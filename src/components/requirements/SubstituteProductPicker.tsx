import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useProducts } from '@/store/DataContext';
import { loadProductCatalog } from '@/services/productCatalog';
import { formatSubstituteLabel, suggestAiSubstitute } from '@/utils/substitutes';
import { formatCurrency } from '@/utils/format';
import { ProductComplianceNotes } from '@/components/products/ProductComplianceNotes';
import { cn } from '@/utils/cn';
import type { Product } from '@/types';

interface SubstituteProductPickerProps {
  productId?: string;
  productName: string;
  strength: string;
  selected: Product | null;
  onSelect: (product: Product) => void;
  onClear?: () => void;
}

export interface SubstituteProductPickerHandle {
  focusSearch: (initialChar?: string) => void;
}

export const SubstituteProductPicker = forwardRef<SubstituteProductPickerHandle, SubstituteProductPickerProps>(
  function SubstituteProductPicker(
    { productId, productName, strength, selected, onSelect, onClear },
    ref,
  ) {
  const { searchProducts, productsLoading } = useProducts();
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<Product | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focusSearch(initialChar?: string) {
      if (initialChar) {
        setQuery(initialChar);
        setShowResults(true);
      }
      searchInputRef.current?.focus();
      if (initialChar) {
        requestAnimationFrame(() => {
          const el = searchInputRef.current;
          if (el) el.setSelectionRange(el.value.length, el.value.length);
        });
      }
    },
  }));

  useEffect(() => {
    setQuery('');
    setShowResults(false);
    setLoading(true);
    setAiLoading(true);
    loadProductCatalog()
      .catch(() => undefined)
      .finally(() => setLoading(false));

    suggestAiSubstitute(productId, productName, strength)
      .then(setAiSuggestion)
      .finally(() => setAiLoading(false));
  }, [productId, productName, strength]);

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
    if (query.trim().length < 2) return [];
    return searchProducts(query, 12).filter((p) => p.id !== productId);
  }, [query, searchProducts, productId]);

  const pickProduct = (product: Product) => {
    onSelect(product);
    setQuery(formatSubstituteLabel(product));
    setShowResults(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-brand-text">Substitute medicine</p>
        {selected && onClear && (
          <button
            type="button"
            onClick={() => {
              onClear();
              setQuery('');
            }}
            className="text-xs text-brand-primary hover:underline"
          >
            Use original
          </button>
        )}
      </div>

      <div ref={containerRef}>
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => query.trim().length >= 2 && setShowResults(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
          placeholder="Search substitute by name, brand, or code…"
          className="w-full text-sm border border-brand-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        />
        {productsLoading && query.trim().length >= 2 && (
          <p className="text-xs text-brand-text-secondary mt-1.5">Loading product catalog…</p>
        )}
        {showResults && query.trim().length >= 2 && !productsLoading && (
          <div className="mt-1 bg-white border border-brand-border rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
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
                  onClick={() => pickProduct(p)}
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-brand-text-secondary ml-2">
                    {p.strength}{p.brand ? ` — ${p.brand}` : ''} · {formatCurrency(p.unitPrice)}
                  </span>
                  <ProductComplianceNotes item={p} className="mt-1.5" compact />
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={14} className="text-brand-primary" />
          <p className="text-xs font-medium text-brand-text-secondary">AI suggestion</p>
        </div>
        {aiLoading ? (
          <div className="rounded-lg border border-dashed border-brand-border px-3 py-2 text-xs text-brand-text-secondary">
            Finding a suitable substitute…
          </div>
        ) : aiSuggestion ? (
          <button
            type="button"
            onClick={() => pickProduct(aiSuggestion)}
            className={cn(
              'w-full text-left rounded-lg border px-3 py-2 transition-colors text-sm',
              selected?.id === aiSuggestion.id
                ? 'border-brand-primary bg-brand-primary/5'
                : 'border-brand-border hover:border-brand-primary/50 hover:bg-brand-primary/5',
            )}
          >
            <p className="font-medium">{aiSuggestion.name}</p>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              {aiSuggestion.strength}
              {aiSuggestion.brand ? ` · ${aiSuggestion.brand}` : ''}
              {' · '}{formatCurrency(aiSuggestion.unitPrice)}
            </p>
            <ProductComplianceNotes item={aiSuggestion} className="mt-1.5" compact />
          </button>
        ) : (
          <div className="rounded-lg border border-dashed border-brand-border px-3 py-2 text-xs text-brand-text-secondary">
            No AI substitute available.
          </div>
        )}
      </div>

      {selected && (
        <p className="text-xs text-emerald-700">
          Substitute selected: {formatSubstituteLabel(selected)} · {formatCurrency(selected.unitPrice)}
        </p>
      )}

      {loading && <p className="text-xs text-brand-text-secondary">Loading substitutes…</p>}
    </div>
  );
  },
);
