import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, ShoppingCart, XCircle, Plus } from 'lucide-react';
import { useRequirements, useStaff, useCustomers, useBranches, useOrders } from '@/store/DataContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Timeline } from '@/components/ui/Timeline';
import { AddItemsToRequirementModal } from '@/components/requirements/AddItemsToRequirementModal';
import { getRequirementStatusVariant, getSourceVariant, getOrderStatusVariant } from '@/utils/statusHelpers';
import { ProductComplianceNotes } from '@/components/products/ProductComplianceNotes';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { createTimelineEvent } from '@/utils/helpers';
import { CURRENT_STAFF_ID } from '@/constants/session';
import type { RequirementItem } from '@/types';

export function RequirementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requirements, updateRequirement, addItemsToRequirement } = useRequirements();
  const { orders } = useOrders();
  const staff = useStaff();
  const branches = useBranches();
  const { customers } = useCustomers();

  const [showAddItemsModal, setShowAddItemsModal] = useState(false);

  const req = requirements.find((r) => r.id === id);
  const customer = req ? customers.find((c) => c.id === req.customerId) : undefined;

  const requirementOrders = useMemo(
    () =>
      req
        ? orders
            .filter((o) => o.requirementId === req.id)
            .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
        : [],
    [orders, req],
  );

  if (!req) {
    return (
      <div className="text-center py-16">
        <p className="text-brand-text-secondary mb-4">Requirement not found</p>
        <Button variant="outline" onClick={() => navigate('/requirements?status=New')}>
          <ArrowLeft size={16} /> Back to Requirements
        </Button>
      </div>
    );
  }

  const staffMap = Object.fromEntries(staff.map((s) => [s.id, s.name]));
  const branchMap = Object.fromEntries(branches.map((b) => [b.id, b.name]));
  const deliveryAddress = customer && req.deliveryAddressId
    ? customer.addresses.find((a) => a.id === req.deliveryAddressId)
    : undefined;

  const handleCancel = () => {
    updateRequirement(req.id, {
      status: 'Cancelled',
      timeline: [...req.timeline, createTimelineEvent('Requirement cancelled', CURRENT_STAFF_ID)],
    });
    toast.success('Requirement cancelled');
  };

  const handleAddItems = (items: RequirementItem[]) => {
    const { ok, error } = addItemsToRequirement({
      requirementId: req.id,
      items,
      actorId: CURRENT_STAFF_ID,
    });

    if (!ok) {
      toast.error(error ?? 'Could not add items');
      return;
    }

    setShowAddItemsModal(false);
    const wasCompleted = req.status === 'Completed';
    toast.success(
      wasCompleted
        ? 'Items added — requirement reopened as Partial'
        : `${items.length} item(s) added to requirement`,
    );
  };

  const canCreateOrder = ['New', 'Follow-up', 'Partial'].includes(req.status);
  const canAddItems = req.status !== 'Cancelled';
  const isOpen = !['Completed', 'Cancelled'].includes(req.status);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={req.id}
        breadcrumbs={[
          { label: 'Requirements', path: '/requirements?status=New' },
          { label: req.id },
        ]}
        actions={
          canAddItems || isOpen ? (
            <div className="flex gap-2">
              {canAddItems && (
                <Button variant="outline" onClick={() => setShowAddItemsModal(true)}>
                  <Plus size={16} /> Add Items
                </Button>
              )}
              {canCreateOrder && (
                <Button onClick={() => navigate(`/requirements/${req.id}/create-order`)}>
                  <ShoppingCart size={16} /> Create Order
                </Button>
              )}
              {isOpen && (
                <Button variant="danger" onClick={handleCancel}>
                  <XCircle size={16} /> Cancel
                </Button>
              )}
            </div>
          ) : undefined
        }
      />

      <div className="flex items-center gap-3 mb-6">
        <StatusBadge label={req.status} variant={getRequirementStatusVariant(req.status)} />
        <StatusBadge label={req.source} variant={getSourceVariant(req.source)} />
        {req.urgency !== 'Normal' && <StatusBadge label={req.urgency} variant="warning" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Customer</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-brand-text-secondary">Name</span><p className="font-medium">{req.customerName}</p></div>
              <div><span className="text-brand-text-secondary">Phone</span><p className="font-medium">{req.phone}</p></div>
              {customer && (
                <>
                  <div><span className="text-brand-text-secondary">Email</span><p className="font-medium">{customer.email ?? '—'}</p></div>
                  <div><span className="text-brand-text-secondary">Address</span><p className="font-medium">{customer.address}</p></div>
                  <div><span className="text-brand-text-secondary">Area</span><p className="font-medium">{customer.area}</p></div>
                  <div><span className="text-brand-text-secondary">Total Orders</span><p className="font-medium">{customer.totalOrders}</p></div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-semibold font-[family-name:var(--font-heading)]">Pending Requirements</h3>
              {canAddItems && (
                <Button variant="outline" size="sm" onClick={() => setShowAddItemsModal(true)}>
                  <Plus size={14} /> Add Items
                </Button>
              )}
            </div>
            {req.items.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-brand-text-secondary">
                  {req.status === 'Completed'
                    ? 'All products have been ordered. Add more items if the customer needs additional products.'
                    : 'No pending items — all products have been ordered'}
                </p>
                {canAddItems && req.status === 'Completed' && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowAddItemsModal(true)}>
                    <Plus size={14} /> Add Items
                  </Button>
                )}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border">
                    {['Product', 'Strength', 'Qty', 'Notes'].map((h) => (
                      <th key={h} className="text-left py-2 font-medium text-brand-text-secondary">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {req.items.map((item, i) => (
                    <tr key={i} className="border-b border-brand-border last:border-0">
                      <td className="py-2">
                        <p>{item.productName}</p>
                        <ProductComplianceNotes item={item} className="mt-1.5" compact />
                      </td>
                      <td className="py-2">{item.strength}</td>
                      <td className="py-2">{item.quantity}</td>
                      <td className="py-2 text-brand-text-secondary">{item.notes ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Orders</h3>
            {requirementOrders.length === 0 ? (
              <p className="text-sm text-brand-text-secondary text-center py-6">No orders created yet</p>
            ) : (
              <div className="space-y-4">
                {requirementOrders.map((order) => (
                  <div key={order.id} className="rounded-lg border border-brand-border overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gray-50/80 border-b border-brand-border">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/orders/${order.id}`}
                          className="font-medium text-brand-primary hover:underline"
                        >
                          {order.id}
                        </Link>
                        <StatusBadge label={order.status} variant={getOrderStatusVariant(order.status)} />
                      </div>
                      <div className="text-xs text-brand-text-secondary text-right">
                        <p>{formatDateTime(order.orderDate)}</p>
                        {order.billNumber && <p>Bill {order.billNumber} · {formatCurrency(order.billValue ?? order.total)}</p>}
                      </div>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-brand-border">
                          {['Product', 'Strength', 'Qty', 'Unit Price', 'Total'].map((h) => (
                            <th key={h} className="text-left py-2 px-4 font-medium text-brand-text-secondary">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, i) => (
                          <tr key={i} className="border-b border-brand-border last:border-0">
                            <td className="py-2 px-4">
                              <p>{item.productName}</p>
                              <ProductComplianceNotes item={item} className="mt-1.5" compact />
                            </td>
                            <td className="py-2 px-4">{item.strength}</td>
                            <td className="py-2 px-4">{item.quantity}</td>
                            <td className="py-2 px-4">{formatCurrency(item.unitPrice)}</td>
                            <td className="py-2 px-4 font-medium">{formatCurrency(item.unitPrice * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </div>

          {req.customerNotes && (
            <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
              <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-2">Customer Notes</h3>
              <p className="text-sm text-brand-text">{req.customerNotes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Details</h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-brand-text-secondary">Source</span><p className="font-medium">{req.source}</p></div>
              <div><span className="text-brand-text-secondary">Assigned Staff</span><p className="font-medium">{req.assignedStaffId ? staffMap[req.assignedStaffId] : 'Unassigned'}</p></div>
              <div><span className="text-brand-text-secondary">Prescription</span><p className="font-medium">{req.prescriptionAttached ? 'Attached' : 'Not attached'}</p></div>
              <div><span className="text-brand-text-secondary">Delivery Type</span><p className="font-medium">{req.requirementDeliveryType ?? (req.deliveryRequired ? 'Home Delivery' : 'Counter Pickup')}</p></div>
              {req.requirementDeliveryType === 'Courier' && req.courierCarrier && (
                <div><span className="text-brand-text-secondary">Courier</span><p className="font-medium">{req.courierCarrier}</p></div>
              )}
              {req.requirementDeliveryType === 'Counter Pickup' && req.pickupBranchId && (
                <div><span className="text-brand-text-secondary">Pickup Branch</span><p className="font-medium">{branchMap[req.pickupBranchId] ?? req.pickupBranchId}</p></div>
              )}
              {req.requirementDeliveryType === 'Home Delivery' && deliveryAddress && (
                <div><span className="text-brand-text-secondary">Delivery Address</span><p className="font-medium">{deliveryAddress.addressLine}, {deliveryAddress.area}</p></div>
              )}
              {req.preferredDeliveryTime && (
                <div><span className="text-brand-text-secondary">Preferred Time</span><p className="font-medium">{new Date(req.preferredDeliveryTime).toLocaleString('en-IN')}</p></div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Timeline</h3>
            <Timeline events={req.timeline} staffMap={staffMap} />
          </div>
        </div>
      </div>

      <AddItemsToRequirementModal
        open={showAddItemsModal}
        requirement={req}
        onClose={() => setShowAddItemsModal(false)}
        onConfirm={handleAddItems}
      />
    </div>
  );
}
