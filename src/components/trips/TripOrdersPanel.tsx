import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, Snowflake, FileWarning, Phone, MapPin, Package } from 'lucide-react';
import { useTrips } from '@/store/DataContext';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/utils/format';
import { getOrderStatusVariant } from '@/utils/statusHelpers';
import { requiresRefrigeration } from '@/utils/productCompliance';
import { cn } from '@/utils/cn';
import type { Order, Trip, TripStop } from '@/types';

interface TripOrdersPanelProps {
  trip: Trip;
  orders: Order[];
  actorId: string;
  variant?: 'web' | 'mobile';
  onCompleteStop?: (stop: TripStop) => void;
}

function itemKey(orderId: string, index: number) {
  return `${orderId}:${index}`;
}

export function TripOrdersPanel({
  trip,
  orders,
  actorId,
  variant = 'web',
  onCompleteStop,
}: TripOrdersPanelProps) {
  const { pickUpTripOrder } = useTrips();
  const isInProgress = trip.status === 'In Progress';
  const isScheduled = trip.status === 'Scheduled';

  const [checkedItems, setCheckedItems] = useState<Record<string, Set<number>>>({});
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const stop of trip.stops) {
      const order = orders.find((o) => o.id === stop.orderId);
      if (order?.status === 'Trip Assigned') initial.add(stop.orderId);
    }
    return initial;
  });

  const pickedUpCount = useMemo(
    () => trip.stops.filter((s) => orders.find((o) => o.id === s.orderId)?.status === 'Picked Up').length,
    [trip.stops, orders],
  );

  const toggleExpanded = (orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const toggleItem = (orderId: string, index: number, checked: boolean) => {
    setCheckedItems((prev) => {
      const next = { ...prev };
      const set = new Set(prev[orderId] ?? []);
      if (checked) set.add(index);
      else set.delete(index);
      next[orderId] = set;
      return next;
    });
  };

  const handleConfirmPickup = (orderId: string, itemCount: number) => {
    const checked = checkedItems[orderId] ?? new Set<number>();
    if (checked.size < itemCount) {
      toast.error('Check all items before confirming pickup');
      return;
    }
    const { ok, error } = pickUpTripOrder({ tripId: trip.id, orderId, actorId });
    if (!ok) {
      toast.error(error ?? 'Could not confirm pickup');
      return;
    }
    toast.success('Order picked up');
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      next.delete(orderId);
      return next;
    });
  };

  const cardClass = variant === 'mobile' ? 'rounded-xl border p-4' : 'rounded-lg border p-4';

  return (
    <div className="space-y-3">
      {isScheduled && (
        <p className="text-sm text-brand-text-secondary">
          Pick up {trip.stops.length - pickedUpCount} of {trip.stops.length} orders before starting the trip.
        </p>
      )}

      {trip.stops.map((stop, stopIndex) => {
        const order = orders.find((o) => o.id === stop.orderId);
        const isPickedUp = order?.status === 'Picked Up';
        const awaitingPickup = order?.status === 'Trip Assigned';
        const isExpanded = expandedOrders.has(stop.orderId);
        const items = order?.items ?? [];
        const checked = checkedItems[stop.orderId] ?? new Set<number>();
        const allChecked = items.length > 0 && checked.size === items.length;

        return (
          <div
            key={stop.orderId}
            className={cn(
              cardClass,
              stop.completed
                ? 'border-emerald-200 bg-emerald-50/40'
                : isPickedUp
                  ? 'border-cyan-200 bg-cyan-50/30'
                  : 'border-brand-border bg-white',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {variant === 'mobile' && (
                  <span className="text-xs font-medium text-brand-text-secondary">Stop {stopIndex + 1}</span>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  {variant === 'web' ? (
                    <Link
                      to={`/orders/${stop.orderId}`}
                      className="font-medium text-brand-primary hover:underline"
                    >
                      {stop.orderId}
                    </Link>
                  ) : (
                    <span className="font-semibold">{stop.orderId}</span>
                  )}
                  {order && (
                    <StatusBadge label={order.status} variant={getOrderStatusVariant(order.status)} />
                  )}
                  {stop.completed && <StatusBadge label="Delivered" variant="success" />}
                </div>
                <p className={cn('font-medium', variant === 'mobile' ? 'text-base' : 'text-sm')}>
                  {stop.customerName}
                </p>
                {isInProgress && (
                  <>
                    <p className="text-xs text-brand-text-secondary mt-1 flex items-start gap-1">
                      <MapPin size={12} className="shrink-0 mt-0.5" />
                      {stop.address}
                    </p>
                    {variant === 'mobile' && (
                      <a
                        href={`tel:${stop.customerPhone.replace(/\s/g, '')}`}
                        className="flex items-center gap-1 text-sm text-brand-primary font-medium mt-1"
                      >
                        <Phone size={14} />
                        {stop.customerPhone}
                      </a>
                    )}
                  </>
                )}
              </div>

              {awaitingPickup && (
                <button
                  type="button"
                  onClick={() => toggleExpanded(stop.orderId)}
                  className="flex items-center gap-1 text-xs font-medium text-brand-primary shrink-0"
                >
                  Pick up Order
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              )}
            </div>

            {isScheduled && awaitingPickup && isExpanded && (
              <div className="mt-4 pt-4 border-t border-brand-border">
                <div className="flex items-center gap-2 mb-3">
                  <Package size={16} className="text-brand-text-secondary" />
                  <span className="text-sm font-semibold">{items.length} items to pick up</span>
                  <span className="text-xs text-brand-text-secondary">
                    ({checked.size}/{items.length} checked)
                  </span>
                </div>

                <ul className="space-y-2">
                  {items.map((item, index) => {
                    const needsRx = item.prescriptionRequired;
                    const needsFridge = requiresRefrigeration(item.storageType);
                    return (
                      <li
                        key={itemKey(stop.orderId, index)}
                        className={cn(
                          'rounded-lg border p-3 text-sm transition-colors',
                          checked.has(index) ? 'border-emerald-200 bg-emerald-50/40' : 'border-brand-border',
                        )}
                      >
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked.has(index)}
                            onChange={(e) => toggleItem(stop.orderId, index, e.target.checked)}
                            className="mt-1 rounded border-brand-border text-brand-primary focus:ring-brand-primary/20"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-brand-text-secondary text-xs">
                              {item.strength} · Qty {item.quantity}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {needsRx && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-800">
                                  <FileWarning size={10} /> Rx required
                                </span>
                              )}
                              {needsFridge && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border border-sky-200 bg-sky-50 text-sky-800">
                                  <Snowflake size={10} /> Refrigeration
                                </span>
                              )}
                            </div>
                          </div>
                        </label>
                      </li>
                    );
                  })}
                </ul>

                <Button
                  className="w-full mt-4"
                  size={variant === 'mobile' ? 'lg' : 'md'}
                  disabled={!allChecked}
                  onClick={() => handleConfirmPickup(stop.orderId, items.length)}
                >
                  Confirm Pickup
                </Button>
              </div>
            )}

            {isScheduled && isPickedUp && (
              <p className="text-xs text-cyan-700 mt-2 flex items-center gap-1">
                <Package size={12} /> {items.length} items picked up — ready for trip
              </p>
            )}

            {isInProgress && (
              <>
                <div className="flex flex-wrap gap-2 mt-3">
                  {stop.prescriptionRequired && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border border-amber-200 bg-amber-50 text-amber-800">
                      <FileWarning size={12} /> Rx to collect
                    </span>
                  )}
                  {stop.hasFridgeItem && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border border-sky-200 bg-sky-50 text-sky-800">
                      <Snowflake size={12} /> Fridge item
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-brand-border">
                  <div>
                    <p className="font-medium">{formatCurrency(stop.billValue)}</p>
                    {stop.amountToCollect > 0 && (
                      <p className="text-xs text-brand-text-secondary">
                        Collect {formatCurrency(stop.amountToCollect)}
                      </p>
                    )}
                  </div>
                  {!stop.completed && onCompleteStop && (
                    <Button
                      size={variant === 'mobile' ? 'lg' : 'sm'}
                      onClick={() => onCompleteStop(stop)}
                    >
                      {variant === 'mobile' ? 'Complete' : 'Complete Order'}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
