import type { RequirementItem } from '@/types';

/** Mock OCR — simulates reading medicines from a prescription image */
export async function mockPrescriptionOcr(_file: File): Promise<RequirementItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const samples: RequirementItem[][] = [
    [
      { productName: 'Paracetamol', strength: '500mg', quantity: 20, prescriptionRequired: false, notes: 'OCR' },
      { productName: 'Amoxicillin', strength: '500mg', quantity: 15, prescriptionRequired: true, notes: 'OCR' },
      { productName: 'Cetirizine', strength: '10mg', quantity: 10, prescriptionRequired: false, notes: 'OCR' },
    ],
    [
      { productName: 'Metformin', strength: '500mg', quantity: 30, prescriptionRequired: true, notes: 'OCR' },
      { productName: 'Atorvastatin', strength: '10mg', quantity: 30, prescriptionRequired: true, notes: 'OCR' },
      { productName: 'Aspirin', strength: '75mg', quantity: 30, prescriptionRequired: true, notes: 'OCR' },
    ],
    [
      { productName: 'Azithromycin', strength: '500mg', quantity: 6, prescriptionRequired: true, notes: 'OCR' },
      { productName: 'Pantoprazole', strength: '40mg', quantity: 14, prescriptionRequired: true, notes: 'OCR' },
      { productName: 'Vitamin D3', strength: '60k IU', quantity: 4, prescriptionRequired: false, notes: 'OCR' },
    ],
  ];

  return samples[Math.floor(Math.random() * samples.length)];
}
