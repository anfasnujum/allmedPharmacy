import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { Branch, Order } from '@/types';
import { branches as allBranches } from '@/data/branches';

const STORAGE_KEY = 'allmed-active-branch';

/** Branches the current user can operate in (mock: all active branches) */
const ACCESSIBLE_BRANCH_IDS = allBranches
  .filter((b) => b.status === 'Active')
  .map((b) => b.id);

interface BranchContextValue {
  activeBranch: Branch;
  activeBranchId: string;
  accessibleBranches: Branch[];
  setActiveBranchId: (id: string) => void;
  /** Filter items that have a direct branchId field */
  matchesBranch: (branchId?: string) => boolean;
  /** Filter deliveries/collections via their linked order */
  orderMatchesBranch: (orderId: string, orders: Order[]) => boolean;
}

const BranchContext = createContext<BranchContextValue | null>(null);

function loadActiveBranchId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ACCESSIBLE_BRANCH_IDS.includes(stored)) return stored;
  } catch {
    // fall through
  }
  return ACCESSIBLE_BRANCH_IDS[0] ?? 'BR-001';
}

export function BranchProvider({ children }: { children: ReactNode }) {
  const [activeBranchId, setActiveBranchIdState] = useState(loadActiveBranchId);

  const accessibleBranches = useMemo(
    () => allBranches.filter((b) => ACCESSIBLE_BRANCH_IDS.includes(b.id)),
    [],
  );

  const activeBranch = useMemo(
    () => accessibleBranches.find((b) => b.id === activeBranchId) ?? accessibleBranches[0],
    [accessibleBranches, activeBranchId],
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, activeBranchId);
    } catch {
      // ignore
    }
  }, [activeBranchId]);

  const setActiveBranchId = useCallback((id: string) => {
    if (ACCESSIBLE_BRANCH_IDS.includes(id)) {
      setActiveBranchIdState(id);
    }
  }, []);

  const matchesBranch = useCallback(
    (branchId?: string) => !branchId || branchId === activeBranchId,
    [activeBranchId],
  );

  const orderMatchesBranch = useCallback(
    (orderId: string, orders: Order[]) => {
      const order = orders.find((o) => o.id === orderId);
      return order ? order.branchId === activeBranchId : false;
    },
    [activeBranchId],
  );

  return (
    <BranchContext.Provider
      value={{
        activeBranch,
        activeBranchId,
        accessibleBranches,
        setActiveBranchId,
        matchesBranch,
        orderMatchesBranch,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error('useBranch must be used within BranchProvider');
  return ctx;
}
