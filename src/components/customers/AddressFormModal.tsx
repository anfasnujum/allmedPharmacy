import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { LocationPicker } from '@/components/customers/LocationPicker';
import type { CustomerAddress } from '@/types';

interface AddressFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (address: Omit<CustomerAddress, 'id'>) => void;
  initial?: CustomerAddress;
  title?: string;
}

const inputClass = 'w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20';
const labelClass = 'block text-sm font-medium text-brand-text mb-1';

const DEFAULT_LAT = 9.9312;
const DEFAULT_LNG = 76.2673;

export function AddressFormModal({ open, onClose, onSave, initial, title = 'Add Address' }: AddressFormModalProps) {
  const [label, setLabel] = useState('Home');
  const [addressLine, setAddressLine] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Kochi');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [isPrimary, setIsPrimary] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setLabel(initial?.label ?? 'Home');
    setAddressLine(initial?.addressLine ?? '');
    setArea(initial?.area ?? '');
    setCity(initial?.city ?? 'Kochi');
    setPincode(initial?.pincode ?? '');
    setLandmark(initial?.landmark ?? '');
    setLat(initial?.lat ?? null);
    setLng(initial?.lng ?? null);
    setIsPrimary(initial?.isPrimary ?? false);
    setErrors({});
  }, [open, initial]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!label.trim()) e.label = 'Label is required';
    if (!addressLine.trim()) e.addressLine = 'Address is required';
    if (!area.trim()) e.area = 'Area is required';
    if (lat == null || lng == null) e.location = 'Please click the map to set a delivery pin';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      label: label.trim(),
      addressLine: addressLine.trim(),
      area: area.trim(),
      city: city.trim(),
      pincode: pincode.trim() || undefined,
      landmark: landmark.trim() || undefined,
      lat: lat ?? DEFAULT_LAT,
      lng: lng ?? DEFAULT_LNG,
      isPrimary,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Label</label>
            <select className={inputClass} value={label} onChange={(e) => setLabel(e.target.value)}>
              {['Home', 'Office', 'Delivery Point', 'Other'].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
              Set as primary address
            </label>
          </div>
        </div>
        <div>
          <label className={labelClass}>Address Line *</label>
          <input className={inputClass} value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
          {errors.addressLine && <p className="text-xs text-brand-primary mt-1">{errors.addressLine}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Area/Locality *</label>
            <input className={inputClass} value={area} onChange={(e) => setArea(e.target.value)} />
            {errors.area && <p className="text-xs text-brand-primary mt-1">{errors.area}</p>}
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Pincode</label>
            <input className={inputClass} value={pincode} onChange={(e) => setPincode(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Landmark</label>
            <input className={inputClass} value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Near..." />
          </div>
        </div>

        <LocationPicker
          lat={lat}
          lng={lng}
          onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); setErrors((e) => ({ ...e, location: '' })); }}
          addressLine={addressLine}
          area={area}
          city={city}
          error={errors.location}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Address</Button>
        </div>
      </div>
    </Modal>
  );
}
