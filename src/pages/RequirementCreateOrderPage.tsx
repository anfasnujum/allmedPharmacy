import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { useRequirements, useCustomers } from '@/store/DataContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { AddToOrderModal } from '@/components/requirements/AddToOrderModal';
import { SubstituteModal } from '@/components/requirements/SubstituteModal';
import { PartialOrderWarningModal } from '@/components/requirements/PartialOrderWarningModal';
import { getPrimaryAddress, formatAddressOption } from '@/data/customers';
import { getProductById, loadProductCatalog } from '@/services/productCatalog';
import { formatCurrency } from '@/utils/format';
import { toDatetimeLocalValue } from '@/utils/format';
import { ProductComplianceNotes } from '@/components/products/ProductComplianceNotes';
import { productSelectionFields } from '@/utils/productCompliance';
import { generateId } from '@/utils/helpers';
import type { OrderItem, RequirementItem } from '@/types';

type PendingLine = RequirementItem & { lineId: string };
type OrderLine = OrderItem & { lineId: string };

const labelClass = 'block text-xs font-medium text-brand-text-secondary mb-1';
const requiredMark = <span className="text-brand-primary ml-0.5">*</span>;
const inputClass =
  'w-full text-sm border border-brand-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20';
const inputErrorClass =
  'w-full text-sm border border-red-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-200';

type BillingErrors = {
  eta?: string;
  billNumber?: string;
  billValue?: string;
  items?: string;
};

function toOrderLine(item: RequirementItem): OrderLine {
  const product = item.productId ? getProductById(item.productId) : undefined;
  const compliance = product ? productSelectionFields(product) : {
    prescriptionRequired: item.prescriptionRequired,
    scheduleType: item.scheduleType,
    storageType: item.storageType,
  };
  return {
    lineId: generateId('OL'),
    productId: item.productId,
    productName: item.productName,
    strength: item.strength,
    quantity: item.quantity,
    unitPrice: product?.unitPrice ?? 0,
    ...compliance,
  };
}

function toRequirementItem(line: PendingLine): RequirementItem {
  const { lineId: _, ...item } = line;
  return item;
}

