import { cn } from '@/utils/cn';
import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: string;
  variant?: 'default' | 'primary' | 'cyan' | 'warning' | 'success';
  className?: string;
}

const variantStyles = {
  default: 'border-brand-border',
  primary: 'border-brand-primary/20 bg-brand-primary/5',
  cyan: 'border-brand-cyan/20 bg-brand-cyan/5',
  warning: 'border-amber-200 bg-amber-50',
  success: 'border-emerald-200 bg-emerald-50',
};

const iconStyles = {
  default: 'bg-gray-100 text-gray-600',
  primary: 'bg-brand-primary/10 text-brand-primary',
  cyan: 'bg-brand-cyan/10 text-brand-cyan-dark',
  warning: 'bg-amber-100 text-amber-600',
  success: 'bg-emerald-100 text-emerald-600',
};

export function SummaryCard({ title, value, icon: Icon, trend, variant = 'default', className }: SummaryCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-[var(--radius-brand)] border p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]',
        variantStyles[variant],
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-brand-text-secondary font-medium">{title}</p>
          <p className="text-2xl font-bold font-[family-name:var(--font-heading)] mt-1 text-brand-text">{value}</p>
          {trend && <p className="text-xs text-brand-text-secondary mt-1">{trend}</p>}
        </div>
        {Icon && (
          <div className={cn('p-2.5 rounded-lg', iconStyles[variant])}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}

export function SummaryCardSkeleton() {
  return (
    <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-4">
      <div className="skeleton h-4 w-24 mb-3" />
      <div className="skeleton h-8 w-16" />
    </div>
  );
}
