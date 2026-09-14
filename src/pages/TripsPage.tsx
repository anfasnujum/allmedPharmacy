import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Navigation } from 'lucide-react';
import { useTrips, useStaff } from '@/store/DataContext';
import { useBranch } from '@/store/BranchContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar, SelectFilter } from '@/components/ui/FilterBar';
import { EmptyState, TableSkeleton } from '@/components/ui/EmptyState';
import { SummaryCard, SummaryCardSkeleton } from '@/components/ui/SummaryCard';
import { formatDateTime } from '@/utils/format';
import { getTripStatusVariant } from '@/utils/statusHelpers';
import type { TripStatus } from '@/types';

export function TripsPage() {
  const { trips, loading } = useTrips();
  const staff = useStaff();
  const { activeBranch } = useBranch();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const staffMap = useMemo(() => Object.fromEntries(staff.map((s) => [s.id, s.name])), [staff]);

  const branchTrips = useMemo(
    () => trips.filter((t) => t.branchId === activeBranch.id),
    [trips, activeBranch.id],
  );

  const filtered = useMemo(() => {
    return branchTrips.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.id.toLowerCase().includes(q) ||
          t.stops.some((s) => s.customerName.toLowerCase().includes(q) || s.orderId.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [branchTrips, statusFilter, search]);

  const stats = useMemo(
    () => ({
      scheduled: branchTrips.filter((t) => t.status === 'Scheduled').length,
      inProgress: branchTrips.filter((t) => t.status === 'In Progress').length,
      completed: branchTrips.filter((t) => t.status === 'Completed').length,
    }),
    [branchTrips],
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Trips"
        description={`Delivery trips at ${activeBranch.name}`}
        actions={
          <Button onClick={() => navigate('/trips/create')}>
            <Plus size={16} /> Create Trip
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SummaryCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <SummaryCard title="Scheduled" value={stats.scheduled} icon={Navigation} variant="warning" />
          <SummaryCard title="In Progress" value={stats.inProgress} icon={Navigation} variant="primary" />
          <SummaryCard title="Completed" value={stats.completed} icon={Navigation} variant="success" />
        </div>
      )}

      <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border shadow-[var(--shadow-card)]">
        <div className="p-4 border-b border-brand-border">
          <FilterBar>
            <SearchInput value={search} onChange={setSearch} placeholder="Search trips..." className="w-64" />
            <SelectFilter
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Statuses' },
                ...(['Scheduled', 'In Progress', 'Completed'] as TripStatus[]).map((s) => ({
                  value: s,
                  label: s,
                })),
              ]}
            />
          </FilterBar>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No trips yet"
            description="Create a trip to batch ready orders for delivery."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border bg-gray-50/80">
                  {['Trip ID', 'Orders', 'Agent', 'Status', 'Created', 'Action'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-brand-text-secondary whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((trip) => (
                  <tr key={trip.id} className="border-b border-brand-border hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-brand-primary">{trip.id}</td>
                    <td className="px-4 py-3">{trip.stops.length}</td>
                    <td className="px-4 py-3">{staffMap[trip.deliveryPersonId] ?? '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={trip.status} variant={getTripStatusVariant(trip.status)} />
                    </td>
                    <td className="px-4 py-3 text-brand-text-secondary whitespace-nowrap">
                      {formatDateTime(trip.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/trips/${trip.id}`)}>
                        <Eye size={14} /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
