import { cn } from '@/utils/cn';
import { badgeClasses } from '@/utils/statusHelpers';

interface StatusBadgeProps {
  label: string;
  variant?: keyof typeof badgeClasses;
  className?: string;
}

export function StatusBadge({ label, variant = 'neutral', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap',
        badgeClasses[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
