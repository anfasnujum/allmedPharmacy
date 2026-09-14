import type { Order, Requirement } from '@/types';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/** Resolve fulfillment deadline when no explicit ETA is set. */
function fallbackDeadlineMs(req: Requirement): number {
  if (req.status === 'Follow-up') return 10 * MINUTE;
  if (req.requirementDeliveryType === 'Courier') return 3 * HOUR;
  if (req.urgency === 'Critical') return 30 * MINUTE;
  if (req.urgency === 'Urgent') return 1 * HOUR;
  if (req.requirementDeliveryType === 'Counter Pickup') return 45 * MINUTE;
  if (req.requirementDeliveryType === 'Home Delivery') return 2 * HOUR;
  return 1 * HOUR;
}

export function getRequirementFulfillmentDeadline(req: Requirement): Date | null {
  if (req.status === 'Completed' || req.status === 'Cancelled') return null;

  if (req.preferredDeliveryTime) {
    return new Date(req.preferredDeliveryTime);
  }

  const created = new Date(req.createdAt).getTime();
  return new Date(created + fallbackDeadlineMs(req));
}

/** Order timer: ETA from create-order step, else requirement creation + fallback rules. */
export function getOrderFulfillmentDeadline(order: Order, requirement?: Requirement | null): Date | null {
  if (order.status === 'Completed' || order.status === 'Cancelled') return null;

  if (order.preferredDeliveryTime) {
    return new Date(order.preferredDeliveryTime);
  }

  if (requirement) {
    const created = new Date(requirement.createdAt).getTime();
    return new Date(created + fallbackDeadlineMs(requirement));
  }

  const created = new Date(order.orderDate).getTime();
  return new Date(created + HOUR);
}

export interface FulfillmentTimeRemaining {
  totalMs: number;
  overdue: boolean;
}

export function getFulfillmentTimeRemaining(deadline: Date, now = Date.now()): FulfillmentTimeRemaining {
  const totalMs = deadline.getTime() - now;
  return { totalMs, overdue: totalMs < 0 };
}

export function formatFulfillmentCountdown(totalMs: number): string {
  const absMs = Math.abs(totalMs);
  const totalSeconds = Math.floor(absMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  const label = parts.join(' ');
  return totalMs < 0 ? `Overdue by ${label}` : label;
}

export function getFulfillmentTimerTone(totalMs: number, overdue: boolean): 'danger' | 'warning' | 'success' | 'muted' {
  if (overdue) return 'danger';
  if (totalMs <= 10 * MINUTE) return 'danger';
  if (totalMs <= 30 * MINUTE) return 'warning';
  return 'success';
}
