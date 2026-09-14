import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Users, UserPlus, Star, ShoppingBag } from 'lucide-react';
import { useCustomers } from '@/store/DataContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { SummaryCard, SummaryCardSkeleton } from '@/components/ui/SummaryCard';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar, SelectFilter } from '@/components/ui/FilterBar';
import { EmptyState, TableSkeleton } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/format';

export function CustomersPage() {
  const { customers, loading } = useCustomers();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const filtered = useMemo(() => {
    let list = customers.filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'orders') return b.totalOrders - a.totalOrders;
      if (sortBy === 'recent') return (b.lastOrderDate ?? '').localeCompare(a.lastOrderDate ?? '');
      return 0;
    });
    return list;
  }, [customers, search, sortBy]);

  const stats = useMemo(() => ({
    total: customers.length,
    vip: customers.filter((c) => c.totalOrders >= 15).length,
    new: customers.filter((c) => c.totalOrders === 0).length,
    active: customers.filter((c) => c.lastOrderDate && new Date(c.lastOrderDate) > new Date(Date.now() - 30 * 86400000)).length,
  }), [customers]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Customers"
        description="Customer directory across all ALLMED branches"
      />

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <SummaryCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard title="Total Customers" value={stats.total} icon={Users} variant="primary" />
          <SummaryCard title="VIP (15+ orders)" value={stats.vip} icon={Star} variant="cyan" />
          <SummaryCard title="New Customers" value={stats.new} icon={UserPlus} variant="success" />
          <SummaryCard title="Active (30 days)" value={stats.active} icon={ShoppingBag} variant="warning" />
        </div>
      )}

      <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border shadow-[var(--shadow-card)]">
        <div className="p-4 border-b border-brand-border">
          <FilterBar>
            <SearchInput value={search} onChange={setSearch} placeholder="Search by name, phone, email, area..." className="w-72" />
            <SelectFilter
              label="Sort by"
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: 'name', label: 'Name' },
                { value: 'orders', label: 'Most Orders' },
                { value: 'recent', label: 'Recent Activity' },
              ]}
            />
          </FilterBar>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState title="No customers found" description="Try adjusting your search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border bg-gray-50/80">
                  {['Customer ID', 'Name', 'Phone', 'Email', 'Area', 'Orders', 'Last Order', 'Action'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-brand-text-secondary whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-brand-border hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/customers/${c.id}`)}>
                    <td className="px-4 py-3 font-medium text-brand-primary">{c.id}</td>
                    <td className="px-4 py-3 font-medium">{c.name}{c.totalOrders >= 15 && <span className="ml-1.5 text-[10px] uppercase bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">VIP</span>}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{c.phone}</td>
                    <td className="px-4 py-3 text-brand-text-secondary">{c.email ?? '—'}</td>
                    <td className="px-4 py-3">{c.area}</td>
                    <td className="px-4 py-3">{c.totalOrders}</td>
                    <td className="px-4 py-3 text-brand-text-secondary whitespace-nowrap">{c.lastOrderDate ? formatDate(c.lastOrderDate) : '—'}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/customers/${c.id}`)}>
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
