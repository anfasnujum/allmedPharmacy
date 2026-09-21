import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useTrips, useStaff, useOrders } from '@/store/DataContext';
import { useBranch } from '@/store/BranchContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Timeline } from '@/components/ui/Timeline';
import { CompleteTripOrderModal } from '@/components/trips/CompleteTripOrderModal';
import { TripOrdersPanel } from '@/components/trips/TripOrdersPanel';
import { useTripPickupState } from '@/components/trips/useTripPickupState';
import { formatDateTime } from '@/utils/format';
import { getTripStatusVariant } from '@/utils/statusHelpers';
import { useActorId } from '@/constants/session';
import type { TripStop } from '@/types';

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trips, startTrip, endTrip, completeTripOrder } = useTrips();
  const { orders } = useOrders();
  const staff = useStaff();
  const { activeBranch } = useBranch();
  const actorId = useActorId();

  const [completeStop, setCompleteStop] = useState<TripStop | null>(null);

  const trip = trips.find((t) => t.id === id);
  const staffMap = Object.fromEntries(staff.map((s) => [s.id, s.name]));
  const { canStart, pickupRemaining, allPickedUp } = useTripPickupState(trip, orders);

  if (!trip) {
    return (
      <div className="text-center py-16">
        <p className="text-brand-text-secondary mb-4">Trip not found</p>
        <Button variant="outline" onClick={() => navigate('/trips')}>
          <ArrowLeft size={16} /> Back
        </Button>
      </div>
    );
  }

  const handleStartTrip = () => {
    if (!canStart) {
      toast.error(`Pick up all orders first (${pickupRemaining} remaining)`);
      return;
    }
    const ok = startTrip(trip.id, actorId);
    if (!ok) {
      toast.error('Could not start trip');
      return;
    }
    toast.success('Trip started — orders are out for delivery');
  };

  const handleEndTrip = () => {
    const pending = trip.stops.filter((s) => !s.completed);
    if (pending.length > 0) {
      toast.error(`${pending.length} order(s) still pending`);
      return;
    }
    const ok = endTrip(trip.id, actorId);
    if (!ok) {
      toast.error('Could not end trip');
      return;
    }
    toast.success('Trip completed');
  };

  const handleCompleteOrder = (payload: {
    paymentOption: import('@/types').TripOrderPaymentOption;
    addressLine: string;
    area: string;
    lat: number;
    lng: number;
    saveAsNewAddress?: boolean;
    newAddressLabel?: string;
  }) => {
    if (!completeStop) return;
    const { ok, error } = completeTripOrder({
      tripId: trip.id,
      orderId: completeStop.orderId,
      ...payload,
      actorId,
    });
    if (!ok) {
      toast.error(error ?? 'Could not complete order');
      return;
    }
    setCompleteStop(null);
    toast.success('Order completed');
  };

  const isInProgress = trip.status === 'In Progress';
  const isScheduled = trip.status === 'Scheduled';

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={trip.id}
        breadcrumbs={[{ label: 'Trips', path: '/trips' }, { label: trip.id }]}
        actions={
          <div className="flex gap-2 flex-wrap">
            {isScheduled && (
              <Button onClick={handleStartTrip} disabled={!canStart}>
                Start Trip
              </Button>
            )}
            {isInProgress && (
              <Button
                variant={trip.stops.every((s) => s.completed) ? 'primary' : 'outline'}
                onClick={handleEndTrip}
              >
                End Trip
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/trips')}>
              <ArrowLeft size={16} /> Back
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <StatusBadge label={trip.status} variant={getTripStatusVariant(trip.status)} />
        <span className="text-sm text-brand-text-secondary">
          Agent: {staffMap[trip.deliveryPersonId] ?? trip.deliveryPersonId}
        </span>
        <span className="text-sm text-brand-text-secondary">{trip.stops.length} orders</span>
        {isScheduled && !allPickedUp && (
          <span className="text-sm text-amber-700">{pickupRemaining} awaiting pickup</span>
        )}
        {trip.startedAt && (
          <span className="text-sm text-brand-text-secondary">Started {formatDateTime(trip.startedAt)}</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">
              {isScheduled ? 'Pick Up Orders' : 'Orders on Trip'}
            </h3>
            <TripOrdersPanel
              trip={trip}
              orders={orders}
              actorId={actorId}
              variant="web"
              onCompleteStop={isInProgress ? setCompleteStop : undefined}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Timeline</h3>
            <Timeline events={trip.timeline} staffMap={staffMap} />
          </div>
        </div>
      </div>

      {completeStop && (
        <CompleteTripOrderModal
          open={Boolean(completeStop)}
          stop={completeStop}
          deliveryPersonId={trip.deliveryPersonId}
          branchName={activeBranch.name}
          onClose={() => setCompleteStop(null)}
          onConfirm={handleCompleteOrder}
        />
      )}
    </div>
  );
}
