import { useState } from 'react';
import { MapPin, ExternalLink, Check, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { InteractiveMap } from '@/components/customers/InteractiveMap';
import {
  geocodeAddress,
  buildGoogleMapsPickerUrl,
  buildGoogleMapsViewUrl,
} from '@/utils/mapLocation';
import { cn } from '@/utils/cn';

interface LocationPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  addressLine?: string;
  area?: string;
  city?: string;
  error?: string;
}

export function LocationPicker({ lat, lng, onChange, addressLine, area, city, error }: LocationPickerProps) {
  const [recenter, setRecenter] = useState<[number, number] | null>(null);
  const [finding, setFinding] = useState(false);
  const [findError, setFindError] = useState('');

  const hasLocation = lat != null && lng != null;

  const openGoogleMaps = () => {
    const url = buildGoogleMapsPickerUrl({
      addressLine,
      area,
      city,
      lat: lat ?? undefined,
      lng: lng ?? undefined,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const findAddressOnMap = async () => {
    setFinding(true);
    setFindError('');
    const result = await geocodeAddress({ addressLine, area, city });
    setFinding(false);
    if (!result) {
      setFindError('Could not find this address. Click the map to place the pin manually.');
      return;
    }
    onChange(result.lat, result.lng);
    setRecenter([result.lat, result.lng]);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-brand-text">Delivery location pin *</label>

      <div className="relative rounded-[var(--radius-brand)] overflow-hidden border border-brand-border">
        <InteractiveMap
          lat={lat}
          lng={lng}
          onChange={onChange}
          recenter={recenter}
        />
        {hasLocation && (
          <div className="absolute top-2 right-2 z-[1000]">
            <span className="flex items-center gap-1 text-[10px] font-medium bg-emerald-600 text-white px-2 py-1 rounded-full shadow">
              <Check size={12} /> Pin set
            </span>
          </div>
        )}
        {!hasLocation && (
          <div className="absolute inset-0 z-[999] pointer-events-none flex items-center justify-center">
            <div className="bg-white/90 px-3 py-1.5 rounded-full text-xs text-brand-text-secondary flex items-center gap-1.5 shadow-sm">
              <MapPin size={14} /> Click the map to drop a pin
            </div>
          </div>
        )}
      </div>

      {hasLocation && (
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-xs text-brand-text-secondary font-mono truncate">
            {lat!.toFixed(5)}, {lng!.toFixed(5)}
          </span>
          <a
            href={buildGoogleMapsViewUrl(lat!, lng!)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-cyan-dark hover:underline flex items-center gap-1 shrink-0"
          >
            Open in Google Maps <ExternalLink size={10} />
          </a>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={findAddressOnMap}
          disabled={finding || (!addressLine?.trim() && !area?.trim())}
        >
          {finding ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Find address on map
        </Button>
        <Button type="button" variant="outline" onClick={openGoogleMaps}>
          <ExternalLink size={16} />
          Google Maps
        </Button>
      </div>

      <p className="text-xs text-brand-text-secondary">
        Click the map to place a pin, or drag the pin to adjust. Use <strong>Find address on map</strong> to jump near the typed address, then fine-tune by clicking.
      </p>

      {(findError || error) && (
        <p className={cn('text-xs text-brand-primary')}>{findError || error}</p>
      )}
    </div>
  );
}
