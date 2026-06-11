import axios from 'axios';

export interface CheckDetail {
  result: string;
  score: number;
  lastChecked: string;
  details: string;
  findings?: number;
}

export interface Screening {
  vendorId: string;
  vendorName: string;
  sanctions: CheckDetail;
  pep: CheckDetail;
  adverseMedia: CheckDetail;
  blacklist: CheckDetail;
  shellCompany: CheckDetail;
  riskScore: number;
}

export interface ScreeningResponse {
  screenings: Screening[];
}

export async function getScreenings(): Promise<ScreeningResponse> {
  const res = await axios.get<ScreeningResponse>('/api/kyc/screening');
  return res.data;
}

export async function runScreening(vendorId: string): Promise<ScreeningResponse> {
  const res = await axios.post<ScreeningResponse>('/api/kyc/screening/run', { vendorId });
  return res.data;
}
