export interface Vendor {
  vendorId: string;
  vendorName: string;
  category: string;
  kycStatus: string;
  riskScore: number;
  riskLevel: string;
  lastVerified: string;
  nextReviewDate: string;
  status: string;
}

export interface Check {
  name: string;
  status: string;
}

export interface ScreeningResult {
  vendorId: string;
  completed: boolean;
  checks: Check[];
  advisoryAccepted: boolean;
  advisoryAcceptedBy: string | null;
  advisoryAcceptedAt: string | null;
}


export interface Approval {
  vendorId: string;
  approvalStatus: string;
  submittedBy: string;
  submittedOn: string;
  remarks: string;
}

export interface AuditLog {
  timestamp: string;
  actor: string;
  action: string;
}

export interface KycData {
  vendors: Vendor[];
  screeningResults: ScreeningResult[];
  approvals: Approval[];
  auditLogs: AuditLog[];
}

export function getKycData(): KycData;
export function saveKycData(data: KycData): void;
export function resetKycData(): KycData;
