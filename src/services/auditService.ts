import axios from 'axios';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  performedBy: string;
  status: string;
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  const res = await axios.get<AuditLogEntry[]>('/api/kyc/audit-log');
  return res.data;
}
