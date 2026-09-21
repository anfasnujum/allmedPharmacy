import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import type { ReactNode } from 'react';
import { DataProvider, useData } from '@/store/DataContext';
import { BranchProvider } from '@/store/BranchContext';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { RequirementsPage } from '@/pages/RequirementsPage';
import { RequirementDetailPage } from '@/pages/RequirementDetailPage';
import { RequirementCreateOrderPage } from '@/pages/RequirementCreateOrderPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { OrderDetailPage } from '@/pages/OrderDetailPage';
import { TripsPage } from '@/pages/TripsPage';
import { TripDetailPage } from '@/pages/TripDetailPage';
import { CreateTripPage } from '@/pages/CreateTripPage';
import { CollectionsPage } from '@/pages/CollectionsPage';
import { CollectionDetailPage } from '@/pages/CollectionDetailPage';
import { CompletedPage } from '@/pages/CompletedPage';
import { CompletedDetailPage } from '@/pages/CompletedDetailPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { CustomerDetailPage } from '@/pages/CustomerDetailPage';
import { EnquiriesPage } from '@/pages/EnquiriesPage';
import { EnquiryDetailPage } from '@/pages/EnquiryDetailPage';
import { AgentLayout } from '@/agent/layout/AgentLayout';
import { AgentTripsPage } from '@/agent/pages/AgentTripsPage';
import { AgentTripPage } from '@/agent/pages/AgentTripPage';
import { LoginPage } from '@/pages/LoginPage';
import { Button } from '@/components/ui/Button';
import { useCurrentStaff } from '@/constants/session';

function Splash({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-brand-background flex items-center justify-center">
      <p className="text-sm text-brand-text-secondary">{message}</p>
    </div>
  );
}

function StaffGate({ children }: { children: ReactNode }) {
  const { configured, user, signOut } = useAuth();
  const { loading, loadError } = useData();
  const staff = useCurrentStaff();

  if (loading) return <Splash message="Loading operations data…" />;

  if (loadError) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <p className="font-semibold text-brand-dark">Could not reach Supabase</p>
          <p className="text-sm text-brand-text-secondary">{loadError}</p>
          <p className="text-xs text-brand-text-secondary">
            Confirm the schema is applied and VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set.
          </p>
          <Button variant="outline" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  if (configured && user?.email && !staff) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <p className="font-semibold text-brand-dark">Account not linked</p>
          <p className="text-sm text-brand-text-secondary">
            {user.email} is not on any staff row. In Supabase, set that email on a{' '}
            <code>staff</code> record, then sign in again.
          </p>
          <p className="text-xs text-brand-text-secondary">
            Demo emails look like priya.nair@allmed.local if you seeded the sample staff list.
          </p>
          <Button onClick={() => void signOut()}>Sign out</Button>
        </div>
      </div>
    );
  }

  return children;
}

function AppRoutes() {
  const { configured, loading, session } = useAuth();

  if (loading) return <Splash message="Checking session…" />;
  if (configured && !session) return <LoginPage />;

  return (
    <DataProvider>
      <StaffGate>
        <BranchProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/agent" element={<AgentLayout />}>
                <Route index element={<AgentTripsPage />} />
                <Route path="trips/:id" element={<AgentTripPage />} />
              </Route>

              <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/requirements?status=New" replace />} />
                <Route path="/enquiries" element={<EnquiriesPage />} />
                <Route path="/enquiries/:id" element={<EnquiryDetailPage />} />
                <Route path="/requirements" element={<RequirementsPage />} />
                <Route path="/requirements/:id" element={<RequirementDetailPage />} />
                <Route path="/requirements/:id/create-order" element={<RequirementCreateOrderPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />
                <Route path="/trips" element={<TripsPage />} />
                <Route path="/trips/create" element={<CreateTripPage />} />
                <Route path="/trips/:id" element={<TripDetailPage />} />
                <Route path="/deliveries" element={<Navigate to="/trips" replace />} />
                <Route path="/deliveries/:id" element={<Navigate to="/trips" replace />} />
                <Route path="/collections" element={<CollectionsPage />} />
                <Route path="/collections/:id" element={<CollectionDetailPage />} />
                <Route path="/completed" element={<CompletedPage />} />
                <Route path="/completed/:id" element={<CompletedDetailPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/customers/:id" element={<CustomerDetailPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </BranchProvider>
      </StaffGate>
    </DataProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  );
}
