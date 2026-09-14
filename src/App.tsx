import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { DataProvider } from '@/store/DataContext';
import { BranchProvider } from '@/store/BranchContext';
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

export default function App() {
  return (
    <DataProvider>
      <BranchProvider>
        <BrowserRouter>
        <Routes>
          {/* Delivery agent mobile app — same data layer, separate URL */}
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
      <Toaster position="top-right" richColors closeButton />
    </DataProvider>
  );
}
