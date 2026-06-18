import axios from 'axios';

export interface PreferredVendor {
  vendorId: string;
  vendorName: string;
}

export interface UploadedFile {
  fileId: string;
  fileName: string;
  fileType: string;
  filePath: string;
  uploadedOn: string;
  fileSize: string;
}

export interface AuditTrailEntry {
  action: string;
  user: string;
  dateTime: string;
}

export interface ApprovalWorkflow {
  submittedBy: string;
  submittedDate: string;
  approvalStatus: string;
  currentApprover: string;
  checkerRemarks?: string;
  checkedBy?: string;
  checkedDate?: string;
}

export interface CatalogueItem {
  itemId?: string;
  itemCode: string;
  itemName: string;
  category: string;
  subCategory: string;
  description: string;
  brand: string;
  countryOfOrigin?: string;
  minimumOrderQuantity: number;
  maximumOrderLimit?: number;
  expectedLeadTime: string;
  warrantySupport?: string;
  preferredVendor: PreferredVendor;
  alternateVendors: PreferredVendor[];
  hsnCode: string;
  unitOfMeasurement: string;
  taxCode: string;
  qualityComplianceStandards?: string;
  qualityTestingCriteria?: string;
  riskClassification?: string;
  status?: string;
  approvalWorkflow?: ApprovalWorkflow;
  uploadedFiles?: UploadedFile[];
  auditTrail?: AuditTrailEntry[];
}

export interface DashboardStats {
  totalItems: number;
  totalServices: number;
  activeVendors: number;
  pendingApprovals: number;
  criticalCategories: number;
  rateRevisionsDue: number;
  catalogueUtilization: number;
}

export interface HsnMapping {
  hsnCode: string;
  category: string;
  gstSlab: string;
  uom: string;
}

export interface VendorSelection {
  vendorId: string;
  vendorName: string;
  status: string;
}

// 1. Fetch all items (with optional filters)
export async function getAllItems(filters?: { category?: string; status?: string; search?: string }): Promise<CatalogueItem[]> {
  const res = await axios.get('/api/catalogue/items', { params: filters });
  return res.data;
}

// 2. Fetch single item details
export async function getItemById(id: string): Promise<CatalogueItem> {
  const res = await axios.get(`/api/catalogue/items/${id}`);
  return res.data;
}

// 3. Create a new item
export async function createItem(itemData: CatalogueItem): Promise<{ success: boolean; item: CatalogueItem }> {
  const res = await axios.post('/api/catalogue/items', itemData);
  return res.data;
}

// 4. Update an existing item
export async function updateItem(id: string, itemData: Partial<CatalogueItem>): Promise<CatalogueItem> {
  const res = await axios.put(`/api/catalogue/items/${id}`, itemData);
  return res.data;
}

// 5. Delete an item
export async function deleteItem(id: string): Promise<{ success: boolean; message: string }> {
  const res = await axios.delete(`/api/catalogue/items/${id}`);
  return res.data;
}

// 6. Upload product specification sheet / image
export async function uploadItemFile(
  file: File,
  metadata: { linkedRecordId?: string; fileType: string; uploadedBy?: string }
): Promise<{ success: boolean; file: UploadedFile }> {
  const formData = new FormData();
  formData.append('linkedModule', 'Item Master');
  if (metadata.linkedRecordId) formData.append('linkedRecordId', metadata.linkedRecordId);
  formData.append('fileType', metadata.fileType);
  if (metadata.uploadedBy) formData.append('uploadedBy', metadata.uploadedBy);
  formData.append('file', file);

  const res = await axios.post('/api/catalogue/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

// 7. Get files linked with item
export async function getItemFiles(itemId: string): Promise<UploadedFile[]> {
  const res = await axios.get(`/api/catalogue/files/${itemId}`);
  return res.data;
}

// 8. Fetch dynamic dashboard stats
export async function getItemDashboardStats(): Promise<DashboardStats> {
  const res = await axios.get('/api/catalogue/dashboard');
  return res.data;
}

// 9. Fetch active approvals queue
export async function getPendingApprovals(): Promise<any[]> {
  const res = await axios.get('/api/catalogue/pending-approvals');
  return res.data;
}

// 10. Checker resolves approval request
export async function resolveApproval(
  id: string,
  action: 'Approve' | 'Reject' | 'Send Back' | 'Recommend',
  remarks: string,
  performedBy?: string
): Promise<{ success: boolean; item: CatalogueItem }> {
  const res = await axios.post(`/api/catalogue/approvals/${id}/resolve`, {
    action,
    remarks,
    performedBy,
  });
  return res.data;
}

// 11. Fetch HSN mappings
export async function getHsnMappings(): Promise<HsnMapping[]> {
  const res = await axios.get('/api/catalogue/hsn-sac');
  return res.data;
}

// 12. Fetch list of UOMs
export async function getUoms(): Promise<string[]> {
  const res = await axios.get('/api/catalogue/uoms');
  return res.data;
}

// 13. Fetch list of active/approved vendors
export async function getActiveVendors(): Promise<VendorSelection[]> {
  const res = await axios.get('/api/catalogue/vendors');
  return res.data;
}
