import axios from 'axios';

export interface Vendor {
  vendorId: string;
  vendorName: string;
  vendorRiskLevel?: string;
  vendorComplianceScore?: number;
}

export interface CommercialTerms {
  contractValue: number;
  currency: string;
  paymentTerms: string;
  billingFrequency: string;
}

export interface SlaMetrics {
  uptime?: string;
  responseTime?: string;
  resolutionTime?: string;
}

export interface PenaltyTerms {
  slaBreachPenalty?: string;
  maxPenaltyCap?: string;
}

export interface SlaAndLegal {
  selectedClauses: string[];
  slaMetrics?: SlaMetrics;
  penaltyTerms?: PenaltyTerms;
}

export interface UploadedDocument {
  fileId: string;
  fileName: string;
  fileType: string;
  filePath: string;
  uploadedBy: string;
  uploadedOn: string;
  fileSize: string;
}

export interface ApprovalWorkflow {
  currentStage: string;
  workflowStep: number;
  approvalStatus: string;
  currentApprover: string;
  submittedBy: string;
  submittedOn: string;
  lastRemarks?: string;
}

export interface RiskInsights {
  portfolioRisk: string;
  legalExposure: number;
  complianceRisk: number;
  financialRisk: number;
  aiAlerts: string[];
}

export interface ContractRecord {
  contractId?: string;
  vendor: Vendor;
  vendorName?: string;
  contractName: string;
  contractType: string;
  department: string;
  effectiveDate: string;
  expiryDate: string;
  commercialTerms: CommercialTerms;
  contractValue?: number;
  currency?: string;
  paymentTerms?: string;
  billingFrequency?: string;
  slaAndLegal: SlaAndLegal;
  uploadedDocuments: UploadedDocument[];
  approvalWorkflow?: ApprovalWorkflow;
  riskInsights?: RiskInsights;
  status?: string;
  createdDate?: string;
  lastModified?: string;
  auditTrail?: Array<{ action: string; user: string; dateTime: string; remarks?: string }>;
}

export interface DashboardStats {
  totalActiveContracts: number;
  expiringSoon: number;
  pendingLegalReviews: number;
  slaBreaches: number;
  lifecycleDistribution: Array<{ name: string; value: number; color: string }>;
  contractValueByCategory: Array<{ category: string; spend: number }>;
  portfolioRisk: string;
  legalExposure: number;
  complianceRisk: number;
  financialRisk: number;
  slaBreachTrends?: Array<{ month: string; breaches: number }>;
  vendorRiskAnalysis?: Array<{ name: string; value: number }>;
}

export interface Clause {
  id: string;
  name: string;
  category: string;
  text: string;
  mandatory: boolean;
}

export interface RenewalRecord {
  contractId: string;
  vendorName: string;
  contractType: string;
  expiryDate: string;
  owner: string;
  status: string;
}

export interface ApprovalQueueItem {
  approvalId: string;
  contractId: string;
  vendorName: string;
  currentStage: string;
  assignedTo: string;
  status: string;
  remarks: string;
  history?: Array<{ action: string; by: string; dateTime: string; remarks?: string }>;
}

// 1. Fetch all contracts
export async function getAllContracts(filters?: { status?: string; risk?: string; contractType?: string; search?: string }): Promise<ContractRecord[]> {
  const res = await axios.get('/api/contracts', { params: filters });
  return res.data;
}

// 2. Fetch contract details
export async function getContractById(id: string): Promise<ContractRecord> {
  const res = await axios.get(`/api/contracts/${id}`);
  return res.data;
}

// 3. Create a new contract wizard record
export async function createContract(contractData: ContractRecord): Promise<{ success: boolean; contract: ContractRecord }> {
  const res = await axios.post('/api/contracts', contractData);
  return res.data;
}

// 4. Update an existing contract
export async function updateContract(id: string, contractData: Partial<ContractRecord>): Promise<ContractRecord> {
  const res = await axios.put(`/api/contracts/${id}`, contractData);
  return res.data;
}

// 5. Delete a contract
export async function deleteContract(id: string): Promise<{ success: boolean; message: string }> {
  const res = await axios.delete(`/api/contracts/${id}`);
  return res.data;
}

// 6. Upload contract attachment files
export async function uploadContractDocument(
  file: File,
  metadata: { linkedRecordId?: string; documentCategory: string; uploadedBy?: string }
): Promise<{ success: boolean; file: UploadedDocument }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('linkedModule', 'Contracts');
  if (metadata.linkedRecordId) formData.append('linkedRecordId', metadata.linkedRecordId);
  formData.append('documentCategory', metadata.documentCategory);
  if (metadata.uploadedBy) formData.append('uploadedBy', metadata.uploadedBy);

  const res = await axios.post('/api/contracts/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

// 7. Get files linked to contract
export async function getContractFiles(contractId: string): Promise<UploadedDocument[]> {
  const res = await axios.get(`/api/contracts/files/${contractId}`);
  return res.data;
}

// 8. Fetch dynamic contracts dashboard stats
export async function getContractDashboard(): Promise<DashboardStats> {
  const res = await axios.get('/api/contracts/dashboard');
  return res.data;
}

// 9. Fetch active approvals review queue
export async function getPendingApprovals(): Promise<ApprovalQueueItem[]> {
  const res = await axios.get('/api/contracts/approvals');
  return res.data;
}

// 10. Approve contract resolution
export async function approveContract(contractId: string, remarks: string, performedBy?: string): Promise<{ success: boolean; contract: ContractRecord }> {
  const res = await axios.post('/api/contracts/approve', { contractId, remarks, performedBy });
  return res.data;
}

// 11. Reject contract resolution
export async function rejectContract(contractId: string, remarks: string, performedBy?: string, actionType: 'Reject' | 'Send Back' = 'Reject'): Promise<{ success: boolean; contract: ContractRecord }> {
  const res = await axios.post('/api/contracts/reject', { contractId, remarks, performedBy, actionType });
  return res.data;
}

// 12. Fetch standard clauses library
export async function getClauses(): Promise<Clause[]> {
  const res = await axios.get('/api/contracts/clauses');
  return res.data;
}

// 13. Fetch renewals queue
export async function getRenewalContracts(): Promise<RenewalRecord[]> {
  const res = await axios.get('/api/contracts/renewals');
  return res.data;
}

// 14. Fetch list of vendors (from contracts-specific vendor list)
export async function getVendorsList(): Promise<Vendor[]> {
  try {
    const res = await axios.get('/api/contracts/vendors');
    return res.data;
  } catch {
    // Fallback to main vendors list
    try {
      const res = await axios.get('/api/vendors');
      return res.data.map((v: any) => ({
        vendorId: v.vendorId,
        vendorName: v.basicDetails?.legalName || v.vendorName,
        vendorRiskLevel: v.vendorRiskLevel || 'Low',
        vendorComplianceScore: v.vendorComplianceScore || 80
      }));
    } catch {
      return [];
    }
  }
}

// 15. Renew an existing contract
export async function renewContract(contractId: string, expiryDate: string): Promise<{ success: boolean; message: string }> {
  const res = await axios.post(`/api/contracts/${contractId}/renew`, { expiryDate });
  return res.data;
}
