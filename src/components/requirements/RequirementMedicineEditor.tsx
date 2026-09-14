import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useProducts } from '@/store/DataContext';
import { getProductCatalog } from '@/services/productCatalog';
import { productSelectionFields } from '@/utils/productCompliance';
import { ProductComplianceNotes } from '@/components/products/ProductComplianceNotes';
import { cn } from '@/utils/cn';
import type { Product, RequirementItem } from '@/types';

interface RequirementMedicineEditorProps {
  items: RequirementItem[];
  onChange: (items: RequirementItem[]) => void;
  error?: string;
}

const inputClass =
  'w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-mono';
const qtyClass =
  'w-20 px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-mono text-center';

function productToItem(product: Product, quantity: number): RequirementItem {
  return {
    productId: product.id,
    productName: product.name,
    strength: product.strength ?? '',
    quantity,
    ...productSelectionFields(product),
  };
}

export function RequirementMedicineEditor({ items, onChange, error }: RequirementMedicineEditorProps) {
  const { searchProducts, productsLoading, products } = useProducts();
  const medicineRef = useRef<HTMLTextAreaElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);

  const [lineText, setLineText] = useState('');
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState('1');
  const [highlightIndex, setHighlightIndex] = useState(0);

  const slashIdx = lineText.lastIndexOf('/');
  const inSlashMode = !pendingProduct && slashIdx >= 0;
  const slashQuery = inSlashMode ? lineText.slice(slashIdx + 1) : '';

  const suggestions = useMemo(() => {
    if (!inSlashMode) return [];
    const catalog = getProductCatalog();
    const source = catalog.length > 0 ? catalog : products;
    if (!slashQuery) return source.slice(0, 8);
    return searchProducts(slashQuery, 8);
  }, [inSlashMode, slashQuery, searchProducts, products]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [suggestions.length, slashQuery]);

  useEffect(() => {
    requestAnimationFrame(() => medicineRef.current?.focus());
  }, []);

  const resetActiveLine = useCallback(() => {
    setLineText('');
    setPendingProduct(null);
    setQty('1');
    setHighlightIndex(0);
    requestAnimationFrame(() => medicineRef.current?.focus());
  }, []);

  const commitRow = useCallback(
    (product: Product, quantity: number) => {
      if (quantity < 1) return;
      onChange([...items, productToItem(product, quantity)]);
      resetActiveLine();
    },
    [items, onChange, resetActiveLine],
  );

  const selectProduct = useCallback((product: Product) => {
    setPendingProduct(product);
    setLineText(product.name);
    setHighlightIndex(0);
    requestAnimationFrame(() => {
      qtyRef.current?.focus();
      qtyRef.current?.select();
    });
  }, []);

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (value: string) => {
    if (pendingProduct) {
      setPendingProduct(null);
    }
    setLineText(value);
  };

  const handleMedicineKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (pendingProduct) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        qtyRef.current?.focus();
        qtyRef.current?.select();
      }
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        qtyRef.current?.focus();
        qtyRef.current?.select();
      }
      return;
    }

    if (inSlashMode && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIndex((i) => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        selectProduct(suggestions[highlightIndex] ?? suggestions[0]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setLineText(lineText.slice(0, slashIdx));
        return;
      }
    }

    if (e.key === 'Escape' && inSlashMode) {
      e.preventDefault();
      setLineText(lineText.slice(0, slashIdx));
    }
  };

  const handleQtyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!pendingProduct) {
        medicineRef.current?.focus();
        return;
      }
      const quantity = parseInt(qty, 10);
      if (!quantity || quantity < 1) return;
      commitRow(pendingProduct, quantity);
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      resetActiveLine();
    }
  };

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <div className="border border-brand-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_72px_32px] gap-0 bg-gray-50/80 border-b border-brand-border px-3 py-2 text-xs font-medium text-brand-text-secondary">
            <span>Medicine</span>
            <span className="text-center">Qty</span>
            <span />
          </div>
          <ul className="divide-y divide-brand-border max-h-48 overflow-y-auto">
            {items.map((item, idx) => (
              <li key={`${item.productId ?? item.productName}-${idx}`} className="px-3 py-2.5 text-sm">
                <div className="grid grid-cols-[1fr_72px_32px] gap-2 items-start">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.productName}</p>
                    {item.strength && (
                      <p className="text-xs text-brand-text-secondary">{item.strength}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <ProductComplianceNotes item={item} compact />
                      {item.notes === 'OCR' && (
                        <span className="text-[10px] bg-brand-cyan/15 text-brand-cyan-dark px-1.5 py-0.5 rounded-full">
                          OCR
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-center font-mono font-medium pt-0.5">{item.quantity}</p>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-1 text-brand-text-secondary hover:text-brand-primary justify-self-end"
                    aria-label="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="relative border border-brand-border rounded-lg bg-white">
        <div className="px-3 py-2 border-b border-brand-border bg-gray-50/60 flex items-center justify-between gap-2 rounded-t-lg">
          <span className="text-xs font-medium text-brand-text-secondary">Medicine pad</span>
          <span className="text-[11px] text-brand-text-secondary">
            <kbd className="px-1 py-0.5 rounded bg-white border border-brand-border font-mono">/</kbd>
            {' '}search · Enter select · Enter qty to add row
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_88px] gap-0 md:divide-x divide-brand-border overflow-visible">
          <div className="relative p-2 overflow-visible">
            <textarea
              ref={medicineRef}
              rows={2}
              className={cn(
                inputClass,
                'resize-none min-h-[56px] border-0 focus:ring-0 rounded-none shadow-none',
                pendingProduct && 'bg-emerald-50/40',
                inSlashMode && 'ring-2 ring-brand-cyan/30',
              )}
              value={lineText}
              onChange={(e) => handleMedicineChange(e.target.value)}
              onKeyDown={handleMedicineKeyDown}
              placeholder="Type / to search medicine by name or product code…"
              spellCheck={false}
            />
            {inSlashMode && (
              <div
                className="absolute z-[100] left-2 right-2 top-full mt-1 bg-white border border-brand-border rounded-lg shadow-xl max-h-52 overflow-y-auto"
              >
                {productsLoading && (
                  <p className="px-3 py-2 text-xs text-brand-text-secondary">Loading catalog…</p>
                )}
                {!productsLoading && suggestions.length === 0 && (
                  <p className="px-3 py-2 text-xs text-brand-text-secondary">
                    {slashQuery ? 'No matches — keep typing' : 'Type name or code after /'}
                  </p>
                )}
                {suggestions.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectProduct(p)}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm border-b last:border-0',
                      idx === highlightIndex ? 'bg-brand-cyan/10' : 'hover:bg-gray-50',
                    )}
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="text-brand-text-secondary ml-2 text-xs">
                      {p.strength}
                      {p.code ? ` · ${p.code}` : ''}
                      {p.brand ? ` · ${p.brand}` : ''}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-2 flex flex-col justify-center items-center bg-gray-50/30">
            <label className="text-[10px] uppercase tracking-wide text-brand-text-secondary mb-1">
              Qty
            </label>
            <input
              ref={qtyRef}
              type="text"
              inputMode="numeric"
              className={qtyClass}
              value={qty}
              disabled={!pendingProduct}
              onChange={(e) => setQty(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyDown={handleQtyKeyDown}
              placeholder="—"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-brand-primary">{error}</p>}
    </div>
  );
}
