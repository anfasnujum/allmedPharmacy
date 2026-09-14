import type { Collection } from '@/types';

function ts(date: string, time: string): string {
  return new Date(`${date}T${time}`).toISOString();
}

export const collections: Collection[] = [
  {
    id: 'COL-301', orderId: 'ORD-10270', customerId: 'CUS-007', customerName: 'Vinod Kumar',
    amountDue: 245, amountCollected: 0, balance: 245, paymentMethod: 'COD',
    dueDate: '2026-08-14', status: 'Pending',
    timeline: [{ id: 't1', timestamp: ts('2026-08-13', '16:00:00'), description: 'Collection pending on delivery', actor: 'ST-002' }],
  },
  {
    id: 'COL-302', orderId: 'ORD-10271', customerId: 'CUS-002', customerName: 'Lakshmi Nair',
    amountDue: 580, amountCollected: 200, balance: 380, paymentMethod: 'UPI',
    dueDate: '2026-08-14', status: 'Partially Collected',
    timeline: [
      { id: 't1', timestamp: ts('2026-08-13', '11:30:00'), description: 'Partial payment of ₹200 via UPI', actor: 'ST-005' },
    ],
  },
  {
    id: 'COL-303', orderId: 'ORD-10279', customerId: 'CUS-012', customerName: 'Kavitha Mohan',
    amountDue: 1350, amountCollected: 0, balance: 1350, paymentMethod: 'COD',
    dueDate: '2026-08-14', status: 'Pending',
    timeline: [{ id: 't1', timestamp: ts('2026-08-13', '14:00:00'), description: 'COD collection on delivery', actor: 'ST-007' }],
  },
  {
    id: 'COL-304', orderId: 'ORD-10277', customerId: 'CUS-014', customerName: 'Reena Mathew',
    amountDue: 148, amountCollected: 0, balance: 148, paymentMethod: 'UPI',
    dueDate: '2026-08-14', status: 'Pending',
    timeline: [{ id: 't1', timestamp: ts('2026-08-14', '08:30:00'), description: 'Awaiting delivery and collection', actor: 'ST-005' }],
  },
  {
    id: 'COL-305', orderId: 'ORD-10276', customerId: 'CUS-008', customerName: 'Meera Das',
    amountDue: 500, amountCollected: 0, balance: 500, paymentMethod: 'COD',
    dueDate: '2026-08-15', status: 'Pending',
    timeline: [{ id: 't1', timestamp: ts('2026-08-13', '18:00:00'), description: 'Collection scheduled', actor: 'ST-005' }],
  },
  {
    id: 'COL-306', orderId: 'ORD-10280', customerId: 'CUS-005', customerName: 'Thomas George',
    amountDue: 230, amountCollected: 0, balance: 230, paymentMethod: 'COD',
    dueDate: '2026-08-14', status: 'Pending',
    timeline: [{ id: 't1', timestamp: ts('2026-08-12', '11:00:00'), description: 'COD on delivery', actor: 'ST-001' }],
  },
  {
    id: 'COL-307', orderId: 'ORD-10273', customerId: 'CUS-001', customerName: 'Ravi Menon',
    amountDue: 320, amountCollected: 0, balance: 320, paymentMethod: 'COD',
    dueDate: '2026-08-14', status: 'Pending',
    timeline: [{ id: 't1', timestamp: ts('2026-08-14', '08:00:00'), description: 'New order — collection pending', actor: 'ST-003' }],
  },
  {
    id: 'COL-308', orderId: 'ORD-10284', customerId: 'CUS-009', customerName: 'Arjun Namboothiri',
    amountDue: 253, amountCollected: 0, balance: 253, paymentMethod: 'COD',
    dueDate: '2026-08-14', status: 'Pending',
    timeline: [{ id: 't1', timestamp: ts('2026-08-14', '11:00:00'), description: 'COD collection pending', actor: 'ST-003' }],
  },
  {
    id: 'COL-309', orderId: 'ORD-10269', customerId: 'CUS-013', customerName: 'Biju Antony',
    amountDue: 125, amountCollected: 0, balance: 125, paymentMethod: 'COD',
    dueDate: '2026-08-10', status: 'Overdue',
    timeline: [
      { id: 't1', timestamp: ts('2026-08-10', '14:30:00'), description: 'Delivery failed — collection overdue', actor: 'ST-004' },
    ],
  },
  {
    id: 'COL-310', orderId: 'ORD-10281', customerId: 'CUS-003', customerName: 'Mohammed Farhan',
    amountDue: 50, amountCollected: 0, balance: 50, paymentMethod: 'Cash',
    dueDate: '2026-08-14', status: 'Pending',
    timeline: [{ id: 't1', timestamp: ts('2026-08-14', '10:00:00'), description: 'Pickup — pay at counter', actor: 'ST-003' }],
  },
  {
    id: 'COL-311', orderId: 'ORD-10274', customerId: 'CUS-010', customerName: 'Deepa Rajan',
    amountDue: 350, amountCollected: 0, balance: 350, paymentMethod: 'Cash',
    dueDate: '2026-08-14', status: 'Pending',
    timeline: [{ id: 't1', timestamp: ts('2026-08-14', '11:00:00'), description: 'Pickup payment pending', actor: 'ST-007' }],
  },
  {
    id: 'COL-312', orderId: 'ORD-10278', customerId: 'CUS-015', customerName: 'Gopal Iyer',
    amountDue: 2550, amountCollected: 2550, balance: 0, paymentMethod: 'Card',
    dueDate: '2026-08-12', status: 'Collected',
    timeline: [{ id: 't1', timestamp: ts('2026-08-12', '14:00:00'), description: 'Full payment collected via card', actor: 'ST-002' }],
  },
];
