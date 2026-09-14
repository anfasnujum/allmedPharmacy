import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Package, XCircle } from 'lucide-react';
import { useOrders, useStaff, useBranches } from '@/store/DataContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Timeline } from '@/components/ui/Timeline';
import { FinishPackingModal } from '@/components/orders/FinishPackingModal';
import { ProductComplianceNotes } from '@/components/products/ProductComplianceNotes';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { getOrderStatusVariant, getPaymentStatusVariant } from '@/utils/statusHelpers';
import { CURRENT_STAFF_ID } from '@/constants/session';
import { createTimelineEvent } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import type { OrderItem } from '@/types';

interface ModalLineSnapshot {
  index: number;
  item: OrderItem;
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, updateOrder, finishOrderPacking, updateOrderStatus } = useOrders();
  const staff = useStaff();
  const branches = useBranches();

  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [modalLineSnapshots, setModalLineSnapshots] = useState<ModalLineSnapshot[]>([]);

  const order = orders.find((o) => o.id === id);
  const staffMap = Object.fromEntries(staff.map((s) => [s.id, s.name]));
  const branch = order ? branches.find((b) => b.id === order.branchId) : undefined;
  const deliveryPerson = order?.deliveryPersonId ? staffMap[order.deliveryPersonId] : undefined;

  const isPacking = order?.status === 'Processing';

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-brand-text-secondary mb-4">Order not found</p>
        <Button variant="outline" onClick={() => navigate('/orders')}><ArrowLeft size={16} /> Back</Button>
      </div>
    );
  }

  const balance = order.total - order.amountCollected;
  const isOpen = order.status !== 'Cancelled' && order.status !== 'Completed';

  const toggleItemCheck = (index: number, checked: boolean) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (checked) next.add(index);
      else next.delete(index);
      return next;
    });
  };

  const submitFinishPacking = (payload: {
    packedItemIndices: number[];
    skippedItems: Array<{ itemIndex: number; reason: string }>;
    newBillNumber?: string;
    newBillValue?: number;
  }) => {
    if (!order.requirementId) {
      toast.error('This order is not linked to a requirement — cannot return unchecked items');
      return;
    }

    setShowFinishModal(false);
    setModalLineSnapshots([]);

    const { ok, error } = finishOrderPacking({
      orderId: order.id,
      packedItemIndices: payload.packedItemIndices,
      skippedItems: payload.skippedItems,
      newBillNumber: payload.newBillNumber,
      newBillValue: payload.newBillValue,
      actorId: CURRENT_STAFF_ID,
    });

    if (!ok) {
      toast.error(error ?? 'Could not finish packing');
      return;
    }

    setCheckedItems(new Set());
    toast.success(
      payload.skippedItems.length > 0
        ? 'Packing finished — unchecked items returned to requirement'
        : 'Packing finished — order is ready',
    );
  };

  const handleFinishPacking = () => {
    const allIndices = order.items.map((_, i) => i);
    const unchecked = allIndices.filter((i) => !checkedItems.has(i));

    if (unchecked.length === 0) {
      if (checkedItems.size === 0) {
        toast.error('Check at least one item before finishing packing');
        return;
      }
      submitFinishPacking({
        packedItemIndices: [...checkedItems],
        skippedItems: [],
      });
      return;
    }

    setModalLineSnapshots(
      unchecked.map((index) => ({ index, item: order.items[index] })).filter((entry) => entry.item),
    );
    setShowFinishModal(true);
  };

  const handleStartPacking = () => {
    setCheckedItems(new Set());
    updateOrder(order.id, {
      status: 'Processing',
      assignedStaffId: CURRENT_STAFF_ID,
      timeline: [...order.timeline, createTimelineEvent('Packing started', CURRENT_STAFF_ID)],
    });
    toast.success('Packing started');
  };

  const handleCancel = () => {
    updateOrderStatus(order.id, 'Cancelled', CURRENT_STAFF_ID);
    setCheckedItems(new Set());
    toast.success('Order cancelled');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Order #${order.id}`}
        breadcrumbs={[{ label: 'Orders', path: '/orders' }, { label: order.id }]}
        actions={
          isOpen ? (
            <div className="flex gap-2 flex-wrap">
              {order.status === 'New' && (
                <Button onClick={handleStartPacking}>
                  <Package size={16} /> Start Packing
                </Button>
              )}
              {order.status === 'Processing' && (
                <Button onClick={handleFinishPacking}>
                  <Package size={16} /> Finish Packing
                </Button>
              )}
              <Button variant="danger" onClick={handleCancel}>
                <XCircle size={16} /> Cancel
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="flex items-center gap-3 mb-6">
        <StatusBadge label={order.status} variant={getOrderStatusVariant(order.status)} />
        <StatusBadge label={order.paymentStatus} variant={getPaymentStatusVariant(order.paymentStatus)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Order Items</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border">
                  {isPacking && (
                    <th className="text-left py-2 w-10 font-medium text-brand-text-secondary">Packed</th>
                  )}
                  {['Product', 'Strength', 'Qty', 'Unit Price', 'Total'].map((h) => (
                    <th key={h} className="text-left py-2 font-medium text-brand-text-secondary">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr
                    key={i}
                    className={cn(
                      'border-b border-brand-border last:border-0 transition-colors',
                      isPacking && !checkedItems.has(i) && 'bg-amber-50/40',
                      isPacking && checkedItems.has(i) && 'bg-emerald-50/40',
                    )}
                  >
                    {isPacking && (
                      <td className="py-2">
                        <input
                          type="checkbox"
                          checked={checkedItems.has(i)}
                          onChange={(e) => toggleItemCheck(i, e.target.checked)}
                          className="rounded border-brand-border text-brand-primary focus:ring-brand-primary/20"
                          aria-label={`Mark ${item.productName} as packed`}
                        />
                      </td>
                    )}
                    <td className="py-2">
                      <p>{item.productName}</p>
                      <ProductComplianceNotes item={item} className="mt-1.5" compact />
                    </td>
                    <td className="py-2">{item.strength}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-2 font-medium">{formatCurrency(item.unitPrice * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-brand-text-secondary">Name</span><p className="font-medium">{order.customerName}</p></div>
              <div><span className="text-brand-text-secondary">Phone</span><p className="font-medium">{order.customerPhone}</p></div>
              <div><span className="text-brand-text-secondary">Address</span><p className="font-medium">{order.customerAddress}</p></div>
              <div><span className="text-brand-text-secondary">Customer Type</span><p className="font-medium">{order.customerType}</p></div>
              <div><span className="text-brand-text-secondary">Contact Preference</span><p className="font-medium">{order.preferredContact}</p></div>
              <div><span className="text-brand-text-secondary">Branch</span><p className="font-medium">{branch?.name ?? order.branchId}</p></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
              <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-brand-text-secondary">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-brand-text-secondary">Discount</span><span>-{formatCurrency(order.discount)}</span></div>
                <div className="flex justify-between"><span className="text-brand-text-secondary">Delivery Charge</span><span>{formatCurrency(order.deliveryCharge)}</span></div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-brand-border"><span>Total</span><span className="text-brand-primary">{formatCurrency(order.total)}</span></div>
              </div>
            </div>

            <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
              <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Payment</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-brand-text-secondary">Method</span><span>{order.paymentMethod}</span></div>
                <div className="flex justify-between"><span className="text-brand-text-secondary">Status</span><StatusBadge label={order.paymentStatus} variant={getPaymentStatusVariant(order.paymentStatus)} /></div>
                <div className="flex justify-between"><span className="text-brand-text-secondary">Collected</span><span>{formatCurrency(order.amountCollected)}</span></div>
                <div className="flex justify-between font-medium"><span className="text-brand-text-secondary">Balance</span><span className={balance > 0 ? 'text-brand-primary' : 'text-emerald-600'}>{formatCurrency(balance)}</span></div>
              </div>
            </div>
          </div>

          {order.deliveryRequired && (
            <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
              <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Delivery</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-brand-text-secondary">Address</span><p className="font-medium">{order.deliveryAddress}</p></div>
                <div><span className="text-brand-text-secondary">Delivery Status</span><p className="font-medium">{order.deliveryStatus ?? '—'}</p></div>
                <div><span className="text-brand-text-secondary">Delivery Person</span><p className="font-medium">{deliveryPerson ?? 'Unassigned'}</p></div>
                {order.preferredDeliveryTime && (
                  <div><span className="text-brand-text-secondary">Preferred Time</span><p className="font-medium">{formatDateTime(order.preferredDeliveryTime)}</p></div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Order Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-brand-text-secondary">Assigned Staff</span>
                <p className="font-medium">{order.assignedStaffId ? staffMap[order.assignedStaffId] ?? order.assignedStaffId : '—'}</p>
              </div>
              <div>
                <span className="text-brand-text-secondary">Bill Number</span>
                <p className="font-medium">{order.billNumber ?? '—'}</p>
              </div>
              <div>
                <span className="text-brand-text-secondary">Bill Value</span>
                <p className="font-medium">{order.billValue != null ? formatCurrency(order.billValue) : '—'}</p>
              </div>
              <div>
                <span className="text-brand-text-secondary">Order Date</span>
                <p className="font-medium">{formatDateTime(order.orderDate)}</p>
              </div>
              {order.requirementId && (
                <div>
                  <span className="text-brand-text-secondary">Requirement</span>
                  <p className="font-medium">{order.requirementId}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Order Timeline</h3>
            <Timeline events={order.timeline} staffMap={staffMap} />
          </div>
        </div>
      </div>

      <FinishPackingModal
        open={showFinishModal}
        order={order}
        lineSnapshots={modalLineSnapshots}
        checkedIndices={checkedItems}
        onToggleCheck={toggleItemCheck}
        onClose={() => {
          setShowFinishModal(false);
          setModalLineSnapshots([]);
        }}
        onConfirm={submitFinishPacking}
      />
    </div>
  );
}
