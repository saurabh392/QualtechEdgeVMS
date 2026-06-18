import axios from 'axios';

export interface Requester {
  employeeId: string;
  requesterName: string;
  department: string;
  designation: string;
}

export interface CostCenter {
  costCenterCode: string;
  costCenterName: string;
}

export interface ItemDetails {
  itemDescription: string;
  quantity: number;
  unitOfMeasure: string;
}

export interface BudgetDetails {
  allocatedBudget: number;
  consumedBudget: number;
  currentRequisitionValue: number;
  availableBudget: number;
}

export interface VendorSelection {
  selectedVendorId: string;
  selectedVendorName: string;
  quotedPrice: number;
  leadTime: string;
  kycCompliance: string;
  slaScore: string;
  vendorRiskLevel: string;
}

export interface LinkedContract {
  contractId: string;
  contractType: string;
  contractExpiry: string;
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
  submittedBy: string;
  submittedOn: string;
  lastRemarks?: string;
}

export interface AIInsights {
  budgetStatus?: string;
  vendorRisk?: string;
  deliveryRisk?: string;
  recommendation?: string;
}

export interface RequisitionRecord {
  requisitionId?: string;
  requester: Requester;
  costCenter: CostCenter;
  projectCode: string;
  category: string;
  itemDetails: ItemDetails;
  budgetDetails: BudgetDetails;
  vendorSelection: VendorSelection;
  linkedContract?: LinkedContract;
  uploadedDocuments: UploadedDocument[];
  approvalWorkflow?: ApprovalWorkflow;
  aiInsights?: AIInsights;
  status?: string;
  createdDate?: string;
  lastModified?: string;
}

export interface PurchaseOrderRecord {
  poId: string;
  linkedRequisitionId: string;
  vendorId: string;
  vendorName: string;
  category: string;
  poValue: number;
  currency: string;
  createdDate: string;
  deliveryDate: string;
  deliveryStatus: string;
  status: string;
  paymentTerms: string;
  goodsReceiptStatus: string;
  invoiceMatchStatus: string;
}

export interface DashboardStats {
  kpis: {
    totalPOs: number;
    posInProgress: number;
    awaitingApproval: number;
    goodsReceived: number;
    pendingInvoices: number;
    poValueThisMonth: number;
  };
  statusData: Array<{ name: string; value: number; color: string }>;
  categoryData: Array<{ category: string; value: number }>;
  trendData: Array<{ month: string; thisYear: number; lastYear: number }>;
  topVendors: Array<{ name: string; value: number; width: string }>;
  approvalQueue: Array<{ type: string; count: number; color: string }>;
  aiInsights: Array<{ type: string; text: string; severity?: string }>;
}

export interface ApprovalQueueItem {
  approvalId: string;
  requisitionId: string;
  vendorName: string;
  department: string;
  estimatedValue: number;
  currentStage: string;
  assignedTo: string;
  status: string;
  remarks: string;
  submittedBy: string;
  submittedOn: string;
  history: Array<{ action: string; by: string; dateTime: string; remarks?: string }>;
}

export interface RFQVendor {
  vendorId: string;
  vendorName: string;
  quotedPrice: number;
  leadTime: string;
  kycCompliance: string;
  slaScore: string;
  vendorRiskLevel: string;
  recommendationTag?: string;
  rating?: number;
}

export interface GRNRecord {
  grnId?: string;
  poId: string;
  receivedDate?: string;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  deliveryCondition: string;
  inspectionRemarks: string;
  grnStatus?: string;
  inspectedBy: string;
  createdDate?: string;
}

export interface MatchRecord {
  matchId?: string;
  poId: string;
  invoiceId: string;
  grnId: string;
  poAmount: number;
  invoiceAmount: number;
  grnQuantity: number;
  invoiceQuantity: number;
  amountMatched: boolean;
  quantityMatched: boolean;
  matchStatus: string;
  processedDate?: string;
  remarks: string;
  mismatchReason?: string;
  approvalRequired?: boolean;
}

// 1. Fetch all requisitions
export async function getAllRequisitions(): Promise<RequisitionRecord[]> {
  const res = await axios.get('/api/requisitions');
  return res.data;
}

