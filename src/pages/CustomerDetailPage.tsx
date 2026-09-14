import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Edit, Plus, Phone, Mail, MessageCircle, FileText, ShoppingCart, Wallet, Pill } from 'lucide-react';
import { useCustomers, useOrders, useCollections, useBranches } from '@/store/DataContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AddressCard } from '@/components/customers/AddressCard';
import { AddressFormModal } from '@/components/customers/AddressFormModal';
import { CustomerEditModal } from '@/components/customers/CustomerEditModal';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format';
import { getOrderStatusVariant, getCollectionStatusVariant } from '@/utils/statusHelpers';
import type { CustomerAddress, OrderStatus } from '@/types';

const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  'New', 'Confirming', 'Processing', 'Ready', 'Out for Delivery', 'Delivered', 'Collection Pending',
];

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    customers,
    prescriptions,
    updateCustomer,
    addCustomerAddress,
    updateCustomerAddress,
    removeCustomerAddress,
    setPrimaryAddress,
  } = useCustomers();
  const { orders } = useOrders();
  const { collections } = useCollections();
  const branches = useBranches();

  const [showEdit, setShowEdit] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editAddress, setEditAddress] = useState<CustomerAddress | null>(null);

  const customer = customers.find((c) => c.id === id);
  const branchMap = useMemo(() => Object.fromEntries(branches.map((b) => [b.id, b.name])), [branches]);

  const customerOrders = useMemo(() => orders.filter((o) => o.customerId === id), [orders, id]);
  const activeOrders = useMemo(() => customerOrders.filter((o) => ACTIVE_ORDER_STATUSES.includes(o.status)), [customerOrders]);
  const pastOrders = useMemo(() => customerOrders.filter((o) => o.status === 'Completed' || o.status === 'Cancelled'), [customerOrders]);
  const pendingPayments = useMemo(
    () => collections.filter((c) => c.customerId === id && c.balance > 0),
    [collections, id],
  );
  const customerPrescriptions = useMemo(
    () => prescriptions.filter((p) => p.customerId === id),
    [prescriptions, id],
  );
  const activePrescriptions = customerPrescriptions.filter((p) => p.status === 'Active');

  if (!customer) {
    return (
      <div className="text-center py-16">
        <p className="text-brand-text-secondary mb-4">Customer not found</p>
        <Button variant="outline" onClick={() => navigate('/customers')}><ArrowLeft size={16} /> Back</Button>
      </div>
    );
  }

  const customerType = customer.totalOrders >= 15 ? 'VIP' : customer.totalOrders > 0 ? 'Regular' : 'New';
  const totalOutstanding = pendingPayments.reduce((s, p) => s + p.balance, 0);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={customer.name}
        breadcrumbs={[{ label: 'Customers', path: '/customers' }, { label: customer.name }]}
        actions={
          <Button variant="outline" onClick={() => setShowEdit(true)}>
            <Edit size={16} /> Edit Profile
          </Button>
        }
      />

      {/* Profile header */}
      <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)] mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-brand-primary">{customer.id}</span>
              <StatusBadge label={customerType} variant={customerType === 'VIP' ? 'warning' : customerType === 'New' ? 'info' : 'neutral'} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2"><Phone size={14} className="text-brand-text-secondary" /> {customer.phone}</div>
              {customer.alternatePhone && <div className="flex items-center gap-2 text-brand-text-secondary">Alt: {customer.alternatePhone}</div>}
              {customer.email && <div className="flex items-center gap-2"><Mail size={14} className="text-brand-text-secondary" /> {customer.email}</div>}
              <div className="flex items-center gap-2"><MessageCircle size={14} className="text-brand-text-secondary" /> Prefers {customer.preferredContact}</div>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div><p className="text-2xl font-bold font-[family-name:var(--font-heading)] text-brand-text">{customer.totalOrders}</p><p className="text-xs text-brand-text-secondary">Total Orders</p></div>
            <div><p className="text-2xl font-bold font-[family-name:var(--font-heading)] text-brand-primary">{activeOrders.length}</p><p className="text-xs text-brand-text-secondary">Active Orders</p></div>
            <div><p className="text-2xl font-bold font-[family-name:var(--font-heading)] text-amber-600">{formatCurrency(totalOutstanding)}</p><p className="text-xs text-brand-text-secondary">Outstanding</p></div>
          </div>
        </div>
        {customer.notes && (
          <p className="mt-4 pt-4 border-t border-brand-border text-sm text-brand-text-secondary">
            <strong className="text-brand-text">Notes:</strong> {customer.notes}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Addresses */}
          <section className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold font-[family-name:var(--font-heading)] flex items-center gap-2">
                <FileText size={18} className="text-brand-primary" /> Addresses
              </h3>
              <Button size="sm" onClick={() => setShowAddAddress(true)}><Plus size={14} /> Add Address</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.addresses.map((addr) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  canRemove={customer.addresses.length > 1}
                  onSetPrimary={() => { setPrimaryAddress(customer.id, addr.id); toast.success('Primary address updated'); }}
                  onEdit={() => setEditAddress(addr)}
                  onRemove={() => { removeCustomerAddress(customer.id, addr.id); toast.success('Address removed'); }}
                />
              ))}
            </div>
          </section>

          {/* Active Orders */}
          <section className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold font-[family-name:var(--font-heading)] flex items-center gap-2 mb-4">
              <ShoppingCart size={18} className="text-brand-primary" /> Active Orders ({activeOrders.length})
            </h3>
            {activeOrders.length === 0 ? (
              <p className="text-sm text-brand-text-secondary py-4 text-center">No active orders</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-border">
                      {['Order', 'Date', 'Items', 'Total', 'Branch', 'Status'].map((h) => (
                        <th key={h} className="text-left py-2 font-medium text-brand-text-secondary">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeOrders.map((o) => (
                      <tr key={o.id} className="border-b border-brand-border last:border-0 hover:bg-gray-50/50">
                        <td className="py-2"><Link to={`/orders/${o.id}`} className="text-brand-primary font-medium hover:underline">{o.id}</Link></td>
                        <td className="py-2 text-brand-text-secondary whitespace-nowrap">{formatDateTime(o.orderDate)}</td>
                        <td className="py-2 max-w-[140px] truncate">{o.items.map((i) => i.productName).join(', ')}</td>
                        <td className="py-2 font-medium">{formatCurrency(o.total)}</td>
                        <td className="py-2 text-brand-text-secondary">{branchMap[o.branchId]}</td>
                        <td className="py-2"><StatusBadge label={o.status} variant={getOrderStatusVariant(o.status)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Past Orders */}
          <section className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Order History ({pastOrders.length})</h3>
            {pastOrders.length === 0 ? (
              <p className="text-sm text-brand-text-secondary py-4 text-center">No completed orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-border">
                      {['Order', 'Date', 'Value', 'Payment', 'Status'].map((h) => (
                        <th key={h} className="text-left py-2 font-medium text-brand-text-secondary">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pastOrders.map((o) => (
                      <tr key={o.id} className="border-b border-brand-border last:border-0 hover:bg-gray-50/50">
                        <td className="py-2"><Link to={`/orders/${o.id}`} className="text-brand-primary hover:underline">{o.id}</Link></td>
                        <td className="py-2 text-brand-text-secondary">{o.completedAt ? formatDateTime(o.completedAt) : formatDateTime(o.orderDate)}</td>
                        <td className="py-2">{formatCurrency(o.total)}</td>
                        <td className="py-2">{o.paymentMethod}</td>
                        <td className="py-2"><StatusBadge label={o.status} variant={getOrderStatusVariant(o.status)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          {/* Pending Payments */}
          <section className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold font-[family-name:var(--font-heading)] flex items-center gap-2 mb-4">
              <Wallet size={18} className="text-brand-primary" /> Pending Payments
            </h3>
            {pendingPayments.length === 0 ? (
              <p className="text-sm text-brand-text-secondary">No outstanding payments</p>
            ) : (
              <div className="space-y-3">
                {pendingPayments.map((col) => (
                  <div key={col.id} className="border border-brand-border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <Link to={`/collections/${col.id}`} className="text-sm font-medium text-brand-primary hover:underline">{col.orderId}</Link>
                      <StatusBadge label={col.status} variant={getCollectionStatusVariant(col.status)} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-text-secondary">Balance</span>
                      <span className="font-bold text-brand-primary">{formatCurrency(col.balance)}</span>
                    </div>
                    <p className="text-xs text-brand-text-secondary mt-1">Due: {col.dueDate} · {col.paymentMethod}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Active Prescriptions */}
          <section className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold font-[family-name:var(--font-heading)] flex items-center gap-2 mb-4">
              <Pill size={18} className="text-brand-primary" /> Active Prescriptions ({activePrescriptions.length})
            </h3>
            {activePrescriptions.length === 0 ? (
              <p className="text-sm text-brand-text-secondary">No active prescriptions on file</p>
            ) : (
              <div className="space-y-4">
                {activePrescriptions.map((rx) => (
                  <div key={rx.id} className="border border-brand-border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium">{rx.doctorName}</p>
                        {rx.hospital && <p className="text-xs text-brand-text-secondary">{rx.hospital}</p>}
                      </div>
                      <StatusBadge label={rx.status} variant="success" />
                    </div>
                    <ul className="text-sm space-y-1 mb-2">
                      {rx.medicines.map((m, i) => (
                        <li key={i} className="text-brand-text">
                          <span className="font-medium">{m.productName}</span> {m.strength}
                          <span className="text-brand-text-secondary block text-xs">{m.dosage} · {m.duration}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-brand-text-secondary">Valid until {formatDate(rx.validUntil)}</p>
                    {rx.notes && <p className="text-xs text-brand-text-secondary mt-1 italic">{rx.notes}</p>}
                  </div>
                ))}
              </div>
            )}

            {customerPrescriptions.filter((p) => p.status !== 'Active').length > 0 && (
              <div className="mt-4 pt-4 border-t border-brand-border">
                <p className="text-xs font-semibold uppercase text-brand-text-secondary mb-2">Past Prescriptions</p>
                {customerPrescriptions.filter((p) => p.status !== 'Active').map((rx) => (
                  <div key={rx.id} className="text-sm py-2 border-b border-brand-border last:border-0 opacity-70">
                    <span className="font-medium">{rx.doctorName}</span>
                    <span className="text-brand-text-secondary ml-2">{formatDate(rx.prescribedDate)}</span>
                    <StatusBadge label={rx.status} variant="neutral" className="ml-2" />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <CustomerEditModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        customer={customer}
        onSave={(updates) => { updateCustomer(customer.id, updates); toast.success('Customer profile updated'); }}
      />

      <AddressFormModal
        open={showAddAddress}
        onClose={() => setShowAddAddress(false)}
        onSave={(addr) => { addCustomerAddress(customer.id, addr); toast.success('Address added'); }}
      />

      {editAddress && (
        <AddressFormModal
          open={!!editAddress}
          onClose={() => setEditAddress(null)}
          title="Edit Address"
          initial={editAddress}
          onSave={(updates) => {
            updateCustomerAddress(customer.id, editAddress.id, updates);
            toast.success('Address updated');
            setEditAddress(null);
          }}
        />
      )}
    </div>
  );
}
