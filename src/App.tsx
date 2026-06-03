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
import { KycDashboard } from './pages/KYC/KycDashboard';
import { KycDetail } from './pages/KYC/KycDetail';
import { KycApprovals } from './pages/KYC/KycApprovals';
import { KycRiskAssessment } from './pages/KYC/KycRiskAssessment';
import { KycSanctionsScreening } from './pages/KYC/KycSanctionsScreening';
import { KycBlacklistCheck } from './pages/KYC/KycBlacklistCheck';
import { KycPepScreening } from './pages/KYC/KycPepScreening';
import { KycAdverseMedia } from './pages/KYC/KycAdverseMedia';
import { KycShellCheck } from './pages/KYC/KycShellCheck';
import { KycReKycScheduling } from './pages/KYC/KycReKycScheduling';
import { ContractsDashboard } from './pages/Contracts/ContractsDashboard';
import { ContractList } from './pages/Contracts/ContractList';
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
import { ReportsDashboard } from './pages/Reports/ReportsDashboard';
import { ProcurementAnalytics } from './pages/Reports/ProcurementAnalytics';
import { VendorPerformance } from './pages/Reports/VendorPerformance';
import { InvoicePaymentReports } from './pages/Reports/InvoicePaymentReports';
import { CustomReportBuilder } from './pages/Reports/CustomReportBuilder';
import { AIInsightsDashboard } from './pages/Reports/AIInsightsDashboard';



import { SettingsDashboard } from './pages/Settings/SettingsDashboard';
import { OrgBrandingSettings } from './pages/Settings/OrgBrandingSettings';
import { UserRoleManagement } from './pages/Settings/UserRoleManagement';
import { ApprovalWorkflowSettings } from './pages/Settings/ApprovalWorkflowSettings';
import { SecurityGovernanceSettings } from './pages/Settings/SecurityGovernanceSettings';
import { IntegrationHubSettings } from './pages/Settings/IntegrationHubSettings';
import { PublishDeploySettings } from './pages/Settings/PublishDeploySettings';
import { VendorPortalDashboard } from './pages/VendorPortal/VendorPortalDashboard';

