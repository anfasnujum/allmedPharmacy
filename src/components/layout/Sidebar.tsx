import { NavLink } from 'react-router-dom';
import {
  MessageCircleQuestion,
  ClipboardList,
  ShoppingCart,
  Truck,
  Wallet,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Users,
  User,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useState } from 'react';

const navItems = [
  { to: '/enquiries', label: 'Enquiries', icon: MessageCircleQuestion },
  { to: '/requirements?status=New', label: 'Requirements', icon: ClipboardList },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/trips', label: 'Trips', icon: Truck },
  { to: '/collections', label: 'Collections', icon: Wallet },
  { to: '/completed', label: 'Completed', icon: CheckCircle2 },
  { to: '/customers', label: 'Customers', icon: Users },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'bg-brand-dark text-white flex flex-col shrink-0 transition-all duration-200 h-full',
        collapsed ? 'w-[68px]' : 'w-60',
      )}
    >
      <div className={cn('flex items-center gap-3 px-4 py-4 border-b border-white/10', collapsed && 'justify-center px-2')}>
        <img src="/logo.png" alt="ALLMED" className={cn('object-contain', collapsed ? 'h-8 w-8' : 'h-10')} />
        {!collapsed && (
          <div>
            <p className="font-bold font-[family-name:var(--font-heading)] text-sm leading-tight">ALLMED</p>
            <p className="text-[10px] text-white/60">Operations</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-primary text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
                collapsed && 'justify-center px-2',
              )
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={20} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10">
        <div
          className={cn(
            'flex items-center gap-3 px-4 py-3',
            collapsed && 'justify-center px-2',
          )}
          title={collapsed ? 'Priya Nair · Pharmacist' : undefined}
        >
          <div className="w-9 h-9 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0">
            <User size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-white leading-tight truncate">Priya Nair</p>
              <p className="text-xs text-white/60 truncate">Pharmacist</p>
            </div>
          )}
        </div>

        <div className="p-2 border-t border-white/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
