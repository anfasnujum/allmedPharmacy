import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { initialData } from '@/data';
import type {
  AppData,
  Requirement,
  RequirementStatus,
  Order,
  Collection,
  Customer,
  CustomerAddress,
  CompletedRecord,
  RequirementItem,
  OrderItem,
  SearchResult,
  PaymentMethod,
  OrderStatus,
  DeliveryStatus,
  Enquiry,
  CreateOrderFromRequirementInput,
  FinishOrderPackingInput,
  AddItemsToRequirementInput,
  Trip,
  TripStatus,
  CreateTripInput,
  CompleteTripOrderInput,
  PickUpTripOrderInput,
} from '@/types';
import { getPrimaryAddress } from '@/data/customers';
import { getProductById, loadProductCatalog, searchProducts } from '@/services/productCatalog';
import { buildTripStopFromOrder } from '@/utils/tripHelpers';
import { generateId, createTimelineEvent, normalizePhone, phoneDigits } from '@/utils/helpers';
import { useAuth } from '@/store/AuthContext';
import { isSupabaseConfigured, shouldSeedDemoData } from '@/lib/supabase';
import { fetchAppData, persistAppData } from '@/services/appDb';

const STORAGE_KEY = 'allmed-pharmacy-data';

interface DataContextValue {
  data: AppData;
  loading: boolean;
  loadError: string | null;
  productsLoading: boolean;
  // Requirements
  addRequirement: (req: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'status'>, status?: RequirementStatus) => Requirement;
  updateRequirement: (id: string, updates: Partial<Requirement>) => void;
  addItemsToRequirement: (input: AddItemsToRequirementInput) => { ok: boolean; error?: string };
  createOrderFromRequirement: (input: CreateOrderFromRequirementInput) => Order | null;
  convertRequirementToOrder: (requirementId: string) => Order | null;
  // Orders
  addOrder: (order: Omit<Order, 'id' | 'orderDate' | 'timeline'>) => Order;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  updateOrderStatus: (id: string, status: OrderStatus, actor?: string) => void;
  finishOrderPacking: (input: FinishOrderPackingInput) => { ok: boolean; error?: string };
  completeOrder: (orderId: string, completedBy: string) => void;
  // Trips
  createTrip: (input: CreateTripInput) => Trip | null;
  pickUpTripOrder: (input: PickUpTripOrderInput) => { ok: boolean; error?: string };
  startTrip: (tripId: string, actorId: string) => boolean;
  endTrip: (tripId: string, actorId: string) => boolean;
  completeTripOrder: (input: CompleteTripOrderInput) => { ok: boolean; error?: string };
  // Collections
  recordCollection: (collectionId: string, amount: number, method: PaymentMethod, reference?: string, notes?: string) => void;
  // Customers
  addCustomer: (customer: Omit<Customer, 'id' | 'totalOrders'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  addCustomerAddress: (customerId: string, address: Omit<CustomerAddress, 'id'>) => CustomerAddress;
  updateCustomerAddress: (customerId: string, addressId: string, updates: Partial<CustomerAddress>) => void;
  removeCustomerAddress: (customerId: string, addressId: string) => void;
  setPrimaryAddress: (customerId: string, addressId: string) => void;
  findCustomerByPhone: (phone: string) => Customer | undefined;
  // Enquiries
  addEnquiry: (enquiry: Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'status'>) => Enquiry;
  updateEnquiry: (id: string, updates: Partial<Enquiry>) => void;
  closeEnquiry: (id: string, actor?: string) => void;
  linkEnquiryToRequirement: (enquiryId: string, requirementId: string, actor?: string) => void;
  // Search
  globalSearch: (query: string, branchId?: string) => SearchResult[];
}

function orderItemToRequirementItem(item: OrderItem): RequirementItem {
  return {
    productId: item.productId,
    productName: item.productName,
    strength: item.strength,
    quantity: item.quantity,
    prescriptionRequired: item.prescriptionRequired,
    scheduleType: item.scheduleType,
    storageType: item.storageType,
  };
}

function mergeRequirementItems(existing: RequirementItem[], toAdd: RequirementItem[]): RequirementItem[] {
  const merged = existing.map((item) => ({ ...item }));
  for (const item of toAdd) {
    const match = merged.find(
      (e) =>
        e.productId === item.productId &&
        e.productName === item.productName &&
        e.strength === item.strength,
    );
    if (match) {
      match.quantity += item.quantity;
    } else {
      merged.push({ ...item });
    }
  }
  return merged;
}

const DataContext = createContext<DataContextValue | null>(null);

const LEGACY_REQUIREMENT_STATUS: Record<string, RequirementStatus> = {
  Reviewing: 'Follow-up',
  'Awaiting Information': 'Follow-up',
  Ready: 'Partial',
  Converted: 'Completed',
};

function migrateRequirementStatus(status: string): RequirementStatus {
  if (status === 'New' || status === 'Follow-up' || status === 'Completed' || status === 'Partial' || status === 'Cancelled') {
    return status;
  }
  return LEGACY_REQUIREMENT_STATUS[status] ?? 'New';
}

function normalizeRequirement(
  r: Requirement,
  staffBranchMap: Record<string, string>,
): Requirement {
  return {
    ...r,
    branchId:
      r.branchId ??
      (r.assignedStaffId ? staffBranchMap[r.assignedStaffId] : undefined) ??
      'BR-001',
    requirementDeliveryType:
      r.requirementDeliveryType ?? (r.deliveryRequired ? 'Home Delivery' : 'Counter Pickup'),
    pickupBranchId: r.pickupBranchId ?? r.branchId ?? 'BR-001',
    status: migrateRequirementStatus(r.status),
  };
}

function normalizeData(data: AppData, opts?: { mergeSeedGaps?: boolean }): AppData {
  const mergeSeedGaps = opts?.mergeSeedGaps !== false;
  const staffBranchMap = Object.fromEntries(data.staff.map((s) => [s.id, s.branchId]));
  const storedReqIds = new Set(data.requirements.map((r) => r.id));
  const requirements = [
    ...data.requirements.map((r) => normalizeRequirement(r, staffBranchMap)),
    ...(mergeSeedGaps
      ? initialData.requirements
          .filter((r) => !storedReqIds.has(r.id))
          .map((r) => normalizeRequirement(r, staffBranchMap))
      : []),
  ];
  return {
    ...data,
    prescriptions: data.prescriptions ?? (mergeSeedGaps ? initialData.prescriptions : []),
    enquiries: data.enquiries ?? (mergeSeedGaps ? initialData.enquiries : []),
    customers: data.customers.map((c) => {
      const normalized = {
        ...c,
        phone: normalizePhone(c.phone),
        alternatePhone: c.alternatePhone ? normalizePhone(c.alternatePhone) : undefined,
        whatsappPhone: c.whatsappPhone ? normalizePhone(c.whatsappPhone) : undefined,
      };
      if (normalized.addresses?.length) return normalized;
      return {
        ...normalized,
        addresses: [
          {
            id: `ADDR-${c.id}-1`,
            label: 'Home',
            addressLine: c.address,
            area: c.area,
            city: 'Kochi',
            lat: 9.9312,
            lng: 76.2673,
            isPrimary: true,
          },
        ],
      };
    }),
    requirements,
    orders: data.orders.map((order) => {
      const seed = initialData.orders.find((o) => o.id === order.id);
      return {
        ...order,
        requirementId: order.requirementId ?? seed?.requirementId,
        billNumber: order.billNumber ?? seed?.billNumber,
        billValue: order.billValue ?? seed?.billValue,
        tripId: order.tripId ?? seed?.tripId,
      };
    }),
    trips: data.trips?.length ? data.trips : mergeSeedGaps ? initialData.trips : (data.trips ?? []),
  };
}

function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AppData>;
      return normalizeData({ ...initialData, ...parsed, products: [] });
    }
  } catch {
    // fall through
  }
  return normalizeData({ ...initialData, products: [] });
}

