import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface PartialOrderWarningModalProps {
  open: boolean;
  remainingCount: number;
  onClose: () => void;
  onConfirmPartial: () => void;
}

export function PartialOrderWarningModal({
  open,
  remainingCount,
  onClose,
  onConfirmPartial,
}: PartialOrderWarningModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Requirement not completed" size="md">
      <div className="space-y-4">
        <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-amber-900">This requirement is not fully fulfilled</p>
            <p className="text-amber-800 mt-1">
              {remainingCount} item{remainingCount === 1 ? '' : 's'} will remain on the requirement after this order is created.
              The requirement status will be set to <strong>Partial</strong>.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-brand-border">
          <Button variant="outline" onClick={onClose}>Go back</Button>
          <Button onClick={onConfirmPartial}>Create Partial Order</Button>
        </div>
      </div>
    </Modal>
  );
}
