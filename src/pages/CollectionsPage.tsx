import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import { useCollections, useOrders } from '@/store/DataContext';
import { useBranch } from '@/store/BranchContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { SummaryCard, SummaryCardSkeleton } from '@/components/ui/SummaryCard';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar, SelectFilter } from '@/components/ui/FilterBar';
import { EmptyState, TableSkeleton } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, isToday } from '@/utils/format';
import { getCollectionStatusVariant } from '@/utils/statusHelpers';
import { Wallet, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import type { CollectionStatus, PaymentMethod } from '@/types';

export function CollectionsPage() {
  const { collections, loading, recordCollection } = useCollections();
  const { orders } = useOrders();
  const { activeBranch, orderMatchesBranch } = useBranch();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [recordModal, setRecordModal] = useState<{ id: string; balance: number } | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const branchCollections = useMemo(
    () => collections.filter((c) => orderMatchesBranch(c.orderId, orders)),
    [collections, orders, orderMatchesBranch],
  );

  const filtered = useMemo(() => {
    return branchCollections.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.orderId.toLowerCase().includes(q) || c.customerName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [branchCollections, statusFilter, search]);

  const stats = useMemo(() => ({
    outstanding: branchCollections.filter((c) => c.balance > 0).reduce((s, c) => s + c.balance, 0),
    dueToday: branchCollections.filter((c) => c.dueDate === new Date().toISOString().split('T')[0] && c.balance > 0).reduce((s, c) => s + c.balance, 0),
    collectedToday: branchCollections.filter((c) => c.timeline.some((t) => isToday(t.timestamp) && t.description.includes('Payment'))).reduce((s, c) => s + c.amountCollected, 0),
    overdue: branchCollections.filter((c) => c.status === 'Overdue').reduce((s, c) => s + c.balance, 0),
  }), [branchCollections]);

  const handleRecord = () => {
    if (!recordModal) return;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    recordCollection(recordModal.id, amt, method, reference || undefined, notes || undefined);
    toast.success('Collection recorded successfully');
    setRecordModal(null);
    setAmount(''); setReference(''); setNotes('');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Collections" description={`Payment tracking at ${activeBranch.name}`} />

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <SummaryCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard title="Total Outstanding" value={formatCurrency(stats.outstanding)} icon={Wallet} variant="warning" />
          <SummaryCard title="Due Today" value={formatCurrency(stats.dueToday)} icon={Calendar} variant="primary" />
          <SummaryCard title="Collected Today" value={formatCurrency(stats.collectedToday)} icon={CheckCircle} variant="success" />
          <SummaryCard title="Overdue" value={formatCurrency(stats.overdue)} icon={AlertTriangle} variant="primary" />
        </div>
      )}

      <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border shadow-[var(--shadow-card)]">
        <div className="p-4 border-b border-brand-border">
          <FilterBar>
            <SearchInput value={search} onChange={setSearch} placeholder="Search collections..." className="w-64" />
            <SelectFilter
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Statuses' },
                ...(['Pending', 'Partially Collected', 'Collected', 'Overdue'] as CollectionStatus[]).map((s) => ({ value: s, label: s })),
              ]}
            />
          </FilterBar>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState title="No outstanding collections" description="Collection records appear when orders have pending payments." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border bg-gray-50/80">
                  {['Order ID', 'Customer', 'Amount Due', 'Collected', 'Balance', 'Method', 'Due Date', 'Status', 'Action'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-brand-text-secondary whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-brand-border hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-brand-primary">{c.orderId}</td>
                    <td className="px-4 py-3">{c.customerName}</td>
                    <td className="px-4 py-3">{formatCurrency(c.amountDue)}</td>
                    <td className="px-4 py-3">{formatCurrency(c.amountCollected)}</td>
                    <td className="px-4 py-3 font-medium text-brand-primary">{formatCurrency(c.balance)}</td>
                    <td className="px-4 py-3">{c.paymentMethod}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{c.dueDate}</td>
                    <td className="px-4 py-3"><StatusBadge label={c.status} variant={getCollectionStatusVariant(c.status)} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {c.balance > 0 && (
                          <Button variant="ghost" size="sm" onClick={() => { setRecordModal({ id: c.id, balance: c.balance }); setAmount(String(c.balance)); }}>
                            <IndianRupee size={14} /> Record
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/collections/${c.id}`)}>
                          <Eye size={14} /> View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!recordModal} onClose={() => setRecordModal(null)} title="Record Collection" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-brand-text-secondary">Balance due: <strong>{formatCurrency(recordModal?.balance ?? 0)}</strong></p>
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input type="number" className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment Method</label>
            <select className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              {(['Cash', 'UPI', 'Card', 'Other'] as PaymentMethod[]).map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reference Number</label>
            <input className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="UPI ref, receipt no." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRecordModal(null)}>Cancel</Button>
            <Button onClick={handleRecord}>Save Collection</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
