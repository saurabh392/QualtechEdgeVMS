import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VendorProvider } from './context/VendorContext';
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
import { DocumentList } from './pages/Documents/DocumentList';
import { UploadDocument } from './pages/Documents/UploadDocument';
import { DocumentApprovals } from './pages/Documents/DocumentApprovals';
import { ExpiryTracker } from './pages/Documents/ExpiryTracker';

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
import { ApprovalDetail } from './pages/KYC/ApprovalDetail';

import { ContractsDashboard } from './pages/Contracts/ContractsDashboard';
import { CreateContract } from './pages/Contracts/CreateContract';
import { ContractApprovals } from './pages/Contracts/ContractApprovals';
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

import { FinanceDashboard } from './pages/Finance/FinanceDashboard';
import { TDSApprovals } from './pages/Finance/TDSApprovals';
import { BankReconciliation } from './pages/Finance/BankReconciliation';

import { MISDashboard } from './pages/Reports/MISDashboard';
import { PerformanceAnalytics } from './pages/Reports/PerformanceAnalytics';
import { AIInsights } from './pages/Reports/AIInsights';

import { GeneralSettings } from './pages/Settings/GeneralSettings';
import { UsersRoles } from './pages/Settings/UsersRoles';
import { SystemPreferences } from './pages/Settings/SystemPreferences';

import { VendorLayout } from './components/VendorLayout/VendorLayout';
import { VendorOverview } from './pages/VendorPortal/VendorOverview';
import { VendorProfile } from './pages/VendorPortal/VendorProfile';
import { VendorDocuments } from './pages/VendorPortal/VendorDocuments';
import { VendorKYC } from './pages/VendorPortal/VendorKYC';
import { VendorContracts } from './pages/VendorPortal/VendorContracts';
import { VendorPOs } from './pages/VendorPortal/VendorPOs';
import { VendorInvoices } from './pages/VendorPortal/VendorInvoices';
import { VendorPayments } from './pages/VendorPortal/VendorPayments';
import { VendorHelpdesk } from './pages/VendorPortal/VendorHelpdesk';
import { VendorSettings } from './pages/VendorPortal/VendorSettings';

import { CatalogueDashboard } from './pages/Catalogue/CatalogueDashboard';
import { ItemMaster } from './pages/Catalogue/ItemMaster';
import { ServiceMaster } from './pages/Catalogue/ServiceMaster';
import { CatalogueApprovals } from './pages/Catalogue/CatalogueApprovals';
import { PublishCatalogue } from './pages/Catalogue/PublishCatalogue';

