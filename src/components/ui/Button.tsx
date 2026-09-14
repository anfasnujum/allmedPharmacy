import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variants = {
  primary: 'bg-brand-primary text-white hover:bg-brand-primary-dark border-brand-primary',
  secondary: 'bg-brand-cyan text-white hover:bg-brand-cyan-dark border-brand-cyan',
  outline: 'bg-white text-brand-text border-brand-border hover:bg-gray-50',
  ghost: 'bg-transparent text-brand-text hover:bg-gray-100 border-transparent',
  danger: 'bg-white text-brand-primary border-red-200 hover:bg-red-50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

export function Button({ variant = 'primary', size = 'md', className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius-brand)] border transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
