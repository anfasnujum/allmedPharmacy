import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ProductComplianceNotes } from '@/components/products/ProductComplianceNotes';
import type { Order, OrderItem } from '@/types';

interface ModalLineSnapshot {
  index: number;
  item: OrderItem;
}

interface FinishPackingModalProps {
  open: boolean;
  order: Order;
  lineSnapshots: ModalLineSnapshot[];
  checkedIndices: Set<number>;
  onToggleCheck: (index: number, checked: boolean) => void;
  onClose: () => void;
  onConfirm: (payload: {
    packedItemIndices: number[];
    skippedItems: Array<{ itemIndex: number; reason: string }>;
    newBillNumber: string;
    newBillValue: number;
  }) => void;
}

const labelClass = 'block text-xs font-medium text-brand-text-secondary mb-1';
const inputClass =
  'w-full text-sm border border-brand-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20';
const inputErrorClass =
  'w-full text-sm border border-red-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-200';

export function FinishPackingModal({
  open,
  order,
  lineSnapshots,
  checkedIndices,
  onToggleCheck,
  onClose,
  onConfirm,
}: FinishPackingModalProps) {
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [newBillNumber, setNewBillNumber] = useState('');
  const [newBillValue, setNewBillValue] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const stillUnchecked = useMemo(
    () => lineSnapshots.filter(({ index }) => !checkedIndices.has(index)),
    [lineSnapshots, checkedIndices],
  );

  useEffect(() => {
    if (!open) return;
    setReasons({});
    setNewBillNumber(order.billNumber ?? '');
    setNewBillValue(order.billValue != null ? String(order.billValue) : String(order.total));
    setErrors({});
  }, [open, order.billNumber, order.billValue, order.total]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (stillUnchecked.length > 0) {
      for (const { index } of stillUnchecked) {
        if (!reasons[index]?.trim()) {
          nextErrors[`reason-${index}`] = 'Reason required';
        }
      }
      if (!newBillNumber.trim()) nextErrors.billNumber = 'Bill number is required';
      const parsedBillValue = Number(newBillValue);
      if (!newBillValue.trim() || Number.isNaN(parsedBillValue) || parsedBillValue <= 0) {
        nextErrors.billValue = 'Valid bill value is required';
      }
    }

    const packedItemIndices = order.items.map((_, i) => i).filter((index) => checkedIndices.has(index));

    if (packedItemIndices.length === 0) {
      nextErrors.general = 'At least one item must be packed';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onConfirm({
      packedItemIndices,
      skippedItems: stillUnchecked.map(({ index }) => ({
        itemIndex: index,
        reason: reasons[index]?.trim() ?? '',
      })),
      newBillNumber: newBillNumber.trim(),
      newBillValue: Number(newBillValue),
    });
  };

  if (!open || lineSnapshots.length === 0) return null;

  return (
    <Modal open={open} onClose={onClose} title="Unchecked Items" size="md">
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-brand-text-secondary">
          These products were not checked during packing. Mark them as packed, or provide a reason for each to return them to the requirement.
        </p>

        {errors.general && <p className="text-xs text-red-600">{errors.general}</p>}

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {lineSnapshots.map(({ index, item }) => {
            const isChecked = checkedIndices.has(index);
            return (
              <div
                key={index}
                className={`rounded-lg border p-3 text-sm ${isChecked ? 'border-emerald-200 bg-emerald-50/50' : 'border-brand-border'}`}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => onToggleCheck(index, e.target.checked)}
                    className="mt-1 rounded border-brand-border text-brand-primary focus:ring-brand-primary/20"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-brand-text-secondary">{item.strength} · Qty {item.quantity}</p>
                    <ProductComplianceNotes item={item} className="mt-1.5" compact />
                  </div>
                </label>
                {!isChecked && (
                  <div className="mt-3 pl-7">
                    <label className={labelClass} htmlFor={`reason-${index}`}>Reason not packed</label>
                    <textarea
                      id={`reason-${index}`}
                      rows={2}
                      className={errors[`reason-${index}`] ? inputErrorClass : inputClass}
                      value={reasons[index] ?? ''}
                      onChange={(e) => {
                        setReasons((prev) => ({ ...prev, [index]: e.target.value }));
                        if (errors[`reason-${index}`]) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next[`reason-${index}`];
                            return next;
                          });
                        }
                      }}
                      placeholder="e.g. Out of stock, wrong batch…"
                    />
                    {errors[`reason-${index}`] && (
                      <p className="text-xs text-red-600 mt-1">{errors[`reason-${index}`]}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {stillUnchecked.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-brand-border">
            <div>
              <label className={labelClass} htmlFor="finish-bill-number">New Bill Number</label>
              <input
                id="finish-bill-number"
                type="text"
                className={errors.billNumber ? inputErrorClass : inputClass}
                value={newBillNumber}
                onChange={(e) => {
                  setNewBillNumber(e.target.value);
                  if (errors.billNumber) setErrors((prev) => ({ ...prev, billNumber: '' }));
                }}
              />
              {errors.billNumber && <p className="text-xs text-red-600 mt-1">{errors.billNumber}</p>}
            </div>
            <div>
              <label className={labelClass} htmlFor="finish-bill-value">New Bill Value (₹)</label>
              <input
                id="finish-bill-value"
                type="text"
                inputMode="decimal"
                className={errors.billValue ? inputErrorClass : inputClass}
                value={newBillValue}
                onChange={(e) => {
                  setNewBillValue(e.target.value);
                  if (errors.billValue) setErrors((prev) => ({ ...prev, billValue: '' }));
                }}
              />
              {errors.billValue && <p className="text-xs text-red-600 mt-1">{errors.billValue}</p>}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-brand-border">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Finish Packing</Button>
        </div>
      </form>
    </Modal>
  );
}
