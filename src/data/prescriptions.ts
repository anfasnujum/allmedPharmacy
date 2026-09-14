import type { Prescription } from '@/types';

export const prescriptions: Prescription[] = [
  {
    id: 'RX-001', customerId: 'CUS-001', doctorName: 'Dr. Anil Kumar', hospital: 'Aster Medcity',
    prescribedDate: '2026-07-01', validUntil: '2026-12-31', status: 'Active', imageAttached: true,
    medicines: [
      { productName: 'Metformin', strength: '500mg', dosage: '1 tablet twice daily', duration: '6 months' },
      { productName: 'Amlodipine', strength: '5mg', dosage: '1 tablet daily', duration: '6 months' },
    ],
    notes: 'Diabetes & hypertension management',
  },
  {
    id: 'RX-002', customerId: 'CUS-004', doctorName: 'Dr. Priya Menon', hospital: 'Amrita Institute',
    prescribedDate: '2026-06-15', validUntil: '2027-06-15', status: 'Active', imageAttached: true,
    medicines: [
      { productName: 'Insulin Glargine', strength: '100 IU/ml', dosage: '12 units at bedtime', duration: '12 months' },
    ],
    notes: 'Type 1 diabetes — cold chain required',
  },
  {
    id: 'RX-003', customerId: 'CUS-010', doctorName: 'Dr. Rajesh Pillai',
    prescribedDate: '2026-05-20', validUntil: '2026-11-20', status: 'Active', imageAttached: true,
    medicines: [
      { productName: 'Amlodipine', strength: '5mg', dosage: '1 tablet daily', duration: '6 months' },
      { productName: 'Atorvastatin', strength: '10mg', dosage: '1 tablet at night', duration: '6 months' },
    ],
  },
  {
    id: 'RX-004', customerId: 'CUS-012', doctorName: 'Dr. Sreeja Nair', hospital: 'Rajagiri Hospital',
    prescribedDate: '2026-04-10', validUntil: '2027-04-10', status: 'Active', imageAttached: true,
    medicines: [
      { productName: 'Thyronorm', strength: '50mcg', dosage: '1 tablet on empty stomach', duration: '12 months' },
    ],
  },
  {
    id: 'RX-005', customerId: 'CUS-002', doctorName: 'Dr. Vinod Das',
    prescribedDate: '2026-03-01', validUntil: '2026-09-01', status: 'Active',
    medicines: [
      { productName: 'Metformin', strength: '500mg', dosage: '1 tablet twice daily', duration: '6 months' },
      { productName: 'Glimepiride', strength: '2mg', dosage: '1 tablet before breakfast', duration: '6 months' },
    ],
  },
  {
    id: 'RX-006', customerId: 'CUS-005', doctorName: 'Dr. Meera Joseph',
    prescribedDate: '2026-02-14', validUntil: '2026-08-14', status: 'Active', imageAttached: true,
    medicines: [
      { productName: 'Salbutamol Inhaler', strength: '100mcg', dosage: '2 puffs as needed', duration: '6 months' },
    ],
    notes: 'Asthma — keep rescue inhaler stocked',
  },
  {
    id: 'RX-007', customerId: 'CUS-009', doctorName: 'Dr. Anwar Ali',
    prescribedDate: '2026-08-10', validUntil: '2026-08-24', status: 'Active', imageAttached: true,
    medicines: [
      { productName: 'Amoxicillin', strength: '500mg', dosage: '1 capsule three times daily', duration: '7 days' },
      { productName: 'Cetirizine', strength: '10mg', dosage: '1 tablet at night', duration: '5 days' },
    ],
    notes: 'Acute infection course',
  },
  {
    id: 'RX-008', customerId: 'CUS-014', doctorName: 'Dr. Lakshmi V',
    prescribedDate: '2025-12-01', validUntil: '2026-06-01', status: 'Expired',
    medicines: [
      { productName: 'Thyronorm', strength: '50mcg', dosage: '1 tablet daily', duration: '6 months' },
    ],
  },
  {
    id: 'RX-009', customerId: 'CUS-007', doctorName: 'Dr. Suresh Babu',
    prescribedDate: '2026-07-20', validUntil: '2027-01-20', status: 'Active', imageAttached: true,
    medicines: [
      { productName: 'Losartan', strength: '50mg', dosage: '1 tablet daily', duration: '6 months' },
    ],
  },
  {
    id: 'RX-010', customerId: 'CUS-015', doctorName: 'Dr. Gopal Krishnan',
    prescribedDate: '2025-06-01', validUntil: '2025-12-01', status: 'Expired',
    medicines: [
      { productName: 'Atorvastatin', strength: '10mg', dosage: '1 tablet daily', duration: '6 months' },
    ],
  },
  {
    id: 'RX-011', customerId: 'CUS-001', doctorName: 'Dr. Anil Kumar',
    prescribedDate: '2025-01-01', validUntil: '2025-07-01', status: 'Completed',
    medicines: [
      { productName: 'Calcium + Vitamin D', strength: '500mg', dosage: '1 tablet daily', duration: '6 months' },
    ],
  },
  {
    id: 'RX-012', customerId: 'CUS-017', doctorName: 'Dr. Harish Nambiar',
    prescribedDate: '2026-07-05', validUntil: '2026-08-05', status: 'Expired',
    medicines: [
      { productName: 'Levofloxacin', strength: '500mg', dosage: '1 tablet daily', duration: '10 days' },
    ],
  },
];
