import type { Product, RequirementItem, OrderItem } from '@/types';
import { getProductById } from '@/services/productCatalog';

export interface ProductComplianceInfo {
  prescriptionRequired: boolean;
  scheduleType?: string;
  storageType?: string;
}

export type ComplianceLineItem = Pick<
  RequirementItem,
  'productId' | 'prescriptionRequired' | 'scheduleType' | 'storageType'
>;

export function resolveProductCompliance(item: ComplianceLineItem | Product): ProductComplianceInfo {
  if ('name' in item && !('productName' in item)) {
    return complianceFromProduct(item);
  }
  const lineItem = item as ComplianceLineItem;
  const product = lineItem.productId ? getProductById(lineItem.productId) : undefined;
  return {
    prescriptionRequired: product?.prescriptionRequired ?? lineItem.prescriptionRequired ?? false,
    scheduleType: product?.scheduleType ?? lineItem.scheduleType,
    storageType: product?.storageType ?? lineItem.storageType,
  };
}

export function complianceFromProduct(product: Product): ProductComplianceInfo {
  return {
    prescriptionRequired: product.prescriptionRequired,
    scheduleType: product.scheduleType,
    storageType: product.storageType,
  };
}

export function requiresRefrigeration(storageType?: string): boolean {
  if (!storageType) return false;
  const normalized = storageType.trim().toLowerCase();
  return normalized === 'fridge' || normalized.includes('refrig') || normalized.includes('cold chain');
}

export function getPrescriptionMessage(info: ProductComplianceInfo): string | null {
  if (!info.prescriptionRequired) return null;
  if (info.scheduleType && !['Others', 'OTC', 'General', 'G'].includes(info.scheduleType)) {
    return `Prescription required (Schedule ${info.scheduleType})`;
  }
  return 'Prescription required';
}

export function getRefrigerationMessage(storageType?: string): string | null {
  if (!requiresRefrigeration(storageType)) return null;
  return 'Requires refrigeration';
}

export function getProductComplianceMessages(item: ComplianceLineItem | OrderItem | Product): string[] {
  const info = resolveProductCompliance(item);
  return [getPrescriptionMessage(info), getRefrigerationMessage(info.storageType)].filter(
    (msg): msg is string => Boolean(msg),
  );
}

export function productSelectionFields(product: Product): Pick<
  RequirementItem,
  'prescriptionRequired' | 'scheduleType' | 'storageType'
> {
  const info = complianceFromProduct(product);
  return {
    prescriptionRequired: info.prescriptionRequired,
    scheduleType: info.scheduleType,
    storageType: info.storageType,
  };
}
