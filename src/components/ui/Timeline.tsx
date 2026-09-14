import { formatDateTime } from '@/utils/format';
import type { TimelineEvent } from '@/types';

interface TimelineProps {
  events: TimelineEvent[];
  staffMap?: Record<string, string>;
}

export function Timeline({ events, staffMap }: TimelineProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  if (sorted.length === 0) {
    return <p className="text-sm text-brand-text-secondary">No timeline events yet.</p>;
  }

  return (
    <div className="space-y-0">
      {sorted.map((event, i) => (
        <div key={event.id} className="flex gap-3 pb-4 last:pb-0">
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-primary shrink-0 mt-1.5" />
            {i < sorted.length - 1 && <div className="w-px flex-1 bg-brand-border mt-1" />}
          </div>
          <div className="pb-1">
            <p className="text-xs text-brand-text-secondary">{formatDateTime(event.timestamp)}</p>
            <p className="text-sm text-brand-text mt-0.5">{event.description}</p>
            {event.actor && staffMap?.[event.actor] && (
              <p className="text-xs text-brand-text-secondary mt-0.5">— {staffMap[event.actor]}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
