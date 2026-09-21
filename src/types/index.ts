export type Source = 'Counter' | 'Phone' | 'WhatsApp';
export type ContactMethod = 'Phone' | 'WhatsApp' | 'Email' | 'SMS';
export type Urgency = 'Normal' | 'Urgent' | 'Critical';
export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Other' | 'COD';
export type PaymentStatus = 'Pending' | 'Partial' | 'Paid' | 'Refunded';
export type DeliveryType = 'Pickup' | 'Delivery';

export type RequirementDeliveryType = 'Home Delivery' | 'Courier' | 'Counter Pickup';

export type RequirementStatus =
  | 'New'
  | 'Follow-up'
  | 'Completed'
  | 'Partial'
  | 'Cancelled';

export type OrderStatus =
  | 'New'
  | 'Confirming'
  | 'Processing'
  | 'Ready'
  | 'Trip Assigned'
  | 'Picked Up'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Collection Pending'
  | 'Completed'
  | 'Cancelled';

export type DeliveryStatus =
  | 'Pending'
  | 'Preparing'
  | 'Assigned'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Failed'
  | 'Rescheduled';

export type CollectionStatus = 'Pending' | 'Partially Collected' | 'Collected' | 'Overdue';

export type EnquiryStatus = 'Open' | 'Closed' | 'Converted';

export type EnquiryDepartment =
  | 'Surgicals'
  | 'FMCG'
  | 'Pharmacy'
  | 'HR'
  | 'Purchase'
  | 'Admin';

export interface Branch {
  id: string;
  name: string;
  code: string;
  location: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  branchId: string;
  phone: string;
  email?: string;
}

export type PrescriptionStatus = 'Active' | 'Expired' | 'Completed';

export interface CustomerAddress {
  id: string;
  label: string;
  addressLine: string;
  area: string;
  city: string;
  pincode?: string;
  landmark?: string;
  lat: number;
  lng: number;
  isPrimary: boolean;
}

export interface PrescriptionMedicine {
  productName: string;
  strength: string;
  dosage: string;
  duration: string;
}

export interface Prescription {
  id: string;
  customerId: string;
  doctorName: string;
  hospital?: string;
  prescribedDate: string;
  validUntil: string;
  status: PrescriptionStatus;
  medicines: PrescriptionMedicine[];
  notes?: string;
  imageAttached?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsappPhone?: string;
  alternatePhone?: string;
  email?: string;
  address: string;
  area: string;
  addresses: CustomerAddress[];
  preferredContact: ContactMethod;
  totalOrders: number;
  lastOrderDate?: string;
  notes?: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  sku: string;
  code: string;
  name: string;
  fullName?: string;
  genericName: string;
  brand: string;
  strength: string;
  form: string;
  category: string;
  unitPrice: number;
  mrp?: number;
  prescriptionRequired: boolean;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  // Product master metadata (from Excel)
  slNo?: number;
  type?: string;
  manfPrCode?: string;
  brandName?: string;
  packing?: string;
  ean?: string;
  unitName?: string;
  unitsPerPack?: number;
  packName?: string;
  shortName?: string;
  indiaTax?: string;
  manfCode?: string;
  manfName?: string;
  genericCode?: string;
  productTree1?: string;
  productTree2?: string;
  productTree3?: string;
  productTree4?: string;
  productTree5?: string;
  category2?: string;
  hsnCode?: string;
  activationStatus?: string;
  scheduleType?: string;
  dateOfIntroduction?: string;
  addlCode1?: string;
  addlCode2?: string;
  addlCode3?: string;
  storageType?: string;
  lpCategory?: string;
  productRange?: string;
  centralizedReorderDivisions?: string;
  therapeuticClass?: string;
  storeClass?: string;
  addlDesc?: string;
  createdUser?: string;
  lastModifiedUser?: string;
  lastModifiedTime?: string;
  productType?: string;
  riskValue?: string;
  nonReturnableItem?: string;
  isNppaItem?: string;
  centralisedLocation?: string;
}

export interface RequirementItem {
  productId?: string;
  productName: string;
  strength: string;
  quantity: number;
  prescriptionRequired: boolean;
  scheduleType?: string;
  storageType?: string;
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  description: string;
  actor?: string;
}

export interface Requirement {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  source: Source;
  items: RequirementItem[];
  status: RequirementStatus;
  assignedStaffId?: string;
  customerNotes?: string;
  prescriptionAttached: boolean;
  urgency: Urgency;
  deliveryRequired: boolean;
  requirementDeliveryType: RequirementDeliveryType;
  deliveryAddressId?: string;
  courierCarrier?: string;
  pickupBranchId?: string;
  preferredDeliveryTime?: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}

