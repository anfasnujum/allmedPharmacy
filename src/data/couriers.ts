export const COURIER_CARRIERS = [
  'India Post',
  'BlueDart',
  'Delhivery',
  'DTDC',
  'FedEx',
  'Ekart',
  'Professional Couriers',
] as const;

export type CourierCarrier = (typeof COURIER_CARRIERS)[number];
