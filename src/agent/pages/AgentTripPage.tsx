import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useTrips, useOrders, useBranches } from '@/store/DataContext';
import { useAgentStaffId } from '@/agent/useAgentStaffId';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CompleteTripOrderModal } from '@/components/trips/CompleteTripOrderModal';
import { TripOrdersPanel } from '@/components/trips/TripOrdersPanel';
import { useTripPickupState } from '@/components/trips/useTripPickupState';
import { getTripStatusVariant } from '@/utils/statusHelpers';
import type { TripStop } from '@/types';

export function AgentTripPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trips, startTrip, endTrip, completeTripOrder } = useTrips();
  const { orders } = useOrders();
  const branches = useBranches();

  const { agentId } = useAgentStaffId();

  const [completeStop, setCompleteStop] = useState<TripStop | null>(null);

  const trip = trips.find((t) => t.id === id && t.deliveryPersonId === agentId);
  const branch = trip ? branches.find((b) => b.id === trip.branchId) : undefined;
  const { canStart, pickupRemaining, allPickedUp } = useTripPickupState(trip, orders);

  if (!trip) {
    return (
      <div className="text-center py-12">
        <p className="text-brand-text-secondary mb-4">Trip not found or not assigned to you</p>
        <Button variant="outline" onClick={() => navigate('/agent')}>
          <ArrowLeft size={16} /> Back
        </Button>
      </div>
    );
  }

  const isInProgress = trip.status === 'In Progress';
  const isScheduled = trip.status === 'Scheduled';
  const pendingCount = trip.stops.filter((s) => !s.completed).length;

  const handleStartTrip = () => {
    if (!canStart) {
      toast.error(`Pick up all orders first (${pickupRemaining} remaining)`);
      return;
    }
    const ok = startTrip(trip.id, agentId);
    if (!ok) {
      toast.error('Could not start trip');
      return;
    }
    toast.success('Trip started');
  };

  const handleEndTrip = () => {
    if (pendingCount > 0) {
      toast.error(`${pendingCount} order(s) still pending`);
      return;
    }
    const ok = endTrip(trip.id, agentId);
    if (!ok) {
      toast.error('Could not end trip');
      return;
    }
    toast.success('Trip completed');
    navigate('/agent');
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
      actorId: agentId,
    });
    if (!ok) {
      toast.error(error ?? 'Could not complete order');
      return;
    }
    setCompleteStop(null);
    toast.success('Order completed');
  };

  return (
    <div className="space-y-4 pb-4">
      <button
        type="button"
        onClick={() => navigate('/agent')}
        className="flex items-center gap-1 text-sm text-brand-primary font-medium"
      >
        <ArrowLeft size={16} /> All trips
      </button>

      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-bold font-[family-name:var(--font-heading)]">{trip.id}</h1>
        <StatusBadge label={trip.status} variant={getTripStatusVariant(trip.status)} />
      </div>
      <p className="text-sm text-brand-text-secondary">
        {isScheduled && !allPickedUp
          ? `${pickupRemaining} orders to pick up`
          : `${trip.stops.length} stops · ${pendingCount} pending delivery`}
        {branch ? ` · ${branch.name}` : ''}
      </p>

      <div className="flex gap-2">
        {isScheduled && (
          <Button className="flex-1" size="lg" onClick={handleStartTrip} disabled={!canStart}>
            Start Trip
          </Button>
        )}
        {isInProgress && (
          <Button
            className="flex-1"
            size="lg"
            variant={pendingCount === 0 ? 'primary' : 'outline'}
            onClick={handleEndTrip}
          >
            End Trip
          </Button>
        )}
      </div>

      <TripOrdersPanel
        trip={trip}
        orders={orders}
        actorId={agentId}
        variant="mobile"
        onCompleteStop={isInProgress ? setCompleteStop : undefined}
      />

      {completeStop && (
        <CompleteTripOrderModal
          open={Boolean(completeStop)}
          stop={completeStop}
          deliveryPersonId={trip.deliveryPersonId}
          branchName={branch?.name ?? 'Kochi'}
          onClose={() => setCompleteStop(null)}
          onConfirm={handleCompleteOrder}
        />
      )}
    </div>
  );
}
