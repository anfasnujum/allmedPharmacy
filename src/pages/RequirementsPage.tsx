import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useRequirements } from '@/store/DataContext';
import { useBranch } from '@/store/BranchContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { SummaryCard, SummaryCardSkeleton } from '@/components/ui/SummaryCard';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar, SelectFilter, TabFilter } from '@/components/ui/FilterBar';
import { EmptyState, TableSkeleton } from '@/components/ui/EmptyState';
import { RequirementForm } from '@/components/requirements/RequirementForm';
import { EnquiryForm } from '@/components/enquiries/EnquiryForm';
import { FulfillmentTimer } from '@/components/requirements/FulfillmentTimer';
import { getRequirementStatusVariant, getUrgencyVariant } from '@/utils/statusHelpers';
import { isToday } from '@/utils/format';
import { ClipboardList, Clock, CheckCircle, CalendarDays } from 'lucide-react';
import type { RequirementStatus, Source } from '@/types';

const DEFAULT_STATUS_FILTER = 'New';

const statusTabs: { value: string; label: string; status?: RequirementStatus }[] = [
  { value: 'all', label: 'All' },
  { value: 'New', label: 'New', status: 'New' },
  { value: 'Follow-up', label: 'Follow-up', status: 'Follow-up' },
  { value: 'Partial', label: 'Partial', status: 'Partial' },
  { value: 'Completed', label: 'Completed', status: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled', status: 'Cancelled' },
];

export function RequirementsPage() {
  const { requirements, loading } = useRequirements();
  const { activeBranchId, activeBranch } = useBranch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  const statusParam = searchParams.get('status');
  const statusFilter = statusTabs.some((t) => t.value === statusParam) ? statusParam! : DEFAULT_STATUS_FILTER;

  const setStatusFilter = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === DEFAULT_STATUS_FILTER) next.delete('status');
      else next.set('status', value);
      return next;
    }, { replace: true });
  };

  useEffect(() => {
    if (statusParam && !statusTabs.some((t) => t.value === statusParam)) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('status');
        return next;
      }, { replace: true });
    }
  }, [statusParam, setSearchParams]);

  const branchRequirements = useMemo(
    () => requirements.filter((r) => r.branchId === activeBranchId),
    [requirements, activeBranchId],
  );

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: branchRequirements.length };
    statusTabs.forEach((tab) => {
      if (tab.status) {
        counts[tab.value] = branchRequirements.filter((r) => r.status === tab.status).length;
      }
    });
    return counts;
  }, [branchRequirements]);

  const filtered = useMemo(() => {
    const tab = statusTabs.find((t) => t.value === statusFilter);
    return branchRequirements.filter((r) => {
      if (tab?.status && r.status !== tab.status) return false;
      if (sourceFilter !== 'all' && r.source !== sourceFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          r.id.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          r.items.some((i) => i.productName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [branchRequirements, statusFilter, sourceFilter, search]);

  const stats = useMemo(() => ({
    new: branchRequirements.filter((r) => r.status === 'New').length,
    followUp: branchRequirements.filter((r) => r.status === 'Follow-up').length,
    partial: branchRequirements.filter((r) => r.status === 'Partial').length,
    today: branchRequirements.filter((r) => isToday(r.createdAt)).length,
  }), [branchRequirements]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Requirements"
        description={`Incoming requests at ${activeBranch.name}`}
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setShowForm(true)}>
              <Plus size={16} /> New Requirement
            </Button>
            <Button variant="secondary" onClick={() => setShowEnquiryForm(true)}>
              <Plus size={16} /> New Enquiry
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <SummaryCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard title="New Requirements" value={stats.new} icon={ClipboardList} />
          <SummaryCard title="Follow-up" value={stats.followUp} icon={Clock} variant="warning" />
          <SummaryCard title="Partial" value={stats.partial} icon={CheckCircle} variant="success" />
          <SummaryCard title="Today's Requirements" value={stats.today} icon={CalendarDays} variant="cyan" />
        </div>
      )}

      <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border shadow-[var(--shadow-card)]">
        <div className="p-4 border-b border-brand-border">
          <TabFilter
            tabs={statusTabs.map((t) => ({ value: t.value, label: t.label, count: tabCounts[t.value] }))}
            active={statusFilter}
            onChange={setStatusFilter}
          />
          <FilterBar className="mb-0">
            <SearchInput value={search} onChange={setSearch} placeholder="Search requirements..." className="w-64" />
            <SelectFilter
              label="Source"
              value={sourceFilter}
              onChange={setSourceFilter}
              options={[
                { value: 'all', label: 'All Sources' },
                ...(['Counter', 'Phone', 'WhatsApp'] as Source[]).map((s) => ({ value: s, label: s })),
              ]}
            />
          </FilterBar>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No requirements found"
            description={branchRequirements.length === 0 ? 'Create your first requirement to get started.' : 'Try adjusting your filters.'}
            actionLabel={branchRequirements.length === 0 ? '+ New Requirement' : undefined}
            onAction={branchRequirements.length === 0 ? () => setShowForm(true) : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border bg-gray-50/80">
                  <th className="text-left px-2 py-3 font-medium text-brand-text-secondary whitespace-nowrap w-[72px]">Req ID</th>
                  <th className="text-left px-4 py-3 font-medium text-brand-text-secondary whitespace-nowrap">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-brand-text-secondary whitespace-nowrap">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-brand-text-secondary whitespace-nowrap">Requested Items</th>
                  <th className="text-left px-4 py-3 font-medium text-brand-text-secondary whitespace-nowrap">Time Left</th>
                  <th className="text-left px-4 py-3 font-medium text-brand-text-secondary whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-brand-text-secondary whitespace-nowrap">Urgency</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-brand-border hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/requirements/${req.id}`)}
                  >
                    <td className="px-2 py-3 font-medium text-brand-primary text-xs whitespace-nowrap w-[72px]">{req.id.replace('REQ-', '')}</td>
                    <td className="px-4 py-3">{req.customerName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{req.phone}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate">{req.items.map((i) => i.productName).join(', ')}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><FulfillmentTimer requirement={req} /></td>
                    <td className="px-4 py-3"><StatusBadge label={req.status} variant={getRequirementStatusVariant(req.status)} /></td>
                    <td className="px-4 py-3"><StatusBadge label={req.urgency} variant={getUrgencyVariant(req.urgency)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RequirementForm open={showForm} onClose={() => setShowForm(false)} />
      <EnquiryForm open={showEnquiryForm} onClose={() => setShowEnquiryForm(false)} />
    </div>
  );
}
