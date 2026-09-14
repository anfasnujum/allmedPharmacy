import { useCallback, useState } from 'react';
import { getAgentStaffId, setAgentStaffId } from '@/constants/session';

export function useAgentStaffId() {
  const [agentId, setAgentId] = useState(getAgentStaffId);

  const selectAgent = useCallback((id: string) => {
    setAgentStaffId(id);
    setAgentId(id);
  }, []);

  return { agentId, selectAgent };
}
