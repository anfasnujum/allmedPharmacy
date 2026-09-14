import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import { useEnquiries } from '@/store/DataContext';
import { useBranch } from '@/store/BranchContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { SummaryCard, SummaryCardSkeleton } from '@/components/ui/SummaryCard';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar, SelectFilter } from '@/components/ui/FilterBar';
import { EmptyState, TableSkeleton } from '@/components/ui/EmptyState';
import { EnquiryForm } from '@/components/enquiries/EnquiryForm';
import { ENQUIRY_DEPARTMENTS } from '@/data/enquiryConfig';
import { formatDateTime } from '@/utils/format';
import { getEnquiryStatusVariant } from '@/utils/statusHelpers';
import { isToday } from '@/utils/format';
import { Inbox, CheckCircle, CalendarDays, HelpCircle } from 'lucide-react';
import type { EnquiryStatus } from '@/types';

export function EnquiriesPage() {
  const { enquiries, loading } = useEnquiries();
  const { activeBranchId, activeBranch } = useBranch();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const branchEnquiries = useMemo(
    () => enquiries.filter((e) => e.branchId === activeBranchId),
    [enquiries, activeBranchId],
  );

  const filtered = useMemo(() => {
    return branchEnquiries.filter((e) => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (departmentFilter !== 'all' && e.department !== departmentFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const queryText = e.queryCustom ?? e.query;
        return (
          e.id.toLowerCase().includes(q) ||
          e.customerName.toLowerCase().includes(q) ||
          e.phone.includes(q) ||
          queryText.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [branchEnquiries, statusFilter, departmentFilter, search]);

  const stats = useMemo(() => ({
    open: branchEnquiries.filter((e) => e.status === 'Open').length,
    closed: branchEnquiries.filter((e) => e.status === 'Closed').length,
    converted: branchEnquiries.filter((e) => e.status === 'Converted').length,
    today: branchEnquiries.filter((e) => isToday(e.createdAt)).length,
  }), [branchEnquiries]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Enquiries"
        description={`Customer enquiries at ${activeBranch.name}`}
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} /> New Enquiry
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <SummaryCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard title="Open Enquiries" value={stats.open} icon={Inbox} variant="primary" />
          <SummaryCard title="Closed" value={stats.closed} icon={CheckCircle} variant="default" />
          <SummaryCard title="Converted" value={stats.converted} icon={HelpCircle} variant="success" />
          <SummaryCard title="Today's Enquiries" value={stats.today} icon={CalendarDays} variant="cyan" />
        </div>
      )}

      <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border shadow-[var(--shadow-card)]">
        <div className="p-4 border-b border-brand-border">
          <FilterBar>
            <SearchInput value={search} onChange={setSearch} placeholder="Search enquiries..." className="w-64" />
            <SelectFilter
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Statuses' },
                ...(['Open', 'Closed', 'Converted'] as EnquiryStatus[]).map((s) => ({ value: s, label: s })),
              ]}
            />
            <SelectFilter
              label="Department"
              value={departmentFilter}
              onChange={setDepartmentFilter}
              options={[
                { value: 'all', label: 'All Departments' },
                ...ENQUIRY_DEPARTMENTS.map((d) => ({ value: d, label: d })),
              ]}
            />
          </FilterBar>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No enquiries found"
            description={branchEnquiries.length === 0 ? 'Create your first enquiry to get started.' : 'Try adjusting your filters.'}
            actionLabel={branchEnquiries.length === 0 ? '+ New Enquiry' : undefined}
            onAction={branchEnquiries.length === 0 ? () => setShowForm(true) : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border bg-gray-50/80">
                  {['Enquiry ID', 'Customer', 'Phone', 'Department', 'Query', 'Date/Time', 'Status', 'Action'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-brand-text-secondary whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((enq) => (
                  <tr key={enq.id} className="border-b border-brand-border hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-brand-primary">{enq.id}</td>
                    <td className="px-4 py-3">{enq.customerName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{enq.phone}</td>
                    <td className="px-4 py-3">{enq.department}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate">{enq.queryCustom ?? enq.query}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-brand-text-secondary">{formatDateTime(enq.createdAt)}</td>
                    <td className="px-4 py-3"><StatusBadge label={enq.status} variant={getEnquiryStatusVariant(enq.status)} /></td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/enquiries/${enq.id}`)}>
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

      <EnquiryForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
