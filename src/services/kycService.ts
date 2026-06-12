import axios from 'axios';

export type KycStatus = 'Verified' | 'Pending' | 'In Progress' | 'High Risk' | 'Re-KYC Due';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Vendor {
  vendorId: string;
  vendorName: string;
  category: string;
  kycStatus: KycStatus;
  riskLevel: RiskLevel;
  riskScore: number;
  lastVerified: string;
  nextReviewDate: string;
  nextReview?: string;
}

export interface KycSummary {
  totalVendors: number;
  verified: number;
  pending: number;
  inProgress: number;
  highRisk: number;
  reKycDue: number;
}

export interface KycDashboardData {
  lastUpdated: string;
  summary: KycSummary;
  vendors: Vendor[];
}

export async function getKycDashboard(): Promise<KycDashboardData> {
  const res = await axios.get<KycDashboardData>('/api/kyc/dashboard');
  return res.data;
}
