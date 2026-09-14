import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, XCircle, ClipboardList } from 'lucide-react';
import { useEnquiries, useCustomers, useData } from '@/store/DataContext';
import { useBranch } from '@/store/BranchContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Timeline } from '@/components/ui/Timeline';
import { RequirementForm } from '@/components/requirements/RequirementForm';
import { getEnquiryStatusVariant } from '@/utils/statusHelpers';
import { formatDateTime } from '@/utils/format';

export function EnquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enquiries, closeEnquiry, linkEnquiryToRequirement } = useEnquiries();
  const { customers } = useCustomers();
  const { data } = useData();
  const { activeBranchId } = useBranch();
  const [showRequirementForm, setShowRequirementForm] = useState(false);

  const enquiry = enquiries.find((e) => e.id === id);
  const customer = enquiry ? customers.find((c) => c.id === enquiry.customerId) : undefined;

  if (!enquiry) {
    return (
      <div className="text-center py-16">
        <p className="text-brand-text-secondary mb-4">Enquiry not found</p>
        <Button variant="outline" onClick={() => navigate('/enquiries')}>
          <ArrowLeft size={16} /> Back to Enquiries
        </Button>
      </div>
    );
  }

  const queryText = enquiry.queryCustom ?? enquiry.query;
  const isOpen = enquiry.status === 'Open';

  const handleClose = () => {
    closeEnquiry(enquiry.id, data.staff.find((s) => s.branchId === activeBranchId)?.id);
    toast.success('Enquiry closed');
  };

  const handleCreateRequirement = () => {
    setShowRequirementForm(true);
  };

  const handleRequirementCreated = (requirementId: string) => {
    linkEnquiryToRequirement(enquiry.id, requirementId, data.staff.find((s) => s.branchId === activeBranchId)?.id);
    toast.success('Requirement created from enquiry');
    navigate(`/requirements/${requirementId}`);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={enquiry.id}
        breadcrumbs={[
          { label: 'Enquiries', path: '/enquiries' },
          { label: enquiry.id },
        ]}
        actions={
          <div className="flex gap-2">
            {isOpen && (
              <>
                <Button onClick={handleCreateRequirement}>
                  <ClipboardList size={16} /> Create Requirement
                </Button>
                <Button variant="danger" onClick={handleClose}>
                  <XCircle size={16} /> Close Enquiry
                </Button>
              </>
            )}
            {enquiry.status === 'Converted' && enquiry.requirementId && (
              <Button variant="outline" onClick={() => navigate(`/requirements/${enquiry.requirementId}`)}>
                <ClipboardList size={16} /> View Requirement
              </Button>
            )}
          </div>
        }
      />

      <div className="flex items-center gap-3 mb-6">
        <StatusBadge label={enquiry.status} variant={getEnquiryStatusVariant(enquiry.status)} />
        <StatusBadge label={enquiry.department} variant="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Customer</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-brand-text-secondary">Name</span><p className="font-medium">{enquiry.customerName}</p></div>
              <div><span className="text-brand-text-secondary">Mobile</span><p className="font-medium">{enquiry.phone}</p></div>
              {enquiry.whatsappPhone && (
                <div><span className="text-brand-text-secondary">WhatsApp</span><p className="font-medium">{enquiry.whatsappPhone}</p></div>
              )}
              {customer?.email && (
                <div><span className="text-brand-text-secondary">Email</span><p className="font-medium">{customer.email}</p></div>
              )}
              {customer && (
                <div>
                  <span className="text-brand-text-secondary">Customer Profile</span>
                  <p>
                    <button
                      type="button"
                      className="font-medium text-brand-cyan-dark hover:underline"
                      onClick={() => navigate(`/customers/${customer.id}`)}
                    >
                      View {customer.id}
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Enquiry Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-brand-text-secondary">Department</span><p className="font-medium">{enquiry.department}</p></div>
              <div><span className="text-brand-text-secondary">Query Type</span><p className="font-medium">{enquiry.query}</p></div>
              <div className="col-span-2">
                <span className="text-brand-text-secondary">Query</span>
                <p className="font-medium mt-1">{queryText}</p>
              </div>
              <div><span className="text-brand-text-secondary">Created</span><p className="font-medium">{formatDateTime(enquiry.createdAt)}</p></div>
              {enquiry.closedAt && (
                <div><span className="text-brand-text-secondary">Closed</span><p className="font-medium">{formatDateTime(enquiry.closedAt)}</p></div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[var(--radius-brand)] border border-brand-border p-5 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-4">Activity</h3>
            <Timeline events={enquiry.timeline} />
          </div>
        </div>
      </div>

      <RequirementForm
        open={showRequirementForm}
        onClose={() => setShowRequirementForm(false)}
        initialCustomer={{
          customerId: enquiry.customerId,
          name: enquiry.customerName,
          phone: enquiry.phone,
          email: customer?.email,
          address: customer?.address,
          area: customer?.area,
          contactMethod: customer?.preferredContact,
        }}
        initialNotes={`From enquiry ${enquiry.id}: ${queryText}`}
        onCreated={handleRequirementCreated}
      />
    </div>
  );
}
