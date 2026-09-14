import { MapPin, ExternalLink } from 'lucide-react';
import type { CustomerAddress } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { buildGoogleMapsEmbedUrl, buildGoogleMapsViewUrl } from '@/utils/mapLocation';

interface AddressCardProps {
  address: CustomerAddress;
  onSetPrimary?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
  canRemove?: boolean;
}

export function AddressCard({ address, onSetPrimary, onEdit, onRemove, canRemove }: AddressCardProps) {
  const mapsUrl = buildGoogleMapsViewUrl(address.lat, address.lng);

  return (
    <div className="border border-brand-border rounded-[var(--radius-brand)] overflow-hidden bg-white shadow-[var(--shadow-card)]">
      <div className="relative">
        <iframe
          title={`Map for ${address.label}`}
          src={buildGoogleMapsEmbedUrl(address.lat, address.lng)}
          className="w-full h-36 border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 text-[10px] flex items-center gap-1 bg-white/95 px-2 py-1 rounded shadow text-brand-cyan-dark hover:underline pointer-events-auto"
        >
          Open in Google Maps <ExternalLink size={10} />
        </a>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold font-[family-name:var(--font-heading)] text-brand-text">{address.label}</h4>
              {address.isPrimary && <StatusBadge label="Primary" variant="success" />}
            </div>
            <p className="text-sm text-brand-text mt-1">{address.addressLine}</p>
            <p className="text-sm text-brand-text-secondary">{address.area}, {address.city}{address.pincode ? ` — ${address.pincode}` : ''}</p>
            {address.landmark && (
              <p className="text-xs text-brand-text-secondary mt-1 flex items-center gap-1">
                <MapPin size={12} /> {address.landmark}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-brand-border">
          {!address.isPrimary && onSetPrimary && (
            <Button variant="outline" size="sm" onClick={onSetPrimary}>Set as Primary</Button>
          )}
          {onEdit && <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>}
          {canRemove && onRemove && (
            <Button variant="danger" size="sm" onClick={onRemove}>Remove</Button>
          )}
        </div>
      </div>
    </div>
  );
}
