import type {
  RequirementStatus,
  OrderStatus,
  DeliveryStatus,
  TripStatus,
  CollectionStatus,
  Source,
  PaymentStatus,
  EnquiryStatus,
  Urgency,
} from '@/types';

type BadgeVariant = 'info' | 'active' | 'success' | 'warning' | 'danger' | 'neutral';

export function getRequirementStatusVariant(status: RequirementStatus): BadgeVariant {
  const map: Record<RequirementStatus, BadgeVariant> = {
    New: 'info',
    'Follow-up': 'warning',
    Partial: 'active',
    Completed: 'success',
    Cancelled: 'danger',
  };
  return map[status];
}

export function getOrderStatusVariant(status: OrderStatus): BadgeVariant {
  const map: Record<OrderStatus, BadgeVariant> = {
    New: 'info',
    Confirming: 'warning',
    Processing: 'active',
    Ready: 'success',
    'Trip Assigned': 'info',
    'Picked Up': 'info',
    'Out for Delivery': 'active',
    Delivered: 'success',
    'Collection Pending': 'warning',
    Completed: 'success',
    Cancelled: 'danger',
  };
  return map[status];
}

export function getTripStatusVariant(status: TripStatus): BadgeVariant {
  const map: Record<TripStatus, BadgeVariant> = {
    Scheduled: 'warning',
    'In Progress': 'active',
    Completed: 'success',
  };
  return map[status];
}

export function getDeliveryStatusVariant(status: DeliveryStatus): BadgeVariant {
  const map: Record<DeliveryStatus, BadgeVariant> = {
    Pending: 'warning',
    Preparing: 'active',
    Assigned: 'info',
    'Out for Delivery': 'active',
    Delivered: 'success',
    Failed: 'danger',
    Rescheduled: 'warning',
  };
  return map[status];
}

export function getCollectionStatusVariant(status: CollectionStatus): BadgeVariant {
  const map: Record<CollectionStatus, BadgeVariant> = {
    Pending: 'warning',
    'Partially Collected': 'active',
    Collected: 'success',
    Overdue: 'danger',
  };
  return map[status];
}

export function getSourceVariant(source: Source): BadgeVariant {
  const map: Record<Source, BadgeVariant> = {
    Counter: 'neutral',
    Phone: 'info',
    WhatsApp: 'success',
  };
  return map[source];
}

export function getUrgencyVariant(urgency: Urgency): BadgeVariant {
  const map: Record<Urgency, BadgeVariant> = {
    Normal: 'neutral',
    Urgent: 'warning',
    Critical: 'danger',
  };
  return map[urgency];
}

export function getPaymentStatusVariant(status: PaymentStatus): BadgeVariant {
  const map: Record<PaymentStatus, BadgeVariant> = {
    Pending: 'warning',
    Partial: 'active',
    Paid: 'success',
    Refunded: 'neutral',
  };
  return map[status];
}

export function getEnquiryStatusVariant(status: EnquiryStatus): BadgeVariant {
  const map: Record<EnquiryStatus, BadgeVariant> = {
    Open: 'info',
    Closed: 'neutral',
    Converted: 'success',
  };
  return map[status];
}

export const badgeClasses: Record<BadgeVariant, string> = {
  info: 'bg-brand-cyan/15 text-brand-cyan-dark border-brand-cyan/30',
  active: 'bg-brand-primary/10 text-brand-primary border-brand-primary/30',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-brand-primary border-red-200',
  neutral: 'bg-gray-100 text-gray-600 border-gray-200',
};
