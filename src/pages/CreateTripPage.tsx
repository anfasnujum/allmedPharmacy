import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, X } from 'lucide-react';
import { useTrips, useOrders, useCustomers, useStaff } from '@/store/DataContext';
import { useBranch } from '@/store/BranchContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/utils/format';
import { buildTripStopFromOrder } from '@/utils/tripHelpers';
import { getOrderStatusVariant } from '@/utils/statusHelpers';
import { CURRENT_STAFF_ID, getDefaultDeliveryAgentId, setAgentStaffId } from '@/constants/session';
import { cn } from '@/utils/cn';

export function CreateTripPage() {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const { customers } = useCustomers();
  const staff = useStaff();
  const { createTrip } = useTrips();
  const { activeBranch } = useBranch();

  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  const defaultAgentId = useMemo(
    () => getDefaultDeliveryAgentId(staff, activeBranch.id),
    [staff, activeBranch.id],
  );
  const [deliveryPersonId, setDeliveryPersonId] = useState(defaultAgentId);

  useEffect(() => {
    setDeliveryPersonId(defaultAgentId);
  }, [defaultAgentId]);

  const deliveryStaff = staff.filter(
    (s) => s.role === 'Delivery Executive' && s.branchId === activeBranch.id,
  );
  const agentOptions = deliveryStaff.length > 0 ? deliveryStaff : staff.filter((s) => s.branchId === activeBranch.id);
  const selectedAgent = staff.find((s) => s.id === deliveryPersonId);

  const readyOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.branchId === activeBranch.id &&
          o.status === 'Ready' &&
          o.deliveryRequired &&
          !o.tripId,
      ),
    [orders, activeBranch.id],
  );

  const selectedStops = useMemo(
    () =>
      selectedOrderIds
        .map((id) => {
          const order = orders.find((o) => o.id === id);
          if (!order) return null;
          const customer = customers.find((c) => c.id === order.customerId);
          return buildTripStopFromOrder(order, customer);
        })
        .filter((stop): stop is NonNullable<typeof stop> => stop != null),
    [selectedOrderIds, orders, customers],
  );

  const toggleOrder = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId],
    );
  };

  const handleFinalise = () => {
    if (selectedOrderIds.length === 0) {
      toast.error('Add at least one order to the trip');
      return;
    }
    const trip = createTrip({
      branchId: activeBranch.id,
      deliveryPersonId,
      orderIds: selectedOrderIds,
      actorId: CURRENT_STAFF_ID,
    });
    if (!trip) {
      toast.error('Could not create trip');
      return;
    }
    setAgentStaffId(deliveryPersonId);
    toast.success(`Trip ${trip.id} created for ${selectedAgent?.name ?? 'agent'}`);
    navigate(`/trips/${trip.id}`);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Create Trip"
        breadcrumbs={[
          { label: 'Trips', path: '/trips' },
          { label: 'Create Trip' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/trips')}>
            <ArrowLeft size={16} /> Back
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-brand-text-secondary mb-1">Delivery Agent</label>
          <select
            className="text-sm border border-brand-border rounded-lg px-3 py-2 bg-white min-w-[200px]"
            value={deliveryPersonId}
            onChange={(e) => setDeliveryPersonId(e.target.value)}
          >
            {agentOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.role}
              </option>
            ))}
          </select>
          {selectedAgent && (
            <p className="text-xs text-brand-text-secondary mt-1">
              Trip will be assigned to <span className="font-medium text-brand-text">{selectedAgent.name}</span>
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">
            Ready Orders ({readyOrders.length})
          </h3>
          {readyOrders.length === 0 ? (
            <p className="text-sm text-brand-text-secondary text-center py-8">No ready delivery orders available</p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {readyOrders.map((order) => {
                const customer = customers.find((c) => c.id === order.customerId);
                const loc = buildTripStopFromOrder(order, customer);
                const isSelected = selectedOrderIds.includes(order.id);
                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => toggleOrder(order.id)}
                    className={cn(
                      'w-full text-left rounded-lg border p-3 transition-colors',
                      isSelected
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-brand-border hover:border-brand-primary/40',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{order.id}</p>
                        <p className="text-sm">{order.customerName}</p>
                        <p className="text-xs text-brand-text-secondary mt-1 flex items-center gap-1">
                          <MapPin size={12} /> {loc.address}
                        </p>
                        <p className="text-[11px] text-brand-text-secondary mt-0.5">
                          {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <StatusBadge label={order.status} variant={getOrderStatusVariant(order.status)} />
                        <p className="text-xs mt-1 font-medium">{formatCurrency(order.billValue ?? order.total)}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)] flex flex-col">
          <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">
            Trip ({selectedStops.length} orders)
          </h3>
          {selectedStops.length === 0 ? (
            <p className="text-sm text-brand-text-secondary text-center py-8 flex-1">
              Click ready orders on the left to add them to this trip
            </p>
          ) : (
            <div className="space-y-2 flex-1 max-h-[50vh] overflow-y-auto">
              {selectedStops.map((stop) => (
                <div
                  key={stop.orderId}
                  className="flex items-start justify-between gap-2 rounded-lg border border-brand-border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{stop.orderId}</p>
                    <p>{stop.customerName}</p>
                    <p className="text-xs text-brand-text-secondary">{stop.address}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleOrder(stop.orderId)}
                    className="text-brand-text-secondary hover:text-brand-primary p-1"
                    aria-label="Remove from trip"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Button className="mt-4 w-full" onClick={handleFinalise} disabled={selectedStops.length === 0}>
            Finalise Trip
          </Button>
        </div>
      </div>
    </div>
  );
}
