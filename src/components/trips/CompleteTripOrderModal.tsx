import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { LocationPicker } from '@/components/customers/LocationPicker';
import { fetchAgentLocation } from '@/utils/tripHelpers';
import { formatCurrency } from '@/utils/format';
import type { TripStop, TripOrderPaymentOption } from '@/types';

interface CompleteTripOrderModalProps {
  open: boolean;
  stop: TripStop;
  deliveryPersonId: string;
  branchName: string;
  onClose: () => void;
  onConfirm: (payload: {
    paymentOption: TripOrderPaymentOption;
    addressLine: string;
    area: string;
    lat: number;
    lng: number;
    saveAsNewAddress?: boolean;
    newAddressLabel?: string;
  }) => void;
}

const labelClass = 'block text-xs font-medium text-brand-text-secondary mb-1';
const inputClass =
  'w-full text-sm border border-brand-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20';

const PAYMENT_OPTIONS: TripOrderPaymentOption[] = [
  'Collected by Agent',
  'Collected by Store',
  'Pay Later',
];

export function CompleteTripOrderModal({
  open,
  stop,
  deliveryPersonId,
  branchName,
  onClose,
  onConfirm,
}: CompleteTripOrderModalProps) {
  const [paymentOption, setPaymentOption] = useState<TripOrderPaymentOption>('Collected by Agent');
  const [addressLine, setAddressLine] = useState('');
  const [area, setArea] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState('Delivery Point');
  const [agentLocation, setAgentLocation] = useState<string>('Fetching agent location…');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setPaymentOption('Collected by Agent');
    setAddressLine(stop.addressLine);
    setArea(stop.area);
    setLat(stop.lat);
    setLng(stop.lng);
    setUseNewAddress(false);
    setNewAddressLabel('Delivery Point');
    setErrors({});
    fetchAgentLocation(deliveryPersonId, branchName).then((loc) => {
      setAgentLocation(`${loc.addressLine}, ${loc.area} (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})`);
    });
  }, [open, stop, deliveryPersonId, branchName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!addressLine.trim()) nextErrors.addressLine = 'Address is required';
    if (!area.trim()) nextErrors.area = 'Area is required';
    if (lat == null || lng == null) nextErrors.location = 'Set delivery location on the map';
    if (useNewAddress && !newAddressLabel.trim()) nextErrors.label = 'Address label is required';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onConfirm({
      paymentOption,
      addressLine: addressLine.trim(),
      area: area.trim(),
      lat: lat!,
      lng: lng!,
      saveAsNewAddress: useNewAddress,
      newAddressLabel: useNewAddress ? newAddressLabel.trim() : undefined,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={`Complete ${stop.orderId}`} size="lg">
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        {stop.prescriptionRequired && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Prescription must be collected from the customer before completing this order.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className={labelClass}>Bill Value</span>
            <p className="text-lg font-semibold">{formatCurrency(stop.billValue)}</p>
          </div>
          <div>
            <label className={labelClass} htmlFor="trip-payment">Payment</label>
            <select
              id="trip-payment"
              className={inputClass}
              value={paymentOption}
              onChange={(e) => setPaymentOption(e.target.value as TripOrderPaymentOption)}
            >
              {PAYMENT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span className={labelClass}>Agent current location</span>
          <p className="text-sm text-brand-text">{agentLocation}</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="use-new-address"
            checked={useNewAddress}
            onChange={(e) => setUseNewAddress(e.target.checked)}
          />
          <label htmlFor="use-new-address" className="text-sm">
            Delivery address is incorrect — add a new address for this customer
          </label>
        </div>

        {useNewAddress && (
          <div>
            <label className={labelClass} htmlFor="addr-label">New address label</label>
            <input
              id="addr-label"
              className={inputClass}
              value={newAddressLabel}
              onChange={(e) => setNewAddressLabel(e.target.value)}
            />
            {errors.label && <p className="text-xs text-red-600 mt-1">{errors.label}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="addr-line">Address line</label>
            <input
              id="addr-line"
              className={inputClass}
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
            />
            {errors.addressLine && <p className="text-xs text-red-600 mt-1">{errors.addressLine}</p>}
          </div>
          <div>
            <label className={labelClass} htmlFor="addr-area">Area</label>
            <input
              id="addr-area"
              className={inputClass}
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
            {errors.area && <p className="text-xs text-red-600 mt-1">{errors.area}</p>}
          </div>
        </div>

        <LocationPicker
          lat={lat}
          lng={lng}
          onChange={(newLat, newLng) => {
            setLat(newLat);
            setLng(newLng);
          }}
          addressLine={addressLine}
          area={area}
          error={errors.location}
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-brand-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Complete Order</Button>
        </div>
      </form>
    </Modal>
  );
}
