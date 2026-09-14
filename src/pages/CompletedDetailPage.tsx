import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCompleted, useBranches, useStaff } from '@/store/DataContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { getSourceVariant } from '@/utils/statusHelpers';

export function CompletedDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { completed } = useCompleted();
  const branches = useBranches();
  const staff = useStaff();

  const record = completed.find((c) => c.id === id);
  const branch = record ? branches.find((b) => b.id === record.branchId) : undefined;
  const completedByStaff = record ? staff.find((s) => s.id === record.completedBy) : undefined;

  if (!record) {
    return (
      <div className="text-center py-16">
        <p className="text-brand-text-secondary mb-4">Record not found</p>
        <Button variant="outline" onClick={() => navigate('/completed')}><ArrowLeft size={16} /> Back</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Completed — ${record.orderId}`}
        breadcrumbs={[{ label: 'Completed', path: '/completed' }, { label: record.orderId }]}
      />

      <div className="flex items-center gap-3 mb-6">
        <StatusBadge label="Completed" variant="success" />
        <StatusBadge label={record.source} variant={getSourceVariant(record.source)} />
      </div>

      <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)] max-w-3xl">
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div><span className="text-brand-text-secondary">Customer</span><p className="font-medium">{record.customerName}</p></div>
          <div><span className="text-brand-text-secondary">Completed Date</span><p className="font-medium">{formatDateTime(record.completedDate)}</p></div>
          <div><span className="text-brand-text-secondary">Order Value</span><p className="font-medium text-brand-primary">{formatCurrency(record.orderValue)}</p></div>
          <div><span className="text-brand-text-secondary">Payment Method</span><p className="font-medium">{record.paymentMethod}</p></div>
          <div><span className="text-brand-text-secondary">Branch</span><p className="font-medium">{branch?.name ?? record.branchId}</p></div>
          <div><span className="text-brand-text-secondary">Completed By</span><p className="font-medium">{completedByStaff?.name ?? record.completedBy}</p></div>
        </div>

        <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-3">Items</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              {['Product', 'Strength', 'Qty', 'Unit Price', 'Total'].map((h) => (
                <th key={h} className="text-left py-2 font-medium text-brand-text-secondary">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {record.items.map((item, i) => (
              <tr key={i} className="border-b border-brand-border last:border-0">
                <td className="py-2">{item.productName}</td>
                <td className="py-2">{item.strength}</td>
                <td className="py-2">{item.quantity}</td>
                <td className="py-2">{formatCurrency(item.unitPrice)}</td>
                <td className="py-2 font-medium">{formatCurrency(item.unitPrice * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 pt-4 border-t border-brand-border">
          <Button variant="outline" size="sm" onClick={() => navigate(`/orders/${record.orderId}`)}>
            View Original Order
          </Button>
        </div>
      </div>
    </div>
  );
}
