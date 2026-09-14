import type { Customer, CustomerAddress } from '@/types';

/** Kochi-area coordinates for demo map pins */
const LOCATIONS: Record<string, { lat: number; lng: number; city: string }> = {
  'MG Road': { lat: 9.9658, lng: 76.2784, city: 'Kochi' },
  'Panampilly Nagar': { lat: 9.9674, lng: 76.2991, city: 'Kochi' },
  Kaloor: { lat: 9.9944, lng: 76.2875, city: 'Kochi' },
  'Marine Drive': { lat: 9.9312, lng: 76.2673, city: 'Kochi' },
  Edapally: { lat: 10.0261, lng: 76.3086, city: 'Kochi' },
  Kakkanad: { lat: 10.0159, lng: 76.3419, city: 'Kochi' },
  Aluva: { lat: 10.1073, lng: 76.3516, city: 'Aluva' },
  'Fort Kochi': { lat: 9.9656, lng: 76.2424, city: 'Kochi' },
  Tripunithura: { lat: 9.9511, lng: 76.3388, city: 'Kochi' },
  Palarivattom: { lat: 10.0074, lng: 76.3028, city: 'Kochi' },
  Vyttila: { lat: 9.9667, lng: 76.3189, city: 'Kochi' },
  Thrikkakara: { lat: 10.0322, lng: 76.3285, city: 'Kochi' },
  Kadavanthra: { lat: 9.9678, lng: 76.2995, city: 'Kochi' },
  Chittoor: { lat: 9.9789, lng: 76.2845, city: 'Kochi' },
  Elamakkara: { lat: 10.0189, lng: 76.3123, city: 'Kochi' },
  Thammanam: { lat: 9.9912, lng: 76.3012, city: 'Kochi' },
  Kalamassery: { lat: 10.0536, lng: 76.3187, city: 'Kochi' },
  Mattancherry: { lat: 9.9569, lng: 76.2558, city: 'Kochi' },
};

function loc(area: string) {
  return LOCATIONS[area] ?? { lat: 9.9312, lng: 76.2673, city: 'Kochi' };
}

function addr(
  label: string,
  addressLine: string,
  area: string,
  isPrimary: boolean,
  extra?: Partial<CustomerAddress> & { id?: string },
): CustomerAddress {
  const { lat, lng, city } = loc(area);
  const { id, ...rest } = extra ?? {};
  return {
    id: id ?? `ADDR-${Math.random().toString(36).slice(2, 8)}`,
    label,
    addressLine,
    area,
    city,
    lat,
    lng,
    isPrimary,
    ...rest,
  };
}

type CustomerSeed = Omit<Customer, 'addresses' | 'id'> & {
  id: string;
  extraAddresses?: CustomerAddress[];
};

function buildCustomer(seed: CustomerSeed): Customer {
  const primary = addr('Home', seed.address, seed.area, true, { id: `ADDR-${seed.id}-1`, pincode: '682001' });
  const addresses = [primary, ...(seed.extraAddresses ?? [])];
  return {
    ...seed,
    addresses,
    address: primary.addressLine,
    area: primary.area,
  };
}

