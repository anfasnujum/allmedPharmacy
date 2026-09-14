import type { Product } from '@/types';
import { getProductById, getProductCatalog, searchProducts } from '@/services/productCatalog';

export function findSubstituteProducts(productId?: string, productName?: string): Product[] {
  const current = productId ? getProductById(productId) : undefined;
  const generic = current?.genericName?.trim().toLowerCase();

  if (generic && generic.length >= 2) {
    return getProductCatalog()
      .filter((p) => p.genericName?.trim().toLowerCase() === generic && p.id !== productId)
      .slice(0, 50);
  }

  return searchProducts(productName ?? '', 25).filter((p) => p.id !== productId);
}

function normalizeStrength(value?: string): string {
  return value?.toLowerCase().replace(/\s/g, '') ?? '';
}

/** Mock AI substitute — ranks same-generic alternatives by stock, strength match, and price. */
export async function suggestAiSubstitute(
  productId?: string,
  productName?: string,
  strength?: string,
): Promise<Product | null> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const candidates = findSubstituteProducts(productId, productName);
  if (candidates.length === 0) return null;

  const current = productId ? getProductById(productId) : undefined;
  const targetStrength = normalizeStrength(strength ?? current?.strength);

  const ranked = [...candidates].sort((a, b) => scoreSubstitute(b, targetStrength, current) - scoreSubstitute(a, targetStrength, current));
  return ranked[0] ?? null;
}

function scoreSubstitute(candidate: Product, targetStrength: string, current?: Product): number {
  let score = 0;
  if (candidate.stockStatus === 'In Stock') score += 12;
  if (candidate.stockStatus === 'Low Stock') score += 6;
  if (normalizeStrength(candidate.strength) === targetStrength) score += 10;
  if (current && candidate.prescriptionRequired === current.prescriptionRequired) score += 3;
  if (current?.form && candidate.form === current.form) score += 2;
  score -= candidate.unitPrice / 500;
  return score;
}

export function formatSubstituteLabel(product: Product): string {
  const parts = [product.name, product.strength, product.brand].filter(Boolean);
  return parts.join(' · ');
}
