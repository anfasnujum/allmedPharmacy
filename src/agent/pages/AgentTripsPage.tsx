import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronRight, Navigation } from 'lucide-react';
import { useTrips } from '@/store/DataContext';
import { useAgentStaffId } from '@/agent/useAgentStaffId';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/utils/format';
import { getTripStatusVariant } from '@/utils/statusHelpers';
import type { Trip } from '@/types';

function sortTrips(trips: Trip[]): Trip[] {
  const order: Record<Trip['status'], number> = {
    'In Progress': 0,
    Scheduled: 1,
    Completed: 2,
  };
  return [...trips].sort((a, b) => {
    const statusDiff = order[a.status] - order[b.status];
    if (statusDiff !== 0) return statusDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function AgentTripsPage() {
  const { trips, loading } = useTrips();
  const { agentId } = useAgentStaffId();
  const navigate = useNavigate();

  const myTrips = useMemo(
    () => sortTrips(trips.filter((t) => t.deliveryPersonId === agentId)),
    [trips, agentId],
  );

  const activeTrip = myTrips.find((t) => t.status === 'In Progress');

  if (loading) {
    return <p className="text-sm text-brand-text-secondary text-center py-12">Loading trips…</p>;
  }

  return (
    <div className="space-y-4">
      {activeTrip && (
        <button
          type="button"
          onClick={() => navigate(`/agent/trips/${activeTrip.id}`)}
          className="w-full text-left rounded-xl bg-brand-primary text-white p-4 shadow-lg active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-2 mb-1">
            <Navigation size={18} />
            <span className="text-sm font-semibold">Active Trip</span>
          </div>
          <p className="text-lg font-bold">{activeTrip.id}</p>
          <p className="text-sm text-white/80 mt-1">
            {activeTrip.stops.filter((s) => !s.completed).length} stops remaining
          </p>
        </button>
      )}

      <div>
        <h1 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-3">My Trips</h1>
        {myTrips.length === 0 ? (
          <EmptyState
            title="No trips assigned"
            description="Trips assigned to you will appear here once created from the store."
          />
        ) : (
          <div className="space-y-3">
            {myTrips.map((trip) => {
              const pending = trip.stops.filter((s) => !s.completed).length;
              return (
                <button
                  key={trip.id}
                  type="button"
                  onClick={() => navigate(`/agent/trips/${trip.id}`)}
                  className="w-full text-left bg-white rounded-xl border border-brand-border p-4 shadow-[var(--shadow-card)] active:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold">{trip.id}</span>
                        <StatusBadge label={trip.status} variant={getTripStatusVariant(trip.status)} />
                      </div>
                      <p className="text-sm text-brand-text-secondary">
                        {trip.stops.length} orders · {pending} pending
                      </p>
                      <p className="text-xs text-brand-text-secondary mt-1">
                        {formatDateTime(trip.createdAt)}
                      </p>
                      <p className="text-xs text-brand-text-secondary mt-2 flex items-center gap-1 truncate">
                        <MapPin size={12} className="shrink-0" />
                        {trip.stops[0]?.area}
                        {trip.stops.length > 1 ? ` +${trip.stops.length - 1} more` : ''}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-brand-text-secondary shrink-0 mt-1" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
