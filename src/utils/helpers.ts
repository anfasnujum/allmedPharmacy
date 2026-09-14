let counter = 100;

export function generateId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
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
