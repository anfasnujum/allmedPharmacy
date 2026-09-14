import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Customer, ContactMethod } from '@/types';
import { normalizePhone } from '@/utils/helpers';

interface CustomerEditModalProps {
  open: boolean;
  onClose: () => void;
  customer: Customer;
  onSave: (updates: Partial<Customer>) => void;
}

const inputClass = 'w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20';
const labelClass = 'block text-sm font-medium text-brand-text mb-1';

export function CustomerEditModal({ open, onClose, customer, onSave }: CustomerEditModalProps) {
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [alternatePhone, setAlternatePhone] = useState(customer.alternatePhone ?? '');
  const [email, setEmail] = useState(customer.email ?? '');
  const [preferredContact, setPreferredContact] = useState<ContactMethod>(customer.preferredContact);
  const [notes, setNotes] = useState(customer.notes ?? '');

  const handleSave = () => {
    if (!name.trim() || !phone.trim()) return;
    onSave({
      name: name.trim(),
      phone: normalizePhone(phone),
      alternatePhone: alternatePhone.trim() ? normalizePhone(alternatePhone) : undefined,
      email: email.trim() || undefined,
      preferredContact,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Customer Details" size="md">
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Full Name</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Mobile</label>
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Alternate Phone</label>
            <input className={inputClass} value={alternatePhone} onChange={(e) => setAlternatePhone(e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Preferred Contact</label>
          <select className={inputClass} value={preferredContact} onChange={(e) => setPreferredContact(e.target.value as ContactMethod)}>
            {(['Phone', 'WhatsApp', 'Email', 'SMS'] as ContactMethod[]).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Notes</label>
          <textarea className={inputClass} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </Modal>
  );
}
