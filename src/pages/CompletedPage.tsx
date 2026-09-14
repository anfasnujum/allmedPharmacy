import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { useCompleted, useBranches } from '@/store/DataContext';
import { useBranch } from '@/store/BranchContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { SummaryCard, SummaryCardSkeleton } from '@/components/ui/SummaryCard';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar, SelectFilter } from '@/components/ui/FilterBar';
import { EmptyState, TableSkeleton } from '@/components/ui/EmptyState';
import { formatCurrency, formatDateTime, isToday, isThisWeek } from '@/utils/format';
import { CheckCircle, Calendar, TrendingUp, Wallet } from 'lucide-react';
import type { Source, PaymentMethod } from '@/types';

export function CompletedPage() {
  const { completed, loading } = useCompleted();
  const branches = useBranches();
  const { activeBranchId, activeBranch } = useBranch();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const branchMap = useMemo(() => Object.fromEntries(branches.map((b) => [b.id, b.name])), [branches]);

  const branchCompleted = useMemo(
    () => completed.filter((c) => c.branchId === activeBranchId),
    [completed, activeBranchId],
  );

  const filtered = useMemo(() => {
    return branchCompleted.filter((c) => {
      if (sourceFilter !== 'all' && c.source !== sourceFilter) return false;
      if (paymentFilter !== 'all' && c.paymentMethod !== paymentFilter) return false;
      if (dateFilter === 'today' && !isToday(c.completedDate)) return false;
      if (dateFilter === 'week' && !isThisWeek(c.completedDate)) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.orderId.toLowerCase().includes(q) || c.customerName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [branchCompleted, sourceFilter, paymentFilter, dateFilter, search]);

  const stats = useMemo(() => ({
    today: branchCompleted.filter((c) => isToday(c.completedDate)).length,
    week: branchCompleted.filter((c) => isThisWeek(c.completedDate)).length,
    totalSales: branchCompleted.reduce((s, c) => s + c.orderValue, 0),
    totalCollections: branchCompleted.reduce((s, c) => s + c.orderValue, 0),
  }), [branchCompleted]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Completed" description={`Order history for ${activeBranch.name}`} />

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <SummaryCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard title="Completed Today" value={stats.today} icon={CheckCircle} variant="success" />
          <SummaryCard title="Completed This Week" value={stats.week} icon={Calendar} variant="cyan" />
          <SummaryCard title="Total Sales" value={formatCurrency(stats.totalSales)} icon={TrendingUp} variant="primary" />
          <SummaryCard title="Total Collections" value={formatCurrency(stats.totalCollections)} icon={Wallet} variant="success" />
        </div>
      )}

      <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border shadow-[var(--shadow-card)]">
        <div className="p-4 border-b border-brand-border">
          <FilterBar>
            <SearchInput value={search} onChange={setSearch} placeholder="Search completed orders..." className="w-64" />
            <SelectFilter label="Date" value={dateFilter} onChange={setDateFilter} options={[
              { value: 'all', label: 'All Dates' }, { value: 'today', label: 'Today' }, { value: 'week', label: 'This Week' },
            ]} />
            <SelectFilter label="Source" value={sourceFilter} onChange={setSourceFilter} options={[
              { value: 'all', label: 'All Sources' }, ...(['Counter', 'Phone', 'WhatsApp'] as Source[]).map((s) => ({ value: s, label: s })),
            ]} />
            <SelectFilter label="Payment" value={paymentFilter} onChange={setPaymentFilter} options={[
              { value: 'all', label: 'All Methods' }, ...(['Cash', 'UPI', 'Card', 'COD'] as PaymentMethod[]).map((m) => ({ value: m, label: m })),
            ]} />
          </FilterBar>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState title="No completed orders found" description="Completed orders will appear here after the full workflow is finished." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border bg-gray-50/80">
                  {['Order ID', 'Customer', 'Completed Date', 'Items', 'Order Value', 'Payment', 'Branch', 'Completed By', 'Action'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-brand-text-secondary whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-brand-border hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-brand-primary">{c.orderId}</td>
                    <td className="px-4 py-3">{c.customerName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-brand-text-secondary">{formatDateTime(c.completedDate)}</td>
                    <td className="px-4 py-3 max-w-[150px] truncate">{c.items.map((i) => i.productName).join(', ')}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(c.orderValue)}</td>
                    <td className="px-4 py-3">{c.paymentMethod}</td>
                    <td className="px-4 py-3 text-brand-text-secondary">{branchMap[c.branchId] ?? c.branchId}</td>
                    <td className="px-4 py-3">{c.completedBy}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/completed/${c.id}`)}>
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
