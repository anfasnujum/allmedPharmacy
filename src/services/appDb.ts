import type {
  AppData,
  Branch,
  Collection,
  CompletedRecord,
  Customer,
  Enquiry,
  Order,
  Prescription,
  Requirement,
  Staff,
  Trip,
} from '@/types';
import { getSupabase } from '@/lib/supabase';

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function mapBranch(row: Record<string, unknown>): Branch {
  return {
    id: String(row.id),
    name: String(row.name),
    code: String(row.code),
    location: String(row.location),
    phone: String(row.phone),
    status: row.status === 'Inactive' ? 'Inactive' : 'Active',
  };
}

function mapStaff(row: Record<string, unknown>): Staff {
  return {
    id: String(row.id),
    name: String(row.name),
    role: String(row.role),
    branchId: String(row.branch_id),
    phone: String(row.phone),
    email: row.email ? String(row.email) : undefined,
  };
}

function mapCustomer(row: Record<string, unknown>): Customer {
  return {
    id: String(row.id),
    name: String(row.name),
    phone: String(row.phone),
    whatsappPhone: row.whatsapp_phone ? String(row.whatsapp_phone) : undefined,
    alternatePhone: row.alternate_phone ? String(row.alternate_phone) : undefined,
    email: row.email ? String(row.email) : undefined,
    address: String(row.address ?? ''),
    area: String(row.area ?? ''),
    addresses: Array.isArray(row.addresses) ? row.addresses : [],
    preferredContact: (row.preferred_contact as Customer['preferredContact']) ?? 'Phone',
    totalOrders: num(row.total_orders),
    lastOrderDate: row.last_order_date ? String(row.last_order_date) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    createdAt: row.created_at ? String(row.created_at) : undefined,
  };
}

function mapPrescription(row: Record<string, unknown>): Prescription {
  return {
    id: String(row.id),
    customerId: String(row.customer_id),
    doctorName: String(row.doctor_name),
    hospital: row.hospital ? String(row.hospital) : undefined,
    prescribedDate: String(row.prescribed_date),
    validUntil: String(row.valid_until),
    status: row.status as Prescription['status'],
    medicines: Array.isArray(row.medicines) ? row.medicines : [],
    notes: row.notes ? String(row.notes) : undefined,
    imageAttached: Boolean(row.image_attached),
  };
}