function App() {
  return (
    <AuthProvider>
      <VendorProvider>
        <BrowserRouter>
          <VendorFilterProvider>
            <DocumentFilterProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/auth/2fa" element={<TwoFactorAuth />} />

                {/* Protected — requires login */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/access-denied" element={<AccessDenied />} />

                    {/* Internal modules: ADMIN, PROCUREMENT, COMPLIANCE, FINANCE */}
                    <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'PROCUREMENT', 'COMPLIANCE', 'FINANCE']} />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/administrator/dashboard" element={<Dashboard />} />
                      <Route path="/procurement/dashboard" element={<Dashboard />} />
                      <Route path="/compliance/dashboard" element={<Dashboard />} />

                      {/* Finance — Dashboard restricted to FINANCE role only */}
                      <Route element={<ProtectedRoute allowedRoles={['FINANCE']} />}>
                        <Route path="/finance" element={<Navigate to="/finance/dashboard" replace />} />
                        <Route path="/finance/dashboard" element={<FinanceDashboard />} />
                      </Route>

                      {/* Finance — TDS & Reconciliation accessible to all internal roles */}
                      <Route path="/finance/tds" element={<TDSApprovals />} />
                      <Route path="/finance/reconciliation" element={<BankReconciliation />} />

                      {/* Vendors */}
                      <Route path="/vendors" element={<VendorList />} />
                      <Route path="/vendors/add" element={<AddVendor />} />

                      {/* Documents */}
                      <Route path="/documents" element={<DocumentList />} />
                      <Route path="/documents/upload" element={<UploadDocument />} />
                      <Route path="/documents/approvals" element={<DocumentApprovals />} />
                      <Route path="/documents/expiry" element={<ExpiryTracker />} />

                      {/* KYC */}
                      <Route path="/kyc" element={<Navigate to="/kyc/dashboard" replace />} />
                      <Route path="/kyc/dashboard" element={<KycDashboardNew />} />
                      <Route path="/kyc/screening" element={<ScreeningRisk />} />
                      <Route path="/kyc/reviews" element={<ReviewsApprovals />} />
                      <Route path="/kyc/approval/:vendorId" element={<ApprovalDetail />} />
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

                      {/* Catalogue */}
                      <Route path="/catalogue" element={<Navigate to="/catalogue/dashboard" replace />} />
                      <Route path="/catalogue/dashboard" element={<CatalogueDashboard />} />
                      <Route path="/catalogue/items" element={<ItemMaster />} />
                      <Route path="/catalogue/services" element={<ServiceMaster />} />
                      <Route path="/catalogue/approvals" element={<CatalogueApprovals />} />
                      <Route path="/catalogue/approval-workflow" element={<CatalogueApprovals />} />
                      <Route path="/catalogue/published" element={<PublishCatalogue />} />
                      <Route path="/catalogue/publish" element={<PublishCatalogue />} />

                      {/* Contracts */}
                      <Route path="/contracts" element={<Navigate to="/contracts/dashboard" replace />} />
                      <Route path="/contracts/dashboard" element={<ContractsDashboard />} />
                      <Route path="/contracts/repository" element={<Navigate to="/contracts/dashboard" replace />} />
                      <Route path="/contracts/create" element={<CreateContract />} />
                      <Route path="/contracts/approvals" element={<ContractApprovals />} />

                      <Route path="/contracts/renewals" element={<Renewals />} />

                      {/* Purchase Orders */}
                      <Route path="/purchase-orders" element={<Navigate to="/purchase-orders/dashboard" replace />} />
                      <Route path="/purchase-orders/dashboard" element={<PODashboard />} />
                      <Route path="/purchase-orders/create" element={<CreatePO />} />
                      <Route path="/purchase-orders/list" element={<POList />} />
                      <Route path="/purchase-orders/approvals" element={<POApprovals />} />

                      {/* Invoices */}
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

                      {/* Payments */}
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

                      {/* Reports */}
                      <Route path="/reports" element={<Navigate to="/reports/dashboard" replace />} />
                      <Route path="/reports/dashboard" element={<MISDashboard />} />
                      <Route path="/reports/performance" element={<PerformanceAnalytics />} />
                      <Route path="/reports/insights" element={<AIInsights />} />

                      {/* Settings */}
                      <Route path="/settings" element={<Navigate to="/settings/general" replace />} />
                      <Route path="/settings/general" element={<GeneralSettings />} />
                      <Route path="/settings/users" element={<UsersRoles />} />
                      <Route path="/settings/preferences" element={<SystemPreferences />} />
                      <Route path="/settings/dashboard" element={<Navigate to="/settings/general" replace />} />
                      <Route path="/settings/org" element={<Navigate to="/settings/general" replace />} />
                      <Route path="/settings/roles" element={<Navigate to="/settings/users" replace />} />
                      <Route path="/settings/workflow" element={<Navigate to="/settings/preferences" replace />} />
                      <Route path="/settings/security" element={<Navigate to="/settings/preferences" replace />} />
                      <Route path="/settings/integrations" element={<Navigate to="/settings/preferences" replace />} />
                      <Route path="/settings/publish" element={<Navigate to="/settings/general" replace />} />
                    </Route>

                    {/* Legacy vendor portal redirects */}
                    <Route path="/vendor-portal" element={<Navigate to="/vendor/overview" replace />} />
                    <Route path="/vendor/dashboard" element={<Navigate to="/vendor/overview" replace />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Route>
                </Route>

                {/* Vendor Portal — dedicated layout, VENDOR role only */}
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
              </Routes>
            </DocumentFilterProvider>
          </VendorFilterProvider>
        </BrowserRouter>
      </VendorProvider>
    </AuthProvider>
  );
}

export default App;
