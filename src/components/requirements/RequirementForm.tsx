import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { UserPlus, UserCheck, Upload, Loader2, ScanLine } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useRequirements, useCustomers, useProducts, useData, useBranches } from '@/store/DataContext';
import { useBranch } from '@/store/BranchContext';
import { getPrimaryAddress } from '@/data/customers';
import { COURIER_CARRIERS } from '@/data/couriers';
import { mockPrescriptionOcr } from '@/utils/prescriptionOcr';
import { isValidPhone, generateId, normalizePhone, phoneDigits } from '@/utils/helpers';
import { toDatetimeLocalValue } from '@/utils/format';
import { productSelectionFields } from '@/utils/productCompliance';
import { RequirementMedicineEditor } from '@/components/requirements/RequirementMedicineEditor';
import { cn } from '@/utils/cn';
import type {
  Source,
  ContactMethod,
  Urgency,
  RequirementItem,
  Customer,
  CustomerAddress,
  RequirementDeliveryType,
  RequirementStatus,
} from '@/types';

interface InitialCustomer {
  customerId?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  area?: string;
  contactMethod?: ContactMethod;
}

interface RequirementFormProps {
  open: boolean;
  onClose: () => void;
  initialCustomer?: InitialCustomer;
  initialNotes?: string;
  onCreated?: (requirementId: string) => void;
}

type CustomerSelection =
  | { mode: 'existing'; customer: Customer }
  | { mode: 'new' }
  | null;

const inputClass =
  'w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary';
const labelClass = 'block text-sm font-medium text-brand-text mb-1';

function formatAddressOption(a: CustomerAddress): string {
  return `${a.label} — ${a.addressLine}, ${a.area}${a.pincode ? ` ${a.pincode}` : ''}`;
}