function mapRequirement(row: Record<string, unknown>): Requirement {
  return {
    id: String(row.id),
    customerId: String(row.customer_id),
    customerName: String(row.customer_name),
    phone: String(row.phone),
    source: row.source as Requirement['source'],
    items: Array.isArray(row.items) ? row.items : [],
    status: row.status as Requirement['status'],
    assignedStaffId: row.assigned_staff_id ? String(row.assigned_staff_id) : undefined,
    customerNotes: row.customer_notes ? String(row.customer_notes) : undefined,
    prescriptionAttached: Boolean(row.prescription_attached),
    urgency: row.urgency as Requirement['urgency'],
    deliveryRequired: Boolean(row.delivery_required),
    requirementDeliveryType: row.requirement_delivery_type as Requirement['requirementDeliveryType'],
    deliveryAddressId: row.delivery_address_id ? String(row.delivery_address_id) : undefined,
    courierCarrier: row.courier_carrier ? String(row.courier_carrier) : undefined,
    pickupBranchId: row.pickup_branch_id ? String(row.pickup_branch_id) : undefined,
    preferredDeliveryTime: row.preferred_delivery_time ? String(row.preferred_delivery_time) : undefined,
    branchId: String(row.branch_id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
  };
}

function mapOrder(row: Record<string, unknown>): Order {
  return {
    id: String(row.id),
    requirementId: row.requirement_id ? String(row.requirement_id) : undefined,
    customerId: String(row.customer_id),
    customerName: String(row.customer_name),
    customerPhone: String(row.customer_phone),
    customerAddress: String(row.customer_address ?? ''),
    customerArea: String(row.customer_area ?? ''),
    customerType: (row.customer_type as Order['customerType']) ?? 'Regular',
    preferredContact: (row.preferred_contact as Order['preferredContact']) ?? 'Phone',
    items: Array.isArray(row.items) ? row.items : [],
    source: row.source as Order['source'],
    orderDate: String(row.order_date),
    deliveryType: row.delivery_type as Order['deliveryType'],
    paymentMethod: row.payment_method as Order['paymentMethod'],
    paymentStatus: row.payment_status as Order['paymentStatus'],
    amountCollected: num(row.amount_collected),
    subtotal: num(row.subtotal),
    discount: num(row.discount),
    deliveryCharge: num(row.delivery_charge),
    total: num(row.total),
    status: row.status as Order['status'],
    branchId: String(row.branch_id),
    assignedStaffId: row.assigned_staff_id ? String(row.assigned_staff_id) : undefined,
    deliveryRequired: Boolean(row.delivery_required),
    deliveryAddress: row.delivery_address ? String(row.delivery_address) : undefined,
    preferredDeliveryTime: row.preferred_delivery_time ? String(row.preferred_delivery_time) : undefined,
    deliveryStatus: row.delivery_status ? (row.delivery_status as Order['deliveryStatus']) : undefined,
    deliveryPersonId: row.delivery_person_id ? String(row.delivery_person_id) : undefined,
    tripId: row.trip_id ? String(row.trip_id) : undefined,
    billNumber: row.bill_number ? String(row.bill_number) : undefined,
    billValue: row.bill_value != null ? num(row.bill_value) : undefined,
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
    completedAt: row.completed_at ? String(row.completed_at) : undefined,
    completedBy: row.completed_by ? String(row.completed_by) : undefined,
  };
}

function mapTrip(row: Record<string, unknown>): Trip {
  return {
    id: String(row.id),
    branchId: String(row.branch_id),
    deliveryPersonId: String(row.delivery_person_id),
    status: row.status as Trip['status'],
    stops: Array.isArray(row.stops) ? row.stops : [],
    startedAt: row.started_at ? String(row.started_at) : undefined,
    completedAt: row.completed_at ? String(row.completed_at) : undefined,
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
    createdAt: String(row.created_at),
  };
}

function mapCollection(row: Record<string, unknown>): Collection {
  return {
    id: String(row.id),
    orderId: String(row.order_id),
    customerId: String(row.customer_id),
    customerName: String(row.customer_name),
    amountDue: num(row.amount_due),
    amountCollected: num(row.amount_collected),
    balance: num(row.balance),
    paymentMethod: row.payment_method as Collection['paymentMethod'],
    dueDate: String(row.due_date),
    status: row.status as Collection['status'],
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
  };
}

function mapCompleted(row: Record<string, unknown>): CompletedRecord {
  return {
    id: String(row.id),
    orderId: String(row.order_id),
    customerId: String(row.customer_id),
    customerName: String(row.customer_name),
    completedDate: String(row.completed_date),
    items: Array.isArray(row.items) ? row.items : [],
    orderValue: num(row.order_value),
    paymentMethod: row.payment_method as CompletedRecord['paymentMethod'],
    branchId: String(row.branch_id),
    completedBy: String(row.completed_by),
    source: row.source as CompletedRecord['source'],
  };
}

function mapEnquiry(row: Record<string, unknown>): Enquiry {
  return {
    id: String(row.id),
    customerId: String(row.customer_id),
    customerName: String(row.customer_name),
    phone: String(row.phone),
    whatsappPhone: row.whatsapp_phone ? String(row.whatsapp_phone) : undefined,
    department: row.department as Enquiry['department'],
    query: String(row.query),
    queryCustom: row.query_custom ? String(row.query_custom) : undefined,
    status: row.status as Enquiry['status'],
    branchId: String(row.branch_id),
    requirementId: row.requirement_id ? String(row.requirement_id) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    closedAt: row.closed_at ? String(row.closed_at) : undefined,
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
  };
}

async function selectAll(table: string): Promise<Record<string, unknown>[]> {
  const { data, error } = await getSupabase().from(table).select('*');
  if (error) throw error;
  return (data ?? []) as Record<string, unknown>[];
}

export async function fetchAppData(): Promise<Omit<AppData, 'products'>> {
  const [
    branches,
    staff,
    customers,
    prescriptions,
    requirements,
    orders,
    trips,
    collections,
    completed,
    enquiries,
  ] = await Promise.all([
    selectAll('branches'),
    selectAll('staff'),
    selectAll('customers'),
    selectAll('prescriptions'),
    selectAll('requirements'),
    selectAll('orders'),
    selectAll('trips'),
    selectAll('collections'),
    selectAll('completed_records'),
    selectAll('enquiries'),
  ]);

  return {
    branches: branches.map(mapBranch),
    staff: staff.map(mapStaff),
    customers: customers.map(mapCustomer),
    prescriptions: prescriptions.map(mapPrescription),
    requirements: requirements.map(mapRequirement),
    orders: orders.map(mapOrder),
    trips: trips.map(mapTrip),
    collections: collections.map(mapCollection),
    completed: completed.map(mapCompleted),
    enquiries: enquiries.map(mapEnquiry),
  };
}

function branchRow(b: Branch) {
  return { id: b.id, name: b.name, code: b.code, location: b.location, phone: b.phone, status: b.status };
}

function staffRow(s: Staff) {
  return {
    id: s.id,
    name: s.name,
    role: s.role,
    branch_id: s.branchId,
    phone: s.phone,
    email: s.email ?? null,
  };
}

function customerRow(c: Customer) {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    whatsapp_phone: c.whatsappPhone ?? null,
    alternate_phone: c.alternatePhone ?? null,
    email: c.email ?? null,
    address: c.address,
    area: c.area,
    addresses: c.addresses ?? [],
    preferred_contact: c.preferredContact,
    total_orders: c.totalOrders,
    last_order_date: c.lastOrderDate ?? null,
    notes: c.notes ?? null,
    created_at: c.createdAt ?? null,
  };
}

