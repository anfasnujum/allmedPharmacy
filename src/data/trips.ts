import type { Trip } from '@/types';

function ts(date: string, time: string): string {
  return new Date(`${date}T${time}`).toISOString();
}

export const trips: Trip[] = [
  {
    id: 'TRP-601',
    branchId: 'BR-001',
    deliveryPersonId: 'ST-004',
    status: 'Scheduled',
    createdAt: ts('2026-08-14', '09:00:00'),
    stops: [
      {
        orderId: 'ORD-10273',
        customerId: 'CUS-001',
        customerName: 'Ravi Menon',
        customerPhone: '+91 98470 12345',
        address: '12 MG Road, Kochi, MG Road',
        addressLine: '12 MG Road, Kochi',
        area: 'MG Road',
        lat: 9.9674,
        lng: 76.2458,
        billValue: 320,
        amountToCollect: 320,
        prescriptionRequired: true,
        hasFridgeItem: false,
        completed: false,
      },
    ],
    timeline: [
      { id: 't1', timestamp: ts('2026-08-14', '09:00:00'), description: 'Trip created with 1 order', actor: 'ST-001' },
    ],
  },
];
