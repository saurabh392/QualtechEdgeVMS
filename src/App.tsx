import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VendorFilterProvider } from './context/VendorFilterContext';
import { DocumentFilterProvider } from './context/DocumentFilterContext';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { Layout } from './components/Layout/Layout';
import { Login } from './pages/Login/Login';
import { TwoFactorAuth } from './pages/Login/TwoFactorAuth';
import { AccessDenied } from './pages/Login/AccessDenied';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { VendorList } from './pages/Vendors/VendorList';
import { AddVendor } from './pages/Vendors/AddVendor';
import { VendorApprovals } from './pages/Vendors/VendorApprovals';
import { DocumentList } from './pages/Documents/DocumentList';
import { UploadDocument } from './pages/Documents/UploadDocument';
import { DocumentApprovals } from './pages/Documents/DocumentApprovals';
import { ExpiryTracker } from './pages/Documents/ExpiryTracker';

import { KycDetail } from './pages/KYC/KycDetail';
import { KycApprovals } from './pages/KYC/KycApprovals';
import { KycRiskAssessment } from './pages/KYC/KycRiskAssessment';
import { KycSanctionsScreening } from './pages/KYC/KycSanctionsScreening';
import { KycBlacklistCheck } from './pages/KYC/KycBlacklistCheck';
import { KycPepScreening } from './pages/KYC/KycPepScreening';
import { KycAdverseMedia } from './pages/KYC/KycAdverseMedia';
import { KycShellCheck } from './pages/KYC/KycShellCheck';
import { KycReKycScheduling } from './pages/KYC/KycReKycScheduling';
import { KycDashboardNew } from './pages/KYC/KycDashboardNew';
import { ScreeningRisk } from './pages/KYC/ScreeningRisk';
import { ReviewsApprovals } from './pages/KYC/ReviewsApprovals';
import { ContractsDashboard } from './pages/Contracts/ContractsDashboard';
import { CreateContract } from './pages/Contracts/CreateContract';
import { ContractApprovals } from './pages/Contracts/ContractApprovals';
import { ClauseLibrary } from './pages/Contracts/ClauseLibrary';
import { Renewals } from './pages/Contracts/Renewals';
import { PODashboard } from './pages/PurchaseOrders/PODashboard';
import { POList } from './pages/PurchaseOrders/POList';
import { CreatePO } from './pages/PurchaseOrders/CreatePO';
import { POApprovals } from './pages/PurchaseOrders/POApprovals';
import { POReceipt } from './pages/PurchaseOrders/POReceipt';
import { POThreeWayMatch } from './pages/PurchaseOrders/POThreeWayMatch';
import { InvoiceDashboard } from './pages/Invoices/InvoiceDashboard';
import { UploadInvoice } from './pages/Invoices/UploadInvoice';
import { InvoiceList } from './pages/Invoices/InvoiceList';
import { InvoiceApprovals } from './pages/Invoices/InvoiceApprovals';
import { PaymentDashboard } from './pages/Payments/PaymentDashboard';
import { PaymentProcessing } from './pages/Payments/PaymentProcessing';
import { PaymentList } from './pages/Payments/PaymentList';
import { PaymentApprovals } from './pages/Payments/PaymentApprovals';
import { MISDashboard } from './pages/Reports/MISDashboard';
import { PerformanceAnalytics } from './pages/Reports/PerformanceAnalytics';
import { AIInsights } from './pages/Reports/AIInsights';



import { GeneralSettings } from './pages/Settings/GeneralSettings';
import { UsersRoles } from './pages/Settings/UsersRoles';
import { SystemPreferences } from './pages/Settings/SystemPreferences';
import { VendorLayout } from './components/VendorLayout/VendorLayout';
import { VendorOverview } from './pages/VendorPortal/VendorOverview';
import { VendorDocuments } from './pages/VendorPortal/VendorDocuments';
import { VendorKYC } from './pages/VendorPortal/VendorKYC';
import { VendorContracts } from './pages/VendorPortal/VendorContracts';
import { VendorPOs } from './pages/VendorPortal/VendorPOs';
import { VendorInvoices } from './pages/VendorPortal/VendorInvoices';
import { VendorPayments } from './pages/VendorPortal/VendorPayments';
import { VendorProfile } from './pages/VendorPortal/VendorProfile';
import { VendorHelpdesk } from './pages/VendorPortal/VendorHelpdesk';
import { VendorSettings } from './pages/VendorPortal/VendorSettings';

