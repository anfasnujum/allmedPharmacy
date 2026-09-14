import type { Staff } from '@/types';

/** Logged-in staff member for the current session (demo — ops desk). */
export const CURRENT_STAFF_ID = 'ST-001';

/** Default delivery agent for the mobile app demo. */
export const AGENT_STAFF_ID = 'ST-004';

const AGENT_SESSION_KEY = 'allmed-agent-staff-id';

export function getDefaultDeliveryAgentId(staff: Staff[], branchId: string): string {
  const executives = staff.filter(
    (s) => s.role === 'Delivery Executive' && s.branchId === branchId,
  );
  if (executives.length > 0) return executives[0].id;
  const branchStaff = staff.filter((s) => s.branchId === branchId);
  return branchStaff[0]?.id ?? AGENT_STAFF_ID;
}

export function getAgentStaffId(): string {
  try {
    const stored = sessionStorage.getItem(AGENT_SESSION_KEY);
    if (stored) return stored;
  } catch {
    // ignore
  }
  return AGENT_STAFF_ID;
}

export function setAgentStaffId(id: string): void {
  try {
    sessionStorage.setItem(AGENT_SESSION_KEY, id);
  } catch {
    // ignore
  }
}
