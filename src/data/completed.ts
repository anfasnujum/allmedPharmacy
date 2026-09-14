import type { CompletedRecord } from '@/types';

export const completed: CompletedRecord[] = [
  {
    id: 'CMP-401', orderId: 'ORD-10282', customerId: 'CUS-011', customerName: 'Sanjay Varma',
    completedDate: '2026-08-12T10:00:00', items: [{ productId: 'PRD-006', productName: 'Cetirizine', strength: '10mg', quantity: 10, unitPrice: 3.5, prescriptionRequired: false }],
    orderValue: 85, paymentMethod: 'UPI', branchId: 'BR-001', completedBy: 'ST-001', source: 'Phone',
  },
  {
    id: 'CMP-402', orderId: 'ORD-10283', customerId: 'CUS-018', customerName: 'Shalini Varghese',
    completedDate: '2026-08-13T17:00:00', items: [{ productId: 'PRD-013', productName: 'Vitamin D3', strength: '60000 IU', quantity: 4, unitPrice: 35.0, prescriptionRequired: false }],
    orderValue: 140, paymentMethod: 'Cash', branchId: 'BR-001', completedBy: 'ST-003', source: 'Counter',
  },
  {
    id: 'CMP-403', orderId: 'ORD-10265', customerId: 'CUS-001', customerName: 'Ravi Menon',
    completedDate: '2026-08-10T16:00:00', items: [
      { productId: 'PRD-008', productName: 'Metformin', strength: '500mg', quantity: 30, unitPrice: 5.0, prescriptionRequired: true },
      { productId: 'PRD-040', productName: 'Calcium + Vitamin D', strength: '500mg', quantity: 30, unitPrice: 10.0, prescriptionRequired: false },
    ],
    orderValue: 500, paymentMethod: 'UPI', branchId: 'BR-001', completedBy: 'ST-001', source: 'Phone',
  },
  {
    id: 'CMP-404', orderId: 'ORD-10266', customerId: 'CUS-004', customerName: 'Sneha Krishnan',
    completedDate: '2026-08-11T14:00:00', items: [{ productId: 'PRD-023', productName: 'Glucometer Strips', strength: '50 strips', quantity: 2, unitPrice: 950.0, prescriptionRequired: false }],
    orderValue: 1950, paymentMethod: 'Card', branchId: 'BR-001', completedBy: 'ST-002', source: 'WhatsApp',
  },
  {
    id: 'CMP-405', orderId: 'ORD-10267', customerId: 'CUS-002', customerName: 'Lakshmi Nair',
    completedDate: '2026-08-09T12:00:00', items: [{ productId: 'PRD-006', productName: 'Cetirizine', strength: '10mg', quantity: 30, unitPrice: 3.5, prescriptionRequired: false }],
    orderValue: 155, paymentMethod: 'Cash', branchId: 'BR-002', completedBy: 'ST-005', source: 'Counter',
  },
  {
    id: 'CMP-406', orderId: 'ORD-10268', customerId: 'CUS-010', customerName: 'Deepa Rajan',
    completedDate: '2026-08-08T18:00:00', items: [
      { productId: 'PRD-009', productName: 'Amlodipine', strength: '5mg', quantity: 30, unitPrice: 4.0, prescriptionRequired: true },
      { productId: 'PRD-010', productName: 'Atorvastatin', strength: '10mg', quantity: 30, unitPrice: 12.0, prescriptionRequired: true },
    ],
    orderValue: 530, paymentMethod: 'UPI', branchId: 'BR-003', completedBy: 'ST-007', source: 'WhatsApp',
  },
  {
    id: 'CMP-407', orderId: 'ORD-10260', customerId: 'CUS-006', customerName: 'Anjali Pillai',
    completedDate: '2026-08-07T11:00:00', items: [{ productId: 'PRD-007', productName: 'Omeprazole', strength: '20mg', quantity: 14, unitPrice: 6.0, prescriptionRequired: false }],
    orderValue: 134, paymentMethod: 'UPI', branchId: 'BR-003', completedBy: 'ST-007', source: 'Phone',
  },
  {
    id: 'CMP-408', orderId: 'ORD-10261', customerId: 'CUS-008', customerName: 'Meera Das',
    completedDate: '2026-08-06T15:00:00', items: [{ productId: 'PRD-034', productName: 'Betadine Solution', strength: '100ml', quantity: 1, unitPrice: 180.0, prescriptionRequired: false }],
    orderValue: 230, paymentMethod: 'COD', branchId: 'BR-001', completedBy: 'ST-004', source: 'WhatsApp',
  },
  {
    id: 'CMP-409', orderId: 'ORD-10262', customerId: 'CUS-014', customerName: 'Reena Mathew',
    completedDate: '2026-08-05T10:00:00', items: [{ productId: 'PRD-029', productName: 'Thyronorm', strength: '50mcg', quantity: 30, unitPrice: 45.0, prescriptionRequired: true }],
    orderValue: 1400, paymentMethod: 'UPI', branchId: 'BR-002', completedBy: 'ST-005', source: 'Phone',
  },
  {
    id: 'CMP-410', orderId: 'ORD-10263', customerId: 'CUS-015', customerName: 'Gopal Iyer',
    completedDate: '2026-08-04T14:00:00', items: [{ productId: 'PRD-014', productName: 'Multivitamin', strength: 'Standard', quantity: 60, unitPrice: 8.0, prescriptionRequired: false }],
    orderValue: 530, paymentMethod: 'Cash', branchId: 'BR-001', completedBy: 'ST-003', source: 'Counter',
  },
  {
    id: 'CMP-411', orderId: 'ORD-10264', customerId: 'CUS-012', customerName: 'Kavitha Mohan',
    completedDate: '2026-08-03T16:00:00', items: [{ productId: 'PRD-005', productName: 'Azithromycin', strength: '500mg', quantity: 6, unitPrice: 25.0, prescriptionRequired: true }],
    orderValue: 200, paymentMethod: 'UPI', branchId: 'BR-003', completedBy: 'ST-007', source: 'WhatsApp',
  },
  {
    id: 'CMP-412', orderId: 'ORD-10258', customerId: 'CUS-005', customerName: 'Thomas George',
    completedDate: '2026-08-02T12:00:00', items: [{ productId: 'PRD-016', productName: 'Domperidone', strength: '10mg', quantity: 20, unitPrice: 3.0, prescriptionRequired: false }],
    orderValue: 110, paymentMethod: 'Cash', branchId: 'BR-002', completedBy: 'ST-005', source: 'Counter',
  },
  {
    id: 'CMP-413', orderId: 'ORD-10259', customerId: 'CUS-017', customerName: 'Harish Pillai',
    completedDate: '2026-08-01T09:00:00', items: [{ productId: 'PRD-018', productName: 'Levofloxacin', strength: '500mg', quantity: 10, unitPrice: 18.0, prescriptionRequired: true }],
    orderValue: 230, paymentMethod: 'UPI', branchId: 'BR-004', completedBy: 'ST-001', source: 'Phone',
  },
  {
    id: 'CMP-414', orderId: 'ORD-10255', customerId: 'CUS-009', customerName: 'Arjun Namboothiri',
    completedDate: '2026-07-30T17:00:00', items: [{ productId: 'PRD-037', productName: 'Diclofenac Gel', strength: '1%', quantity: 1, unitPrice: 95.0, prescriptionRequired: false }],
    orderValue: 145, paymentMethod: 'COD', branchId: 'BR-001', completedBy: 'ST-004', source: 'WhatsApp',
  },
  {
    id: 'CMP-415', orderId: 'ORD-10256', customerId: 'CUS-003', customerName: 'Mohammed Farhan',
    completedDate: '2026-07-29T13:00:00', items: [{ productId: 'PRD-001', productName: 'Paracetamol', strength: '500mg', quantity: 30, unitPrice: 2.5, prescriptionRequired: false }],
    orderValue: 125, paymentMethod: 'Cash', branchId: 'BR-001', completedBy: 'ST-003', source: 'Counter',
  },
];
