import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getVendorDashboard,
  getVendorProfile,
  updateVendorProfile,
  getVendorKyc,
  updateVendorKyc,
  getVendorDocuments,
  uploadVendorDocument,
  deleteVendorDocument,
  getVendorPOs,
  acknowledgePO,
  getVendorInvoices,
  submitVendorInvoice,
  getVendorPayments,
  getVendorContracts,
  initiateEsign,
  getEsignStatus,
  simulateEsignComplete,
  type InitiateEsignPayload,
  getVendorTickets,
  submitVendorTicket,
  getVendorNotifications,
  markNotificationsRead,
  completeOnboarding,
} from '../services/vendorPortalService';

// ── Query keys ─────────────────────────────────────────────────────────────
export const VQ = {
  dashboard:     ['vendor', 'dashboard']    as const,
  profile:       ['vendor', 'profile']      as const,
  kyc:           ['vendor', 'kyc']          as const,
  documents:     ['vendor', 'documents']    as const,
  pos:           ['vendor', 'pos']          as const,
  invoices:      ['vendor', 'invoices']     as const,
  payments:      ['vendor', 'payments']     as const,
  contracts:     ['vendor', 'contracts']    as const,
  esign:         (id: string) => ['vendor', 'esign', id] as const,
  tickets:       ['vendor', 'tickets']      as const,
  notifications: ['vendor', 'notifications'] as const,
};

// ── Queries ─────────────────────────────────────────────────────────────────
export const useVendorDashboard  = () => useQuery({ queryKey: VQ.dashboard,     queryFn: getVendorDashboard });
export const useVendorProfile    = () => useQuery({ queryKey: VQ.profile,       queryFn: getVendorProfile });
export const useVendorKyc        = () => useQuery({ queryKey: VQ.kyc,           queryFn: getVendorKyc });
export const useVendorDocuments  = () => useQuery({ queryKey: VQ.documents,     queryFn: getVendorDocuments });
export const useVendorPOs        = () => useQuery({ queryKey: VQ.pos,           queryFn: getVendorPOs });
export const useVendorInvoices   = () => useQuery({ queryKey: VQ.invoices,      queryFn: getVendorInvoices });
export const useVendorPayments   = () => useQuery({ queryKey: VQ.payments,      queryFn: getVendorPayments });
export const useVendorContracts  = () => useQuery({ queryKey: VQ.contracts,     queryFn: getVendorContracts });

export const useEsignStatus = (contractId: string) =>
  useQuery({ queryKey: VQ.esign(contractId), queryFn: () => getEsignStatus(contractId), staleTime: 10_000 });

export const useInitiateEsign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, payload }: { contractId: string; payload: InitiateEsignPayload }) =>
      initiateEsign(contractId, payload),
    onSuccess: (_, { contractId }) => {
      qc.invalidateQueries({ queryKey: VQ.esign(contractId) });
      qc.invalidateQueries({ queryKey: VQ.notifications });
      toast.success('E-signature request sent via SignDesk. Please complete signing using the OTP sent to you.');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to initiate e-signature. Please try again.');
    },
  });
};

export const useSimulateEsign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contractId: string) => simulateEsignComplete(contractId),
    onSuccess: (_, contractId) => {
      qc.invalidateQueries({ queryKey: VQ.esign(contractId) });
      qc.invalidateQueries({ queryKey: VQ.notifications });
      toast.success('Contract signed successfully via SignDesk.');
    },
    onError: () => toast.error('Simulation failed.'),
  });
};
export const useVendorTickets    = () => useQuery({ queryKey: VQ.tickets,       queryFn: getVendorTickets });
export const useVendorNotifications = () => useQuery({ queryKey: VQ.notifications, queryFn: getVendorNotifications });

// ── Mutations ────────────────────────────────────────────────────────────────
export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateVendorProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VQ.profile });
      toast.success('Profile updated successfully');
    },
    onError: () => toast.error('Failed to save profile'),
  });
};

export const useUpdateKyc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateVendorKyc,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VQ.kyc });
      toast.success('KYC registration numbers updated successfully');
    },
    onError: () => toast.error('Failed to update KYC'),
  });
};

export const useUploadDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, type, name, expiry, docId }: {
      file: File; type: string; name?: string; expiry?: string | null; docId?: string;
    }) => uploadVendorDocument(file, type, name, expiry, docId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: VQ.documents });
      qc.invalidateQueries({ queryKey: VQ.dashboard });
      toast.success(vars.docId ? 'Document renewed successfully' : 'Document uploaded and sent for verification');
    },
    onError: () => toast.error('Upload failed. Please try again.'),
  });
};

export const useDeleteDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => deleteVendorDocument(documentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VQ.documents });
      qc.invalidateQueries({ queryKey: VQ.dashboard });
      toast.success('Document deleted successfully.');
    },
    onError: () => toast.error('Delete failed. Please try again.'),
  });
};

export const useAcknowledgePO = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (poId: string) => acknowledgePO(poId),
    onSuccess: (_, poId) => {
      qc.invalidateQueries({ queryKey: VQ.pos });
      qc.invalidateQueries({ queryKey: VQ.dashboard });
      toast.success(`PO ${poId} acknowledged. Procurement team notified.`);
    },
    onError: () => toast.error('Acknowledgement failed. Please retry.'),
  });
};

export const useSubmitInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceNo, poId, amount }: { invoiceNo: string; poId: string; amount: number }) =>
      submitVendorInvoice(invoiceNo, poId, amount),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: VQ.invoices });
      qc.invalidateQueries({ queryKey: VQ.pos });
      qc.invalidateQueries({ queryKey: VQ.dashboard });
      toast.success(`Invoice ${vars.invoiceNo} submitted. OCR pipeline processing started.`);
    },
    onError: () => toast.error('Invoice submission failed. Please try again.'),
  });
};

export const useSubmitTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ category, subject, description }: { category: string; subject: string; description: string }) =>
      submitVendorTicket(category, subject, description),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: VQ.tickets });
      qc.invalidateQueries({ queryKey: VQ.dashboard });
      toast.success(`Ticket ${data.ticket.ticketId} raised. Assigned to Procurement Helpdesk.`);
    },
    onError: () => toast.error('Failed to submit ticket'),
  });
};

export const useMarkNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VQ.notifications });
      toast.success('All notifications marked as read');
    },
    onError: () => toast.error('Failed to mark notifications'),
  });
};

export const useCompleteOnboarding = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VQ.profile });
    },
    onError: () => toast.error('Failed to complete onboarding'),
  });
};

// ── Sprint 3 additions ───────────────────────────────────────────────────────
import {
  getVendorAuditTrail,
  getVendorSettings,
  saveVendorSettings,
  replyToTicket,
} from '../services/vendorPortalService';

export const VQ_EXTRA = {
  auditTrail: ['vendor', 'audit-trail'] as const,
  settings:   ['vendor', 'settings']   as const,
};

export const useVendorAuditTrail = () =>
  useQuery({ queryKey: VQ_EXTRA.auditTrail, queryFn: getVendorAuditTrail });

export const useVendorSettings = () =>
  useQuery({ queryKey: VQ_EXTRA.settings, queryFn: getVendorSettings });

export const useSaveVendorSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveVendorSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VQ_EXTRA.settings });
      toast.success('Preferences saved');
    },
    onError: () => toast.error('Failed to save preferences'),
  });
};

export const useReplyToTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: string; message: string }) =>
      replyToTicket(ticketId, message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VQ.tickets });
      toast.success('Reply sent');
    },
    onError: () => toast.error('Failed to send reply'),
  });
};
