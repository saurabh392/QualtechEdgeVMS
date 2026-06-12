import axios from 'axios';

export interface ReviewComment {
  author: string;
  text: string;
  timestamp?: string;
}

export interface Review {
  reviewId: string;
  vendorId: string;
  vendorName: string;
  category: string;
  riskScore: number;
  riskLevel: string;
  kycStatus: string;
  screeningStatus: string;
  approvalStatus: string;
  assignedTo: string;
  dueDate: string;
  comments: ReviewComment[];
}

export interface ReviewsSummary {
  pendingReviews: number;
  inProgress: number;
  readyForApproval: number;
  approved: number;
  rejected: number;
}

export interface ReviewsResponse {
  summary: ReviewsSummary;
  reviews: Review[];
}

export interface KycSummarySection {
  panStatus: string;
  gstStatus: string;
  cinStatus: string;
  bankStatus: string;
  rocStatus: string;
  itrStatus: string;
  status: string;
}

export interface ScreeningSummaryItem {
  status: string;
  score: number;
  remarks: string;
}

export interface ScreeningSummarySection {
  sanctions: ScreeningSummaryItem;
  pep: ScreeningSummaryItem;
  adverseMedia: ScreeningSummaryItem;
  blacklist: ScreeningSummaryItem;
  shellCompany: ScreeningSummaryItem;
}

export interface DocumentSummarySection {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
}

export interface RiskAssessmentSection {
  score: number;
  level: string;
  breakdown: {
    business: number;
    financial: number;
    compliance: number;
    operational: number;
  };
}

export interface ApprovalDetailData {
  reviewId: string;
  vendorId: string;
  vendorName: string;
  vendorCode: string;
  category: string;
  kycStatus: string;
  riskScore: number;
  riskLevel: string;
  approvalStatus: string;
  comments: ReviewComment[];
  kycSummary: KycSummarySection;
  screeningSummary: ScreeningSummarySection;
  documentSummary: DocumentSummarySection;
  riskAssessment: RiskAssessmentSection;
}

export async function getReviews(): Promise<ReviewsResponse> {
  const res = await axios.get<ReviewsResponse>('/api/kyc/reviews');
  return res.data;
}

export async function getApprovalDetail(vendorId: string): Promise<ApprovalDetailData> {
  const res = await axios.get<ApprovalDetailData>(`/api/kyc/reviews/detail/${vendorId}`);
  return res.data;
}

export async function submitApprovalAction(
  vendorId: string,
  action: 'Approve' | 'Reject' | 'SendBack',
  comment: string
): Promise<{ success: boolean; message: string }> {
  const res = await axios.post<{ success: boolean; message: string }>('/api/kyc/reviews/action', {
    vendorId,
    action,
    comment
  });
  return res.data;
}
