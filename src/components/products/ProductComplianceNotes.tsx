import { getProductComplianceMessages } from '@/utils/productCompliance';
import type { OrderItem, Product, RequirementItem } from '@/types';
import { cn } from '@/utils/cn';

interface ProductComplianceNotesProps {
  item: RequirementItem | OrderItem | Product;
  className?: string;
  compact?: boolean;
}

export function ProductComplianceNotes({ item, className, compact = false }: ProductComplianceNotesProps) {
  const messages = getProductComplianceMessages(item);
  if (messages.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {messages.map((message) => (
        <span
          key={message}
          className={cn(
            'inline-flex items-center rounded-md border text-[11px] font-medium leading-tight',
            compact ? 'px-1.5 py-0.5' : 'px-2 py-1',
            message.includes('Prescription')
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : 'border-sky-200 bg-sky-50 text-sky-800',
          )}
        >
          {message}
        </span>
      ))}
    </div>
  );
}
