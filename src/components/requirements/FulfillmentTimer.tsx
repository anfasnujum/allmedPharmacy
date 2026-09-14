import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';
import type { Order, Requirement } from '@/types';
import {
  formatFulfillmentCountdown,
  getFulfillmentTimeRemaining,
  getFulfillmentTimerTone,
  getOrderFulfillmentDeadline,
  getRequirementFulfillmentDeadline,
} from '@/utils/requirementTimer';
import { cn } from '@/utils/cn';

const toneClasses = {
  danger: 'text-red-600 bg-red-50',
  warning: 'text-amber-700 bg-amber-50',
  success: 'text-emerald-700 bg-emerald-50',
  muted: 'text-brand-text-secondary bg-gray-50',
};

interface FulfillmentCountdownProps {
  deadline: Date | null;
  isTerminal: boolean;
  terminalLabel?: string;
  className?: string;
}

function FulfillmentCountdown({ deadline, isTerminal, terminalLabel, className }: FulfillmentCountdownProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (isTerminal || !deadline) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [isTerminal, deadline]);

  if (isTerminal) {
    return (
      <span className={cn('text-brand-text-secondary', className)}>
        {terminalLabel ?? 'Closed'}
      </span>
    );
  }

  if (!deadline) {
    return <span className={cn('text-brand-text-secondary', className)}>—</span>;
  }

  const { totalMs, overdue } = getFulfillmentTimeRemaining(deadline, now);
  const tone = getFulfillmentTimerTone(totalMs, overdue);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium tabular-nums whitespace-nowrap',
        toneClasses[tone],
        className,
      )}
      title={`Fulfill by ${deadline.toLocaleString('en-IN')}`}
    >
      <Timer size={12} className="shrink-0" />
      {formatFulfillmentCountdown(totalMs)}
    </span>
  );
}

interface FulfillmentTimerProps {
  requirement: Requirement;
  className?: string;
}

export function FulfillmentTimer({ requirement, className }: FulfillmentTimerProps) {
  const deadline = getRequirementFulfillmentDeadline(requirement);
  const isTerminal = requirement.status === 'Completed' || requirement.status === 'Cancelled';

  return (
    <FulfillmentCountdown
      deadline={deadline}
      isTerminal={isTerminal}
      terminalLabel={requirement.status === 'Completed' ? 'Fulfilled' : 'Cancelled'}
      className={className}
    />
  );
}

interface OrderFulfillmentTimerProps {
  order: Order;
  requirement?: Requirement | null;
  className?: string;
}

export function OrderFulfillmentTimer({ order, requirement, className }: OrderFulfillmentTimerProps) {
  const deadline = getOrderFulfillmentDeadline(order, requirement);
  const isTerminal = order.status === 'Completed' || order.status === 'Cancelled';

  return (
    <FulfillmentCountdown
      deadline={deadline}
      isTerminal={isTerminal}
      terminalLabel={order.status === 'Completed' ? 'Completed' : 'Cancelled'}
      className={className}
    />
  );
}
