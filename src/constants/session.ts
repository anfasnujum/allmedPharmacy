import type { Staff } from '@/types';
import { useAuth } from '@/store/AuthContext';
import { useStaff } from '@/store/DataContext';

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

export function useCurrentStaff(): Staff | undefined {
  const { configured, user } = useAuth();
  const staff = useStaff();
  if (configured && user?.email) {
    const email = user.email.toLowerCase();
    return staff.find((s) => s.email?.toLowerCase() === email);
  }
  return staff.find((s) => s.id === CURRENT_STAFF_ID) ?? staff[0];
}

export function useActorId(): string {
  return useCurrentStaff()?.id ?? CURRENT_STAFF_ID;
}