export function RequirementCreateOrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requirements, createOrderFromRequirement } = useRequirements();
  const { customers } = useCustomers();

  const req = requirements.find((r) => r.id === id);
  const customer = req ? customers.find((c) => c.id === req.customerId) : undefined;

  const [pendingItems, setPendingItems] = useState<PendingLine[]>([]);
  const [orderItems, setOrderItems] = useState<OrderLine[]>([]);
  const [deliveryAddressId, setDeliveryAddressId] = useState('');
  const [preferredDeliveryTime, setPreferredDeliveryTime] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [billValue, setBillValue] = useState('');
  const [substituteIndex, setSubstituteIndex] = useState<number | null>(null);
  const [showPartialWarning, setShowPartialWarning] = useState(false);
  const [addItemTarget, setAddItemTarget] = useState<PendingLine | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [errors, setErrors] = useState<BillingErrors>({});

  useEffect(() => {
    setInitialized(false);
  }, [id]);

  useEffect(() => {
    loadProductCatalog().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!req || initialized) return;
    setPendingItems(req.items.map((item) => ({ ...item, lineId: generateId('PL') })));
    setOrderItems([]);
    setDeliveryAddressId(
      req.deliveryAddressId ?? (customer ? getPrimaryAddress(customer).id : ''),
    );
    setPreferredDeliveryTime(
      req.preferredDeliveryTime ? toDatetimeLocalValue(new Date(req.preferredDeliveryTime)) : '',
    );
    setInitialized(true);
  }, [req, customer, initialized]);

  const deliveryType = req?.requirementDeliveryType ?? (req?.deliveryRequired ? 'Home Delivery' : 'Counter Pickup');
  const showAddressPicker = deliveryType === 'Home Delivery' && !!customer?.addresses.length;

  const computedSubtotal = useMemo(
    () => orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [orderItems],
  );

  const openAddToOrder = (item: PendingLine) => {
    setAddItemTarget(item);
  };

  const closeAddToOrder = () => {
    setAddItemTarget(null);
  };

  const confirmAddToOrder = ({
    sourceLineId,
    orderItem,
    quantity,
  }: {
    sourceLineId: string;
    orderItem: RequirementItem;
    quantity: number;
  }) => {
    const orderLine = toOrderLine(orderItem);

    setOrderItems((prev) => {
      const existing = prev.find(
        (o) =>
          o.productId === orderItem.productId &&
          o.productName === orderItem.productName &&
          o.strength === orderItem.strength,
      );
      if (existing) {
        return prev.map((o) =>
          o.lineId === existing.lineId ? { ...o, quantity: o.quantity + quantity } : o,
        );
      }
      return [...prev, orderLine];
    });

    setPendingItems((prev) => prev.filter((i) => i.lineId !== sourceLineId));

    closeAddToOrder();
  };

  const handleSubstitute = (productId: string) => {
    if (substituteIndex === null) return;
    const product = getProductById(productId);
    if (!product) return;

    setOrderItems((prev) =>
      prev.map((item, idx) =>
        idx === substituteIndex
          ? {
              ...item,
              productId: product.id,
              productName: product.name,
              strength: product.strength,
              unitPrice: product.unitPrice,
              ...productSelectionFields(product),
            }
          : item,
      ),
    );
    setSubstituteIndex(null);
    toast.success('Substitute applied');
  };

  const validateForm = (): BillingErrors => {
    const next: BillingErrors = {};
    if (orderItems.length === 0) next.items = 'Add at least one item to the order';
    if (!preferredDeliveryTime.trim()) next.eta = 'Order ETA is required';
    if (!billNumber.trim()) next.billNumber = 'Bill number is required';
    const parsedBillValue = Number(billValue);
    if (!billValue.trim() || Number.isNaN(parsedBillValue) || parsedBillValue <= 0) {
      next.billValue = 'Bill value is required';
    }
    return next;
  };

  const submitOrder = () => {
    if (!req) return;
    const validation = validateForm();
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const parsedBillValue = Number(billValue);
    const remainingItems = pendingItems.map(toRequirementItem);
    const order = createOrderFromRequirement({
      requirementId: req.id,
      items: orderItems.map(({ lineId: _, ...item }) => item),
      remainingItems,
      deliveryAddressId: showAddressPicker ? deliveryAddressId : req.deliveryAddressId,
      preferredDeliveryTime: new Date(preferredDeliveryTime).toISOString(),
      billNumber: billNumber.trim(),
      billValue: parsedBillValue,
    });

    if (!order) {
      toast.error('Could not create order');
      return;
    }

    toast.success(
      remainingItems.length === 0
        ? `Order ${order.id} created — requirement fulfilled`
        : `Partial order ${order.id} created`,
    );
    navigate(`/requirements/${req.id}`);
  };

  const handleCreateOrderClick = () => {
    const validation = validateForm();
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (pendingItems.length > 0) {
      setShowPartialWarning(true);
      return;
    }
    submitOrder();
  };

  if (!req) {
    return (
      <div className="text-center py-16">
        <p className="text-brand-text-secondary mb-4">Requirement not found</p>
        <Button variant="outline" onClick={() => navigate('/requirements?status=New')}>
          <ArrowLeft size={16} /> Back to Requirements
        </Button>
      </div>
    );
  }

  if (req.status === 'Completed' || req.status === 'Cancelled') {
    return (
      <div className="text-center py-16">
        <p className="text-brand-text-secondary mb-4">Cannot create an order for a {req.status.toLowerCase()} requirement</p>
        <Button variant="outline" onClick={() => navigate(`/requirements/${req.id}`)}>
          <ArrowLeft size={16} /> Back to Requirement
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Create Order"
        breadcrumbs={[
          { label: 'Requirements', path: '/requirements?status=New' },
          { label: req.id, path: `/requirements/${req.id}` },
          { label: 'Create Order' },
        ]}
      />

      <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)] mb-6">
        <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Customer & Delivery</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className={labelClass}>Customer</span>
            <p className="font-medium">{req.customerName}</p>
          </div>
          <div>
            <span className={labelClass}>Phone</span>
            <p className="font-medium">{req.phone}</p>
          </div>
          <div>
            <span className={labelClass}>Delivery Type</span>
            <p className="font-medium">{deliveryType}</p>
          </div>
          <div>
            <label className={labelClass}>Order ETA{requiredMark}</label>
            <input
              type="datetime-local"
              required
              className={errors.eta ? inputErrorClass : inputClass}
              value={preferredDeliveryTime}
              onChange={(e) => {
                setPreferredDeliveryTime(e.target.value);
                if (errors.eta) setErrors((prev) => ({ ...prev, eta: undefined }));
              }}
            />
            {errors.eta && <p className="text-xs text-red-600 mt-1">{errors.eta}</p>}
          </div>
          {showAddressPicker && customer && (
            <div className="md:col-span-2">
              <label className={labelClass}>Delivery Address</label>
              <select
                className={inputClass}
                value={deliveryAddressId}
                onChange={(e) => setDeliveryAddressId(e.target.value)}
              >
                {customer.addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {formatAddressOption(a)}{a.isPrimary ? ' (Primary)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
          {!showAddressPicker && customer && (
            <div className="md:col-span-2">
              <span className={labelClass}>Address</span>
              <p className="font-medium">{formatAddressOption(getPrimaryAddress(customer))}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border shadow-[var(--shadow-card)]">
          <div className="px-5 py-4 border-b border-brand-border">
            <h3 className="font-semibold font-[family-name:var(--font-heading)]">Requirement Products</h3>
            <p className="text-xs text-brand-text-secondary mt-1">Click an item to choose quantity and add to order</p>
          </div>
          <div className="p-3 space-y-2 max-h-[420px] overflow-y-auto">
            {pendingItems.length === 0 ? (
              <p className="text-sm text-brand-text-secondary text-center py-8">All items moved to order</p>
            ) : (
              pendingItems.map((item) => (
                <button
                  key={item.lineId}
                  type="button"
                  onClick={() => openAddToOrder(item)}
                  className="w-full text-left rounded-lg border border-brand-border px-4 py-3 hover:border-brand-primary hover:bg-brand-primary/5 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-brand-text-secondary">{item.strength} · Qty {item.quantity}</p>
                      <ProductComplianceNotes item={item} className="mt-1.5" compact />
                    </div>
                    <ArrowRight size={16} className="text-brand-text-secondary group-hover:text-brand-primary shrink-0" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border shadow-[var(--shadow-card)]">
          <div className="px-5 py-4 border-b border-brand-border">
            <h3 className="font-semibold font-[family-name:var(--font-heading)]">Order Items</h3>
            <p className="text-xs text-brand-text-secondary mt-1">
              {orderItems.length === 0 ? 'No items yet' : `${orderItems.length} item(s) · ${formatCurrency(computedSubtotal)}`}
            </p>
          </div>
          <div className="p-3 space-y-2 max-h-[420px] overflow-y-auto">
            {orderItems.length === 0 ? (
              <p className="text-sm text-brand-text-secondary text-center py-8">Select items from the requirement</p>
            ) : (
              orderItems.map((item, index) => (
                <div
                  key={item.lineId}
                  className="relative rounded-lg border border-brand-border px-4 py-3 group hover:border-brand-primary/40"
                >
                  <p className="font-medium text-sm">{item.productName}</p>
                  <p className="text-xs text-brand-text-secondary">
                    {item.strength} · Qty {item.quantity} · {formatCurrency(item.unitPrice * item.quantity)}
                  </p>
                  <ProductComplianceNotes item={item} className="mt-1.5" compact />
                  <button
                    type="button"
                    onClick={() => setSubstituteIndex(index)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-xs font-medium text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-md"
                  >
                    <RefreshCw size={12} /> Substitute
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)] mb-6">
        <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Billing</h3>
        {errors.items && <p className="text-xs text-red-600 mb-3">{errors.items}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <div>
            <label className={labelClass}>Bill Number{requiredMark}</label>
            <input
              type="text"
              required
              className={errors.billNumber ? inputErrorClass : inputClass}
              value={billNumber}
              onChange={(e) => {
                setBillNumber(e.target.value);
                if (errors.billNumber) setErrors((prev) => ({ ...prev, billNumber: undefined }));
              }}
              placeholder="e.g. BILL-2026-001"
            />
            {errors.billNumber && <p className="text-xs text-red-600 mt-1">{errors.billNumber}</p>}
          </div>
          <div>
            <label className={labelClass}>Bill Value (₹){requiredMark}</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className={errors.billValue ? inputErrorClass : inputClass}
              value={billValue}
              onChange={(e) => {
                setBillValue(e.target.value);
                if (errors.billValue) setErrors((prev) => ({ ...prev, billValue: undefined }));
              }}
              placeholder={computedSubtotal > 0 ? String(computedSubtotal) : '0'}
            />
            {errors.billValue && <p className="text-xs text-red-600 mt-1">{errors.billValue}</p>}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(`/requirements/${req.id}`)}>
          Cancel
        </Button>
        <Button onClick={handleCreateOrderClick}>
          Create Order
        </Button>
      </div>

      <AddToOrderModal
        open={addItemTarget !== null}
        item={addItemTarget}
        onClose={closeAddToOrder}
        onConfirm={confirmAddToOrder}
      />

      <SubstituteModal
        open={substituteIndex !== null}
        item={substituteIndex !== null ? orderItems[substituteIndex] : null}
        onClose={() => setSubstituteIndex(null)}
        onConfirm={handleSubstitute}
      />

      <PartialOrderWarningModal
        open={showPartialWarning}
        remainingCount={pendingItems.length}
        onClose={() => setShowPartialWarning(false)}
        onConfirmPartial={() => {
          setShowPartialWarning(false);
          submitOrder();
        }}
      />
    </div>
  );
}
