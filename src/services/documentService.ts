import axios from 'axios';

export interface Document {
  documentId: string;
  documentType: string;
  documentName: string;
  documentCategory: string;
  vendor: {
    vendorId: string;
    vendorName: string;
  };
  documentNumber: string;
  issueDate: string | null;
  expiryDate: string | null;
  issuedBy: string;
  remarks: string;
  verificationStatus: string;
  approvalStatus: string;
  uploadedAt: string;
  uploadedBy: {
    userId: string;
    userName: string;
  };
  fileDetails: {
    originalFileName: string;
    storedFileName: string;
    filePath: string;
    fileType: string;
    fileSizeKB: number;
    fileExtension: string;
  };
  status?: string;
}

export async function getAllDocuments(): Promise<Document[]> {
  const res = await axios.get<Document[]>('/api/documents');
  return res.data;
}

export async function getPendingDocuments(): Promise<Document[]> {
  const docs = await getAllDocuments();
  return docs.filter(doc => (doc.verificationStatus || doc.status) === 'Pending Verification');
}

export async function getVerifiedDocuments(): Promise<Document[]> {
  const docs = await getAllDocuments();
  return docs.filter(doc => (doc.verificationStatus || doc.status) === 'Verified');
}

export async function getRejectedDocuments(): Promise<Document[]> {
  const docs = await getAllDocuments();
  return docs.filter(doc => (doc.verificationStatus || doc.status) === 'Rejected');
}