function saveData(data: AppData) {
  try {
    const { products: _products, ...persisted } = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch {
    // ignore
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { configured, loading: authLoading, session } = useAuth();
  const [data, setData] = useState<AppData>({ ...initialData, products: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [productsLoading, setProductsLoading] = useState(true);
  const hydratedRef = useRef(false);
  const skipPersistRef = useRef(true);
  const lastOpsJson = useRef('');
  const persistTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    loadProductCatalog()
      .then((products) => {
        setData((prev) => ({ ...prev, products }));
      })
      .catch(() => {
        // keep empty catalog on failure
      })
      .finally(() => setProductsLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (authLoading) return;
      if (configured && !session) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(null);
      hydratedRef.current = false;

      try {
        if (!isSupabaseConfigured()) {
          if (!cancelled) {
            setData((prev) => ({ ...loadData(), products: prev.products }));
            hydratedRef.current = true;
            skipPersistRef.current = true;
          }
          return;
        }

        const remote = await fetchAppData();
        if (cancelled) return;
        const empty = remote.branches.length === 0;

        if (empty && shouldSeedDemoData()) {
          const seeded = normalizeData({ ...initialData, products: [] });
          await persistAppData(seeded);
          if (cancelled) return;
          setData((prev) => ({ ...seeded, products: prev.products }));
        } else {
          setData((prev) => ({
            ...normalizeData(
              {
                ...remote,
                products: [],
              },
              { mergeSeedGaps: false },
            ),
            products: prev.products,
          }));
        }
        hydratedRef.current = true;
        skipPersistRef.current = true;
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load data from Supabase');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [configured, authLoading, session]);

  useEffect(() => {
    if (!hydratedRef.current || loading) return;

    const { products: _products, ...rest } = data;
    const snapshot = JSON.stringify(rest);
    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      lastOpsJson.current = snapshot;
      if (!isSupabaseConfigured()) saveData(data);
      return;
    }
    if (snapshot === lastOpsJson.current) return;
    lastOpsJson.current = snapshot;

    if (!isSupabaseConfigured()) {
      saveData(data);
      return;
    }

    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      void persistAppData(rest).catch((err) => {
        console.error('Failed to save to Supabase', err);
      });
    }, 500);

    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [data, loading]);

  const update = useCallback((fn: (prev: AppData) => AppData) => {
    setData((prev) => fn(prev));
  }, []);

  const findCustomerByPhone = useCallback(
    (phone: string) => {
      const digits = phoneDigits(phone);
      if (digits.length < 10) return undefined;
      return data.customers.find(
        (c) =>
          phoneDigits(c.phone) === digits ||
          (c.alternatePhone && phoneDigits(c.alternatePhone) === digits) ||
          (c.whatsappPhone && phoneDigits(c.whatsappPhone) === digits),
      );
    },
    [data.customers],
  );

  const addCustomer = useCallback(
    (customer: Omit<Customer, 'id' | 'totalOrders'>) => {
      const primary = customer.addresses?.find((a) => a.isPrimary) ?? customer.addresses?.[0];
      const newCustomer: Customer = {
        ...customer,
        id: generateId('CUS', data.customers.map((c) => c.id)),
        totalOrders: 0,
        phone: normalizePhone(customer.phone),
        alternatePhone: customer.alternatePhone ? normalizePhone(customer.alternatePhone) : undefined,
        whatsappPhone: customer.whatsappPhone ? normalizePhone(customer.whatsappPhone) : undefined,
        addresses: (customer.addresses ?? []).map((a) => ({
          ...a,
          id: a.id || generateId(
            'ADDR',
            data.customers.flatMap((c) => c.addresses.map((addr) => addr.id)),
          ),
        })),
        address: primary?.addressLine ?? customer.address,
        area: primary?.area ?? customer.area,
        createdAt: new Date().toISOString().split('T')[0],
      };
      update((prev) => ({ ...prev, customers: [...prev.customers, newCustomer] }));
      return newCustomer;
    },
    [update, data.customers],
  );

  const syncCustomerPrimaryFields = (customer: Customer): Customer => {
    const primary = getPrimaryAddress(customer);
    return { ...customer, address: primary.addressLine, area: primary.area };
  };

  const updateCustomer = useCallback(
    (id: string, updates: Partial<Customer>) => {
      update((prev) => ({
        ...prev,
        customers: prev.customers.map((c) => {
          if (c.id !== id) return c;
          const merged = {
            ...c,
            ...updates,
            phone: updates.phone ? normalizePhone(updates.phone) : c.phone,
            alternatePhone: updates.alternatePhone ? normalizePhone(updates.alternatePhone) : c.alternatePhone,
            whatsappPhone: updates.whatsappPhone ? normalizePhone(updates.whatsappPhone) : c.whatsappPhone,
          };
          return syncCustomerPrimaryFields(merged);
        }),
      }));
    },
    [update],
  );

  const addCustomerAddress = useCallback(
    (customerId: string, address: Omit<CustomerAddress, 'id'>) => {
      const newAddress: CustomerAddress = {
        ...address,
        id: generateId('ADDR', data.customers.flatMap((c) => c.addresses.map((a) => a.id))),
      };
      update((prev) => ({
        ...prev,
        customers: prev.customers.map((c) => {
          if (c.id !== customerId) return c;
          const addresses = address.isPrimary
            ? c.addresses.map((a) => ({ ...a, isPrimary: false })).concat(newAddress)
            : [...c.addresses, newAddress];
          return syncCustomerPrimaryFields({ ...c, addresses });
        }),
      }));
      return newAddress;
    },
    [update, data.customers],
  );

  const updateCustomerAddress = useCallback(
    (customerId: string, addressId: string, updates: Partial<CustomerAddress>) => {
      update((prev) => ({
        ...prev,
        customers: prev.customers.map((c) => {
          if (c.id !== customerId) return c;
          let addresses = c.addresses.map((a) => (a.id === addressId ? { ...a, ...updates } : a));
          if (updates.isPrimary) {
            addresses = addresses.map((a) => ({ ...a, isPrimary: a.id === addressId }));
          }
          return syncCustomerPrimaryFields({ ...c, addresses });
        }),
      }));
    },
    [update],
  );

  const removeCustomerAddress = useCallback(
    (customerId: string, addressId: string) => {
      update((prev) => ({
        ...prev,
        customers: prev.customers.map((c) => {
          if (c.id !== customerId) return c;
          const remaining = c.addresses.filter((a) => a.id !== addressId);
          if (remaining.length === 0) return c;
          if (!remaining.some((a) => a.isPrimary)) remaining[0].isPrimary = true;
          return syncCustomerPrimaryFields({ ...c, addresses: remaining });
        }),
      }));
    },
    [update],
  );

  const setPrimaryAddress = useCallback(
    (customerId: string, addressId: string) => {
      updateCustomerAddress(customerId, addressId, { isPrimary: true });
    },
    [updateCustomerAddress],
  );

  const buildOrderFromRequirementItems = (
    req: Requirement,
    prev: AppData,
    options: {
      items: OrderItem[];
      deliveryAddressId?: string;
      preferredDeliveryTime: string;
      billNumber: string;
      billValue: number;
    },
  ): Order => {
    const customer = prev.customers.find((c) => c.id === req.customerId);
    const addressId = options.deliveryAddressId ?? req.deliveryAddressId;
    const deliveryAddr = customer
      ? (addressId
          ? customer.addresses.find((a) => a.id === addressId) ?? getPrimaryAddress(customer)
          : getPrimaryAddress(customer))
      : { addressLine: '', area: '' };
    const primary = customer ? getPrimaryAddress(customer) : { addressLine: '', area: '' };
    const subtotal = options.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const deliveryRequired = req.requirementDeliveryType
      ? req.requirementDeliveryType !== 'Counter Pickup'
      : req.deliveryRequired;
    const deliveryCharge = deliveryRequired ? 50 : 0;

    return {
      id: generateId('ORD', prev.orders.map((o) => o.id)),
      requirementId: req.id,
      customerId: req.customerId,
      customerName: req.customerName,
      customerPhone: req.phone,
      customerAddress: primary.addressLine,
      customerArea: primary.area,
      customerType: (customer?.totalOrders ?? 0) > 10 ? 'VIP' : (customer?.totalOrders ?? 0) > 0 ? 'Regular' : 'New',
      preferredContact: customer?.preferredContact ?? 'Phone',
      items: options.items,
      source: req.source,
      orderDate: new Date().toISOString(),
      deliveryType: deliveryRequired ? 'Delivery' : 'Pickup',
      paymentMethod: deliveryRequired ? 'COD' : 'Cash',
      paymentStatus: 'Pending',
      amountCollected: 0,
      subtotal,
      discount: 0,
      deliveryCharge,
      total: options.billValue,
      billNumber: options.billNumber,
      billValue: options.billValue,
      status: 'New',
      branchId: req.branchId,
      deliveryRequired,
      deliveryAddress: deliveryRequired ? deliveryAddr.addressLine : undefined,
      preferredDeliveryTime: options.preferredDeliveryTime,
      deliveryStatus: deliveryRequired ? 'Pending' : undefined,
      timeline: [
        createTimelineEvent(`Order created from requirement ${req.id}`, req.assignedStaffId),
      ],
    };
  };

  const applyCreateOrderFromRequirement = (prev: AppData, req: Requirement, input: CreateOrderFromRequirementInput) => {
    const order = buildOrderFromRequirementItems(req, prev, input);
    const isFullFulfillment = input.remainingItems.length === 0;
    const updatedReq: Requirement = {
      ...req,
      items: input.remainingItems,
      status: isFullFulfillment ? 'Completed' : 'Partial',
      deliveryAddressId: input.deliveryAddressId ?? req.deliveryAddressId,
      preferredDeliveryTime: input.preferredDeliveryTime,
      updatedAt: new Date().toISOString(),
      timeline: [
        ...req.timeline,
        createTimelineEvent(
          isFullFulfillment
            ? `Order ${order.id} created — requirement fulfilled`
            : `Partial order ${order.id} created — ${input.remainingItems.length} item(s) remaining`,
          req.assignedStaffId,
        ),
      ],
    };

    let collections = prev.collections;

    if (order.paymentStatus !== 'Paid') {
      const collection: Collection = {
        id: generateId('COL', prev.collections.map((c) => c.id)),
        orderId: order.id,
        customerId: order.customerId,
        customerName: order.customerName,
        amountDue: order.total,
        amountCollected: 0,
        balance: order.total,
        paymentMethod: order.paymentMethod,
        dueDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        timeline: [createTimelineEvent('Collection record created', order.assignedStaffId)],
      };
      collections = [collection, ...prev.collections];
    }

    const customers = prev.customers.map((c) =>
      c.id === order.customerId
        ? { ...c, totalOrders: c.totalOrders + 1, lastOrderDate: order.orderDate.split('T')[0] }
        : c,
    );

    return {
      prev,
      order,
      next: {
        ...prev,
        requirements: prev.requirements.map((r) => (r.id === req.id ? updatedReq : r)),
        orders: [order, ...prev.orders],
        collections,
        customers,
      },
    };
  };

  const buildOrderFromRequirement = (req: Requirement, prev: AppData): Order => {
    const customer = prev.customers.find((c) => c.id === req.customerId);
    const deliveryAddr = customer
      ? (req.deliveryAddressId
          ? customer.addresses.find((a) => a.id === req.deliveryAddressId) ?? getPrimaryAddress(customer)
          : getPrimaryAddress(customer))
      : { addressLine: '', area: '' };
    const primary = customer ? getPrimaryAddress(customer) : { addressLine: '', area: '' };
    const items: OrderItem[] = req.items.map((item) => {
      const product = item.productId ? getProductById(item.productId) : undefined;
      return {
        productId: item.productId,
        productName: item.productName,
        strength: item.strength,
        quantity: item.quantity,
        unitPrice: product?.unitPrice ?? 0,
        prescriptionRequired: item.prescriptionRequired,
        scheduleType: item.scheduleType,
        storageType: item.storageType,
      };
    });
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const deliveryRequired = req.requirementDeliveryType
      ? req.requirementDeliveryType !== 'Counter Pickup'
      : req.deliveryRequired;
    const deliveryCharge = deliveryRequired ? 50 : 0;

    return {
      id: generateId('ORD', prev.orders.map((o) => o.id)),
      requirementId: req.id,
      customerId: req.customerId,
      customerName: req.customerName,
      customerPhone: req.phone,
      customerAddress: primary.addressLine,
      customerArea: primary.area,
      customerType: (customer?.totalOrders ?? 0) > 10 ? 'VIP' : (customer?.totalOrders ?? 0) > 0 ? 'Regular' : 'New',
      preferredContact: customer?.preferredContact ?? 'Phone',
      items,
      source: req.source,
      orderDate: new Date().toISOString(),
      deliveryType: deliveryRequired ? 'Delivery' : 'Pickup',
      paymentMethod: deliveryRequired ? 'COD' : 'Cash',
      paymentStatus: 'Pending',
      amountCollected: 0,
      subtotal,
      discount: 0,
      deliveryCharge,
      total: subtotal + deliveryCharge,
      status: 'New',
      branchId: req.branchId,
      deliveryRequired,
      deliveryAddress: deliveryRequired ? deliveryAddr.addressLine : undefined,
      preferredDeliveryTime: req.preferredDeliveryTime,
      deliveryStatus: deliveryRequired ? 'Pending' : undefined,
      timeline: [
        createTimelineEvent(`Order created from requirement ${req.id}`, req.assignedStaffId),
      ],
    };
  };

  const applyOrderFromRequirement = (prev: AppData, req: Requirement) => {
    const order = buildOrderFromRequirement(req, prev);
    const updatedReq: Requirement = {
      ...req,
      status: 'Completed',
      updatedAt: new Date().toISOString(),
      timeline: [
        ...req.timeline,
        createTimelineEvent(`Order created — ${order.id}`, req.assignedStaffId),
      ],
    };

    let collections = prev.collections;

    if (order.paymentStatus !== 'Paid') {
      const collection: Collection = {
        id: generateId('COL', prev.collections.map((c) => c.id)),
        orderId: order.id,
        customerId: order.customerId,
        customerName: order.customerName,
        amountDue: order.total,
        amountCollected: 0,
        balance: order.total,
        paymentMethod: order.paymentMethod,
        dueDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        timeline: [createTimelineEvent('Collection record created', order.assignedStaffId)],
      };
      collections = [collection, ...prev.collections];
    }

    const customers = prev.customers.map((c) =>
      c.id === order.customerId
        ? { ...c, totalOrders: c.totalOrders + 1, lastOrderDate: order.orderDate.split('T')[0] }
        : c,
    );

    return {
      ...prev,
      requirements: prev.requirements.map((r) => (r.id === req.id ? updatedReq : r)),
      orders: [order, ...prev.orders],
      collections,
      customers,
    };
  };

  const addRequirement = useCallback(
    (req: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'status'>, status: RequirementStatus = 'New') => {
      const now = new Date().toISOString();
      const timelineMessage = status === 'Follow-up' ? 'Requirement saved for follow-up' : 'Requirement received';
      const newReq: Requirement = {
        ...req,
        id: generateId('REQ', data.requirements.map((r) => r.id)),
        status,
        createdAt: now,
        updatedAt: now,
        timeline: [createTimelineEvent(timelineMessage, req.assignedStaffId)],
      };

      update((prev) => ({ ...prev, requirements: [newReq, ...prev.requirements] }));
      return newReq;
    },
    [update, data.requirements],
  );

  const updateRequirement = useCallback(
    (id: string, updates: Partial<Requirement>) => {
      update((prev) => ({
        ...prev,
        requirements: prev.requirements.map((r) =>
          r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r,
        ),
      }));
    },
    [update],
  );

  const addItemsToRequirement = useCallback(
    (input: AddItemsToRequirementInput): { ok: boolean; error?: string } => {
      let result: { ok: boolean; error?: string } = { ok: false, error: 'Could not add items' };
      update((prev) => {
        const req = prev.requirements.find((r) => r.id === input.requirementId);
        if (!req) {
          result = { ok: false, error: 'Requirement not found' };
          return prev;
        }
        if (req.status === 'Cancelled') {
          result = { ok: false, error: 'Cannot add items to a cancelled requirement' };
          return prev;
        }

        const validItems = input.items
          .filter((item) => item.productName?.trim() && item.quantity >= 1)
          .map((item) => ({
            ...item,
            productName: item.productName.trim(),
            strength: (item.strength ?? '').trim(),
          }));

        if (validItems.length === 0) {
          result = { ok: false, error: 'Add at least one valid item with name and quantity' };
          return prev;
        }

        const mergedItems = mergeRequirementItems(req.items, validItems);
        const newStatus: RequirementStatus = req.status === 'Completed' ? 'Partial' : req.status;
        const wasCompleted = req.status === 'Completed';
        const timelineMessage = wasCompleted
          ? `${validItems.length} item(s) added — requirement reopened as Partial`
          : `${validItems.length} item(s) added to pending requirements`;

        result = { ok: true };
        return {
          ...prev,
          requirements: prev.requirements.map((r) =>
            r.id === req.id
              ? {
                  ...r,
                  items: mergedItems,
                  status: newStatus,
                  updatedAt: new Date().toISOString(),
                  timeline: [...r.timeline, createTimelineEvent(timelineMessage, input.actorId)],
                }
              : r,
          ),
        };
      });
      return result;
    },
    [update],
  );

  const createOrderFromRequirement = useCallback(
    (input: CreateOrderFromRequirementInput): Order | null => {
      let created: Order | null = null;
      update((prev) => {
        const req = prev.requirements.find((r) => r.id === input.requirementId);
        if (!req || req.status === 'Completed' || req.status === 'Cancelled' || input.items.length === 0) {
          return prev;
        }
        if (!input.preferredDeliveryTime?.trim() || !input.billNumber?.trim() || input.billValue <= 0) {
          return prev;
        }
        const result = applyCreateOrderFromRequirement(prev, req, input);
        created = result.order;
        return result.next;
      });
      return created;
    },
    [update],
  );

  const convertRequirementToOrder = useCallback(
    (requirementId: string): Order | null => {
      const req = data.requirements.find((r) => r.id === requirementId);
      if (!req || req.status === 'Completed') return null;
      update((prev) => applyOrderFromRequirement(prev, req));
      return null;
    },
    [data.requirements, update],
  );

  const addOrder = useCallback(
    (order: Omit<Order, 'id' | 'orderDate' | 'timeline'>) => {
      const newOrder: Order = {
        ...order,
        id: generateId('ORD', data.orders.map((o) => o.id)),
        orderDate: new Date().toISOString(),
        timeline: [createTimelineEvent('Order created', order.assignedStaffId)],
      };
      update((prev) => ({ ...prev, orders: [newOrder, ...prev.orders] }));
      return newOrder;
    },
    [update, data.orders],
  );

  const updateOrder = useCallback(
    (id: string, updates: Partial<Order>) => {
      update((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => (o.id === id ? { ...o, ...updates } : o)),
      }));
    },
    [update],
  );

  const updateOrderStatus = useCallback(
    (id: string, status: OrderStatus, actor = 'ST-001') => {
      update((prev) => {
        const order = prev.orders.find((o) => o.id === id);
        if (!order) return prev;

        const event = createTimelineEvent(`Status updated to ${status}`, actor);
        let orders = prev.orders.map((o) =>
          o.id === id ? { ...o, status, timeline: [...o.timeline, event] } : o,
        );
        let collections = prev.collections;

        if (status === 'Out for Delivery') {
          orders = orders.map((o) =>
            o.id === id ? { ...o, deliveryStatus: 'Out for Delivery' as DeliveryStatus } : o,
          );
        }

        if (status === 'Delivered') {
          orders = orders.map((o) =>
            o.id === id ? { ...o, deliveryStatus: 'Delivered' as DeliveryStatus } : o,
          );
        }

        if (status === 'Collection Pending') {
          const existingCol = prev.collections.find((c) => c.orderId === id);
          if (!existingCol && order.paymentStatus !== 'Paid') {
            const collection: Collection = {
              id: generateId('COL', prev.collections.map((c) => c.id)),
              orderId: id,
              customerId: order.customerId,
              customerName: order.customerName,
              amountDue: order.total,
              amountCollected: order.amountCollected,
              balance: order.total - order.amountCollected,
              paymentMethod: order.paymentMethod,
              dueDate: new Date().toISOString().split('T')[0],
              status: order.amountCollected > 0 ? 'Partially Collected' : 'Pending',
              timeline: [createTimelineEvent('Moved to collection', actor)],
            };
            collections = [collection, ...collections];
          }
        }

        return { ...prev, orders, collections };
      });
    },
    [update],
  );

  const finishOrderPacking = useCallback(
    (input: FinishOrderPackingInput): { ok: boolean; error?: string } => {
      let result: { ok: boolean; error?: string } = { ok: false, error: 'Could not finish packing' };
      update((prev) => {
        const order = prev.orders.find((o) => o.id === input.orderId);
        if (!order) {
          result = { ok: false, error: 'Order not found' };
          return prev;
        }
        if (order.status !== 'Processing') {
          result = { ok: false, error: 'Order is not in packing (Processing) status' };
          return prev;
        }
        if (!order.requirementId) {
          result = { ok: false, error: 'Order is not linked to a requirement' };
          return prev;
        }

        const staffBranchMap = Object.fromEntries(prev.staff.map((s) => [s.id, s.branchId]));
        let req = prev.requirements.find((r) => r.id === order.requirementId);
        let requirements = prev.requirements;
        if (!req) {
          const seedReq = initialData.requirements.find((r) => r.id === order.requirementId);
          if (!seedReq) {
            result = { ok: false, error: `Linked requirement ${order.requirementId} was not found` };
            return prev;
          }
          req = normalizeRequirement(seedReq, staffBranchMap);
          requirements = [...prev.requirements, req];
        }

        const packedIndices = new Set(input.packedItemIndices);
        if (packedIndices.size === 0) {
          result = { ok: false, error: 'At least one item must be packed' };
          return prev;
        }

        const skippedSet = new Set(input.skippedItems.map((s) => s.itemIndex));
        const allIndices = order.items.map((_, i) => i);
        const unaccounted = allIndices.filter((i) => !packedIndices.has(i) && !skippedSet.has(i));
        if (unaccounted.length > 0) {
          result = { ok: false, error: 'Every order item must be marked packed or skipped' };
          return prev;
        }

        if (input.skippedItems.length > 0) {
          if (!input.newBillNumber?.trim() || !input.newBillValue || input.newBillValue <= 0) {
            result = { ok: false, error: 'Bill number and value are required when items are returned' };
            return prev;
          }
          if (input.skippedItems.some((s) => !s.reason.trim())) {
            result = { ok: false, error: 'A reason is required for each unchecked item' };
            return prev;
          }
        }

        const packedItems = order.items.filter((_, i) => packedIndices.has(i));
        const returnedItems = input.skippedItems.map((s) => ({
          ...orderItemToRequirementItem(order.items[s.itemIndex]),
          notes: s.reason.trim(),
        }));

        const subtotal = packedItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
        const billValue = input.skippedItems.length > 0 ? input.newBillValue! : (order.billValue ?? order.total);
        const billNumber = input.skippedItems.length > 0 ? input.newBillNumber!.trim() : order.billNumber;
        const total = billValue;

        const timelineMessage =
          input.skippedItems.length > 0
            ? `Packing finished — ${input.skippedItems.length} item(s) returned to ${req.id}`
            : 'Packing finished — order ready';

        const updatedOrder: Order = {
          ...order,
          items: packedItems,
          subtotal,
          total,
          billNumber,
          billValue,
          status: 'Ready',
          timeline: [...order.timeline, createTimelineEvent(timelineMessage, input.actorId)],
        };

        if (returnedItems.length > 0) {
          const updatedReq: Requirement = {
            ...req,
            items: mergeRequirementItems(req.items, returnedItems),
            status: req.status === 'Completed' ? 'Partial' : req.status === 'New' ? 'Partial' : req.status,
            updatedAt: new Date().toISOString(),
            timeline: [
              ...req.timeline,
              createTimelineEvent(
                `${returnedItems.length} item(s) returned from order ${order.id}`,
                input.actorId,
              ),
            ],
          };
          requirements = requirements.map((r) => (r.id === req!.id ? updatedReq : r));
        }

        let collections = prev.collections.map((c) =>
          c.orderId === order.id
            ? { ...c, amountDue: total, balance: total - c.amountCollected }
            : c,
        );

        result = { ok: true };
        return {
          ...prev,
          orders: prev.orders.map((o) => (o.id === order.id ? updatedOrder : o)),
          requirements,
          collections,
        };
      });
      return result;
    },
    [update],
  );

  const completeOrder = useCallback(
    (orderId: string, completedBy: string) => {
      update((prev) => {
        const order = prev.orders.find((o) => o.id === orderId);
        if (!order) return prev;

        const completedRecord: CompletedRecord = {
          id: generateId('CMP', prev.completed.map((c) => c.id)),
          orderId: order.id,
          customerId: order.customerId,
          customerName: order.customerName,
          completedDate: new Date().toISOString(),
          items: order.items,
          orderValue: order.total,
          paymentMethod: order.paymentMethod,
          branchId: order.branchId,
          completedBy,
          source: order.source,
        };

        const event = createTimelineEvent('Order completed', completedBy);
        const orders = prev.orders.map((o) =>
          o.id === orderId
            ? { ...o, status: 'Completed' as OrderStatus, completedAt: new Date().toISOString(), completedBy, timeline: [...o.timeline, event] }
            : o,
        );

        const collections = prev.collections.map((c) =>
          c.orderId === orderId ? { ...c, status: 'Collected' as const, amountCollected: order.total, balance: 0 } : c,
        );

        return {
          ...prev,
          orders,
          collections,
          completed: [completedRecord, ...prev.completed],
        };
      });
    },
    [update],
  );

  const createTrip = useCallback(
    (input: CreateTripInput): Trip | null => {
      const { branchId, deliveryPersonId, orderIds, actorId } = input;
      if (!deliveryPersonId?.trim()) return null;

      let created: Trip | null = null;
      update((prev) => {
        if (orderIds.length === 0) return prev;

        const ordersToAdd = orderIds
          .map((id) => prev.orders.find((o) => o.id === id))
          .filter((o): o is Order => Boolean(o));

        if (ordersToAdd.length === 0) return prev;

        const invalid = ordersToAdd.some(
          (o) => o.status !== 'Ready' || !o.deliveryRequired || o.tripId,
        );
        if (invalid) return prev;

        const stops = ordersToAdd.map((order) => {
          const customer = prev.customers.find((c) => c.id === order.customerId);
          return buildTripStopFromOrder(order, customer);
        });

        const trip: Trip = {
          id: generateId('TRP', prev.trips.map((t) => t.id)),
          branchId,
          deliveryPersonId,
          status: 'Scheduled',
          stops,
          timeline: [
            createTimelineEvent(`Trip created with ${stops.length} order(s) for agent ${deliveryPersonId}`, actorId),
          ],
          createdAt: new Date().toISOString(),
        };

        const orderIdSet = new Set(stops.map((s) => s.orderId));
        const orders = prev.orders.map((o) =>
          orderIdSet.has(o.id)
            ? {
                ...o,
                status: 'Trip Assigned' as OrderStatus,
                tripId: trip.id,
                deliveryPersonId,
                timeline: [
                  ...o.timeline,
                  createTimelineEvent(`Assigned to trip ${trip.id}`, actorId),
                ],
              }
            : o,
        );

        created = trip;
        return { ...prev, trips: [trip, ...prev.trips], orders };
      });
      return created;
    },
    [update],
  );

  const pickUpTripOrder = useCallback(
    (input: PickUpTripOrderInput): { ok: boolean; error?: string } => {
      let result: { ok: boolean; error?: string } = { ok: false, error: 'Could not confirm pickup' };
      update((prev) => {
        const trip = prev.trips.find((t) => t.id === input.tripId);
        if (!trip || trip.status !== 'Scheduled') {
          result = { ok: false, error: 'Trip is not awaiting pickup' };
          return prev;
        }

        const stop = trip.stops.find((s) => s.orderId === input.orderId);
        if (!stop) {
          result = { ok: false, error: 'Order not on this trip' };
          return prev;
        }

        const order = prev.orders.find((o) => o.id === input.orderId);
        if (!order) {
          result = { ok: false, error: 'Order not found' };
          return prev;
        }
        if (order.status !== 'Trip Assigned') {
          result = { ok: false, error: 'Order is not awaiting pickup' };
          return prev;
        }

        const orders = prev.orders.map((o) =>
          o.id === order.id
            ? {
                ...o,
                status: 'Picked Up' as OrderStatus,
                timeline: [
                  ...o.timeline,
                  createTimelineEvent(`Picked up for trip ${trip.id}`, input.actorId),
                ],
              }
            : o,
        );

        const trips = prev.trips.map((t) =>
          t.id === trip.id
            ? {
                ...t,
                timeline: [...t.timeline, createTimelineEvent(`Order ${order.id} picked up`, input.actorId)],
              }
            : t,
        );

        result = { ok: true };
        return { ...prev, orders, trips };
      });
      return result;
    },
    [update],
  );

  const startTrip = useCallback(
    (tripId: string, actorId: string): boolean => {
      let ok = false;
      update((prev) => {
        const trip = prev.trips.find((t) => t.id === tripId);
        if (!trip || trip.status !== 'Scheduled') return prev;

        const orderIds = trip.stops.map((s) => s.orderId);
        const tripOrders = orderIds.map((id) => prev.orders.find((o) => o.id === id)).filter(Boolean) as Order[];
        if (tripOrders.length !== orderIds.length) return prev;
        if (!tripOrders.every((o) => o.status === 'Picked Up')) return prev;
        const orders = prev.orders.map((o) =>
          orderIds.includes(o.id)
            ? {
                ...o,
                status: 'Out for Delivery' as OrderStatus,
                deliveryStatus: 'Out for Delivery' as DeliveryStatus,
                timeline: [
                  ...o.timeline,
                  createTimelineEvent(`Out for delivery — trip ${tripId}`, actorId),
                ],
              }
            : o,
        );

        const trips = prev.trips.map((t) =>
          t.id === tripId
            ? {
                ...t,
                status: 'In Progress' as TripStatus,
                startedAt: new Date().toISOString(),
                timeline: [...t.timeline, createTimelineEvent('Trip started', actorId)],
              }
            : t,
        );

        ok = true;
        return { ...prev, trips, orders };
      });
      return ok;
    },
    [update],
  );

  const endTrip = useCallback(
    (tripId: string, actorId: string): boolean => {
      let ok = false;
      update((prev) => {
        const trip = prev.trips.find((t) => t.id === tripId);
        if (!trip || trip.status !== 'In Progress') return prev;

        const trips = prev.trips.map((t) =>
          t.id === tripId
            ? {
                ...t,
                status: 'Completed' as TripStatus,
                completedAt: new Date().toISOString(),
                timeline: [...t.timeline, createTimelineEvent('Trip ended', actorId)],
              }
            : t,
        );

        ok = true;
        return { ...prev, trips };
      });
      return ok;
    },
    [update],
  );

  const completeTripOrder = useCallback(
    (input: CompleteTripOrderInput): { ok: boolean; error?: string } => {
      let result: { ok: boolean; error?: string } = { ok: false, error: 'Could not complete order' };
      update((prev) => {
        const trip = prev.trips.find((t) => t.id === input.tripId);
        if (!trip || trip.status !== 'In Progress') {
          result = { ok: false, error: 'Trip is not in progress' };
          return prev;
        }

        const stop = trip.stops.find((s) => s.orderId === input.orderId);
        if (!stop || stop.completed) {
          result = { ok: false, error: 'Order not found on this trip' };
          return prev;
        }

        const order = prev.orders.find((o) => o.id === input.orderId);
        if (!order) {
          result = { ok: false, error: 'Order not found' };
          return prev;
        }

        let customers = prev.customers;
        if (input.saveAsNewAddress && input.newAddressLabel?.trim()) {
          const customer = prev.customers.find((c) => c.id === order.customerId);
          if (customer) {
            const newAddr = {
              id: generateId('ADDR', prev.customers.flatMap((c) => c.addresses.map((a) => a.id))),
              label: input.newAddressLabel.trim(),
              addressLine: input.addressLine.trim(),
              area: input.area.trim(),
              city: 'Kochi',
              lat: input.lat,
              lng: input.lng,
              isPrimary: false,
            };
            customers = prev.customers.map((c) =>
              c.id === customer.id ? { ...c, addresses: [...(c.addresses ?? []), newAddr] } : c,
            );
          }
        }

        const deliveryAddress = `${input.addressLine.trim()}, ${input.area.trim()}`;
        let paymentStatus = order.paymentStatus;
        let amountCollected = order.amountCollected;
        let orderStatus: OrderStatus = 'Delivered';
        let collections = prev.collections;

        if (input.paymentOption === 'Collected by Agent') {
          paymentStatus = 'Paid';
          amountCollected = order.billValue ?? order.total;
          orderStatus = 'Completed';
        } else if (input.paymentOption === 'Collected by Store') {
          paymentStatus = 'Paid';
          amountCollected = order.billValue ?? order.total;
          orderStatus = 'Completed';
        } else {
          paymentStatus = order.paymentStatus === 'Paid' ? 'Paid' : 'Pending';
          orderStatus = order.paymentStatus === 'Paid' ? 'Completed' : 'Collection Pending';
        }

        if (input.paymentOption !== 'Pay Later' && order.paymentStatus !== 'Paid') {
          collections = prev.collections.map((c) =>
            c.orderId === order.id
              ? {
                  ...c,
                  amountCollected: order.billValue ?? order.total,
                  balance: 0,
                  status: 'Collected' as const,
                  timeline: [
                    ...c.timeline,
                    createTimelineEvent(`Payment — ${input.paymentOption}`, input.actorId),
                  ],
                }
              : c,
          );
        }

        const orders = prev.orders.map((o) =>
          o.id === order.id
            ? {
                ...o,
                status: orderStatus,
                paymentStatus,
                amountCollected,
                deliveryAddress,
                deliveryStatus: 'Delivered' as DeliveryStatus,
                timeline: [
                  ...o.timeline,
                  createTimelineEvent(`Delivered — ${input.paymentOption}`, input.actorId),
                ],
                ...(orderStatus === 'Completed'
                  ? { completedAt: new Date().toISOString(), completedBy: input.actorId }
                  : {}),
              }
            : o,
        );

        const updatedStops = trip.stops.map((s) =>
          s.orderId === input.orderId
            ? { ...s, completed: true, paymentOption: input.paymentOption, address: deliveryAddress, addressLine: input.addressLine.trim(), area: input.area.trim(), lat: input.lat, lng: input.lng }
            : s,
        );

        const allDone = updatedStops.every((s) => s.completed);
        const trips = prev.trips.map((t) =>
          t.id === trip.id
            ? {
                ...t,
                stops: updatedStops,
                ...(allDone
                  ? {
                      status: 'Completed' as TripStatus,
                      completedAt: new Date().toISOString(),
                      timeline: [...t.timeline, createTimelineEvent('All orders completed — trip finished', input.actorId)],
                    }
                  : {
                      timeline: [...t.timeline, createTimelineEvent(`Order ${order.id} completed`, input.actorId)],
                    }),
              }
            : t,
        );

        let completed = prev.completed;
        if (orderStatus === 'Completed') {
          completed = [
            {
              id: generateId('CMP', prev.completed.map((c) => c.id)),
              orderId: order.id,
              customerId: order.customerId,
              customerName: order.customerName,
              completedDate: new Date().toISOString(),
              items: order.items,
              orderValue: order.billValue ?? order.total,
              paymentMethod: order.paymentMethod,
              branchId: order.branchId,
              completedBy: input.actorId,
              source: order.source,
            },
            ...prev.completed,
          ];
        }

        result = { ok: true };
        return { ...prev, trips, orders, customers, collections, completed };
      });
      return result;
    },
    [update],
  );

  const recordCollection = useCallback(
    (collectionId: string, amount: number, method: PaymentMethod, reference?: string, notes?: string) => {
      update((prev) => {
        const collection = prev.collections.find((c) => c.id === collectionId);
        if (!collection) return prev;

        const newCollected = collection.amountCollected + amount;
        const balance = collection.amountDue - newCollected;
        const status = balance <= 0 ? 'Collected' as const : 'Partially Collected' as const;
        const desc = `Payment of ₹${amount} via ${method}${reference ? ` (Ref: ${reference})` : ''}${notes ? ` — ${notes}` : ''}`;
        const event = createTimelineEvent(desc);

        const collections = prev.collections.map((c) =>
          c.id === collectionId
            ? { ...c, amountCollected: newCollected, balance: Math.max(0, balance), paymentMethod: method, status, timeline: [...c.timeline, event] }
            : c,
        );

        const orders = prev.orders.map((o) => {
          if (o.id !== collection.orderId) return o;
          const paymentStatus = balance <= 0 ? 'Paid' as const : 'Partial' as const;
          return { ...o, amountCollected: newCollected, paymentStatus, timeline: [...o.timeline, event] };
        });

        return { ...prev, collections, orders };
      });
    },
    [update],
  );

  const addEnquiry = useCallback(
    (enquiry: Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'status'>) => {
      const now = new Date().toISOString();
      const queryLabel = enquiry.queryCustom?.trim() || enquiry.query;
      const newEnquiry: Enquiry = {
        ...enquiry,
        id: generateId('ENQ', data.enquiries.map((e) => e.id)),
        status: 'Open',
        createdAt: now,
        updatedAt: now,
        timeline: [createTimelineEvent(`Enquiry received — ${queryLabel}`)],
      };
      update((prev) => ({ ...prev, enquiries: [newEnquiry, ...prev.enquiries] }));
      return newEnquiry;
    },
    [update, data.enquiries],
  );

  const updateEnquiry = useCallback(
    (id: string, updates: Partial<Enquiry>) => {
      update((prev) => ({
        ...prev,
        enquiries: prev.enquiries.map((e) =>
          e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e,
        ),
      }));
    },
    [update],
  );

  const closeEnquiry = useCallback(
    (id: string, actor?: string) => {
      const now = new Date().toISOString();
      update((prev) => ({
        ...prev,
        enquiries: prev.enquiries.map((e) =>
          e.id === id
            ? {
                ...e,
                status: 'Closed',
                closedAt: now,
                updatedAt: now,
                timeline: [...e.timeline, createTimelineEvent('Enquiry closed', actor)],
              }
            : e,
        ),
      }));
    },
    [update],
  );

  const linkEnquiryToRequirement = useCallback(
    (enquiryId: string, requirementId: string, actor?: string) => {
      update((prev) => ({
        ...prev,
        enquiries: prev.enquiries.map((e) =>
          e.id === enquiryId
            ? {
                ...e,
                status: 'Converted',
                requirementId,
                updatedAt: new Date().toISOString(),
                timeline: [...e.timeline, createTimelineEvent(`Converted to requirement ${requirementId}`, actor)],
              }
            : e,
        ),
      }));
    },
    [update],
  );

  const globalSearch = useCallback(
    (query: string, branchId?: string): SearchResult[] => {
      if (!query.trim()) return [];
      const q = query.toLowerCase();
      const results: SearchResult[] = [];

      data.customers.forEach((c) => {
        const qDigits = phoneDigits(q);
        if (
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q.replace(/\s+/g, '')) ||
          (qDigits.length >= 4 && phoneDigits(c.phone).includes(qDigits))
        ) {
          results.push({ type: 'customer', id: c.id, title: c.name, subtitle: c.phone, path: `/customers/${c.id}` });
        }
      });

      data.requirements.forEach((r) => {
        if (branchId && r.branchId !== branchId) return;
        if (r.id.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q) || r.phone.includes(q)) {
          results.push({ type: 'requirement', id: r.id, title: r.id, subtitle: r.customerName, path: `/requirements/${r.id}` });
        }
        r.items.forEach((item) => {
          if (item.productName.toLowerCase().includes(q)) {
            results.push({ type: 'requirement', id: r.id, title: item.productName, subtitle: r.id, path: `/requirements/${r.id}` });
          }
        });
      });

      data.orders.forEach((o) => {
        if (branchId && o.branchId !== branchId) return;
        if (o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q)) {
          results.push({ type: 'order', id: o.id, title: o.id, subtitle: o.customerName, path: `/orders/${o.id}` });
        }
      });

      searchProducts(q, 8).forEach((p) => {
        results.push({ type: 'product', id: p.id, title: p.name, subtitle: `${p.brand} · ${p.code}`, path: `/requirements` });
      });

      data.enquiries.forEach((e) => {
        if (branchId && e.branchId !== branchId) return;
        const queryText = e.queryCustom ?? e.query;
        if (
          e.id.toLowerCase().includes(q) ||
          e.customerName.toLowerCase().includes(q) ||
          e.phone.includes(q) ||
          queryText.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
        ) {
          results.push({ type: 'enquiry', id: e.id, title: e.id, subtitle: `${e.customerName} — ${queryText}`, path: `/enquiries/${e.id}` });
        }
      });

      return results.slice(0, 10);
    },
    [data],
  );

  return (
    <DataContext.Provider
      value={{
        data,
        loading,
        loadError,
        productsLoading,
        addRequirement,
        updateRequirement,
        addItemsToRequirement,
        createOrderFromRequirement,
        convertRequirementToOrder,
        addOrder,
        updateOrder,
        updateOrderStatus,
        finishOrderPacking,
        completeOrder,
        createTrip,
        pickUpTripOrder,
        startTrip,
        endTrip,
        completeTripOrder,
        recordCollection,
        addCustomer,
        updateCustomer,
        addCustomerAddress,
        updateCustomerAddress,
        removeCustomerAddress,
        setPrimaryAddress,
        findCustomerByPhone,
        addEnquiry,
        updateEnquiry,
        closeEnquiry,
        linkEnquiryToRequirement,
        globalSearch,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export function useRequirements() {
  const { data, loading, addRequirement, updateRequirement, addItemsToRequirement, createOrderFromRequirement, convertRequirementToOrder } = useData();
  return { requirements: data.requirements, loading, addRequirement, updateRequirement, addItemsToRequirement, createOrderFromRequirement, convertRequirementToOrder };
}

export function useOrders() {
  const { data, loading, addOrder, updateOrder, updateOrderStatus, finishOrderPacking, completeOrder } = useData();
  return { orders: data.orders, loading, addOrder, updateOrder, updateOrderStatus, finishOrderPacking, completeOrder };
}

export function useTrips() {
  const { data, loading, createTrip, pickUpTripOrder, startTrip, endTrip, completeTripOrder } = useData();
  return { trips: data.trips, loading, createTrip, pickUpTripOrder, startTrip, endTrip, completeTripOrder };
}

export function useCollections() {
  const { data, loading, recordCollection } = useData();
  return { collections: data.collections, loading, recordCollection };
}

export function useCustomers() {
  const { data, loading, addCustomer, updateCustomer, addCustomerAddress, updateCustomerAddress, removeCustomerAddress, setPrimaryAddress, findCustomerByPhone } = useData();
  return {
    customers: data.customers,
    prescriptions: data.prescriptions,
    loading,
    addCustomer,
    updateCustomer,
    addCustomerAddress,
    updateCustomerAddress,
    removeCustomerAddress,
    setPrimaryAddress,
    findCustomerByPhone,
  };
}

export function useEnquiries() {
  const { data, loading, addEnquiry, updateEnquiry, closeEnquiry, linkEnquiryToRequirement } = useData();
  return { enquiries: data.enquiries, loading, addEnquiry, updateEnquiry, closeEnquiry, linkEnquiryToRequirement };
}

export function useProducts() {
  const { data, productsLoading } = useData();
  const products = data.products;
  const search = useCallback(
    (query: string, limit = 10) => searchProducts(query, limit, products),
    [products],
  );
  return { products, productsLoading, searchProducts: search };
}

export function useBranches() {
  const { data } = useData();
  return data.branches;
}

export function useStaff() {
  const { data } = useData();
  return data.staff;
}

export function useCompleted() {
  const { data, loading } = useData();
  return { completed: data.completed, loading };
}

export type { RequirementItem };
