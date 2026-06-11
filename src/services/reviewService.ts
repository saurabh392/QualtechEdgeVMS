import axios from 'axios';

export interface Review {
  reviewId: string;
  vendorId: string;
  vendorName: string;
  reviewType: string;
  dueDate: string;
  assignedTo: string;
  status: string;
  priority: string;
}

export interface Approval {
  approvalId: string;
  vendorId: string;
  vendorName: string;
  category: string;
  riskLevel: string;
  submittedBy: string;
  submittedOn: string;
  stage: string;
  workflow: { procurement: string; compliance: string; legal: string; final: string };
}

export interface CompletedReview {
  reviewId: string;
  vendorId: string;
  vendorName: string;
  reviewType: string;
  completedDate: string;
  reviewedBy: string;
  outcome: string;
  nextReviewDate: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  pendingApprovals: Approval[];
  completedReviews: CompletedReview[];
}

export async function getReviewsAndApprovals(): Promise<ReviewsResponse> {
  const res = await axios.get<ReviewsResponse>('/api/kyc/reviews');
  return res.data;
}