// 2. Fetch requisition by ID
export async function getRequisitionById(id: string): Promise<RequisitionRecord> {
  const res = await axios.get(`/api/requisitions/${id}`);
  return res.data;
}

// 3. Create requisition
export async function createRequisition(requisition: RequisitionRecord): Promise<{ success: boolean; requisition: RequisitionRecord }> {
  const res = await axios.post('/api/requisitions', requisition);
  return res.data;
}

// 4. Update requisition
export async function updateRequisition(id: string, updates: Partial<RequisitionRecord>): Promise<RequisitionRecord> {
  const res = await axios.put(`/api/requisitions/${id}`, updates);
  return res.data;
}

// 5. Generate PO
export async function generatePO(requisitionId: string): Promise<{ success: boolean; purchaseOrder: PurchaseOrderRecord }> {
  const res = await axios.post('/api/purchase-orders/generate', { requisitionId });
  return res.data;
}

// 6. Fetch all POs
export async function getAllPOs(): Promise<PurchaseOrderRecord[]> {
  const res = await axios.get('/api/purchase-orders');
  return res.data;
}

// 7. Fetch PO Dashboard Stats
export async function getPODashboard(): Promise<DashboardStats> {
  const res = await axios.get('/api/purchase-orders/dashboard');
  return res.data;
}

// 8. Fetch active pending approvals queue
export async function getPendingApprovals(): Promise<ApprovalQueueItem[]> {
  const res = await axios.get('/api/purchase-orders/approvals');
  return res.data;
}

// 9. Approve PO Requisition
export async function approvePO(requisitionId: string, remarks: string, approvedBy?: string): Promise<{ success: boolean; approval: ApprovalQueueItem }> {
  const res = await axios.post('/api/purchase-orders/approve', { requisitionId, remarks, approvedBy });
  return res.data;
}

// 10. Reject PO Requisition
export async function rejectPO(requisitionId: string, remarks: string, rejectedBy?: string, actionType: 'Reject' | 'Send Back' = 'Reject'): Promise<{ success: boolean; approval: ApprovalQueueItem }> {
  const res = await axios.post('/api/purchase-orders/reject', { requisitionId, remarks, rejectedBy, actionType });
  return res.data;
}

// 11. Upload file linked with PO
export async function uploadPOFile(
  file: File,
  metadata: { linkedRecordId?: string; documentCategory: string; uploadedBy?: string }
): Promise<{ success: boolean; file: UploadedDocument }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('linkedModule', 'Purchase Orders');
  if (metadata.linkedRecordId) formData.append('linkedRecordId', metadata.linkedRecordId);
  formData.append('documentCategory', metadata.documentCategory);
  if (metadata.uploadedBy) formData.append('uploadedBy', metadata.uploadedBy);

  const res = await axios.post('/api/purchase-orders/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

// 12. Get files linked with PO
export async function getPOFiles(recordId: string): Promise<UploadedDocument[]> {
  const res = await axios.get(`/api/purchase-orders/files/${recordId}`);
  return res.data;
}

// 13. Create Goods Receipt Note (GRN)
export async function createGRN(grn: GRNRecord): Promise<{ success: boolean; grn: GRNRecord }> {
  const res = await axios.post('/api/grn/create', grn);
  return res.data;
}

// 14. Get GRN list
export async function getAllGRNs(): Promise<GRNRecord[]> {
  const res = await axios.get('/api/grn/list');
  return res.data;
}

// 15. Process 3-Way Match
export async function processThreeWayMatch(match: MatchRecord): Promise<{ success: boolean; match: MatchRecord }> {
  const res = await axios.post('/api/three-way-match/process', match);
  return res.data;
}

// 16. Get 3-way matches list
export async function getAllMatches(): Promise<MatchRecord[]> {
  const res = await axios.get('/api/three-way-match/list');
  return res.data;
}

// 17. Fetch RFQ & Vendor Selection list
export async function getRFQVendors(estimatedCost?: number): Promise<RFQVendor[]> {
  const res = await axios.get('/api/rfq-vendors', { params: { estimatedCost } });
  return res.data;
}