export function RequirementForm({ open, onClose, initialCustomer, initialNotes, onCreated }: RequirementFormProps) {
  const { addRequirement } = useRequirements();
  const { addCustomer } = useCustomers();
  const { searchProducts } = useProducts();
  const { data } = useData();
  const branches = useBranches();
  const { activeBranchId } = useBranch();

  const [phone, setPhone] = useState('');
  const [selection, setSelection] = useState<CustomerSelection>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('Phone');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const [source, setSource] = useState<Source>('Counter');
  const [items, setItems] = useState<RequirementItem[]>([]);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [customerNotes, setCustomerNotes] = useState('');
  const [prescriptionAttached, setPrescriptionAttached] = useState(false);
  const [urgency, setUrgency] = useState<Urgency>('Normal');
  const [deliveryType, setDeliveryType] = useState<RequirementDeliveryType>('Counter Pickup');
  const [deliveryAddressId, setDeliveryAddressId] = useState<string | null>(null);
  const [courierCarrier, setCourierCarrier] = useState<string>(COURIER_CARRIERS[0]);
  const [pickupBranchId, setPickupBranchId] = useState(activeBranchId);
  const [preferredDeliveryTime, setPreferredDeliveryTime] = useState(toDatetimeLocalValue());

  const [errors, setErrors] = useState<Record<string, string>>({});
  const phoneRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const customerPhones = (c: Customer) =>
    [c.phone, c.alternatePhone, c.whatsappPhone].filter(Boolean) as string[];

  const matchingCustomers = useMemo(() => {
    const digits = phoneDigits(phone);
    if (digits.length < 4) return [];
    return data.customers.filter((c) =>
      customerPhones(c).some((p) => phoneDigits(p).includes(digits)),
    );
  }, [phone, data.customers]);

  const exactMatch = useMemo(() => {
    if (!isValidPhone(phone)) return undefined;
    const digits = phoneDigits(phone);
    return data.customers.find((c) =>
      customerPhones(c).some((p) => phoneDigits(p) === digits),
    );
  }, [phone, data.customers]);

  const showNewCustomerOption = isValidPhone(phone) && matchingCustomers.length === 0;

  const dropdownOptions = useMemo(() => {
    const opts: Array<{ type: 'existing'; customer: Customer } | { type: 'new' }> =
      matchingCustomers.map((c) => ({ type: 'existing', customer: c }));
    if (showNewCustomerOption) opts.push({ type: 'new' });
    return opts;
  }, [matchingCustomers, showNewCustomerOption]);

  const existingCustomer = selection?.mode === 'existing' ? selection.customer : undefined;
  const addressOptions: CustomerAddress[] = existingCustomer?.addresses ?? [];

  const selectedCustomerAddress = useMemo(() => {
    if (!existingCustomer) return null;
    if (selectedAddressId) {
      return existingCustomer.addresses.find((a) => a.id === selectedAddressId) ?? getPrimaryAddress(existingCustomer);
    }
    return getPrimaryAddress(existingCustomer);
  }, [existingCustomer, selectedAddressId]);

  const reset = useCallback(() => {
    setPhone('');
    setSelection(null);
    setDropdownOpen(false);
    setHighlightIndex(0);
    setName('');
    setEmail('');
    setAltPhone('');
    setContactMethod('Phone');
    setNewCustomerAddress('');
    setSelectedAddressId(null);
    setSource('Counter');
    setItems([]);
    setCustomerNotes('');
    setPrescriptionAttached(false);
    setUrgency('Normal');
    setDeliveryType('Counter Pickup');
    setDeliveryAddressId(null);
    setCourierCarrier(COURIER_CARRIERS[0]);
    setPickupBranchId(activeBranchId);
    setPreferredDeliveryTime(toDatetimeLocalValue());
    setErrors({});
    setOcrLoading(false);
    setDragOver(false);
    dragCounterRef.current = 0;
  }, [activeBranchId]);

  const selectExistingCustomer = useCallback((customer: Customer) => {
    const primary = getPrimaryAddress(customer);
    setPhone(normalizePhone(customer.phone));
    setSelection({ mode: 'existing', customer });
    setName(customer.name);
    setEmail(customer.email ?? '');
    setAltPhone(customer.alternatePhone ?? '');
    setContactMethod(customer.preferredContact);
    setSelectedAddressId(primary.id);
    setDeliveryAddressId(primary.id);
    setDropdownOpen(false);
    setErrors((e) => ({ ...e, phone: '', name: '', address: '' }));
  }, []);

  useEffect(() => {
    if (!open) return;
    reset();
    if (initialCustomer) {
      setPhone(normalizePhone(initialCustomer.phone));
      setName(initialCustomer.name);
      setEmail(initialCustomer.email ?? '');
      setContactMethod(initialCustomer.contactMethod ?? 'Phone');
      if (initialCustomer.customerId) {
        const found = data.customers.find((c) => c.id === initialCustomer.customerId);
        if (found) selectExistingCustomer(found);
      }
    }
    if (initialNotes) setCustomerNotes(initialNotes);
    setTimeout(() => phoneRef.current?.focus(), 100);
  }, [open, initialCustomer, initialNotes, data.customers, reset, selectExistingCustomer]);

  useEffect(() => {
    if (!exactMatch || !isValidPhone(phone)) return;
    selectExistingCustomer(exactMatch);
  }, [exactMatch, phone, selectExistingCustomer]);

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

  useEffect(() => {
    if (deliveryType === 'Home Delivery' && selectedAddressId && !deliveryAddressId) {
      setDeliveryAddressId(selectedAddressId);
    }
  }, [deliveryType, selectedAddressId, deliveryAddressId]);

  const applySelection = (opt: (typeof dropdownOptions)[number]) => {
    if (opt.type === 'existing') {
      selectExistingCustomer(opt.customer);
      return;
    }
    setSelection({ mode: 'new' });
    setName('');
    setEmail('');
    setAltPhone('');
    setNewCustomerAddress('');
    setSelectedAddressId(null);
    setDeliveryAddressId(null);
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

  const processOcrFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setOcrLoading(true);
    try {
      const extracted = await mockPrescriptionOcr(file);
      const enriched = extracted.map((item) => {
        const matches = searchProducts(item.productName, 1);
        const product = matches[0];
        if (!product) return item;
        return {
          ...item,
          productId: product.id,
          productName: product.name,
          strength: product.strength || item.strength,
          ...productSelectionFields(product),
        };
      });
      setItems((prev) => [...prev, ...enriched]);
      setPrescriptionAttached(true);
      toast.success(`${extracted.length} medicines extracted from prescription`);
    } catch {
      toast.error('Could not read prescription image');
    } finally {
      setOcrLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const onDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current += 1;
      if (e.dataTransfer?.types.includes('Files')) setDragOver(true);
    };

    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current -= 1;
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0;
        setDragOver(false);
      }
    };

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setDragOver(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) processOcrFile(file);
    };

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('drop', onDrop);

    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('drop', onDrop);
    };
  }, [open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!phone.trim()) e.phone = 'Customer mobile number is required';
    else if (!isValidPhone(phone)) e.phone = 'Enter a valid Indian phone number';
    if (!selection) e.phone = e.phone ?? 'Select a customer or register as new';
    if (selection?.mode === 'new' && !name.trim()) e.name = 'Customer name is required';
    if (selection?.mode === 'new' && deliveryType === 'Home Delivery' && !newCustomerAddress.trim()) {
      e.address = 'Address is required for home delivery';
    }
    if (items.length === 0 || items.every((i) => !i.productName.trim())) {
      e.items = 'Add at least one medicine manually or via prescription OCR';
    }
    items.forEach((item, idx) => {
      if (item.productName.trim() && item.quantity <= 0) e[`qty-${idx}`] = 'Quantity must be greater than zero';
    });
    if (deliveryType === 'Home Delivery' && existingCustomer && !deliveryAddressId) {
      e.deliveryAddress = 'Select a delivery address';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (status: RequirementStatus = 'New') => {
    if (!validate()) return;

    let customerId = existingCustomer?.id;
    if (!customerId) {
      const newCust = addCustomer({
        name: name.trim(),
        phone: normalizePhone(phone),
        alternatePhone: altPhone.trim() || undefined,
        email: email.trim() || undefined,
        address: newCustomerAddress.trim(),
        area: '',
        addresses: newCustomerAddress.trim()
          ? [{
              id: generateId('ADDR'),
              label: 'Home',
              addressLine: newCustomerAddress.trim(),
              area: '',
              city: 'Kochi',
              lat: 9.9312,
              lng: 76.2673,
              isPrimary: true,
            }]
          : [],
        preferredContact: contactMethod,
      });
      customerId = newCust.id;
    }

    const validItems = items.filter((i) => i.productName.trim());
    const deliveryRequired = deliveryType !== 'Counter Pickup';

    const newReq = addRequirement({
      customerId,
      customerName: name.trim(),
      phone: normalizePhone(phone),
      source,
      items: validItems,
      branchId: activeBranchId,
      assignedStaffId: data.staff.find((s) => s.branchId === activeBranchId)?.id ?? data.staff[0]?.id,
      customerNotes: customerNotes.trim() || undefined,
      prescriptionAttached,
      urgency,
      deliveryRequired,
      requirementDeliveryType: deliveryType,
      deliveryAddressId: deliveryType === 'Home Delivery' ? deliveryAddressId ?? selectedAddressId ?? undefined : undefined,
      courierCarrier: deliveryType === 'Courier' ? courierCarrier : undefined,
      pickupBranchId: deliveryType === 'Counter Pickup' ? pickupBranchId : undefined,
      preferredDeliveryTime: deliveryType !== 'Courier' ? preferredDeliveryTime || undefined : undefined,
    }, status);

    if (onCreated) onCreated(newReq.id);

    toast.success(status === 'Follow-up' ? 'Requirement saved for follow-up' : 'Requirement created successfully');
    reset();
    onClose();
  };

  const deliveryAddressDisplay = useMemo(() => {
    if (deliveryType !== 'Home Delivery') return null;
    if (existingCustomer && deliveryAddressId) {
      const addr = existingCustomer.addresses.find((a) => a.id === deliveryAddressId);
      return addr ? formatAddressOption(addr) : null;
    }
    if (selection?.mode === 'new') return newCustomerAddress;
    return selectedCustomerAddress ? formatAddressOption(selectedCustomerAddress) : null;
  }, [deliveryType, existingCustomer, deliveryAddressId, selection, newCustomerAddress, selectedCustomerAddress]);

  return (
    <>
      {open && dragOver && !ocrLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-primary/10 pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-brand-primary px-6 py-4 rounded-xl border-2 border-dashed border-brand-primary bg-white/90 shadow-lg">
            <ScanLine size={28} />
            <p className="text-sm font-medium">Drop prescription anywhere to extract medicines</p>
          </div>
        </div>
      )}
      <Modal open={open} onClose={() => { reset(); onClose(); }} title="New Requirement" size="xl">
      <div className="relative space-y-6 min-h-full">
        {/* Customer */}
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
                      'w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 border-b last:border-0',
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
                      </>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {existingCustomer && (
            <div className="mt-4 space-y-4 p-4 border border-brand-border rounded-lg bg-gray-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Customer Name</label>
                  <input className={cn(inputClass, 'bg-gray-100')} value={name} readOnly />
                </div>
                <div>
                  <label className={labelClass}>Mobile Number</label>
                  <input className={cn(inputClass, 'bg-gray-100')} value={phone} readOnly />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input className={cn(inputClass, 'bg-gray-100')} value={email || '—'} readOnly />
                </div>
                <div>
                  <label className={labelClass}>Alternate Number</label>
                  <input className={cn(inputClass, 'bg-gray-100')} value={altPhone || '—'} readOnly />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Address</label>
                  <select
                    className={inputClass}
                    value={selectedAddressId ?? ''}
                    onChange={(e) => {
                      setSelectedAddressId(e.target.value);
                      setDeliveryAddressId(e.target.value);
                    }}
                  >
                    {addressOptions.map((a) => (
                      <option key={a.id} value={a.id}>{formatAddressOption(a)}{a.isPrimary ? ' (Primary)' : ''}</option>
                    ))}
                  </select>
                </div>
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
                    onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
                  />
                  {errors.name && <p className="text-xs text-brand-primary mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Address</label>
                  <input
                    className={cn(inputClass, errors.address && 'border-brand-primary')}
                    value={newCustomerAddress}
                    onChange={(e) => {
                      setNewCustomerAddress(e.target.value);
                      setErrors((p) => ({ ...p, address: '' }));
                    }}
                    placeholder="Single line address — pin coordinates can be added later"
                  />
                  {errors.address && <p className="text-xs text-brand-primary mt-1">{errors.address}</p>}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Order Source & Prescription */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            <div>
              <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] text-brand-text mb-3 uppercase tracking-wide">
                Order Source
              </h3>
              <div className="flex flex-col gap-2">
                {(['Counter', 'Phone', 'WhatsApp'] as Source[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSource(s)}
                    className={cn(
                      'w-full px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors text-left',
                      source === s
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-white border-brand-border hover:bg-gray-50',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] text-brand-text mb-3 uppercase tracking-wide">
                Requirements
              </h3>
              <button
                type="button"
                disabled={ocrLoading}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'flex-1 border-2 border-dashed rounded-lg px-3 py-4 flex flex-col items-center justify-center text-center transition-colors min-h-[132px]',
                  dragOver ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-border bg-gray-50/50 hover:bg-gray-50',
                  ocrLoading && 'opacity-60 pointer-events-none',
                )}
              >
                {ocrLoading ? (
                  <div className="flex flex-col items-center gap-1.5 text-brand-text-secondary">
                    <Loader2 size={20} className="animate-spin text-brand-primary" />
                    <p className="text-xs">Reading prescription…</p>
                  </div>
                ) : (
                  <>
                    <ScanLine size={20} className="text-brand-text-secondary/60" />
                    <p className="text-xs text-brand-text-secondary mt-1.5 mb-2 leading-snug">
                      Drop prescription or click to upload
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-primary border border-brand-border bg-white rounded-md px-2.5 py-1">
                      <Upload size={12} /> Upload
                    </span>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) processOcrFile(file);
                  e.target.value = '';
                }}
              />
            </div>
          </div>

          <div className="mt-4">
            <RequirementMedicineEditor
              items={items}
              onChange={setItems}
              error={errors.items}
            />
          </div>
        </section>

        {/* Delivery & extras */}
        <section>
          <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] text-brand-text mb-3 uppercase tracking-wide">
            Additional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Customer Notes</label>
              <textarea className={inputClass} rows={2} value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="rx" checked={prescriptionAttached} onChange={(e) => setPrescriptionAttached(e.target.checked)} />
              <label htmlFor="rx" className="text-sm">Prescription Attached</label>
            </div>
            <div>
              <label className={labelClass}>Urgency</label>
              <select className={inputClass} value={urgency} onChange={(e) => setUrgency(e.target.value as Urgency)}>
                {(['Normal', 'Urgent', 'Critical'] as Urgency[]).map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Delivery Type</label>
              <select
                className={inputClass}
                value={deliveryType}
                onChange={(e) => {
                  const type = e.target.value as RequirementDeliveryType;
                  setDeliveryType(type);
                  if (type === 'Home Delivery' && selectedAddressId) setDeliveryAddressId(selectedAddressId);
                  if (type === 'Counter Pickup') setPickupBranchId(activeBranchId);
                  if (type !== 'Counter Pickup' && type !== 'Home Delivery') {
                    setPreferredDeliveryTime(toDatetimeLocalValue());
                  }
                }}
              >
                {(['Home Delivery', 'Courier', 'Counter Pickup'] as RequirementDeliveryType[]).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {deliveryType === 'Home Delivery' && (
              <>
                <div className="md:col-span-2">
                  <label className={labelClass}>Delivery Address</label>
                  {existingCustomer ? (
                    <select
                      className={cn(inputClass, errors.deliveryAddress && 'border-brand-primary')}
                      value={deliveryAddressId ?? selectedAddressId ?? ''}
                      onChange={(e) => setDeliveryAddressId(e.target.value)}
                    >
                      {addressOptions.map((a) => (
                        <option key={a.id} value={a.id}>{formatAddressOption(a)}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className={inputClass}
                      value={newCustomerAddress}
                      onChange={(e) => setNewCustomerAddress(e.target.value)}
                      placeholder="Delivery address"
                    />
                  )}
                  {deliveryAddressDisplay && existingCustomer && (
                    <p className="text-xs text-brand-text-secondary mt-1">{deliveryAddressDisplay}</p>
                  )}
                  {errors.deliveryAddress && <p className="text-xs text-brand-primary mt-1">{errors.deliveryAddress}</p>}
                </div>
                <div>
                  <label className={labelClass}>Expected Delivery (ETA)</label>
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={preferredDeliveryTime}
                    onChange={(e) => setPreferredDeliveryTime(e.target.value)}
                  />
                </div>
              </>
            )}

            {deliveryType === 'Courier' && (
              <div>
                <label className={labelClass}>Courier Carrier</label>
                <select className={inputClass} value={courierCarrier} onChange={(e) => setCourierCarrier(e.target.value)}>
                  {COURIER_CARRIERS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            {deliveryType === 'Counter Pickup' && (
              <>
                <div>
                  <label className={labelClass}>Pickup Branch</label>
                  <select className={inputClass} value={pickupBranchId} onChange={(e) => setPickupBranchId(e.target.value)}>
                    {branches.filter((b) => b.status === 'Active').map((b) => (
                      <option key={b.id} value={b.id}>{b.name} — {b.location}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Expected Pickup (ETA)</label>
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={preferredDeliveryTime}
                    onChange={(e) => setPreferredDeliveryTime(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </section>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
          <Button variant="outline" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button variant="secondary" onClick={() => handleSave('Follow-up')}>Follow Up</Button>
          <Button onClick={() => handleSave('New')}>Save Requirement</Button>
        </div>
      </div>
    </Modal>
    </>
  );
}
