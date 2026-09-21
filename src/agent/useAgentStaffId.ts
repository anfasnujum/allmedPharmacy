import { useCallback, useState } from 'react';
import { getAgentStaffId, setAgentStaffId, useCurrentStaff } from '@/constants/session';

export function useAgentStaffId() {
  const staff = useCurrentStaff();
  const locked = staff?.role === 'Delivery Executive';
  const [agentId, setAgentId] = useState(getAgentStaffId);

  const selectAgent = useCallback((id: string) => {
    if (locked) return;
    setAgentStaffId(id);
    setAgentId(id);
  }, [locked]);

  return {
    agentId: locked && staff ? staff.id : agentId,
    selectAgent,
    locked: Boolean(locked),
  };
}
