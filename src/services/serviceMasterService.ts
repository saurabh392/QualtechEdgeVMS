import axios from 'axios';
import type { UploadedFile } from './itemMasterService';

export interface ServiceMasterData {
  serviceId?: string;
  serviceCode: string;
  serviceName: string;
  serviceCategory: string;
  serviceSubCategory: string;
  description: string;
  department: string;
  businessFunction: string;
  serviceOwner: string;
  serviceType: string;
  preferredVendor: string;
  alternateVendors?: string[];
  deliveryModel: string;
  serviceFrequency: string;
  serviceDuration: string;
  serviceLocation: string;
  slaCommitment: string;
  responseTime: string;
  resolutionTime: string;
  escalationMatrix?: string;
  riskClassification: string;
  complianceRequirements: string;
  certifications: string[];
  qualityStandards: string;
  kpiMeasurement: string;
  status?: string;
  workflowStage?: string;
  attachmentIds?: string[];
  createdDate?: string;
  createdBy?: string;
  uploadedFiles?: UploadedFile[];
}

// 1. Create a new service
export async function createService(serviceData: ServiceMasterData): Promise<{ success: boolean; service: ServiceMasterData }> {
  const res = await axios.post('/api/catalogue/services', serviceData);
  return res.data;
}

// 2. Fetch all services
export async function getAllServices(): Promise<ServiceMasterData[]> {
  const res = await axios.get('/api/catalogue/services');
  return res.data;
}

// 3. Upload a file for Service Master
export async function uploadServiceFile(
  file: File,
  metadata: { fileType: string; uploadedBy?: string }
): Promise<{ success: boolean; file: UploadedFile }> {
  const formData = new FormData();
  formData.append('linkedModule', 'Service Master');
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

// 4. Fetch all service attachments (for reuse)
export async function getServiceAttachments(): Promise<any[]> {
  const res = await axios.get('/api/catalogue/service-attachments');
  return res.data;
}
