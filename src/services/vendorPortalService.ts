import axios from 'axios';

export interface VendorProfile {
  vendorId: string;
  vendorName: string;
  vendorType: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  status: string;
  bankSecurityNode: boolean;
  onboardingDate: string;
  lastLogin: string;
  onboardingComplete?: boolean;
}

export interface VendorKyc {
  vendorId: string;
  gstNumber: string;
  panNumber: string;
  msmeNumber: string;
  status: string;
}

export interface VendorDocumentVersion {
  fileId: string;
  uploadDate: string;
  uploadedBy?: string;
}

export interface VendorDocument {
  documentId: string;
  vendorId: string;
  documentName: string;
  documentType: string;
  uploadDate: string;
  expiryDate: string | null;
  status: 'Verified' | 'Pending Verification' | 'Expired' | 'Rejected';
  fileId: string;
  filePath?: string;
  versions?: VendorDocumentVersion[];
}

export interface VendorPO {
  poId: string;
  vendorId: string;
  issueDate: string;
  items: number;
  value: number;
  status: 'Pending Acknowledgement' | 'Pending Acknowledgment' | 'Acknowledged' | 'Delivered' | 'Invoiced';
}

export interface VendorInvoice {
  invoiceId: string;
  vendorId: string;
  poId: string;
  amount: number;
  submitDate: string;
  verificationStage: string;
  paymentStatus: string;
}

export interface VendorPayment {
  paymentId: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  status: string;
}

export interface VendorContract {
  contractId: string;
  contractName: string;
  contractType: string;
  department: string;
  effectiveDate: string;
  expiryDate: string;
  status: string;
  vendorName: string;
  contractValue: number;
  currency: string;
  paymentTerms: string;
  billingFrequency: string;
  riskLevel: string;
  uploadedFiles: string[];
}

export type EsignStatus = 'Initiated' | 'Sent' | 'Signed' | 'Failed';
export type OtpMethod  = 'aadhaar' | 'email';

export interface EsignRequest {
  requestId: string;
  contractId: string;
  vendorId: string;
  signerName: string;
  signerEmail: string;
  signerPhone: string;
  otpMethod: OtpMethod;
  status: EsignStatus;
  initiatedAt: string;
  completedAt: string | null;
  signDeskRequestId: string;
  signingUrl: string;
  signedDocUrl: string | null;
}

export interface InitiateEsignPayload {
  signerName: string;
  signerEmail: string;
  signerPhone: string;
  otpMethod: OtpMethod;
}

export interface VendorTicket {
  ticketId: string;
  vendorId: string;
  category: string;
  subject: string;
  description: string;
  status: 'Open' | 'Resolved';
  createdDate: string;
}

export interface VendorNotification {
  notificationId: string;
  vendorId: string;
  message: string;
  read: boolean;
  createdDate: string;
}

export interface VendorDashboardStats {
  vendorId: string;
  pendingPOs: number;
  paidInvoices: number;
  expiredDocuments: number;
  activeTickets: number;
}

// 1. Dashboard Cache
export async function getVendorDashboard(): Promise<VendorDashboardStats> {
  const res = await axios.get('/api/vendor-portal/dashboard');
  return res.data;
}

// 2. Profile
export async function getVendorProfile(): Promise<VendorProfile> {
  const res = await axios.get('/api/vendor-portal/profile');
  return res.data;
}

export async function updateVendorProfile(data: Partial<VendorProfile>): Promise<VendorProfile> {
  const res = await axios.put('/api/vendor-portal/profile', data);
  return res.data;
}

// 3. KYC
export async function getVendorKyc(): Promise<VendorKyc> {
  const res = await axios.get('/api/vendor-portal/kyc');
  return res.data;
}

export async function updateVendorKyc(data: Partial<VendorKyc>): Promise<VendorKyc> {
  const res = await axios.put('/api/vendor-portal/kyc', data);
  return res.data;
}

// 4. Documents
export async function getVendorDocuments(): Promise<VendorDocument[]> {
  const res = await axios.get('/api/vendor-portal/documents');
  return res.data;
}

export async function uploadVendorDocument(
  file: File,
  documentType: string,
  documentName?: string,
  expiryDate?: string | null,
  documentId?: string
): Promise<{ success: boolean; document: VendorDocument }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);
  if (documentName) formData.append('documentName', documentName);
  if (expiryDate) formData.append('expiryDate', expiryDate);
  if (documentId) formData.append('documentId', documentId);

  const res = await axios.post('/api/vendor-portal/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function deleteVendorDocument(documentId: string): Promise<void> {
  await axios.delete(`/api/vendor-portal/documents/${documentId}`);
}

