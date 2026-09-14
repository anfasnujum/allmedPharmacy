import type { Delivery } from '@/types';

function ts(date: string, time: string): string {
  return new Date(`${date}T${time}`).toISOString();
}

export const deliveries: Delivery[] = [
  {
    id: 'DEL-501', orderId: 'ORD-10270', customerId: 'CUS-007', customerName: 'Vinod Kumar', customerPhone: '+91 98470 78901',
    address: '89 Aluva Bypass, Aluva', items: [{ productId: 'PRD-019', productName: 'Losartan', strength: '50mg', quantity: 30, unitPrice: 6.5, prescriptionRequired: true }],
    deliverySlot: '2026-08-14T17:00:00', deliveryPersonId: 'ST-004', status: 'Out for Delivery',
    amountToCollect: 245, paymentStatus: 'Pending', createdAt: ts('2026-08-13', '16:00:00'),
    timeline: [
      { id: 't1', timestamp: ts('2026-08-13', '16:00:00'), description: 'Delivery created', actor: 'ST-002' },
      { id: 't2', timestamp: ts('2026-08-14', '10:00:00'), description: 'Out for delivery', actor: 'ST-004' },
    ],
  },
  {
    id: 'DEL-502', orderId: 'ORD-10271', customerId: 'CUS-002', customerName: 'Lakshmi Nair', customerPhone: '+91 98950 23456',
    address: '45 Panampilly Nagar', items: [
      { productId: 'PRD-008', productName: 'Metformin', strength: '500mg', quantity: 60, unitPrice: 5.0, prescriptionRequired: true },
      { productId: 'PRD-020', productName: 'Glimepiride', strength: '2mg', quantity: 30, unitPrice: 8.5, prescriptionRequired: true },
    ],
    deliverySlot: '2026-08-13T14:00:00', deliveryPersonId: 'ST-006', status: 'Delivered',
    amountToCollect: 580, paymentStatus: 'Partial', createdAt: ts('2026-08-13', '10:00:00'),
    timeline: [
      { id: 't1', timestamp: ts('2026-08-13', '10:00:00'), description: 'Delivery assigned', actor: 'ST-002' },
      { id: 't2', timestamp: ts('2026-08-13', '11:00:00'), description: 'Delivered', actor: 'ST-006' },
    ],
  },
  {
    id: 'DEL-503', orderId: 'ORD-10277', customerId: 'CUS-014', customerName: 'Reena Mathew', customerPhone: '+91 98950 44567',
    address: '73 Chittoor Road', items: [{ productId: 'PRD-017', productName: 'Pantoprazole', strength: '40mg', quantity: 14, unitPrice: 7.0, prescriptionRequired: false }],
    deliverySlot: '2026-08-14T15:00:00', status: 'Pending',
    amountToCollect: 148, paymentStatus: 'Pending', createdAt: ts('2026-08-14', '08:30:00'),
    timeline: [{ id: 't1', timestamp: ts('2026-08-14', '08:30:00'), description: 'Awaiting delivery assignment', actor: 'ST-005' }],
  },
  {
    id: 'DEL-504', orderId: 'ORD-10279', customerId: 'CUS-012', customerName: 'Kavitha Mohan', customerPhone: '+91 97460 22345',
    address: '91 Thrikkakara', items: [{ productId: 'PRD-029', productName: 'Thyronorm', strength: '50mcg', quantity: 30, unitPrice: 45.0, prescriptionRequired: true }],
    deliverySlot: '2026-08-14T14:00:00', deliveryPersonId: 'ST-008', status: 'Out for Delivery',
    amountToCollect: 1350, paymentStatus: 'Pending', createdAt: ts('2026-08-13', '14:00:00'),
    timeline: [
      { id: 't1', timestamp: ts('2026-08-13', '14:00:00'), description: 'Delivery created', actor: 'ST-007' },
      { id: 't2', timestamp: ts('2026-08-14', '09:00:00'), description: 'Out for delivery', actor: 'ST-008' },
    ],
  },
  {
    id: 'DEL-505', orderId: 'ORD-10278', customerId: 'CUS-015', customerName: 'Gopal Iyer', customerPhone: '+91 97460 55678',
    address: '52 Elamakkara', items: [{ productId: 'PRD-022', productName: 'Blood Pressure Monitor', strength: 'Standard', quantity: 1, unitPrice: 2500.0, prescriptionRequired: false }],
    deliverySlot: '2026-08-13T16:00:00', deliveryPersonId: 'ST-004', status: 'Delivered',
    amountToCollect: 0, paymentStatus: 'Paid', createdAt: ts('2026-08-12', '15:00:00'),
    timeline: [
      { id: 't1', timestamp: ts('2026-08-12', '15:00:00'), description: 'Assigned to delivery', actor: 'ST-002' },
      { id: 't2', timestamp: ts('2026-08-13', '15:00:00'), description: 'Delivered', actor: 'ST-004' },
    ],
  },
  {
    id: 'DEL-506', orderId: 'ORD-10276', customerId: 'CUS-008', customerName: 'Meera Das', customerPhone: '+91 98950 89012',
    address: '17 Fort Kochi Beach Road', items: [{ productId: 'PRD-035', productName: 'Moisturizing Cream', strength: '100g', quantity: 1, unitPrice: 450.0, prescriptionRequired: false }],
    deliverySlot: '2026-08-15T10:00:00', status: 'Preparing',
    amountToCollect: 500, paymentStatus: 'Pending', createdAt: ts('2026-08-14', '09:00:00'),
    timeline: [{ id: 't1', timestamp: ts('2026-08-14', '09:00:00'), description: 'Preparing for delivery', actor: 'ST-005' }],
  },
  {
    id: 'DEL-507', orderId: 'ORD-10280', customerId: 'CUS-005', customerName: 'Thomas George', customerPhone: '+91 98950 56789',
    address: '56 Edapally Junction', items: [{ productId: 'PRD-012', productName: 'Salbutamol Inhaler', strength: '100mcg', quantity: 1, unitPrice: 180.0, prescriptionRequired: true }],
    deliverySlot: '2026-08-14T18:00:00', status: 'Preparing',
    amountToCollect: 230, paymentStatus: 'Pending', createdAt: ts('2026-08-12', '12:00:00'),
    timeline: [{ id: 't1', timestamp: ts('2026-08-12', '12:00:00'), description: 'Delivery scheduled', actor: 'ST-001' }],
  },
  {
    id: 'DEL-508', orderId: 'ORD-10273', customerId: 'CUS-001', customerName: 'Ravi Menon', customerPhone: '+91 98470 12345',
    address: '12 MG Road, Kochi', items: [
      { productId: 'PRD-008', productName: 'Metformin', strength: '500mg', quantity: 30, unitPrice: 5.0, prescriptionRequired: true },
      { productId: 'PRD-009', productName: 'Amlodipine', strength: '5mg', quantity: 30, unitPrice: 4.0, prescriptionRequired: true },
    ],
    deliverySlot: '2026-08-14T19:00:00', status: 'Pending',
    amountToCollect: 320, paymentStatus: 'Pending', createdAt: ts('2026-08-14', '08:00:00'),
    timeline: [{ id: 't1', timestamp: ts('2026-08-14', '08:00:00'), description: 'Pending order confirmation', actor: 'ST-003' }],
  },
  {
    id: 'DEL-509', orderId: 'ORD-10272', customerId: 'CUS-004', customerName: 'Sneha Krishnan', customerPhone: '+91 98470 45678',
    address: '23 Marine Drive', items: [{ productId: 'PRD-021', productName: 'Insulin Glargine', strength: '100 IU/ml', quantity: 2, unitPrice: 850.0, prescriptionRequired: true }],
    deliverySlot: '2026-08-14T19:00:00', status: 'Preparing',
    amountToCollect: 0, paymentStatus: 'Paid', createdAt: ts('2026-08-13', '11:00:00'),
    timeline: [{ id: 't1', timestamp: ts('2026-08-13', '11:00:00'), description: 'Cold chain delivery preparing', actor: 'ST-001' }],
  },
  {
    id: 'DEL-510', orderId: 'ORD-10284', customerId: 'CUS-009', customerName: 'Arjun Namboothiri', customerPhone: '+91 97460 90123',
    address: '62 Tripunithura', items: [
      { productId: 'PRD-004', productName: 'Amoxicillin', strength: '500mg', quantity: 21, unitPrice: 8.0, prescriptionRequired: true },
      { productId: 'PRD-006', productName: 'Cetirizine', strength: '10mg', quantity: 10, unitPrice: 3.5, prescriptionRequired: false },
    ],
    deliverySlot: '2026-08-14T20:00:00', status: 'Preparing',
    amountToCollect: 253, paymentStatus: 'Pending', createdAt: ts('2026-08-14', '11:30:00'),
    timeline: [{ id: 't1', timestamp: ts('2026-08-14', '11:30:00'), description: 'Preparing order for delivery', actor: 'ST-001' }],
  },
  {
    id: 'DEL-511', orderId: 'ORD-10282', customerId: 'CUS-011', customerName: 'Sanjay Varma', customerPhone: '+91 98950 11234',
    address: '28 Vyttila Junction', items: [{ productId: 'PRD-006', productName: 'Cetirizine', strength: '10mg', quantity: 10, unitPrice: 3.5, prescriptionRequired: false }],
    deliverySlot: '2026-08-12T09:00:00', deliveryPersonId: 'ST-004', status: 'Delivered',
    amountToCollect: 85, paymentStatus: 'Paid', createdAt: ts('2026-08-11', '16:00:00'),
    timeline: [
      { id: 't1', timestamp: ts('2026-08-11', '16:00:00'), description: 'Assigned', actor: 'ST-002' },
      { id: 't2', timestamp: ts('2026-08-12', '09:00:00'), description: 'Delivered', actor: 'ST-004' },
    ],
  },
  {
    id: 'DEL-512', orderId: 'ORD-10269', customerId: 'CUS-013', customerName: 'Biju Antony', customerPhone: '+91 98470 33456',
    address: '15 Kadavanthra', items: [{ productId: 'PRD-015', productName: 'ORS Powder', strength: 'Standard', quantity: 5, unitPrice: 15.0, prescriptionRequired: false }],
    deliverySlot: '2026-08-10T14:00:00', deliveryPersonId: 'ST-004', status: 'Failed',
    amountToCollect: 125, paymentStatus: 'Pending', createdAt: ts('2026-08-10', '10:00:00'),
    timeline: [
      { id: 't1', timestamp: ts('2026-08-10', '10:00:00'), description: 'Assigned', actor: 'ST-002' },
      { id: 't2', timestamp: ts('2026-08-10', '14:30:00'), description: 'Failed — customer unavailable', actor: 'ST-004' },
    ],
  },
];