const seeds: CustomerSeed[] = [
  { id: 'CUS-001', name: 'Ravi Menon', phone: '+91 98470 12345', alternatePhone: '+91 98470 12346', email: 'ravi.m@email.com', address: '12 MG Road, Kochi', area: 'MG Road', preferredContact: 'Phone', totalOrders: 8, lastOrderDate: '2026-08-10', notes: 'Regular diabetic patient', createdAt: '2025-03-15', extraAddresses: [addr('Office', 'Block C, Infopark Phase 1', 'Kakkanad', false, { id: 'ADDR-C01-2', pincode: '682030' })] },
  { id: 'CUS-002', name: 'Lakshmi Nair', phone: '+91 98950 23456', email: 'lakshmi.n@email.com', address: '45 Panampilly Nagar', area: 'Panampilly Nagar', preferredContact: 'WhatsApp', totalOrders: 15, lastOrderDate: '2026-08-12', createdAt: '2024-11-02' },
  { id: 'CUS-003', name: 'Mohammed Farhan', phone: '+91 97460 34567', address: '78 Kaloor Road', area: 'Kaloor', preferredContact: 'Phone', totalOrders: 3, lastOrderDate: '2026-08-05', createdAt: '2026-06-20' },
  { id: 'CUS-004', name: 'Sneha Krishnan', phone: '+91 98470 45678', email: 'sneha.k@email.com', address: '23 Marine Drive', area: 'Marine Drive', preferredContact: 'WhatsApp', totalOrders: 22, lastOrderDate: '2026-08-13', notes: 'VIP customer', createdAt: '2023-08-10', extraAddresses: [addr('Parents Home', '14 Hill Palace Road', 'Tripunithura', false, { id: 'ADDR-C04-2' })] },
  { id: 'CUS-005', name: 'Thomas George', phone: '+91 98950 56789', address: '56 Edapally Junction', area: 'Edapally', preferredContact: 'Phone', totalOrders: 5, lastOrderDate: '2026-08-08', createdAt: '2025-01-22' },
  { id: 'CUS-006', name: 'Anjali Pillai', phone: '+91 97460 67890', email: 'anjali.p@email.com', address: '34 Kakkanad Info Park Road', area: 'Kakkanad', preferredContact: 'Email', totalOrders: 11, lastOrderDate: '2026-08-11', createdAt: '2024-05-18' },
  { id: 'CUS-007', name: 'Vinod Kumar', phone: '+91 98470 78901', address: '89 Aluva Bypass', area: 'Aluva', preferredContact: 'Phone', totalOrders: 2, lastOrderDate: '2026-08-01', createdAt: '2026-07-01' },
  { id: 'CUS-008', name: 'Meera Das', phone: '+91 98950 89012', alternatePhone: '+91 98950 89013', address: '17 Fort Kochi Beach Road', area: 'Fort Kochi', preferredContact: 'WhatsApp', totalOrders: 7, lastOrderDate: '2026-08-09', createdAt: '2024-09-03' },
  { id: 'CUS-009', name: 'Arjun Namboothiri', phone: '+91 97460 90123', address: '62 Tripunithura', area: 'Tripunithura', preferredContact: 'Phone', totalOrders: 4, lastOrderDate: '2026-08-07', createdAt: '2025-06-14' },
  { id: 'CUS-010', name: 'Deepa Rajan', phone: '+91 98470 01234', email: 'deepa.r@email.com', address: '41 Palarivattom', area: 'Palarivattom', preferredContact: 'WhatsApp', totalOrders: 18, lastOrderDate: '2026-08-14', createdAt: '2023-12-01', extraAddresses: [addr('Delivery Point', 'Near Lulu Mall Gate 2', 'Edapally', false, { id: 'ADDR-C10-2', landmark: 'Opposite Metro Pillar 12' })] },
  { id: 'CUS-011', name: 'Sanjay Varma', phone: '+91 98950 11234', address: '28 Vyttila Junction', area: 'Vyttila', preferredContact: 'Phone', totalOrders: 6, lastOrderDate: '2026-08-06', createdAt: '2025-02-28' },
  { id: 'CUS-012', name: 'Kavitha Mohan', phone: '+91 97460 22345', address: '91 Thrikkakara', area: 'Thrikkakara', preferredContact: 'SMS', totalOrders: 9, lastOrderDate: '2026-08-12', createdAt: '2024-07-19' },
  { id: 'CUS-013', name: 'Biju Antony', phone: '+91 98470 33456', address: '15 Kadavanthra', area: 'Kadavanthra', preferredContact: 'Phone', totalOrders: 1, lastOrderDate: '2026-08-03', createdAt: '2026-08-01' },
  { id: 'CUS-014', name: 'Reena Mathew', phone: '+91 98950 44567', email: 'reena.m@email.com', address: '73 Chittoor Road', area: 'Chittoor', preferredContact: 'WhatsApp', totalOrders: 13, lastOrderDate: '2026-08-11', createdAt: '2024-02-14' },
  { id: 'CUS-015', name: 'Gopal Iyer', phone: '+91 97460 55678', address: '52 Elamakkara', area: 'Elamakkara', preferredContact: 'Phone', totalOrders: 10, lastOrderDate: '2026-08-10', createdAt: '2024-04-07' },
  { id: 'CUS-016', name: 'Nisha Babu', phone: '+91 98470 66789', address: '38 Thammanam', area: 'Thammanam', preferredContact: 'WhatsApp', totalOrders: 0, createdAt: '2026-08-14' },
  { id: 'CUS-017', name: 'Harish Pillai', phone: '+91 98950 77890', address: '64 Kalamassery', area: 'Kalamassery', preferredContact: 'Phone', totalOrders: 3, lastOrderDate: '2026-08-04', createdAt: '2025-09-11' },
  { id: 'CUS-018', name: 'Shalini Varghese', phone: '+91 97460 88901', email: 'shalini.v@email.com', address: '27 Mattancherry', area: 'Mattancherry', preferredContact: 'Email', totalOrders: 5, lastOrderDate: '2026-08-08', createdAt: '2025-04-25' },
];

export const customers: Customer[] = seeds.map(buildCustomer);

export function getPrimaryAddress(customer: Customer): CustomerAddress {
  return customer.addresses.find((a) => a.isPrimary) ?? customer.addresses[0];
}

export function formatAddressOption(a: CustomerAddress): string {
  return [a.label, a.addressLine, a.area, a.city].filter(Boolean).join(', ');
}
