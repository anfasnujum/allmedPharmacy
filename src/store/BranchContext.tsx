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
import { useBranches } from '@/store/DataContext';

const STORAGE_KEY = 'allmed-active-branch';

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

function loadStoredBranchId(accessibleIds: string[]): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && accessibleIds.includes(stored)) return stored;
  } catch {
    // fall through
  }
  return accessibleIds[0] ?? 'BR-001';
}

export function BranchProvider({ children }: { children: ReactNode }) {
  const allBranches = useBranches();
  const accessibleBranches = useMemo(
    () => allBranches.filter((b) => b.status === 'Active'),
    [allBranches],
  );
  const accessibleIds = useMemo(
    () => accessibleBranches.map((b) => b.id),
    [accessibleBranches],
  );

  const [activeBranchId, setActiveBranchIdState] = useState(() =>
    loadStoredBranchId(accessibleIds),
  );

  useEffect(() => {
    if (accessibleIds.length > 0 && !accessibleIds.includes(activeBranchId)) {
      setActiveBranchIdState(accessibleIds[0]);
    }
  }, [accessibleIds, activeBranchId]);

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

  const setActiveBranchId = useCallback(
    (id: string) => {
      if (accessibleIds.includes(id)) {
        setActiveBranchIdState(id);
      }
    },
    [accessibleIds],
  );

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

  if (!activeBranch) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center p-6">
        <p className="text-sm text-brand-text-secondary">No active branches found.</p>
      </div>
    );
  }

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