import { CatalogueDashboard } from './pages/Catalogue/CatalogueDashboard';
import { ItemMaster } from './pages/Catalogue/ItemMaster';
import { ServiceMaster } from './pages/Catalogue/ServiceMaster';
import { VendorMapping } from './pages/Catalogue/VendorMapping';
import { CategoryManagement } from './pages/Catalogue/CategoryManagement';
import { HsnSacMapping } from './pages/Catalogue/HsnSacMapping';
import { UomManagement } from './pages/Catalogue/UomManagement';
import { RatePriceReference } from './pages/Catalogue/RatePriceReference';
import { QualityStandards } from './pages/Catalogue/QualityStandards';
import { CatalogueApprovals } from './pages/Catalogue/CatalogueApprovals';
import { PublishCatalogue } from './pages/Catalogue/PublishCatalogue';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <VendorFilterProvider>
          <DocumentFilterProvider>
            <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/2fa" element={<TwoFactorAuth />} />
          
          {/* Main layout guarded by general login check */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/access-denied" element={<AccessDenied />} />

              {/* Internal Procurement Modules: restricted to ADMIN, PROCUREMENT, COMPLIANCE, FINANCE */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'PROCUREMENT', 'COMPLIANCE', 'FINANCE']} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/administrator/dashboard" element={<Dashboard />} />
                <Route path="/procurement/dashboard" element={<Dashboard />} />
                <Route path="/compliance/dashboard" element={<Dashboard />} />
                <Route path="/finance/dashboard" element={<Dashboard />} />
                <Route path="/vendors" element={<VendorList />} />
                <Route path="/vendors/add" element={<AddVendor />} />
                <Route path="/vendors/approvals" element={<VendorApprovals />} />
                <Route path="/documents" element={<DocumentList />} />
                <Route path="/documents/upload" element={<UploadDocument />} />
                <Route path="/documents/approvals" element={<DocumentApprovals />} />
                <Route path="/documents/expiry" element={<ExpiryTracker />} />
                <Route path="/kyc" element={<Navigate to="/kyc/dashboard" replace />} />
                <Route path="/kyc/dashboard" element={<KycDashboardNew />} />
                <Route path="/kyc/screening" element={<ScreeningRisk />} />
                <Route path="/kyc/reviews" element={<ReviewsApprovals />} />
                <Route path="/kyc/:id" element={<KycDetail />} />
                <Route path="/kyc/approvals" element={<KycApprovals />} />
                <Route path="/kyc/risk" element={<KycRiskAssessment />} />
                <Route path="/kyc/risk-assessment" element={<KycRiskAssessment />} />
                <Route path="/kyc/sanctions" element={<KycSanctionsScreening />} />
                <Route path="/kyc/sanctions-screening" element={<KycSanctionsScreening />} />
                <Route path="/kyc/blacklist" element={<KycBlacklistCheck />} />
                <Route path="/kyc/blacklist-check" element={<KycBlacklistCheck />} />
                <Route path="/kyc/pep" element={<KycPepScreening />} />
                <Route path="/kyc/pep-screening" element={<KycPepScreening />} />
                <Route path="/kyc/media" element={<KycAdverseMedia />} />
                <Route path="/kyc/adverse-media" element={<KycAdverseMedia />} />
                <Route path="/kyc/shell" element={<KycShellCheck />} />
                <Route path="/kyc/shell-company-check" element={<KycShellCheck />} />
                <Route path="/kyc/schedule" element={<KycReKycScheduling />} />
                <Route path="/kyc/re-kyc" element={<KycReKycScheduling />} />
                
                <Route path="/catalogue" element={<Navigate to="/catalogue/dashboard" replace />} />
                <Route path="/catalogue/dashboard" element={<CatalogueDashboard />} />
                <Route path="/catalogue/items" element={<ItemMaster />} />
                <Route path="/catalogue/services" element={<ServiceMaster />} />
                <Route path="/catalogue/vendor-mapping" element={<VendorMapping />} />
                <Route path="/catalogue/categories" element={<CategoryManagement />} />
                <Route path="/catalogue/hsn-sac" element={<HsnSacMapping />} />
                <Route path="/catalogue/uom" element={<UomManagement />} />
                <Route path="/catalogue/rates" element={<RatePriceReference />} />
                <Route path="/catalogue/pricing" element={<RatePriceReference />} />
                <Route path="/catalogue/quality" element={<QualityStandards />} />
                <Route path="/catalogue/quality-standards" element={<QualityStandards />} />
                <Route path="/catalogue/approvals" element={<CatalogueApprovals />} />
                <Route path="/catalogue/approval-workflow" element={<CatalogueApprovals />} />
                <Route path="/catalogue/published" element={<PublishCatalogue />} />
                <Route path="/catalogue/publish" element={<PublishCatalogue />} />

                <Route path="/contracts" element={<Navigate to="/contracts/dashboard" replace />} />
                <Route path="/contracts/dashboard" element={<ContractsDashboard />} />
                <Route path="/contracts/repository" element={<Navigate to="/contracts/dashboard" replace />} />
                <Route path="/contracts/create" element={<CreateContract />} />
                <Route path="/contracts/approvals" element={<ContractApprovals />} />
                <Route path="/contracts/clauses" element={<ClauseLibrary />} />
                <Route path="/contracts/renewals" element={<Renewals />} />

                <Route path="/purchase-orders" element={<Navigate to="/purchase-orders/dashboard" replace />} />
                <Route path="/purchase-orders/dashboard" element={<PODashboard />} />
                <Route path="/purchase-orders/create" element={<CreatePO />} />
                <Route path="/purchase-orders/list" element={<POList />} />
                <Route path="/purchase-orders/approvals" element={<POApprovals />} />

                <Route path="/invoices" element={<Navigate to="/invoices/dashboard" replace />} />
                <Route path="/invoices/dashboard" element={<InvoiceDashboard />} />
                <Route path="/invoices/upload" element={<UploadInvoice />} />
                <Route path="/invoices/list" element={<InvoiceList />} />
                <Route path="/invoices/grn" element={<POReceipt />} />
                <Route path="/invoices/match" element={<POThreeWayMatch />} />
                <Route path="/invoices/approvals" element={<InvoiceApprovals />} />
                <Route path="/invoices/gst" element={<InvoiceDashboard />} />
                <Route path="/invoices/exceptions" element={<InvoiceDashboard />} />
                <Route path="/invoices/analytics" element={<InvoiceDashboard />} />

                <Route path="/payments" element={<Navigate to="/payments/dashboard" replace />} />
                <Route path="/payments/dashboard" element={<PaymentDashboard />} />
                <Route path="/payments/processing" element={<PaymentProcessing />} />
                <Route path="/payments/list" element={<PaymentList />} />
                <Route path="/payments/approvals" element={<PaymentApprovals />} />
                <Route path="/payments/recon" element={<PaymentDashboard />} />
                <Route path="/payments/msme" element={<PaymentDashboard />} />
                <Route path="/payments/tax" element={<PaymentDashboard />} />
                <Route path="/payments/failed" element={<PaymentDashboard />} />
                <Route path="/payments/analytics" element={<PaymentDashboard />} />

                <Route path="/reports" element={<Navigate to="/reports/dashboard" replace />} />
                <Route path="/reports/dashboard"   element={<MISDashboard />} />
                <Route path="/reports/performance" element={<PerformanceAnalytics />} />
                <Route path="/reports/insights"    element={<AIInsights />} />

                {/* New simplified Settings routes */}
                <Route path="/settings" element={<Navigate to="/settings/general" replace />} />
                <Route path="/settings/general" element={<GeneralSettings />} />
                <Route path="/settings/users" element={<UsersRoles />} />
                <Route path="/settings/preferences" element={<SystemPreferences />} />

                {/* Legacy Settings routes — redirect to new simplified pages */}
                <Route path="/settings/dashboard" element={<Navigate to="/settings/general" replace />} />
                <Route path="/settings/org" element={<Navigate to="/settings/general" replace />} />
                <Route path="/settings/roles" element={<Navigate to="/settings/users" replace />} />
                <Route path="/settings/workflow" element={<Navigate to="/settings/preferences" replace />} />
                <Route path="/settings/security" element={<Navigate to="/settings/preferences" replace />} />
                <Route path="/settings/integrations" element={<Navigate to="/settings/preferences" replace />} />
                <Route path="/settings/publish" element={<Navigate to="/settings/general" replace />} />
              </Route>

              {/* Legacy vendor portal redirect */}
              <Route path="/vendor-portal" element={<Navigate to="/vendor/overview" replace />} />
              <Route path="/vendor/dashboard" element={<Navigate to="/vendor/overview" replace />} />


              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          {/* ===== VENDOR PORTAL — dedicated layout ===== */}
          <Route element={<ProtectedRoute allowedRoles={['VENDOR']} />}>
            <Route element={<VendorLayout />}>
              <Route path="/vendor/overview" element={<VendorOverview />} />
              <Route path="/vendor/profile" element={<VendorProfile />} />
              <Route path="/vendor/documents" element={<VendorDocuments />} />
              <Route path="/vendor/kyc" element={<VendorKYC />} />
              <Route path="/vendor/contracts" element={<VendorContracts />} />
              <Route path="/vendor/purchase-orders" element={<VendorPOs />} />
              <Route path="/vendor/invoices" element={<VendorInvoices />} />
              <Route path="/vendor/payments" element={<VendorPayments />} />
              <Route path="/vendor/helpdesk" element={<VendorHelpdesk />} />
              <Route path="/vendor/settings" element={<VendorSettings />} />
              <Route path="/vendor/*" element={<Navigate to="/vendor/overview" replace />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </DocumentFilterProvider>
        </VendorFilterProvider>
    </BrowserRouter>
  </AuthProvider>
);
}

export default App;
