import type { EnquiryDepartment } from '@/types';

export const ENQUIRY_DEPARTMENTS: EnquiryDepartment[] = [
  'Surgicals',
  'FMCG',
  'Pharmacy',
  'HR',
  'Purchase',
  'Admin',
];

export const ENQUIRY_QUERIES: Record<EnquiryDepartment, string[]> = {
  Surgicals: [
    'Surgical supply availability',
    'Medical equipment enquiry',
    'Dressing & bandage stock',
    'Bulk surgical order',
    'Product specification query',
    'Other',
  ],
  FMCG: [
    'Personal care product availability',
    'Baby care products',
    'Household essentials',
    'Brand recommendation',
    'Bulk FMCG order',
    'Other',
  ],
  Pharmacy: [
    'Medicine availability check',
    'Prescription refill',
    'Generic substitute query',
    'Dosage & usage query',
    'Notify when in stock',
    'Other',
  ],
  HR: [
    'Job application enquiry',
    'Leave & attendance query',
    'Staff scheduling',
    'Training request',
    'HR policy query',
    'Other',
  ],
  Purchase: [
    'Vendor registration',
    'Purchase order status',
    'Stock replenishment request',
    'Price quotation request',
    'Supplier follow-up',
    'Other',
  ],
  Admin: [
    'Store timings',
    'Branch location & directions',
    'Billing & payment query',
    'Complaint or feedback',
    'General information',
    'Other',
  ],
};
