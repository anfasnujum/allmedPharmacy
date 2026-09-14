import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useProducts } from '@/store/DataContext';
import { getProductById } from '@/services/productCatalog';
import { productSelectionFields } from '@/utils/productCompliance';
import { ProductComplianceNotes } from '@/components/products/ProductComplianceNotes';
import type { Requirement, RequirementItem } from '@/types';

interface AddItemsToRequirementModalProps {
  open: boolean;
  requirement: Requirement;
  onClose: () => void;
  onConfirm: (items: RequirementItem[]) => void;
}

const emptyItem = (): RequirementItem => ({
  productName: '',
  strength: '',
  quantity: 1,
  prescriptionRequired: false,
  notes: '',
});

const labelClass = 'block text-sm font-medium text-brand-text mb-1';
const inputClass =
  'w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary';

export function AddItemsToRequirementModal({
  open,
  requirement,
  onClose,
  onConfirm,
}: AddItemsToRequirementModalProps) {
  const { searchProducts, productsLoading } = useProducts();
  const [items, setItems] = useState<RequirementItem[]>([emptyItem()]);
  const [productSearch, setProductSearch] = useState<Record<number, string | undefined>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setItems([emptyItem()]);
    setProductSearch({});
    setErrors({});
  }, [open, requirement.id]);

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setProductSearch((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  };

  const updateItem = (idx: number, updates: Partial<RequirementItem>) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...updates } : item)));
  };

  const selectProduct = (idx: number, productId: string) => {
    const product = getProductById(productId);
    if (!product) return;
    updateItem(idx, {
      productId: product.id,
      productName: product.name,
      strength: product.strength ?? '',
      ...productSelectionFields(product),
    });
    setProductSearch((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  };

  const getProductSuggestions = (idx: number) => {
    const q = productSearch[idx] ?? '';
    if (q.length < 2) return [];
    return searchProducts(q, 8);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    items.forEach((item, idx) => {
      if (!item.productName.trim()) nextErrors[`name-${idx}`] = 'Product name is required';
      if (item.quantity < 1) nextErrors[`qty-${idx}`] = 'Quantity must be at least 1';
    });

    const validItems = items.filter((item) => item.productName.trim() && item.quantity >= 1);
    if (validItems.length === 0) {
      nextErrors.general = 'Add at least one item';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onConfirm(validItems);
  };

  const reopenNotice =
    requirement.status === 'Completed'
      ? 'This requirement was fully ordered. Adding items will reopen it as Partial so you can create another order.'
      : undefined;

  return (
    <Modal open={open} onClose={onClose} title="Add Items to Requirement" size="lg">
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        {reopenNotice && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {reopenNotice}
          </p>
        )}

        {errors.general && <p className="text-xs text-red-600">{errors.general}</p>}

        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
          {items.map((item, idx) => (
            <div key={idx} className="border border-brand-border rounded-lg p-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2 relative">
                  <label className={labelClass}>Product / Medicine</label>
                  <input
                    className={inputClass}
                    value={productSearch[idx] !== undefined ? productSearch[idx] : item.productName}
                    onChange={(e) => {
                      setProductSearch({ ...productSearch, [idx]: e.target.value });
                      updateItem(idx, {
                        productName: e.target.value,
                        productId: undefined,
                        scheduleType: undefined,
                        storageType: undefined,
                        prescriptionRequired: false,
                      });
                    }}
                    placeholder="Search product..."
                  />
                  {(productSearch[idx] ?? '').length >= 2 && getProductSuggestions(idx).length > 0 && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-brand-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {getProductSuggestions(idx).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b last:border-0"
                          onClick={() => selectProduct(idx, p.id)}
                        >
                          <span className="font-medium">{p.name}</span>
                          <span className="text-brand-text-secondary ml-2">
                            {p.strength}
                            {p.brand ? ` — ${p.brand}` : ''}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {productsLoading && (productSearch[idx] ?? '').length >= 2 && (
                    <p className="text-xs text-brand-text-secondary mt-1">Loading product catalog...</p>
                  )}
                  {errors[`name-${idx}`] && (
                    <p className="text-xs text-red-600 mt-1">{errors[`name-${idx}`]}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Strength</label>
                  <input
                    className={inputClass}
                    value={item.strength ?? ''}
                    onChange={(e) => updateItem(idx, { strength: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Quantity</label>
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, { quantity: parseInt(e.target.value, 10) || 0 })}
                  />
                  {errors[`qty-${idx}`] && (
                    <p className="text-xs text-red-600 mt-1">{errors[`qty-${idx}`]}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-4 mt-2">
                <div className="flex-1">
                  <label className={labelClass}>Notes (optional)</label>
                  <input
                    className={inputClass}
                    value={item.notes ?? ''}
                    onChange={(e) => updateItem(idx, { notes: e.target.value })}
                    placeholder="e.g. substitute ok, specific brand…"
                  />
                </div>
                <ProductComplianceNotes item={item} className="shrink-0" />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-brand-primary text-sm flex items-center gap-1 hover:underline shrink-0 mt-6"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus size={14} /> Add Another Item
        </Button>

        <div className="flex justify-end gap-2 pt-2 border-t border-brand-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add Items</Button>
        </div>
      </form>
    </Modal>
  );
}
