import type { Product } from '@/types';

let catalog: Product[] = [];
let searchIndex: string[] = [];
let loaded = false;
let loadPromise: Promise<Product[]> | null = null;

function buildSearchText(product: Product): string {
  return [
    product.name,
    product.fullName,
    product.genericName,
    product.brand,
    product.manfName,
    product.brandName,
    product.code,
    product.sku,
    product.ean,
    product.shortName,
    product.form,
    product.strength,
    product.packing,
    product.category,
    product.category2,
    product.manfCode,
    product.genericCode,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export async function loadProductCatalog(): Promise<Product[]> {
  if (loaded) return catalog;
  if (loadPromise) return loadPromise;

  loadPromise = fetch('/data/products.json')
    .then((res) => {
      if (!res.ok) throw new Error('Failed to load product catalog');
      return res.json() as Promise<Product[]>;
    })
    .then((products) => {
      catalog = products.map((p) => ({
        ...p,
        genericName: p.genericName ?? '',
        strength: p.strength ?? '',
        unitPrice: p.unitPrice ?? p.mrp ?? 0,
      }));
      searchIndex = catalog.map(buildSearchText);
      loaded = true;
      return catalog;
    })
    .catch((err) => {
      loadPromise = null;
      throw err;
    });

  return loadPromise;
}

export function isProductCatalogLoaded(): boolean {
  return loaded;
}

export function getProductCatalog(): Product[] {
  return catalog;
}

export function getProductById(id: string): Product | undefined {
  return catalog.find((p) => p.id === id || p.code === id || p.sku === id);
}

export function searchProducts(query: string, limit = 10, source?: Product[]): Product[] {
  const list = source && source.length > 0 ? source : catalog;
  const q = query.toLowerCase().trim();
  if (!q || list.length === 0) return [];

  const useModuleIndex = list === catalog && searchIndex.length === catalog.length;
  const textAt = (i: number) => (useModuleIndex ? searchIndex[i] : buildSearchText(list[i]));

  const exact = list.find(
    (p) =>
      p.code?.toLowerCase() === q ||
      p.sku?.toLowerCase() === q ||
      p.id?.toLowerCase() === q,
  );

  const results: Product[] = exact ? [exact] : [];
  const seen = new Set(results.map((p) => p.id));

  for (let i = 0; i < list.length && results.length < limit; i++) {
    if (textAt(i).includes(q) && !seen.has(list[i].id)) {
      results.push(list[i]);
      seen.add(list[i].id);
    }
  }
  return results;
}
