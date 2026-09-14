export async function geocodeAddress(parts: {
  addressLine?: string;
  area?: string;
  city?: string;
}): Promise<{ lat: number; lng: number } | null> {
  const query = [parts.addressLine, parts.area, parts.city, 'Kerala, India'].filter(Boolean).join(', ');
  if (!query.trim()) return null;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { 'Accept-Language': 'en' } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!data[0]) return null;
    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    return isValidCoord(lat, lng) ? { lat, lng } : null;
  } catch {
    return null;
  }
}

/** Parse latitude/longitude from Google Maps links or plain coordinate strings */
export function parseGoogleMapsLocation(input: string): { lat: number; lng: number } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const plain = trimmed.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
  if (plain) {
    const lat = parseFloat(plain[1]);
    const lng = parseFloat(plain[2]);
    if (isValidCoord(lat, lng)) return { lat, lng };
  }

  const patterns = [
    /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,
    /[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /center=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (isValidCoord(lat, lng)) return { lat, lng };
    }
  }

  return null;
}

function isValidCoord(lat: number, lng: number): boolean {
  return !Number.isNaN(lat) && !Number.isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/** Open Google Maps so staff can search, drop a pin, and copy the link */
export function buildGoogleMapsPickerUrl(parts: {
  addressLine?: string;
  area?: string;
  city?: string;
  lat?: number;
  lng?: number;
}): string {
  if (parts.lat != null && parts.lng != null) {
    return `https://www.google.com/maps/@?api=1&map_action=map&center=${parts.lat},${parts.lng}&zoom=17`;
  }
  const query = [parts.addressLine, parts.area, parts.city, 'Kerala, India'].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || 'Kochi, Kerala')}`;
}

export function buildGoogleMapsEmbedUrl(lat: number, lng: number): string {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
}

export function buildGoogleMapsViewUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}
