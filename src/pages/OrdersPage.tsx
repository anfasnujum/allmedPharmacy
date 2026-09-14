import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders, useRequirements } from '@/store/DataContext';
import { useBranch } from '@/store/BranchContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { SummaryCard, SummaryCardSkeleton } from '@/components/ui/SummaryCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar, TabFilter } from '@/components/ui/FilterBar';
import { EmptyState, TableSkeleton } from '@/components/ui/EmptyState';
import { OrderFulfillmentTimer } from '@/components/requirements/FulfillmentTimer';
import { getOrderStatusVariant, getSourceVariant } from '@/utils/statusHelpers';
import { ShoppingCart, Sparkles, Cog, Package, Truck, Wallet, CheckCircle } from 'lucide-react';
import type { OrderStatus } from '@/types';

const statusTabs: { value: string; label: string; statuses?: OrderStatus[] }[] = [
  { value: 'all', label: 'All' },
  { value: 'New', label: 'New', statuses: ['New'] },
  { value: 'Processing', label: 'Processing', statuses: ['Confirming', 'Processing'] },
  { value: 'Ready', label: 'Ready', statuses: ['Ready'] },
  { value: 'Delivery', label: 'Delivery', statuses: ['Trip Assigned', 'Picked Up', 'Out for Delivery', 'Delivered'] },
  { value: 'Collection', label: 'Collection', statuses: ['Collection Pending'] },
  { value: 'Completed', label: 'Completed', statuses: ['Completed'] },
];

export function OrdersPage() {
  const { orders, loading } = useOrders();
  const { requirements } = useRequirements();
  const { activeBranchId, activeBranch } = useBranch();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const requirementMap = useMemo(
    () => Object.fromEntries(requirements.map((r) => [r.id, r])),
    [requirements],
  );

  const branchOrders = useMemo(
    () => orders.filter((o) => o.branchId === activeBranchId),
    [orders, activeBranchId],
  );

  const filtered = useMemo(() => {
    const tab = statusTabs.find((t) => t.value === activeTab);
    return branchOrders.filter((o) => {
      if (tab && tab.statuses && !tab.statuses.includes(o.status)) return false;
      if (search) {
        const q = search.toLowerCase();
        return o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q);
      }
      return true;
    });
  }, [branchOrders, activeTab, search]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: branchOrders.length };
    statusTabs.forEach((tab) => {
      if (tab.statuses) {
        counts[tab.value] = branchOrders.filter((o) => tab.statuses!.includes(o.status)).length;
      }
    });
    return counts;
  }, [branchOrders]);

  const stats = useMemo(() => ({
    all: branchOrders.length,
    new: branchOrders.filter((o) => o.status === 'New').length,
    processing: branchOrders.filter((o) => ['Confirming', 'Processing'].includes(o.status)).length,
    ready: branchOrders.filter((o) => o.status === 'Ready').length,
    delivery: branchOrders.filter((o) => ['Trip Assigned', 'Picked Up', 'Out for Delivery', 'Delivered'].includes(o.status)).length,
    collection: branchOrders.filter((o) => o.status === 'Collection Pending').length,
    completed: branchOrders.filter((o) => o.status === 'Completed').length,
  }), [branchOrders]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Orders" description={`Order management for ${activeBranch.name}`} />

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
          {Array.from({ length: 7 }).map((_, i) => <SummaryCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
          <SummaryCard title="All Orders" value={stats.all} icon={ShoppingCart} />
          <SummaryCard title="New" value={stats.new} icon={Sparkles} variant="primary" />
          <SummaryCard title="Processing" value={stats.processing} icon={Cog} variant="cyan" />
          <SummaryCard title="Ready" value={stats.ready} icon={Package} variant="success" />
          <SummaryCard title="Delivery" value={stats.delivery} icon={Truck} variant="cyan" />
          <SummaryCard title="Collection" value={stats.collection} icon={Wallet} variant="warning" />
          <SummaryCard title="Completed" value={stats.completed} icon={CheckCircle} variant="success" />
        </div>
      )}

      <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border shadow-[var(--shadow-card)]">
        <div className="p-4 border-b border-brand-border">
          <TabFilter
            tabs={statusTabs.map((t) => ({ ...t, count: tabCounts[t.value] }))}
            active={activeTab}
            onChange={setActiveTab}
          />
          <FilterBar>
            <SearchInput value={search} onChange={setSearch} placeholder="Search orders..." className="w-64" />
          </FilterBar>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState title="No orders found" description="Orders will appear here once requirements are converted." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border bg-gray-50/80">
                  {['Order ID', 'Customer', 'Items', 'Source', 'Time Left', 'Delivery', 'Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-brand-text-secondary whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-brand-border hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-brand-primary">{order.id}</td>
                    <td className="px-4 py-3">{order.customerName}</td>
                    <td className="px-4 py-3 max-w-[150px] truncate">{order.items.map((i) => i.productName).join(', ')}</td>
                    <td className="px-4 py-3"><StatusBadge label={order.source} variant={getSourceVariant(order.source)} /></td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <OrderFulfillmentTimer
                        order={order}
                        requirement={order.requirementId ? requirementMap[order.requirementId] : undefined}
                      />
                    </td>
                    <td className="px-4 py-3">{order.deliveryType}</td>
                    <td className="px-4 py-3"><StatusBadge label={order.status} variant={getOrderStatusVariant(order.status)} /></td>
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