function prescriptionRow(p: Prescription) {
  return {
    id: p.id,
    customer_id: p.customerId,
    doctor_name: p.doctorName,
    hospital: p.hospital ?? null,
    prescribed_date: p.prescribedDate,
    valid_until: p.validUntil,
    status: p.status,
    medicines: p.medicines,
    notes: p.notes ?? null,
    image_attached: p.imageAttached ?? false,
  };
}

function requirementRow(r: Requirement) {
  return {
    id: r.id,
    customer_id: r.customerId,
    customer_name: r.customerName,
    phone: r.phone,
    source: r.source,
    items: r.items,
    status: r.status,
    assigned_staff_id: r.assignedStaffId ?? null,
    customer_notes: r.customerNotes ?? null,
    prescription_attached: r.prescriptionAttached,
    urgency: r.urgency,
    delivery_required: r.deliveryRequired,
    requirement_delivery_type: r.requirementDeliveryType,
    delivery_address_id: r.deliveryAddressId ?? null,
    courier_carrier: r.courierCarrier ?? null,
    pickup_branch_id: r.pickupBranchId ?? null,
    preferred_delivery_time: r.preferredDeliveryTime ?? null,
    branch_id: r.branchId,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
    timeline: r.timeline,
  };
}

function orderRow(o: Order) {
  return {
    id: o.id,
    requirement_id: o.requirementId ?? null,
    customer_id: o.customerId,
    customer_name: o.customerName,
    customer_phone: o.customerPhone,
    customer_address: o.customerAddress,
    customer_area: o.customerArea,
    customer_type: o.customerType,
    preferred_contact: o.preferredContact,
    items: o.items,
    source: o.source,
    order_date: o.orderDate,
    delivery_type: o.deliveryType,
    payment_method: o.paymentMethod,
    payment_status: o.paymentStatus,
    amount_collected: o.amountCollected,
    subtotal: o.subtotal,
    discount: o.discount,
    delivery_charge: o.deliveryCharge,
    total: o.total,
    status: o.status,
    branch_id: o.branchId,
    assigned_staff_id: o.assignedStaffId ?? null,
    delivery_required: o.deliveryRequired,
    delivery_address: o.deliveryAddress ?? null,
    preferred_delivery_time: o.preferredDeliveryTime ?? null,
    delivery_status: o.deliveryStatus ?? null,
    delivery_person_id: o.deliveryPersonId ?? null,
    trip_id: o.tripId ?? null,
    bill_number: o.billNumber ?? null,
    bill_value: o.billValue ?? null,
    timeline: o.timeline,
    completed_at: o.completedAt ?? null,
    completed_by: o.completedBy ?? null,
  };
}

