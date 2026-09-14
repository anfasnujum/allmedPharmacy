import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { UserPlus, UserCheck, ChevronDown } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useEnquiries, useCustomers } from '@/store/DataContext';
import { useBranch } from '@/store/BranchContext';
import { ENQUIRY_DEPARTMENTS, ENQUIRY_QUERIES } from '@/data/enquiryConfig';
import { isValidPhone, generateId, normalizePhone, phoneDigits } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import type { Customer, EnquiryDepartment } from '@/types';

interface EnquiryFormProps {
  open: boolean;
  onClose: () => void;
}

type CustomerSelection =
  | { mode: 'existing'; customer: Customer }
  | { mode: 'new' }
  | null;

export function EnquiryForm({ open, onClose }: EnquiryFormProps) {
  const { addEnquiry } = useEnquiries();
  const { customers, addCustomer } = useCustomers();
  const { activeBranchId } = useBranch();

  const [phone, setPhone] = useState('');
  const [selection, setSelection] = useState<CustomerSelection>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const [name, setName] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');

  const [department, setDepartment] = useState<EnquiryDepartment>('Pharmacy');
  const [query, setQuery] = useState(ENQUIRY_QUERIES.Pharmacy[0]);
  const [queryCustom, setQueryCustom] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const phoneRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const customerPhones = (c: Customer) =>
    [c.phone, c.alternatePhone, c.whatsappPhone].filter(Boolean) as string[];

  const matchingCustomers = useMemo(() => {
    const digits = phoneDigits(phone);
    if (digits.length < 4) return [];
    return customers.filter((c) =>
      customerPhones(c).some((p) => phoneDigits(p).includes(digits)),
    );
  }, [phone, customers]);

  const exactMatch = useMemo(() => {
    if (!isValidPhone(phone)) return undefined;
    const digits = phoneDigits(phone);
    return customers.find((c) =>
      customerPhones(c).some((p) => phoneDigits(p) === digits),
    );
  }, [phone, customers]);

  const showNewCustomerOption = isValidPhone(phone) && matchingCustomers.length === 0;

  const dropdownOptions = useMemo(() => {
    const opts: Array<{ type: 'existing'; customer: Customer } | { type: 'new' }> =
      matchingCustomers.map((c) => ({ type: 'existing', customer: c }));
    if (showNewCustomerOption) opts.push({ type: 'new' });
    return opts;
  }, [matchingCustomers, showNewCustomerOption]);

  useEffect(() => {
    if (!open) return;
    setPhone('');
    setSelection(null);
    setDropdownOpen(false);
    setHighlightIndex(0);
    setName('');
    setWhatsappPhone('');
    setSameAsMobile(true);
    setEmail('');
    setArea('');
    setDepartment('Pharmacy');
    setQuery(ENQUIRY_QUERIES.Pharmacy[0]);
    setQueryCustom('');
    setErrors({});
    setTimeout(() => phoneRef.current?.focus(), 100);
  }, [open]);

  const selectExistingCustomer = useCallback((customer: Customer) => {
    setPhone(normalizePhone(customer.phone));
    setSelection({ mode: 'existing', customer });
    setName(customer.name);
    setEmail(customer.email ?? '');
    setArea(customer.area);
    setWhatsappPhone(customer.whatsappPhone ?? customer.phone);
    setSameAsMobile(
      normalizePhone(customer.whatsappPhone ?? customer.phone) === normalizePhone(customer.phone),
    );
    setDropdownOpen(false);
    setErrors((e) => ({ ...e, phone: '', name: '' }));
  }, []);

  useEffect(() => {
    if (!exactMatch || !isValidPhone(phone)) return;
    selectExistingCustomer(exactMatch);
  }, [exactMatch, phone, selectExistingCustomer]);

  useEffect(() => {
    if (sameAsMobile && phone.trim()) {
      setWhatsappPhone(phone);
    }
  }, [sameAsMobile, phone]);

  useEffect(() => {
    setQuery(ENQUIRY_QUERIES[department][0]);
    setQueryCustom('');
  }, [department]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [dropdownOptions.length]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applySelection = (opt: (typeof dropdownOptions)[number]) => {
    if (opt.type === 'existing') {
      selectExistingCustomer(opt.customer);
      return;
    }
    setSelection({ mode: 'new' });
    setName('');
    setEmail('');
    setArea('');
    setWhatsappPhone(phone);
    setSameAsMobile(true);
    setDropdownOpen(false);
    setErrors((e) => ({ ...e, phone: '', name: '' }));
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent) => {
    if (!dropdownOpen && dropdownOptions.length > 0 && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setDropdownOpen(true);
      if (e.key === 'Enter' && dropdownOptions.length > 0) {
        e.preventDefault();
        applySelection(dropdownOptions[highlightIndex] ?? dropdownOptions[0]);
      }
      return;
    }

    if (!dropdownOpen || dropdownOptions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % dropdownOptions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => (i - 1 + dropdownOptions.length) % dropdownOptions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      applySelection(dropdownOptions[highlightIndex] ?? dropdownOptions[0]);
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!phone.trim()) e.phone = 'Mobile number is required';
    else if (!isValidPhone(phone)) e.phone = 'Enter a valid Indian phone number';
    if (!selection) e.phone = e.phone ?? 'Select a customer or register as new';
    if (selection?.mode === 'new' && !name.trim()) e.name = 'Customer name is required';
    if (query === 'Other' && !queryCustom.trim()) e.queryCustom = 'Please describe the enquiry';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    let customerId = selection?.mode === 'existing' ? selection.customer.id : undefined;
    let customerName = selection?.mode === 'existing' ? selection.customer.name : name.trim();
    const resolvedWhatsapp = sameAsMobile ? normalizePhone(phone) : (whatsappPhone.trim() ? normalizePhone(whatsappPhone) : undefined);

    if (selection?.mode === 'new') {
      const newCustomer = addCustomer({
        name: name.trim(),
        phone: normalizePhone(phone),
        whatsappPhone: resolvedWhatsapp,
        email: email.trim() || undefined,
        address: '',
        area: area.trim(),
        addresses: area.trim()
          ? [{
              id: generateId('ADDR'),
              label: 'Home',
              addressLine: '',
              area: area.trim(),
              city: 'Kochi',
              lat: 9.9312,
              lng: 76.2673,
              isPrimary: true,
            }]
          : [],
        preferredContact: sameAsMobile || resolvedWhatsapp ? 'WhatsApp' : 'Phone',
      });
      customerId = newCustomer.id;
      customerName = newCustomer.name;
    }

    addEnquiry({
      customerId: customerId!,
      customerName,
      phone: normalizePhone(phone),
      whatsappPhone: resolvedWhatsapp,
      department,
      query,
      queryCustom: query === 'Other' ? queryCustom.trim() : undefined,
      branchId: activeBranchId,
    });

    toast.success('Enquiry submitted successfully');
    onClose();
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary';
  const labelClass = 'block text-sm font-medium text-brand-text mb-1';
  const queryOptions = ENQUIRY_QUERIES[department];

  return (
    <Modal open={open} onClose={onClose} title="New Enquiry" size="lg">
      <div className="space-y-6">
        <section>
          <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] text-brand-text mb-3 uppercase tracking-wide">
            Customer
          </h3>

          <div className="relative" ref={dropdownRef}>
            <label className={labelClass}>Customer Mobile Number *</label>
            <input
              ref={phoneRef}
              className={cn(inputClass, errors.phone && 'border-brand-primary')}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\s+/g, ''));
                setSelection(null);
                setDropdownOpen(true);
                setErrors((prev) => ({ ...prev, phone: '' }));
              }}
              onFocus={() => dropdownOptions.length > 0 && setDropdownOpen(true)}
              onKeyDown={handlePhoneKeyDown}
              placeholder="+91 98765 43210"
            />
            {errors.phone && <p className="text-xs text-brand-primary mt-1">{errors.phone}</p>}

            {dropdownOpen && dropdownOptions.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-brand-border rounded-lg shadow-lg overflow-hidden">
                {dropdownOptions.map((opt, idx) => (
                  <button
                    key={opt.type === 'existing' ? opt.customer.id : 'new'}
                    type="button"
                    onClick={() => applySelection(opt)}
                    className={cn(
                      'w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 border-b last:border-0 transition-colors',
                      idx === highlightIndex ? 'bg-brand-cyan/10' : 'hover:bg-gray-50',
                    )}
                  >
                    {opt.type === 'existing' ? (
                      <>
                        <UserCheck size={16} className="text-brand-cyan-dark shrink-0" />
                        <div>
                          <span className="font-medium">{opt.customer.name}</span>
                          <span className="text-brand-text-secondary ml-2">{opt.customer.phone}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} className="text-brand-primary shrink-0" />
                        <span className="font-medium text-brand-primary">New Customer</span>
                        <span className="text-brand-text-secondary ml-1">— register {phone}</span>
                      </>
                    )}
                  </button>
                ))}
                <p className="px-3 py-1.5 text-[10px] text-brand-text-secondary bg-gray-50">
                  ↑↓ navigate · Enter to select
                </p>
              </div>
            )}
          </div>

          {selection?.mode === 'existing' && (
            <div className="mt-3 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
              <UserCheck size={16} className="text-brand-cyan-dark shrink-0" />
              <div>
                <span className="font-semibold text-brand-cyan-dark">{selection.customer.name}</span>
                <span className="text-brand-text-secondary ml-2">{selection.customer.phone}</span>
                {selection.customer.totalOrders > 0 && (
                  <span className="text-brand-text-secondary ml-2">· {selection.customer.totalOrders} orders</span>
                )}
              </div>
            </div>
          )}

          {selection?.mode === 'new' && (
            <div className="mt-4 space-y-4 p-4 border border-brand-border rounded-lg bg-gray-50/50">
              <p className="text-sm font-semibold text-brand-text flex items-center gap-2">
                <UserPlus size={16} className="text-brand-primary" /> Register New Customer
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Name *</label>
                  <input
                    className={cn(inputClass, errors.name && 'border-brand-primary')}
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: '' })); }}
                    placeholder="Customer full name"
                  />
                  {errors.name && <p className="text-xs text-brand-primary mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className={labelClass}>Mobile Number</label>
                  <input className={cn(inputClass, 'bg-gray-100')} value={phone} readOnly />
                </div>
                <div>
                  <label className={labelClass}>WhatsApp Number</label>
                  <input
                    className={cn(inputClass, sameAsMobile && 'bg-gray-100')}
                    value={sameAsMobile ? '' : whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    disabled={sameAsMobile}
                    placeholder={sameAsMobile ? 'Same as mobile number' : '+91 98765 43210'}
                  />
                  <label className="flex items-center gap-2 text-xs mt-2 text-brand-text-secondary">
                    <input
                      type="checkbox"
                      checked={sameAsMobile}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSameAsMobile(checked);
                        if (checked) {
                          setWhatsappPhone('');
                        } else if (!whatsappPhone.trim() && phone.trim()) {
                          setWhatsappPhone(phone);
                        }
                      }}
                    />
                    Same as mobile number
                  </label>
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Area/Locality</label>
                  <input className={inputClass} value={area} onChange={(e) => setArea(e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </section>

        <section>
          <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] text-brand-text mb-3 uppercase tracking-wide">
            Enquiry Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Department *</label>
              <div className="relative">
                <select
                  className={cn(inputClass, 'appearance-none pr-8')}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as EnquiryDepartment)}
                >
                  {ENQUIRY_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-secondary pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Query *</label>
              <div className="relative">
                <select
                  className={cn(inputClass, 'appearance-none pr-8')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                >
                  {queryOptions.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-secondary pointer-events-none" />
              </div>
            </div>
          </div>
          {query === 'Other' && (
            <div className="mt-4">
              <label className={labelClass}>Describe enquiry *</label>
              <textarea
                className={cn(inputClass, errors.queryCustom && 'border-brand-primary')}
                rows={3}
                value={queryCustom}
                onChange={(e) => { setQueryCustom(e.target.value); setErrors((prev) => ({ ...prev, queryCustom: '' })); }}
                placeholder="Type the customer's query..."
              />
              {errors.queryCustom && <p className="text-xs text-brand-primary mt-1">{errors.queryCustom}</p>}
            </div>
          )}
        </section>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit Enquiry</Button>
        </div>
      </div>
    </Modal>
  );
}
