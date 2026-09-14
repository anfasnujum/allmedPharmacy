import { useState, useRef, useEffect } from 'react';
import { Building2, ChevronDown, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useBranch } from '@/store/BranchContext';
import { cn } from '@/utils/cn';

export function BranchSelector() {
  const { activeBranch, accessibleBranches, setActiveBranchId } = useBranch();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm border border-brand-border rounded-[var(--radius-brand)] bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/20 max-w-[220px]"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select branch"
      >
        <Building2 size={16} className="text-brand-primary shrink-0" />
        <span className="truncate text-left">
          <span className="block font-medium text-brand-text leading-tight truncate">{activeBranch.name}</span>
          <span className="block text-[10px] text-brand-text-secondary">{activeBranch.code}</span>
        </span>
        <ChevronDown size={14} className={cn('text-gray-400 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-72 bg-white border border-brand-border rounded-[var(--radius-brand)] shadow-lg z-50 py-1"
          role="listbox"
          aria-label="Branches"
        >
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-brand-text-secondary border-b border-brand-border">
            Your branches
          </p>
          {accessibleBranches.map((branch) => {
            const selected = branch.id === activeBranch.id;
            return (
              <button
                key={branch.id}
                type="button"
                role="option"
                aria-selected={selected}
                className={cn(
                  'w-full text-left px-3 py-2.5 hover:bg-gray-50 flex items-start gap-2 transition-colors',
                  selected && 'bg-brand-primary/5',
                )}
                onClick={() => {
                  if (branch.id !== activeBranch.id) {
                    setActiveBranchId(branch.id);
                    toast.success(`Switched to ${branch.name}`);
                  }
                  setOpen(false);
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-text truncate">{branch.name}</p>
                  <p className="text-xs text-brand-text-secondary truncate">
                    {branch.code} · {branch.location}
                  </p>
                </div>
                {selected && <Check size={16} className="text-brand-primary shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
