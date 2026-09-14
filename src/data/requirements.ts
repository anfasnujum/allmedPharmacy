import type { Requirement } from '@/types';
import { staff } from './staff';

const STAFF_BRANCH = Object.fromEntries(staff.map((s) => [s.id, s.branchId]));

const now = new Date('2026-08-14T10:00:00');

function ts(hoursAgo: number, minutesAgo = 0): string {
  const d = new Date(now);
  d.setHours(d.getHours() - hoursAgo, d.getMinutes() - minutesAgo);
  return d.toISOString();
}

export const requirements: Requirement[] = [
  {
    id: 'REQ-10201', customerId: 'CUS-001', customerName: 'Ravi Menon', phone: '+91 98470 12345',
    source: 'Phone', items: [{ productId: 'PRD-008', productName: 'Metformin', strength: '500mg', quantity: 60, prescriptionRequired: true }],
    status: 'New', assignedStaffId: 'ST-001', prescriptionAttached: true, urgency: 'Normal', deliveryRequired: true,
    preferredDeliveryTime: '2026-08-14T18:00:00', createdAt: ts(0, 15), updatedAt: ts(0, 15),
    timeline: [{ id: 't1', timestamp: ts(0, 15), description: 'Requirement received via phone call', actor: 'ST-003' }],
  },
  {
    id: 'REQ-10202', customerId: 'CUS-002', customerName: 'Lakshmi Nair', phone: '+91 98950 23456',
    source: 'WhatsApp', items: [{ productId: 'PRD-006', productName: 'Cetirizine', strength: '10mg', quantity: 10, prescriptionRequired: false }],
    status: 'Follow-up', assignedStaffId: 'ST-005', customerNotes: 'Need by evening', prescriptionAttached: false, urgency: 'Urgent', deliveryRequired: true,
    preferredDeliveryTime: '2026-08-14T20:00:00', createdAt: ts(1), updatedAt: ts(0, 45),
    timeline: [
      { id: 't1', timestamp: ts(1), description: 'Requirement received via WhatsApp', actor: 'ST-003' },
      { id: 't2', timestamp: ts(0, 45), description: 'Marked for follow-up', actor: 'ST-005' },
    ],
  },
  {
    id: 'REQ-10203', customerId: 'CUS-003', customerName: 'Mohammed Farhan', phone: '+91 97460 34567',
    source: 'Counter', items: [],
    status: 'Completed', assignedStaffId: 'ST-001', prescriptionAttached: false, urgency: 'Normal', deliveryRequired: false,
    createdAt: ts(2), updatedAt: ts(1),
    timeline: [
      { id: 't1', timestamp: ts(2), description: 'Walk-in requirement at counter', actor: 'ST-003' },
      { id: 't2', timestamp: ts(1), description: 'Order ORD-10281 created — requirement fulfilled', actor: 'ST-003' },
    ],
  },
  {
    id: 'REQ-10204', customerId: 'CUS-004', customerName: 'Sneha Krishnan', phone: '+91 98470 45678',
    source: 'WhatsApp', items: [
      { productId: 'PRD-023', productName: 'Glucometer Strips', strength: '50 strips', quantity: 1, prescriptionRequired: false },
    ],
    status: 'Partial', assignedStaffId: 'ST-002', prescriptionAttached: true, urgency: 'Urgent', deliveryRequired: true,
    createdAt: ts(3), updatedAt: ts(2),
    timeline: [
      { id: 't1', timestamp: ts(3), description: 'Requirement received via WhatsApp', actor: 'ST-007' },
      { id: 't2', timestamp: ts(2), description: 'Partial order ORD-10272 created — insulin packed', actor: 'ST-002' },
    ],
  },
  {
    id: 'REQ-10205', customerId: 'CUS-005', customerName: 'Thomas George', phone: '+91 98950 56789',
    source: 'Phone', items: [{ productId: 'PRD-012', productName: 'Salbutamol Inhaler', strength: '100mcg', quantity: 1, prescriptionRequired: true }],
    status: 'Completed', assignedStaffId: 'ST-001', prescriptionAttached: true, urgency: 'Normal', deliveryRequired: true,
    createdAt: ts(5), updatedAt: ts(4),
    timeline: [
      { id: 't1', timestamp: ts(5), description: 'Requirement received', actor: 'ST-003' },
      { id: 't2', timestamp: ts(4, 30), description: 'Converted to order ORD-10280', actor: 'ST-001' },
    ],
  },
  {
    id: 'REQ-10206', customerId: 'CUS-006', customerName: 'Anjali Pillai', phone: '+91 97460 67890',
    source: 'Counter', items: [],
    status: 'Completed', assignedStaffId: 'ST-007', prescriptionAttached: false, urgency: 'Normal', deliveryRequired: false,
    createdAt: ts(0, 30), updatedAt: ts(0, 15),
    timeline: [
      { id: 't1', timestamp: ts(0, 30), description: 'Counter requirement logged', actor: 'ST-007' },
      { id: 't2', timestamp: ts(0, 15), description: 'Order ORD-10275 created — requirement fulfilled', actor: 'ST-007' },
    ],
  },
  {
    id: 'REQ-10207', customerId: 'CUS-008', customerName: 'Meera Das', phone: '+91 98950 89012',
    source: 'WhatsApp', items: [],
    status: 'Completed', assignedStaffId: 'ST-005', prescriptionAttached: false, urgency: 'Normal', deliveryRequired: true,
    preferredDeliveryTime: '2026-08-15T10:00:00', createdAt: ts(4), updatedAt: ts(3),
    timeline: [
      { id: 't1', timestamp: ts(4), description: 'WhatsApp requirement received', actor: 'ST-003' },
      { id: 't2', timestamp: ts(3), description: 'Order ORD-10276 created — requirement fulfilled', actor: 'ST-005' },
    ],
  },
  {
    id: 'REQ-10208', customerId: 'CUS-010', customerName: 'Deepa Rajan', phone: '+91 98470 01234',
    source: 'Phone', items: [
      { productId: 'PRD-009', productName: 'Amlodipine', strength: '5mg', quantity: 30, prescriptionRequired: true },
      { productId: 'PRD-010', productName: 'Atorvastatin', strength: '10mg', quantity: 30, prescriptionRequired: true },
    ],
    status: 'Partial', assignedStaffId: 'ST-001', prescriptionAttached: true, urgency: 'Normal', deliveryRequired: true,
    createdAt: ts(6), updatedAt: ts(5),
    timeline: [
      { id: 't1', timestamp: ts(6), description: 'Phone requirement received', actor: 'ST-003' },
      { id: 't2', timestamp: ts(5), description: 'Partially fulfilled — one item pending', actor: 'ST-001' },
    ],
  },
  {
    id: 'REQ-10209', customerId: 'CUS-011', customerName: 'Sanjay Varma', phone: '+91 98950 11234',
    source: 'Counter', items: [{ productId: 'PRD-015', productName: 'ORS Powder', strength: 'Standard', quantity: 5, prescriptionRequired: false }],
    status: 'Cancelled', assignedStaffId: 'ST-003', prescriptionAttached: false, urgency: 'Normal', deliveryRequired: false,
    createdAt: ts(8), updatedAt: ts(7),
    timeline: [
      { id: 't1', timestamp: ts(8), description: 'Counter requirement logged', actor: 'ST-003' },
      { id: 't2', timestamp: ts(7), description: 'Cancelled — customer left without purchase', actor: 'ST-003' },
    ],
  },
  {
    id: 'REQ-10210', customerId: 'CUS-012', customerName: 'Kavitha Mohan', phone: '+91 97460 22345',
    source: 'WhatsApp', items: [],
    status: 'Completed', prescriptionAttached: true, urgency: 'Normal', deliveryRequired: true,
    createdAt: ts(5), updatedAt: ts(4),
    timeline: [
      { id: 't1', timestamp: ts(5), description: 'WhatsApp requirement received', actor: 'ST-007' },
      { id: 't2', timestamp: ts(4), description: 'Order ORD-10279 created — requirement fulfilled', actor: 'ST-007' },
    ],
  },
  {
    id: 'REQ-10211', customerId: 'CUS-014', customerName: 'Reena Mathew', phone: '+91 98950 44567',
    source: 'Phone', items: [],
    status: 'Completed', assignedStaffId: 'ST-005', prescriptionAttached: false, urgency: 'Normal', deliveryRequired: false,
    createdAt: ts(6), updatedAt: ts(5),
    timeline: [
      { id: 't1', timestamp: ts(6), description: 'Phone requirement received', actor: 'ST-003' },
      { id: 't2', timestamp: ts(5), description: 'Order ORD-10277 created — requirement fulfilled', actor: 'ST-005' },
    ],
  },
  {
    id: 'REQ-10212', customerId: 'CUS-015', customerName: 'Gopal Iyer', phone: '+91 97460 55678',
    source: 'Counter', items: [],
    status: 'Completed', assignedStaffId: 'ST-002', prescriptionAttached: false, urgency: 'Normal', deliveryRequired: true,
    createdAt: ts(8), updatedAt: ts(7),
    timeline: [
      { id: 't1', timestamp: ts(8), description: 'Counter requirement for medical device', actor: 'ST-007' },
      { id: 't2', timestamp: ts(7), description: 'Order ORD-10278 created — requirement fulfilled', actor: 'ST-002' },
    ],
  },
  {
    id: 'REQ-10213', customerId: 'CUS-016', customerName: 'Nisha Babu', phone: '+91 98470 66789',
    source: 'WhatsApp', items: [{ productId: 'PRD-032', productName: 'Paracetamol Syrup', strength: '250mg/5ml', quantity: 1, prescriptionRequired: false }],
    status: 'New', prescriptionAttached: false, urgency: 'Urgent', deliveryRequired: true,
    customerNotes: 'For child — fever', createdAt: ts(0, 10), updatedAt: ts(0, 10),
    timeline: [{ id: 't1', timestamp: ts(0, 10), description: 'Urgent WhatsApp requirement', actor: 'ST-003' }],
  },
  {
    id: 'REQ-10214', customerId: 'CUS-017', customerName: 'Harish Pillai', phone: '+91 98950 77890',
    source: 'Phone', items: [{ productId: 'PRD-004', productName: 'Amoxicillin', strength: '500mg', quantity: 21, prescriptionRequired: true }],
    status: 'Follow-up', prescriptionAttached: false, urgency: 'Normal', deliveryRequired: true,
    createdAt: ts(5, 30), updatedAt: ts(4, 30),
    timeline: [{ id: 't1', timestamp: ts(5, 30), description: 'Prescription pending', actor: 'ST-001' }],
  },
  {
    id: 'REQ-10215', customerId: 'CUS-018', customerName: 'Shalini Varghese', phone: '+91 97460 88901',
    source: 'Counter', items: [],
    status: 'Completed', assignedStaffId: 'ST-001', prescriptionAttached: false, urgency: 'Normal', deliveryRequired: false,
    createdAt: ts(2, 30), updatedAt: ts(2),
    timeline: [
      { id: 't1', timestamp: ts(2, 30), description: 'Counter requirement logged', actor: 'ST-007' },
      { id: 't2', timestamp: ts(2), description: 'Order ORD-10283 created — requirement fulfilled', actor: 'ST-003' },
    ],
  },
  {
    id: 'REQ-10216', customerId: 'CUS-007', customerName: 'Vinod Kumar', phone: '+91 98470 78901',
    source: 'Phone', items: [{ productId: 'PRD-019', productName: 'Losartan', strength: '50mg', quantity: 30, prescriptionRequired: true }],
    status: 'Completed', assignedStaffId: 'ST-001', prescriptionAttached: true, urgency: 'Normal', deliveryRequired: true,
    createdAt: ts(10), updatedAt: ts(9),
    timeline: [
      { id: 't1', timestamp: ts(10), description: 'Requirement received', actor: 'ST-003' },
      { id: 't2', timestamp: ts(9), description: 'Converted to order ORD-10270', actor: 'ST-001' },
    ],
  },
  {
    id: 'REQ-10217', customerId: 'CUS-009', customerName: 'Arjun Namboothiri', phone: '+91 97460 90123',
    source: 'WhatsApp', items: [{ productId: 'PRD-037', productName: 'Diclofenac Gel', strength: '1%', quantity: 2, prescriptionRequired: false }],
    status: 'New', prescriptionAttached: false, urgency: 'Normal', deliveryRequired: true,
    createdAt: ts(0, 45), updatedAt: ts(0, 45),
    timeline: [{ id: 't1', timestamp: ts(0, 45), description: 'WhatsApp requirement received', actor: 'ST-007' }],
  },
  {
    id: 'REQ-10218', customerId: 'CUS-013', customerName: 'Biju Antony', phone: '+91 98470 33456',
    source: 'Counter', items: [{ productId: 'PRD-025', productName: 'Hand Sanitizer', strength: '500ml', quantity: 2, prescriptionRequired: false }],
    status: 'Follow-up', assignedStaffId: 'ST-003', prescriptionAttached: false, urgency: 'Normal', deliveryRequired: false,
    createdAt: ts(1, 15), updatedAt: ts(0, 50),
    timeline: [{ id: 't1', timestamp: ts(1, 15), description: 'Counter requirement logged', actor: 'ST-003' }],
  },
  {
    id: 'REQ-10219', customerId: 'CUS-001', customerName: 'Ravi Menon', phone: '+91 98470 12345',
    source: 'Phone', items: [
      { productId: 'PRD-009', productName: 'Amlodipine', strength: '5mg', quantity: 30, prescriptionRequired: true },
      { productId: 'PRD-010', productName: 'Atorvastatin', strength: '10mg', quantity: 30, prescriptionRequired: true },
      { productId: 'PRD-013', productName: 'Vitamin D3', strength: '60000 IU', quantity: 4, prescriptionRequired: false },
    ],
    status: 'New', assignedStaffId: 'ST-001', prescriptionAttached: true, urgency: 'Normal', deliveryRequired: true,
    requirementDeliveryType: 'Home Delivery', preferredDeliveryTime: '2026-08-14T19:00:00',
    customerNotes: 'Regular monthly refill', createdAt: ts(0, 5), updatedAt: ts(0, 5),
    timeline: [{ id: 't1', timestamp: ts(0, 5), description: 'Phone requirement — monthly medicines', actor: 'ST-003' }],
  },
  {
    id: 'REQ-10220', customerId: 'CUS-016', customerName: 'Nisha Babu', phone: '+91 98470 66789',
    source: 'WhatsApp', items: [
      { productId: 'PRD-032', productName: 'Paracetamol Syrup', strength: '250mg/5ml', quantity: 2, prescriptionRequired: false },
      { productId: 'PRD-006', productName: 'Cetirizine', strength: '10mg', quantity: 10, prescriptionRequired: false },
    ],
    status: 'New', prescriptionAttached: false, urgency: 'Urgent', deliveryRequired: true,
    requirementDeliveryType: 'Home Delivery', customerNotes: 'Child fever — need quickly',
    createdAt: ts(0, 8), updatedAt: ts(0, 8),
    timeline: [{ id: 't1', timestamp: ts(0, 8), description: 'Urgent WhatsApp requirement', actor: 'ST-003' }],
  },
  {
    id: 'REQ-10221', customerId: 'CUS-003', customerName: 'Mohammed Farhan', phone: '+91 97460 34567',
    source: 'Counter', items: [
      { productId: 'PRD-001', productName: 'Paracetamol', strength: '500mg', quantity: 30, prescriptionRequired: false },
      { productId: 'PRD-015', productName: 'ORS Powder', strength: 'Standard', quantity: 5, prescriptionRequired: false },
    ],
    status: 'New', assignedStaffId: 'ST-003', prescriptionAttached: false, urgency: 'Normal', deliveryRequired: false,
    requirementDeliveryType: 'Counter Pickup', createdAt: ts(0, 20), updatedAt: ts(0, 20),
    timeline: [{ id: 't1', timestamp: ts(0, 20), description: 'Walk-in counter requirement', actor: 'ST-003' }],
  },
  {
    id: 'REQ-10222', customerId: 'CUS-007', customerName: 'Vinod Kumar', phone: '+91 98470 78901',
    source: 'Phone', items: [
      { productId: 'PRD-019', productName: 'Losartan', strength: '50mg', quantity: 30, prescriptionRequired: true },
      { productId: 'PRD-008', productName: 'Metformin', strength: '500mg', quantity: 60, prescriptionRequired: true },
    ],
    status: 'New', assignedStaffId: 'ST-001', prescriptionAttached: true, urgency: 'Normal', deliveryRequired: true,
    requirementDeliveryType: 'Home Delivery', preferredDeliveryTime: '2026-08-15T12:00:00',
    createdAt: ts(0, 25), updatedAt: ts(0, 25),
    timeline: [{ id: 't1', timestamp: ts(0, 25), description: 'Repeat customer phone order', actor: 'ST-003' }],
  },
  {
    id: 'REQ-10223', customerId: 'CUS-004', customerName: 'Sneha Krishnan', phone: '+91 98470 45678',
    source: 'WhatsApp', items: [
      { productId: 'PRD-021', productName: 'Insulin Glargine', strength: '100 IU/ml', quantity: 2, prescriptionRequired: true },
      { productId: 'PRD-023', productName: 'Glucometer Strips', strength: '50 strips', quantity: 2, prescriptionRequired: false },
    ],
    status: 'New', assignedStaffId: 'ST-002', prescriptionAttached: true, urgency: 'Urgent', deliveryRequired: true,
    requirementDeliveryType: 'Home Delivery', preferredDeliveryTime: '2026-08-14T21:00:00',
    customerNotes: 'Cold chain — fridge items', createdAt: ts(0, 12), updatedAt: ts(0, 12),
    timeline: [{ id: 't1', timestamp: ts(0, 12), description: 'WhatsApp requirement with cold chain items', actor: 'ST-007' }],
  },
  {
    id: 'REQ-10224', customerId: 'CUS-002', customerName: 'Lakshmi Nair', phone: '+91 98950 23456',
    source: 'WhatsApp', items: [
      { productId: 'PRD-008', productName: 'Metformin', strength: '500mg', quantity: 60, prescriptionRequired: true },
      { productId: 'PRD-020', productName: 'Glimepiride', strength: '2mg', quantity: 30, prescriptionRequired: true },
      { productId: 'PRD-014', productName: 'Multivitamin', strength: 'Standard', quantity: 30, prescriptionRequired: false },
    ],
    status: 'New', assignedStaffId: 'ST-005', prescriptionAttached: true, urgency: 'Normal', deliveryRequired: true,
    requirementDeliveryType: 'Home Delivery', preferredDeliveryTime: '2026-08-15T10:00:00',
    createdAt: ts(0, 18), updatedAt: ts(0, 18),
    timeline: [{ id: 't1', timestamp: ts(0, 18), description: 'WhatsApp — diabetes care bundle', actor: 'ST-003' }],
  },
  {
    id: 'REQ-10225', customerId: 'CUS-009', customerName: 'Arjun Namboothiri', phone: '+91 97460 90123',
    source: 'Phone', items: [
      { productId: 'PRD-004', productName: 'Amoxicillin', strength: '500mg', quantity: 21, prescriptionRequired: true },
      { productId: 'PRD-006', productName: 'Cetirizine', strength: '10mg', quantity: 10, prescriptionRequired: false },
    ],
    status: 'New', prescriptionAttached: true, urgency: 'Critical', deliveryRequired: true,
    requirementDeliveryType: 'Courier', courierCarrier: 'BlueDart', preferredDeliveryTime: '2026-08-15T14:00:00',
    createdAt: ts(0, 3), updatedAt: ts(0, 3),
    timeline: [{ id: 't1', timestamp: ts(0, 3), description: 'Courier delivery requirement', actor: 'ST-003' }],
  },
  {
    id: 'REQ-10226', customerId: 'CUS-010', customerName: 'Deepa Rajan', phone: '+91 98470 01234',
    source: 'Phone', items: [
      { productId: 'PRD-010', productName: 'Atorvastatin', strength: '10mg', quantity: 30, prescriptionRequired: true },
      { productId: 'PRD-017', productName: 'Pantoprazole', strength: '40mg', quantity: 14, prescriptionRequired: false },
    ],
    status: 'New', assignedStaffId: 'ST-007', prescriptionAttached: false, urgency: 'Normal', deliveryRequired: true,
    requirementDeliveryType: 'Home Delivery', createdAt: ts(0, 22), updatedAt: ts(0, 22),
    timeline: [{ id: 't1', timestamp: ts(0, 22), description: 'Phone requirement received', actor: 'ST-007' }],
  },
  {
    id: 'REQ-10227', customerId: 'CUS-011', customerName: 'Sanjay Varma', phone: '+91 98950 11234',
    source: 'Counter', items: [{ productId: 'PRD-006', productName: 'Cetirizine', strength: '10mg', quantity: 10, prescriptionRequired: false }],
    status: 'New', assignedStaffId: 'ST-003', prescriptionAttached: false, urgency: 'Normal', deliveryRequired: false,
    requirementDeliveryType: 'Counter Pickup', createdAt: ts(0, 28), updatedAt: ts(0, 28),
    timeline: [{ id: 't1', timestamp: ts(0, 28), description: 'Counter pickup requirement', actor: 'ST-003' }],
  },
  {
    id: 'REQ-10230', customerId: 'CUS-002', customerName: 'Lakshmi Nair', phone: '+91 98950 23456',
    source: 'WhatsApp', items: [],
    status: 'Completed', assignedStaffId: 'ST-005', prescriptionAttached: true, urgency: 'Normal', deliveryRequired: true,
    createdAt: ts(8), updatedAt: ts(7),
    timeline: [
      { id: 't1', timestamp: ts(8), description: 'Requirement received', actor: 'ST-005' },
      { id: 't2', timestamp: ts(7), description: 'Order ORD-10271 created — requirement fulfilled', actor: 'ST-005' },
    ],
  },
  {
    id: 'REQ-10231', customerId: 'CUS-001', customerName: 'Ravi Menon', phone: '+91 98470 12345',
    source: 'Phone', items: [],
    status: 'Completed', assignedStaffId: 'ST-003', prescriptionAttached: true, urgency: 'Normal', deliveryRequired: true,
    createdAt: ts(6), updatedAt: ts(5),
    timeline: [
      { id: 't1', timestamp: ts(6), description: 'Requirement received', actor: 'ST-003' },
      { id: 't2', timestamp: ts(5), description: 'Order ORD-10273 created — requirement fulfilled', actor: 'ST-003' },
    ],
  },
  {
    id: 'REQ-10232', customerId: 'CUS-010', customerName: 'Deepa Rajan', phone: '+91 98470 01234',
    source: 'Phone', items: [],
    status: 'Completed', assignedStaffId: 'ST-007', prescriptionAttached: true, urgency: 'Normal', deliveryRequired: false,
    createdAt: ts(7), updatedAt: ts(6),
    timeline: [
      { id: 't1', timestamp: ts(7), description: 'Requirement received', actor: 'ST-007' },
      { id: 't2', timestamp: ts(6), description: 'Order ORD-10274 created — requirement fulfilled', actor: 'ST-007' },
    ],
  },
  {
    id: 'REQ-10233', customerId: 'CUS-011', customerName: 'Sanjay Varma', phone: '+91 98950 11234',
    source: 'Phone', items: [],
    status: 'Completed', assignedStaffId: 'ST-001', prescriptionAttached: false, urgency: 'Normal', deliveryRequired: true,
    createdAt: ts(12), updatedAt: ts(11),
    timeline: [
      { id: 't1', timestamp: ts(12), description: 'Requirement received', actor: 'ST-003' },
      { id: 't2', timestamp: ts(11), description: 'Order ORD-10282 created — requirement fulfilled', actor: 'ST-001' },
    ],
  },
  {
    id: 'REQ-10234', customerId: 'CUS-009', customerName: 'Arjun Namboothiri', phone: '+91 97460 90123',
    source: 'Phone', items: [],
    status: 'Completed', assignedStaffId: 'ST-003', prescriptionAttached: true, urgency: 'Normal', deliveryRequired: true,
    createdAt: ts(4), updatedAt: ts(3),
    timeline: [
      { id: 't1', timestamp: ts(4), description: 'Requirement received', actor: 'ST-003' },
      { id: 't2', timestamp: ts(3), description: 'Order ORD-10284 created — requirement fulfilled', actor: 'ST-001' },
    ],
  },
].map((req) => ({
  ...req,
  branchId: (req.assignedStaffId && STAFF_BRANCH[req.assignedStaffId]) || 'BR-001',
})) as Requirement[];
