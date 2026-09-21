import { Outlet, NavLink } from 'react-router-dom';
import { Truck, User } from 'lucide-react';
import { useStaff } from '@/store/DataContext';
import { useAgentStaffId } from '@/agent/useAgentStaffId';
import { useAuth } from '@/store/AuthContext';
import { cn } from '@/utils/cn';

export function AgentLayout() {
  const staff = useStaff();
  const { agentId, selectAgent, locked } = useAgentStaffId();
  const { configured, signOut } = useAuth();
  const deliveryAgents = staff.filter((s) => s.role === 'Delivery Executive');
  const agent = staff.find((s) => s.id === agentId);

  return (
    <div className="min-h-[100dvh] bg-brand-background flex flex-col max-w-lg mx-auto shadow-xl">
      <header className="sticky top-0 z-40 bg-brand-dark text-white px-4 py-3 safe-top">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/logo.png" alt="ALLMED" className="h-8 w-8 object-contain shrink-0" />
            <div className="min-w-0">
              <p className="font-bold font-[family-name:var(--font-heading)] text-sm leading-tight truncate">
                ALLMED Agent
              </p>
              <p className="text-[11px] text-white/60 truncate">Delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {locked ? (
              <p className="text-xs text-white/80 max-w-[130px] truncate">{agent?.name}</p>
            ) : (
              <select
                value={agentId}
                onChange={(e) => selectAgent(e.target.value)}
                className="text-xs bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white max-w-[130px] truncate"
                aria-label="Switch delivery agent"
              >
                {deliveryAgents.map((s) => (
                  <option key={s.id} value={s.id} className="text-brand-text">
                    {s.name}
                  </option>
                ))}
              </select>
            )}
            {configured && (
              <button
                type="button"
                onClick={() => void signOut()}
                className="text-[11px] text-white/70 hover:text-white underline-offset-2 hover:underline"
              >
                Sign out
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-brand-primary/30 flex items-center justify-center">
              <User size={16} />
            </div>
          </div>
        </div>
        {agent && (
          <p className="text-[10px] text-white/50 mt-1 truncate">{agent.phone}</p>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-brand-border safe-bottom">
        <div className="max-w-lg mx-auto flex">
          <NavLink
            to="/agent"
            end
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                isActive ? 'text-brand-primary' : 'text-brand-text-secondary',
              )
            }
          >
            <Truck size={22} />
            My Trips
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