import { CatalogueDashboard } from './pages/Catalogue/CatalogueDashboard';
import { ItemMaster } from './pages/Catalogue/ItemMaster';
import { ServiceMaster } from './pages/Catalogue/ServiceMaster';
import { VendorMapping } from './pages/Catalogue/VendorMapping';
import { CategoryManagement } from './pages/Catalogue/CategoryManagement';
import { HsnSacMapping } from './pages/Catalogue/HsnSacMapping';
import { UomManagement } from './pages/Catalogue/UomManagement';
import { RatePriceReference } from './pages/Catalogue/RatePriceReference';
import { QualityStandards } from './pages/Catalogue/QualityStandards';
import { VendorComparison } from './pages/Catalogue/VendorComparison';
import { CatalogueApprovals } from './pages/Catalogue/CatalogueApprovals';
import { AiRecommendations } from './pages/Catalogue/AiRecommendations';
import { CatalogueAnalytics } from './pages/Catalogue/CatalogueAnalytics';
import { PublishCatalogue } from './pages/Catalogue/PublishCatalogue';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <VendorFilterProvider>
          <DocumentFilterProvider>
            <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/2fa" element={<TwoFactorAuth />} />
          
          {/* Main layout guarded by general login check */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/access-denied" element={<AccessDenied />} />

              {/* Internal Procurement Modules: restricted to ADMIN */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/vendors" element={<VendorList />} />
                <Route path="/vendors/add" element={<AddVendor />} />
                <Route path="/vendors/approvals" element={<VendorApprovals />} />
                <Route path="/documents" element={<DocumentList />} />
                <Route path="/documents/upload" element={<UploadDocument />} />
                <Route path="/documents/approvals" element={<DocumentApprovals />} />
                <Route path="/documents/expiry" element={<ExpiryTracker />} />
                <Route path="/kyc" element={<KycDashboard />} />
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
                <Route path="/catalogue/comparison" element={<VendorComparison />} />
                <Route path="/catalogue/approvals" element={<CatalogueApprovals />} />
                <Route path="/catalogue/approval-workflow" element={<CatalogueApprovals />} />
                <Route path="/catalogue/ai-recommendations" element={<AiRecommendations />} />

                <Route path="/catalogue/published" element={<PublishCatalogue />} />
                <Route path="/catalogue/analytics" element={<CatalogueAnalytics />} />
                <Route path="/catalogue/publish" element={<PublishCatalogue />} />

                <Route path="/contracts" element={<Navigate to="/contracts/dashboard" replace />} />
                <Route path="/contracts/dashboard" element={<ContractsDashboard />} />
                <Route path="/contracts/repository" element={<ContractList />} />
                <Route path="/contracts/create" element={<CreateContract />} />
                <Route path="/contracts/approvals" element={<ContractApprovals />} />
                <Route path="/contracts/clauses" element={<ClauseLibrary />} />
                <Route path="/contracts/renewals" element={<Renewals />} />

                <Route path="/purchase-orders" element={<Navigate to="/purchase-orders/dashboard" replace />} />
                <Route path="/purchase-orders/dashboard" element={<PODashboard />} />
                <Route path="/purchase-orders/create" element={<CreatePO />} />
                <Route path="/purchase-orders/list" element={<POList />} />
                <Route path="/purchase-orders/approvals" element={<POApprovals />} />
                <Route path="/purchase-orders/grn" element={<POReceipt />} />
                <Route path="/purchase-orders/match" element={<POThreeWayMatch />} />

                <Route path="/invoices" element={<Navigate to="/invoices/dashboard" replace />} />
                <Route path="/invoices/dashboard" element={<InvoiceDashboard />} />
                <Route path="/invoices/upload" element={<UploadInvoice />} />
                <Route path="/invoices/list" element={<InvoiceList />} />
                <Route path="/invoices/approvals" element={<InvoiceApprovals />} />
                <Route path="/invoices/match" element={<InvoiceDashboard />} />
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
                <Route path="/reports/dashboard" element={<ReportsDashboard />} />
                <Route path="/reports/procurement" element={<ProcurementAnalytics />} />
                <Route path="/reports/performance" element={<VendorPerformance />} />
                <Route path="/reports/spend" element={<ProcurementAnalytics />} />
                <Route path="/reports/finance" element={<InvoicePaymentReports />} />
                <Route path="/reports/compliance" element={<ReportsDashboard />} />
                <Route path="/reports/sla" element={<VendorPerformance />} />
                <Route path="/reports/builder" element={<CustomReportBuilder />} />
                <Route path="/reports/audit" element={<ReportsDashboard />} />
                <Route path="/reports/insights" element={<AIInsightsDashboard />} />

                <Route path="/settings" element={<Navigate to="/settings/dashboard" replace />} />
                <Route path="/settings/dashboard" element={<SettingsDashboard />} />
                <Route path="/settings/org" element={<OrgBrandingSettings />} />
                <Route path="/settings/roles" element={<UserRoleManagement />} />
                <Route path="/settings/workflow" element={<ApprovalWorkflowSettings />} />
                <Route path="/settings/security" element={<SecurityGovernanceSettings />} />
                <Route path="/settings/integrations" element={<IntegrationHubSettings />} />
                <Route path="/settings/publish" element={<PublishDeploySettings />} />
              </Route>

              {/* Vendor Portal: restricted to VENDOR */}
              <Route element={<ProtectedRoute allowedRoles={['VENDOR']} moduleKey="Vendor Portal" />}>
                <Route path="/vendor-portal" element={<VendorPortalDashboard />} />
                <Route path="/vendor/dashboard" element={<VendorPortalDashboard />} />
              </Route>


              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