// 5. Purchase Orders
export async function getVendorPOs(): Promise<VendorPO[]> {
  const res = await axios.get('/api/vendor-portal/pos');
  return res.data;
}

export async function acknowledgePO(poId: string): Promise<{ success: boolean; po: VendorPO }> {
  const res = await axios.post(`/api/vendor-portal/pos/${poId}/acknowledge`);
  return res.data;
}

// 6. Invoices & Payments
export async function getVendorInvoices(): Promise<VendorInvoice[]> {
  const res = await axios.get('/api/vendor-portal/invoices');
  return res.data;
}

export async function submitVendorInvoice(
  invoiceNo: string,
  poId: string,
  amount: number
): Promise<{ success: boolean; invoice: VendorInvoice }> {
  const res = await axios.post('/api/vendor-portal/invoices', { invoiceNo, poId, amount });
  return res.data;
}

export async function getVendorPayments(): Promise<VendorPayment[]> {
  const res = await axios.get('/api/vendor-portal/payments');
  return res.data;
}

// 7. Contracts
export async function getVendorContracts(): Promise<VendorContract[]> {
  const res = await axios.get('/api/vendor-portal/contracts');
  return res.data;
}

// 7b. E-Sign (SignDesk)
export async function initiateEsign(contractId: string, payload: InitiateEsignPayload): Promise<{ success: boolean; request: EsignRequest }> {
  const res = await axios.post(`/api/vendor-portal/contracts/${contractId}/esign/initiate`, payload);
  return res.data;
}

export async function getEsignStatus(contractId: string): Promise<EsignRequest | null> {
  const res = await axios.get(`/api/vendor-portal/contracts/${contractId}/esign/status`);
  return res.data;
}

export async function simulateEsignComplete(contractId: string): Promise<{ success: boolean; request: EsignRequest }> {
  const res = await axios.post(`/api/vendor-portal/contracts/${contractId}/esign/simulate-complete`);
  return res.data;
}

// 8. Tickets
export async function getVendorTickets(): Promise<VendorTicket[]> {
  const res = await axios.get('/api/vendor-portal/tickets');
  return res.data;
}

export async function submitVendorTicket(
  category: string,
  subject: string,
  description: string
): Promise<{ success: boolean; ticket: VendorTicket }> {
  const res = await axios.post('/api/vendor-portal/tickets', { category, subject, description });
  return res.data;
}

// 9. Notifications
export async function getVendorNotifications(): Promise<VendorNotification[]> {
  const res = await axios.get('/api/vendor-portal/notifications');
  return res.data;
}

export async function markNotificationsRead(): Promise<{ success: boolean }> {
  const res = await axios.post('/api/vendor-portal/notifications/read-all');
  return res.data;
}

// 10. Complete onboarding
export async function completeOnboarding(): Promise<{ success: boolean }> {
  const res = await axios.post('/api/vendor-portal/onboarding/complete');
  return res.data;
}

// ── Sprint 3 additions ────────────────────────────────────────────────────

export interface TicketReply {
  replyId: string;
  message: string;
  author: string;
  createdDate: string;
}

export interface VendorTicket {
  ticketId: string;
  vendorId: string;
  category: string;
  subject: string;
  description: string;
  status: 'Open' | 'Resolved';
  createdDate: string;
  replies?: TicketReply[];
}

export interface AuditEntry {
  auditId: string;
  vendorId: string;
  action: string;
  referenceId: string;
  performedBy: string;
  timestamp: string;
}

export interface VendorSettings {
  theme?: string;
  language?: string;
  notifications?: Record<string, boolean>;
}

// 11. Helpdesk reply
export async function replyToTicket(ticketId: string, message: string): Promise<{ success: boolean; reply: TicketReply }> {
  const res = await axios.post(`/api/vendor-portal/tickets/${ticketId}/reply`, { message });
  return res.data;
}

// 12. Audit trail
export async function getVendorAuditTrail(): Promise<AuditEntry[]> {
  const res = await axios.get('/api/vendor-portal/audit-trail');
  return res.data;
}

// 13. Settings persistence
export async function getVendorSettings(): Promise<VendorSettings> {
  const res = await axios.get('/api/vendor-portal/settings');
  return res.data;
}

export async function saveVendorSettings(settings: Partial<VendorSettings>): Promise<VendorSettings> {
  const res = await axios.put('/api/vendor-portal/settings', settings);
  return res.data;
}