export interface OrderItem {
  productId?: string;
  productName: string;
  strength: string;
  quantity: number;
  unitPrice: number;
  prescriptionRequired: boolean;
  scheduleType?: string;
  storageType?: string;
}

export interface Order {
  id: string;
  requirementId?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerArea: string;
  customerType: 'Regular' | 'New' | 'VIP';
  preferredContact: ContactMethod;
  items: OrderItem[];
  source: Source;
  orderDate: string;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amountCollected: number;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  status: OrderStatus;
  branchId: string;
  assignedStaffId?: string;
  deliveryRequired: boolean;
  deliveryAddress?: string;
  preferredDeliveryTime?: string;
  deliveryStatus?: DeliveryStatus;
  deliveryPersonId?: string;
  tripId?: string;
  billNumber?: string;
  billValue?: number;
  timeline: TimelineEvent[];
  completedAt?: string;
  completedBy?: string;
}

export interface CreateOrderFromRequirementInput {
  requirementId: string;
  items: OrderItem[];
  remainingItems: RequirementItem[];
  deliveryAddressId?: string;
  preferredDeliveryTime: string;
  billNumber: string;
  billValue: number;
}

export interface AddItemsToRequirementInput {
  requirementId: string;
  items: RequirementItem[];
  actorId: string;
}

export interface FinishOrderPackingSkippedItem {
  itemIndex: number;
  reason: string;
}

export interface FinishOrderPackingInput {
  orderId: string;
  packedItemIndices: number[];
  skippedItems: FinishOrderPackingSkippedItem[];
  newBillNumber?: string;
  newBillValue?: number;
  actorId: string;
}

export type TripStatus = 'Scheduled' | 'In Progress' | 'Completed';

export type TripOrderPaymentOption = 'Collected by Agent' | 'Collected by Store' | 'Pay Later';

export interface TripStop {
  orderId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  addressLine: string;
  area: string;
  lat: number;
  lng: number;
  billValue: number;
  amountToCollect: number;
  prescriptionRequired: boolean;
  hasFridgeItem: boolean;
  completed: boolean;
  paymentOption?: TripOrderPaymentOption;
}

export interface Trip {
  id: string;
  branchId: string;
  deliveryPersonId: string;
  status: TripStatus;
  stops: TripStop[];
  startedAt?: string;
  completedAt?: string;
  timeline: TimelineEvent[];
  createdAt: string;
}

export interface CreateTripInput {
  branchId: string;
  deliveryPersonId: string;
  orderIds: string[];
  actorId: string;
}

export interface CompleteTripOrderInput {
  tripId: string;
  orderId: string;
  paymentOption: TripOrderPaymentOption;
  addressLine: string;
  area: string;
  lat: number;
  lng: number;
  saveAsNewAddress?: boolean;
  newAddressLabel?: string;
  actorId: string;
}

export interface PickUpTripOrderInput {
  tripId: string;
  orderId: string;
  actorId: string;
}

/** @deprecated Legacy per-order delivery record — use Trip instead */
export interface Delivery {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: OrderItem[];
  deliverySlot: string;
  deliveryPersonId?: string;
  status: DeliveryStatus;
  amountToCollect: number;
  paymentStatus: PaymentStatus;
  timeline: TimelineEvent[];
  createdAt: string;
}

export interface Collection {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  amountDue: number;
  amountCollected: number;
  balance: number;
  paymentMethod: PaymentMethod;
  dueDate: string;
  status: CollectionStatus;
  timeline: TimelineEvent[];
}

export interface CompletedRecord {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  completedDate: string;
  items: OrderItem[];
  orderValue: number;
  paymentMethod: PaymentMethod;
  branchId: string;
  completedBy: string;
  source: Source;
}

export interface Enquiry {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  whatsappPhone?: string;
  department: EnquiryDepartment;
  query: string;
  queryCustom?: string;
  status: EnquiryStatus;
  branchId: string;
  requirementId?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  timeline: TimelineEvent[];
}

export interface AppData {
  customers: Customer[];
  products: Product[];
  requirements: Requirement[];
  orders: Order[];
  trips: Trip[];
  collections: Collection[];
  completed: CompletedRecord[];
  prescriptions: Prescription[];
  enquiries: Enquiry[];
  branches: Branch[];
  staff: Staff[];
}

export interface SearchResult {
  type: 'customer' | 'requirement' | 'order' | 'product' | 'enquiry';
  id: string;
  title: string;
  subtitle: string;
  path: string;
}
