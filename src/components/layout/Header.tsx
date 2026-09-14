import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useData } from '@/store/DataContext';
import { useBranch } from '@/store/BranchContext';
import { BranchSelector } from '@/components/layout/BranchSelector';
import type { SearchResult } from '@/types';

export function Header() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { globalSearch } = useData();
  const { activeBranchId } = useBranch();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length >= 2) {
      setResults(globalSearch(query, activeBranchId));
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query, globalSearch, activeBranchId]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const typeLabels: Record<SearchResult['type'], string> = {
    customer: 'Customer',
    requirement: 'Requirement',
    order: 'Order',
    product: 'Product',
    enquiry: 'Enquiry',
  };

  return (
    <header className="h-14 bg-white border-b border-brand-border flex items-center gap-3 px-4 shrink-0">
      <BranchSelector />
      <div ref={ref} className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder="Search customers, orders, requirements, products..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-brand-border rounded-[var(--radius-brand)] bg-brand-background focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
        />
        {showResults && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-brand-border rounded-[var(--radius-brand)] shadow-lg z-50 max-h-72 overflow-y-auto">
            {results.map((r) => (
              <button
                key={`${r.type}-${r.id}`}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 border-b border-brand-border last:border-0"
                onClick={() => {
                  navigate(r.path);
                  setQuery('');
                  setShowResults(false);
                }}
              >
                <span className="text-[10px] uppercase font-semibold text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded">
                  {typeLabels[r.type]}
                </span>
                <div>
                  <p className="text-sm font-medium text-brand-text">{r.title}</p>
                  <p className="text-xs text-brand-text-secondary">{r.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {showResults && query.length >= 2 && results.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-brand-border rounded-[var(--radius-brand)] shadow-lg z-50 p-4 text-sm text-brand-text-secondary text-center">
            No results found
          </div>
        )}
      </div>

      <button
        className="relative shrink-0 p-2.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        <span className="absolute top-2 right-2 w-2 h-2 bg-brand-primary rounded-full" />
      </button>
    </header>
  );
}
