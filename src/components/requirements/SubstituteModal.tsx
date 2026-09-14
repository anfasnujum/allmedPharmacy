import { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useProducts } from '@/store/DataContext';
import { loadProductCatalog } from '@/services/productCatalog';
import { formatSubstituteLabel, suggestAiSubstitute } from '@/utils/substitutes';
import { formatCurrency } from '@/utils/format';
import { ProductComplianceNotes } from '@/components/products/ProductComplianceNotes';
import { getPrescriptionMessage, getRefrigerationMessage, resolveProductCompliance } from '@/utils/productCompliance';
import { cn } from '@/utils/cn';
import type { OrderItem, Product } from '@/types';

interface SubstituteModalProps {
  open: boolean;
  item: OrderItem | null;
  onClose: () => void;
  onConfirm: (substituteProductId: string) => void;
}

export function SubstituteModal({ open, item, onClose, onConfirm }: SubstituteModalProps) {
  const { searchProducts, productsLoading } = useProducts();
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<Product | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !item) return;

    setQuery('');
    setSelected(null);
    setShowResults(false);
    setAiSuggestion(null);
    setLoading(true);
    setAiLoading(true);

    loadProductCatalog()
      .catch(() => undefined)
      .finally(() => setLoading(false));

    suggestAiSubstitute(item.productId, item.productName, item.strength)
      .then(setAiSuggestion)
      .finally(() => setAiLoading(false));
  }, [open, item?.productId, item?.productName, item?.strength]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const searchResults = useMemo(() => {
    if (!item || query.trim().length < 2) return [];
    return searchProducts(query, 12).filter((p) => p.id !== item.productId);
  }, [item, query, searchProducts]);

  const selectProduct = (product: Product) => {
    setSelected(product);
    setQuery(formatSubstituteLabel(product));
    setShowResults(false);
  };

  if (!item) return null;

  const currentCompliance = resolveProductCompliance(item);
  const rxMessage = getPrescriptionMessage(currentCompliance);
  const refrigerationMessage = getRefrigerationMessage(currentCompliance.storageType);

  return (
    <Modal open={open} onClose={onClose} title="Choose Substitute" size="md">
      <div className="space-y-4">
        <div className="rounded-lg border border-brand-border bg-gray-50/80 p-3 text-sm">
          <p className="text-brand-text-secondary text-xs uppercase tracking-wide mb-1">Current medicine</p>
          <p className="font-medium">{item.productName}</p>
          <p className="text-brand-text-secondary">{item.strength} · Qty {item.quantity}</p>
          {(rxMessage || refrigerationMessage) && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {rxMessage && (
                <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800">
                  {rxMessage}
                </span>
              )}
              {refrigerationMessage && (
                <span className="inline-flex rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-medium text-sky-800">
                  {refrigerationMessage}
                </span>
              )}
            </div>
          )}
        </div>

        <div ref={containerRef}>
          <label className="block text-sm font-medium text-brand-text mb-1.5">Search substitute</label>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
              setShowResults(true);
            }}
            onFocus={() => query.trim().length >= 2 && setShowResults(true)}
            placeholder="Type medicine name, brand, or code…"
            className="w-full text-sm border border-brand-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
          {productsLoading && query.trim().length >= 2 && (
            <p className="text-xs text-brand-text-secondary mt-1.5">Loading product catalog…</p>
          )}
          {showResults && query.trim().length >= 2 && !productsLoading && (
            <div className="mt-1 bg-white border border-brand-border rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
              {searchResults.length === 0 ? (
                <p className="px-3 py-2.5 text-sm text-brand-text-secondary">No products found</p>
              ) : (
                searchResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={cn(
                      'w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 border-b border-brand-border last:border-0',
                      selected?.id === p.id && 'bg-brand-primary/5',
                    )}
                    onClick={() => selectProduct(p)}
                  >
                    <div>
                      <span className="font-medium">{p.name}</span>
                      <span className="text-brand-text-secondary ml-2">
                        {p.strength}{p.brand ? ` — ${p.brand}` : ''} · {formatCurrency(p.unitPrice)}
                      </span>
                      <ProductComplianceNotes item={p} className="mt-1.5" compact />
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
          {selected && (
            <div className="mt-2">
              <p className="text-xs text-emerald-700">
                Selected: {formatSubstituteLabel(selected)} · {formatCurrency(selected.unitPrice)}
              </p>
              <ProductComplianceNotes item={selected} className="mt-1.5" compact />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={14} className="text-brand-primary" />
            <p className="text-sm font-medium text-brand-text">AI suggestion</p>
          </div>
          {aiLoading ? (
            <div className="rounded-lg border border-dashed border-brand-border px-4 py-3 text-sm text-brand-text-secondary">
              Finding a suitable substitute…
            </div>
          ) : aiSuggestion ? (
            <button
              type="button"
              onClick={() => selectProduct(aiSuggestion)}
              className={cn(
                'w-full text-left rounded-lg border px-4 py-3 transition-colors',
                selected?.id === aiSuggestion.id
                  ? 'border-brand-primary bg-brand-primary/5'
                  : 'border-brand-border hover:border-brand-primary/50 hover:bg-brand-primary/5',
              )}
            >
              <p className="font-medium text-sm">{aiSuggestion.name}</p>
              <p className="text-xs text-brand-text-secondary mt-0.5">
                {aiSuggestion.strength}
                {aiSuggestion.brand ? ` · ${aiSuggestion.brand}` : ''}
                {' · '}{formatCurrency(aiSuggestion.unitPrice)}
                {aiSuggestion.stockStatus === 'In Stock' ? ' · In stock' : ''}
              </p>
              <ProductComplianceNotes item={aiSuggestion} className="mt-2" compact />
              <p className="text-[11px] text-brand-primary mt-1.5">Click to use this substitute</p>
            </button>
          ) : (
            <div className="rounded-lg border border-dashed border-brand-border px-4 py-3 text-sm text-brand-text-secondary">
              No AI substitute available for this medicine.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-brand-border">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!selected || loading}
            onClick={() => selected && onConfirm(selected.id)}
          >
            Replace item
          </Button>
        </div>
      </div>
    </Modal>
  );
}
