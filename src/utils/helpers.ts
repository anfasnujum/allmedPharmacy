function numericSuffix(prefix: string, id: string): number | null {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = id.match(new RegExp(`^${escaped}-(\\d+)$`, 'i'));
  return match ? Number.parseInt(match[1], 10) : null;
}

const lastIssued: Record<string, number> = {};

/** Next id like ENQ-005, ORD-012 — sequential from existing records. */
export function generateId(prefix: string, existingIds: readonly string[] = []): string {
  let max = lastIssued[prefix] ?? 0;
  for (const id of existingIds) {
    const n = numericSuffix(prefix, id);
    if (n != null && n > max) max = n;
  }
  const next = max + 1;
  lastIssued[prefix] = next;
  return `${prefix}-${String(next).padStart(3, '0')}`;
}

export function createTimelineEvent(description: string, actor?: string) {
  return {
    id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    description,
    actor,
  };
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    return `+91${digits.slice(-10)}`;
  }
  return phone.replace(/\s+/g, '').replace(/-/g, '');
}

export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10);
}

export function isValidPhone(phone: string): boolean {
  const digits = phoneDigits(phone);
  return /^[6-9]\d{9}$/.test(digits);
}