function tripRow(t: Trip) {
  return {
    id: t.id,
    branch_id: t.branchId,
    delivery_person_id: t.deliveryPersonId,
    status: t.status,
    stops: t.stops,
    started_at: t.startedAt ?? null,
    completed_at: t.completedAt ?? null,
    timeline: t.timeline,
    created_at: t.createdAt,
  };
}

function collectionRow(c: Collection) {
  return {
    id: c.id,
    order_id: c.orderId,
    customer_id: c.customerId,
    customer_name: c.customerName,
    amount_due: c.amountDue,
    amount_collected: c.amountCollected,
    balance: c.balance,
    payment_method: c.paymentMethod,
    due_date: c.dueDate,
    status: c.status,
    timeline: c.timeline,
  };
}

function completedRow(c: CompletedRecord) {
  return {
    id: c.id,
    order_id: c.orderId,
    customer_id: c.customerId,
    customer_name: c.customerName,
    completed_date: c.completedDate,
    items: c.items,
    order_value: c.orderValue,
    payment_method: c.paymentMethod,
    branch_id: c.branchId,
    completed_by: c.completedBy,
    source: c.source,
  };
}

function enquiryRow(e: Enquiry) {
  return {
    id: e.id,
    customer_id: e.customerId,
    customer_name: e.customerName,
    phone: e.phone,
    whatsapp_phone: e.whatsappPhone ?? null,
    department: e.department,
    query: e.query,
    query_custom: e.queryCustom ?? null,
    status: e.status,
    branch_id: e.branchId,
    requirement_id: e.requirementId ?? null,
    created_at: e.createdAt,
    updated_at: e.updatedAt,
    closed_at: e.closedAt ?? null,
    timeline: e.timeline,
  };
}

async function upsert(table: string, rows: object[]) {
  if (rows.length === 0) return;
  const { error } = await getSupabase().from(table).upsert(rows, { onConflict: 'id' });
  if (error) throw error;
}

async function deleteMissing(table: string, keepIds: string[]) {
  const { data, error } = await getSupabase().from(table).select('id');
  if (error) throw error;
  const keep = new Set(keepIds);
  const gone = (data ?? []).map((r) => String(r.id)).filter((id) => !keep.has(id));
  if (gone.length === 0) return;
  const { error: delError } = await getSupabase().from(table).delete().in('id', gone);
  if (delError) throw delError;
}

export async function persistAppData(data: Omit<AppData, 'products'>): Promise<void> {
  await upsert('branches', data.branches.map(branchRow));
  await upsert('staff', data.staff.map(staffRow));
  await upsert('customers', data.customers.map(customerRow));
  await upsert('prescriptions', data.prescriptions.map(prescriptionRow));
  await upsert('requirements', data.requirements.map(requirementRow));
  await upsert('orders', data.orders.map(orderRow));
  await upsert('trips', data.trips.map(tripRow));
  await upsert('collections', data.collections.map(collectionRow));
  await upsert('completed_records', data.completed.map(completedRow));
  await upsert('enquiries', data.enquiries.map(enquiryRow));

  await deleteMissing('enquiries', data.enquiries.map((r) => r.id));
  await deleteMissing('completed_records', data.completed.map((r) => r.id));
  await deleteMissing('collections', data.collections.map((r) => r.id));
  await deleteMissing('trips', data.trips.map((r) => r.id));
  await deleteMissing('orders', data.orders.map((r) => r.id));
  await deleteMissing('requirements', data.requirements.map((r) => r.id));
  await deleteMissing('prescriptions', data.prescriptions.map((r) => r.id));
  await deleteMissing('customers', data.customers.map((r) => r.id));
  await deleteMissing('staff', data.staff.map((r) => r.id));
  await deleteMissing('branches', data.branches.map((r) => r.id));
}
