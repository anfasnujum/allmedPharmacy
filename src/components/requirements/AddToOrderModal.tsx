import { useEffect, useRef, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SubstituteProductPicker, type SubstituteProductPickerHandle } from '@/components/requirements/SubstituteProductPicker';
import { ProductComplianceNotes } from '@/components/products/ProductComplianceNotes';
import { productSelectionFields } from '@/utils/productCompliance';
import type { Product, RequirementItem } from '@/types';

type PendingLine = RequirementItem & { lineId: string };

interface AddToOrderModalProps {
  open: boolean;
  item: PendingLine | null;
  onClose: () => void;
  onConfirm: (payload: { sourceLineId: string; orderItem: RequirementItem; quantity: number }) => void;
}

const labelClass = 'block text-xs font-medium text-brand-text-secondary mb-1';
const inputClass =
  'w-full text-sm border border-brand-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20';
const inputErrorClass =
  'w-full text-sm border border-red-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-200';

function toOrderItemFromProduct(product: Product, baseQuantity: number): RequirementItem {
  return {
    productId: product.id,
    productName: product.name,
    strength: product.strength,
    quantity: baseQuantity,
    ...productSelectionFields(product),
  };
}

export function AddToOrderModal({ open, item, onClose, onConfirm }: AddToOrderModalProps) {
  const quantityRef = useRef<HTMLInputElement>(null);
  const substitutePickerRef = useRef<SubstituteProductPickerHandle>(null);
  const [quantity, setQuantity] = useState('1');
  const [quantityError, setQuantityError] = useState('');
  const [substituteProduct, setSubstituteProduct] = useState<Product | null>(null);
  const [orderItem, setOrderItem] = useState<RequirementItem | null>(null);

  useEffect(() => {
    if (!open || !item) return;

    setQuantity(String(item.quantity));
    setQuantityError('');
    setSubstituteProduct(null);
    setOrderItem({
      productId: item.productId,
      productName: item.productName,
      strength: item.strength,
      quantity: item.quantity,
      prescriptionRequired: item.prescriptionRequired,
      scheduleType: item.scheduleType,
      storageType: item.storageType,
      notes: item.notes,
    });

    const timer = window.setTimeout(() => {
      quantityRef.current?.focus();
      quantityRef.current?.select();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open, item]);

  const handleSubstituteSelect = (product: Product) => {
    if (!item) return;
    setSubstituteProduct(product);
    setOrderItem(toOrderItemFromProduct(product, item.quantity));
  };

  const handleSubstituteClear = () => {
    if (!item) return;
    setSubstituteProduct(null);
    setOrderItem({
      productId: item.productId,
      productName: item.productName,
      strength: item.strength,
      quantity: item.quantity,
      prescriptionRequired: item.prescriptionRequired,
      scheduleType: item.scheduleType,
      storageType: item.storageType,
      notes: item.notes,
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!item || !orderItem) return;

    const parsedQuantity = parseInt(quantity, 10);
    if (!quantity.trim() || Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setQuantityError('Enter a valid quantity');
      return;
    }

    onConfirm({
      sourceLineId: item.lineId,
      orderItem: { ...orderItem, quantity: parsedQuantity },
      quantity: parsedQuantity,
    });
  };

  if (!item || !orderItem) return null;

  const isSubstituted = substituteProduct !== null;

  return (
    <Modal open={open} onClose={onClose} title="Add to Order" size="md">
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-brand-border bg-gray-50/80 p-3 text-sm">
          <p className="text-brand-text-secondary text-xs uppercase tracking-wide mb-1">Requested in requirement</p>
          <p className="font-medium">{item.productName}</p>
          <p className="text-brand-text-secondary">{item.strength}</p>
          <ProductComplianceNotes item={item} className="mt-2" compact />
        </div>

        <SubstituteProductPicker
          ref={substitutePickerRef}
          productId={item.productId}
          productName={item.productName}
          strength={item.strength}
          selected={substituteProduct}
          onSelect={handleSubstituteSelect}
          onClear={handleSubstituteClear}
        />

        <div className="rounded-lg border border-brand-border p-3 text-sm">
          <p className="text-brand-text-secondary text-xs uppercase tracking-wide mb-1">
            {isSubstituted ? 'Adding substitute to order' : 'Adding to order'}
          </p>
          <p className="font-medium">{orderItem.productName}</p>
          <p className="text-brand-text-secondary">{orderItem.strength}</p>
          <ProductComplianceNotes item={orderItem} className="mt-2" compact />
        </div>

        <div>
          <label className={labelClass} htmlFor="add-order-quantity">Quantity to add</label>
          <input
            id="add-order-quantity"
            ref={quantityRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            className={quantityError ? inputErrorClass : inputClass}
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value.replace(/[^\d]/g, ''));
              setQuantityError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
                return;
              }
              if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
                e.preventDefault();
                substitutePickerRef.current?.focusSearch(e.key);
              }
            }}
          />
          {quantityError && <p className="text-xs text-red-600 mt-1">{quantityError}</p>}
          <p className="text-xs text-brand-text-secondary mt-1">Press Enter to add</p>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-brand-border">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Add to Order</Button>
        </div>
      </form>
    </Modal>
  );
}
