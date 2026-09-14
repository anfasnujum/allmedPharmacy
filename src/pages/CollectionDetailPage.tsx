import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, IndianRupee } from 'lucide-react';
import { useState } from 'react';
import { useCollections, useStaff } from '@/store/DataContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Timeline } from '@/components/ui/Timeline';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/utils/format';
import { getCollectionStatusVariant } from '@/utils/statusHelpers';
import type { PaymentMethod } from '@/types';

export function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { collections, recordCollection } = useCollections();
  const staff = useStaff();
  const [showRecord, setShowRecord] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const collection = collections.find((c) => c.id === id);
  const staffMap = Object.fromEntries(staff.map((s) => [s.id, s.name]));

  if (!collection) {
    return (
      <div className="text-center py-16">
        <p className="text-brand-text-secondary mb-4">Collection not found</p>
        <Button variant="outline" onClick={() => navigate('/collections')}><ArrowLeft size={16} /> Back</Button>
      </div>
    );
  }

  const handleRecord = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    recordCollection(collection.id, amt, method, reference || undefined, notes || undefined);
    toast.success('Collection recorded successfully');
    setShowRecord(false);
  };

  const handleMarkPaid = () => {
    if (collection.balance > 0) {
      recordCollection(collection.id, collection.balance, collection.paymentMethod);
      toast.success('Marked as fully paid');
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Collection — ${collection.orderId}`}
        breadcrumbs={[{ label: 'Collections', path: '/collections' }, { label: collection.orderId }]}
        actions={
          collection.balance > 0 ? (
            <div className="flex gap-2">
              <Button onClick={() => { setAmount(String(collection.balance)); setShowRecord(true); }}>
                <IndianRupee size={16} /> Record Collection
              </Button>
              <Button variant="secondary" onClick={handleMarkPaid}>Mark Paid</Button>
            </div>
          ) : undefined
        }
      />

      <div className="mb-6"><StatusBadge label={collection.status} variant={getCollectionStatusVariant(collection.status)} /></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Payment Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-brand-text-secondary">Customer</span><p className="font-medium">{collection.customerName}</p></div>
              <div><span className="text-brand-text-secondary">Order ID</span>
                <button className="block font-medium text-brand-primary hover:underline" onClick={() => navigate(`/orders/${collection.orderId}`)}>{collection.orderId}</button>
              </div>
              <div><span className="text-brand-text-secondary">Amount Due</span><p className="font-medium">{formatCurrency(collection.amountDue)}</p></div>
              <div><span className="text-brand-text-secondary">Amount Collected</span><p className="font-medium text-emerald-600">{formatCurrency(collection.amountCollected)}</p></div>
              <div><span className="text-brand-text-secondary">Balance</span><p className="font-medium text-brand-primary">{formatCurrency(collection.balance)}</p></div>
              <div><span className="text-brand-text-secondary">Payment Method</span><p className="font-medium">{collection.paymentMethod}</p></div>
              <div><span className="text-brand-text-secondary">Due Date</span><p className="font-medium">{collection.dueDate}</p></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)] h-fit">
          <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Collection Timeline</h3>
          <Timeline events={collection.timeline} staffMap={staffMap} />
        </div>
      </div>

      <Modal open={showRecord} onClose={() => setShowRecord(false)} title="Record Collection" size="sm">
        <div className="space-y-4">
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
            <input className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg" value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRecord(false)}>Cancel</Button>
            <Button onClick={handleRecord}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
