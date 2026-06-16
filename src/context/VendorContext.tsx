import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface Check {
  name: string;
  status: string;
}

export interface ScreeningRun {
  screeningRunId: string;
  vendorId: string;
  runDate: string;
  runTime: string;
  performedBy: string;
  score: number;
  riskTier: string;
  subScores: {
    financialHealth: number;
    regulatory: number;
    operational: number;
    sanctions: number;
    adverseMedia: number;
    esg: number;
  };
  checks: Check[];
}

export interface Vendor {
  vendorId: string;
  status: string; // 'Active' | 'Pending Approval' | 'Rejected'
  createdAt: string;
  basicDetails?: {
    legalName: string;
    tradeName?: string;
    dateOfIncorporation?: string;
    cinNumber?: string;
    panNumber: string;
    gstin: string;
    msmeClassification?: string;
    companyWebsite?: string;
    businessType?: string;
  };
  businessDetails?: {
    vendorCategory: string;
    subCategory?: string;
    serviceAreas?: string[];
    productsServicesOffered?: string;
    annualTurnover?: number;
    employeeCount?: number;
    majorClients?: string[];
    criticalVendor?: boolean;
  };
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountType?: string;
    ifscCode?: string;
    branchName?: string;
    cancelledChequeFile?: string;
    bankVerificationStatus?: string;
  };
  documents?: any[];
  approvalWorkflow?: any;
  auditTrail?: any[];
  
  // KYC injected fields for flat access
  kycStatus?: string; // 'Pending Screening' | 'Screening Done' | 'Under Review' | 'Approved' | 'Rejected'
  riskScore?: number;
  riskLevel?: string; // 'Low' | 'Medium' | 'High' | 'Critical'
  lastVerified?: string;
  screeningHistory?: ScreeningRun[];
}

export interface KycVendorSummary {
  vendorId: string;
  vendorName: string;
  category: string;
  kycStatus: string;
  riskScore: number;
  riskLevel: string;
  lastVerified: string;
  nextReviewDate: string;
  status: string;
  screeningHistory?: ScreeningRun[];
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

export interface KycDataStore {
  vendors: KycVendorSummary[];
  screeningResults: ScreeningResult[];
  approvals: Approval[];
  auditLogs: AuditLog[];
}

interface VendorContextType {
  vendors: Vendor[];
  kycData: KycDataStore | null;
  loading: boolean;
  refreshVendors: () => Promise<void>;
  registerVendor: (payload: any) => Promise<any>;
  updateVendor: (vendorId: string, payload: any) => Promise<any>;
  deleteVendor: (vendorId: string) => Promise<void>;
  completeScreening: (vendorId: string, checks: Check[], riskScore: number, riskLevel: string, performedBy: string, subScores: any) => void;
  acceptAdvisory: (vendorId: string, username: string, timestamp: string) => void;
  submitDecision: (vendorId: string, decision: 'Approve' | 'Conditional Approval' | 'Hold' | 'Reject', remarks: string, authority: string) => Promise<void>;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

const initialKycData: KycDataStore = {
  vendors: [
    {
      vendorId: "VND-2025-00029",
      vendorName: "ABC Infotech Private Limited",
      category: "IT Services",
      kycStatus: "Approved",
      riskScore: 88,
      riskLevel: "Low",
      lastVerified: "12 Jun 2026",
      nextReviewDate: "12 Jun 2027",
      status: "Active"
    },
    {
      vendorId: "VND-2026-88001",
      vendorName: "HDFC Bank Limited",
      category: "Consulting",
      kycStatus: "Approved",
      riskScore: 82,
      riskLevel: "Medium",
      lastVerified: "11 Jun 2026",
      nextReviewDate: "11 Jun 2027",
      status: "Active"
    },
    {
      vendorId: "VND-2026-50469",
      vendorName: "My Money Mantra",
      category: "IT Services",
      kycStatus: "Pending Screening",
      riskScore: 0,
      riskLevel: "Low",
      lastVerified: "N/A",
      nextReviewDate: "15 Jun 2027",
      status: "Pending Approval"
    },
    {
      vendorId: "VND-2026-88164",
      vendorName: "axis max life",
      category: "IT Services",
      kycStatus: "Pending Screening",
      riskScore: 0,
      riskLevel: "Low",
      lastVerified: "N/A",
      nextReviewDate: "15 Jun 2027",
      status: "Pending Approval"
    }
  ],
  screeningResults: [
    {
      vendorId: "VND-2025-00029",
      completed: true,
      checks: [
        { name: "PAN Verification", status: "Clear" },
        { name: "GST Validation", status: "Clear" },
        { name: "CIN / MCA21", status: "Clear" },
        { name: "OFAC / UN", status: "Clear" },
        { name: "PEP Check", status: "Clear" },
        { name: "Adverse Media", status: "Clear" },
        { name: "Shell Company", status: "Clear" },
        { name: "CIBIL Score", status: "Clear" }
      ],
      advisoryAccepted: false,
      advisoryAcceptedBy: null,
      advisoryAcceptedAt: null
    },
    {
      vendorId: "VND-2026-88001",
      completed: true,
      checks: [
        { name: "PAN Verification", status: "Clear" },
        { name: "GST Validation", status: "Clear" },
        { name: "CIN / MCA21", status: "Clear" },
        { name: "OFAC / UN", status: "Clear" },
        { name: "PEP Check", status: "Clear" },
        { name: "Adverse Media", status: "Clear" },
        { name: "Shell Company", status: "Clear" },
        { name: "CIBIL Score", status: "Clear" }
      ],
      advisoryAccepted: false,
      advisoryAcceptedBy: null,
      advisoryAcceptedAt: null
    },
    {
      vendorId: "VND-2026-50469",
      completed: false,
      checks: [
        { name: "PAN Verification", status: "Pending" },
        { name: "GST Validation", status: "Pending" },
        { name: "CIN / MCA21", status: "Pending" },
        { name: "OFAC / UN", status: "Pending" },
        { name: "PEP Check", status: "Pending" },
        { name: "Adverse Media", status: "Pending" },
        { name: "Shell Company", status: "Pending" },
        { name: "CIBIL Score", status: "Pending" }
      ],
      advisoryAccepted: false,
      advisoryAcceptedBy: null,
      advisoryAcceptedAt: null
    },
    {
      vendorId: "VND-2026-88164",
      completed: false,
      checks: [
        { name: "PAN Verification", status: "Pending" },
        { name: "GST Validation", status: "Pending" },
        { name: "CIN / MCA21", status: "Pending" },
        { name: "OFAC / UN", status: "Pending" },
        { name: "PEP Check", status: "Pending" },
        { name: "Adverse Media", status: "Pending" },
        { name: "Shell Company", status: "Pending" },
        { name: "CIBIL Score", status: "Pending" }
      ],
      advisoryAccepted: false,
      advisoryAcceptedBy: null,
      advisoryAcceptedAt: null
    }
  ],
  approvals: [
    {
      vendorId: "VND-2025-00029",
      approvalStatus: "Approved",
      submittedBy: "Procurement Exec",
      submittedOn: "12 Jun 2026",
      remarks: "KYC documents verified and AML screening cleared. Recommended for empanelment."
    },
    {
      vendorId: "VND-2026-88001",
      approvalStatus: "Approved",
      submittedBy: "Procurement Exec",
      submittedOn: "11 Jun 2026",
      remarks: "Critical vendor checks completed. All certifications verified."
    },
    {
      vendorId: "VND-2026-50469",
      approvalStatus: "Pending",
      submittedBy: "Procurement Exec",
      submittedOn: "15 Jun 2026",
      remarks: "Awaiting final checkers sign-off."
    },
    {
      vendorId: "VND-2026-88164",
      approvalStatus: "Pending",
      submittedBy: "Procurement Exec",
      submittedOn: "15 Jun 2026",
      remarks: "Awaiting AI screening check completion."
    }
  ],
  auditLogs: [
    { timestamp: "12 Jun 2026 10:45 AM", actor: "Admin", action: "Approved My Money Mantra" }
  ]
};

const getKycDataLocal = (): KycDataStore => {
  const data = localStorage.getItem("vms_kyc_data");
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse KYC data, falling back to defaults", e);
    }
  }
  localStorage.setItem("vms_kyc_data", JSON.stringify(initialKycData));
  return initialKycData;
};

const saveKycDataLocal = (data: KycDataStore) => {
  localStorage.setItem("vms_kyc_data", JSON.stringify(data));
};

export const VendorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [kycData, setKycData] = useState<KycDataStore | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshVendors = async () => {
    try {
      const res = await axios.get('/api/vendors');
      const apiVendors: Vendor[] = res.data || [];
      const kycStore = getKycDataLocal();

      // Merge and synchronize
      let storeChanged = false;
      
      apiVendors.forEach(av => {
        const hasKyc = kycStore.vendors.find(kv => kv.vendorId === av.vendorId);
        if (!hasKyc) {
          storeChanged = true;
          const name = av.basicDetails?.legalName || av.vendorId;
          const category = av.businessDetails?.vendorCategory || 'IT Services';
          const defaultKycStatus = av.status === 'Active' ? 'Approved' : 'Pending Screening';
          const defaultRiskScore = av.status === 'Active' ? 88 : 0;
          const defaultRiskLevel = 'Low';
          const defaultApprovalStatus = av.status === 'Active' ? 'Approved' : 'Draft';
          
          kycStore.vendors.push({
            vendorId: av.vendorId,
            vendorName: name,
            category: category,
            kycStatus: defaultKycStatus,
            riskScore: defaultRiskScore,
            riskLevel: defaultRiskLevel,
            lastVerified: av.status === 'Active' ? '12 Jun 2026' : 'N/A',
            nextReviewDate: '15 Jun 2027',
            status: av.status
          });

          kycStore.screeningResults.push({
            vendorId: av.vendorId,
            completed: av.status === 'Active',
            checks: av.status === 'Active' 
              ? [
                  { name: "PAN Verification", status: "Clear" },
                  { name: "GST Validation", status: "Clear" },
                  { name: "CIN / MCA21", status: "Clear" },
                  { name: "OFAC / UN", status: "Clear" },
                  { name: "PEP Check", status: "Clear" },
                  { name: "Adverse Media", status: "Clear" },
                  { name: "Shell Company", status: "Clear" },
                  { name: "CIBIL Score", status: "Clear" }
                ]
              : [
                  { name: "PAN Verification", status: "Pending" },
                  { name: "GST Validation", status: "Pending" },
                  { name: "CIN / MCA21", status: "Pending" },
                  { name: "OFAC / UN", status: "Pending" },
                  { name: "PEP Check", status: "Pending" },
                  { name: "Adverse Media", status: "Pending" },
                  { name: "Shell Company", status: "Pending" },
                  { name: "CIBIL Score", status: "Pending" }
                ],
            advisoryAccepted: false,
            advisoryAcceptedBy: null,
            advisoryAcceptedAt: null
          });

          kycStore.approvals.push({
            vendorId: av.vendorId,
            approvalStatus: defaultApprovalStatus,
            submittedBy: av.status === 'Active' ? 'Procurement Exec' : 'N/A',
            submittedOn: av.status === 'Active' ? '12 Jun 2026' : 'N/A',
            remarks: av.status === 'Active' ? 'Approved & Empanelled' : 'Draft pending screening'
          });
        }
      });

      if (storeChanged) {
        saveKycDataLocal(kycStore);
      }

      // Merge into full Vendor state object
      const mergedVendors = apiVendors.map(av => {
        const kycRecord = kycStore.vendors.find(kv => kv.vendorId === av.vendorId);
        return {
          ...av,
          status: kycRecord ? kycRecord.status : av.status, // use synced onboarding status
          kycStatus: kycRecord ? kycRecord.kycStatus : 'Pending Screening',
          riskScore: kycRecord ? kycRecord.riskScore : 0,
          riskLevel: kycRecord ? kycRecord.riskLevel : 'Low',
          lastVerified: kycRecord ? kycRecord.lastVerified : 'N/A',
          screeningHistory: kycRecord ? kycRecord.screeningHistory : []
        };
      });

      setKycData(kycStore);
      setVendors(mergedVendors);
    } catch (err) {
      console.error('Error fetching/merging vendors in context:', err);
      // Fallback: load only from localStorage if backend fails
      const kycStore = getKycDataLocal();
      const fallbackVendors = kycStore.vendors.map(kv => ({
        vendorId: kv.vendorId,
        status: kv.status,
        createdAt: new Date().toISOString(),
        basicDetails: {
          legalName: kv.vendorName,
          panNumber: 'N/A',
          gstin: 'N/A'
        },
        businessDetails: {
          vendorCategory: kv.category
        },
        kycStatus: kv.kycStatus,
        riskScore: kv.riskScore,
        riskLevel: kv.riskLevel,
        lastVerified: kv.lastVerified,
        screeningHistory: kv.screeningHistory || []
      }));
      setKycData(kycStore);
      setVendors(fallbackVendors);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshVendors();
  }, []);

  const registerVendor = async (payload: any) => {
    // Generate a Vendor ID
    const year = new Date().getFullYear();
    const num = Math.floor(Math.random() * 90000) + 10000;
    const vendorId = `VND-${year}-${num}`;

    const newVendor: Vendor = {
      ...payload,
      vendorId,
      status: 'Pending Approval',
      createdAt: new Date().toISOString(),
      kycStatus: 'Pending Screening',
      riskScore: 0,
      riskLevel: 'Low',
      lastVerified: 'N/A'
    };

    // Save in localStorage kycData
    const kycStore = getKycDataLocal();
    kycStore.vendors.push({
      vendorId,
      vendorName: payload.basicDetails?.legalName || 'New Vendor',
      category: payload.businessDetails?.vendorCategory || 'IT Services',
      kycStatus: 'Pending Screening',
      riskScore: 0,
      riskLevel: 'Low',
      lastVerified: 'N/A',
      nextReviewDate: '15 Jun 2027',
      status: 'Pending Approval'
    });

    kycStore.screeningResults.push({
      vendorId,
      completed: false,
      checks: [
        { name: "PAN Verification", status: "Pending" },
        { name: "GST Validation", status: "Pending" },
        { name: "CIN / MCA21", status: "Pending" },
        { name: "OFAC / UN", status: "Pending" },
        { name: "PEP Check", status: "Pending" },
        { name: "Adverse Media", status: "Pending" },
        { name: "Shell Company", status: "Pending" },
        { name: "CIBIL Score", status: "Pending" }
      ],
      advisoryAccepted: false,
      advisoryAcceptedBy: null,
      advisoryAcceptedAt: null
    });

    kycStore.approvals.push({
      vendorId,
      approvalStatus: 'Draft',
      submittedBy: 'Procurement Exec',
      submittedOn: new Date().toLocaleDateString('en-IN'),
      remarks: 'Draft pending AI screening'
    });

    saveKycDataLocal(kycStore);

    // Call Axios post
    try {
      await axios.post('/api/vendors', { ...payload, vendorId, status: 'Pending Approval' });
    } catch (e) {
      console.error('Failed to post vendor to server api, continuing client-side', e);
    }

    await refreshVendors();
    return newVendor;
  };

  const updateVendor = async (vendorId: string, payload: any) => {
    // Update local storage
    const kycStore = getKycDataLocal();
    const idx = kycStore.vendors.findIndex(kv => kv.vendorId === vendorId);
    if (idx !== -1) {
      kycStore.vendors[idx].vendorName = payload.basicDetails?.legalName || kycStore.vendors[idx].vendorName;
      kycStore.vendors[idx].category = payload.businessDetails?.vendorCategory || kycStore.vendors[idx].category;
      saveKycDataLocal(kycStore);
    }

    try {
      await axios.put(`/api/vendors/${vendorId}`, payload);
    } catch (e) {
      console.error('Failed to update vendor on server api', e);
    }

    await refreshVendors();
    return { ...payload, vendorId };
  };

  const deleteVendor = async (vendorId: string) => {
    const kycStore = getKycDataLocal();
    kycStore.vendors = kycStore.vendors.filter(kv => kv.vendorId !== vendorId);
    kycStore.screeningResults = kycStore.screeningResults.filter(sr => sr.vendorId !== vendorId);
    kycStore.approvals = kycStore.approvals.filter(a => a.vendorId !== vendorId);
    saveKycDataLocal(kycStore);

    try {
      await axios.delete(`/api/vendors/${vendorId}`);
    } catch (e) {
      console.error('Failed to delete vendor on server api', e);
    }

    await refreshVendors();
  };

  const completeScreening = (
    vendorId: string, 
    checks: Check[], 
    riskScore: number, 
    riskLevel: string,
    performedBy: string,
    subScores: any
  ) => {
    const kycStore = getKycDataLocal();
    const vIdx = kycStore.vendors.findIndex(kv => kv.vendorId === vendorId);
    const sIdx = kycStore.screeningResults.findIndex(sr => sr.vendorId === vendorId);
    const aIdx = kycStore.approvals.findIndex(a => a.vendorId === vendorId);

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const runId = `RUN-${Date.now()}`;
    const newRun = {
      screeningRunId: runId,
      vendorId,
      runDate: dateStr,
      runTime: timeStr,
      performedBy,
      score: riskScore,
      riskTier: riskLevel,
      subScores,
      checks
    };

    if (vIdx !== -1) {
      const vendorRecord = kycStore.vendors[vIdx];
      vendorRecord.kycStatus = 'Under Review';
      vendorRecord.riskScore = riskScore;
      vendorRecord.riskLevel = riskLevel;
      vendorRecord.lastVerified = dateStr + ' ' + timeStr;
      
      // Initialize or append to history list (most recent first)
      if (!vendorRecord.screeningHistory) {
        vendorRecord.screeningHistory = [];
      }
      vendorRecord.screeningHistory.unshift(newRun);
    }

    if (sIdx !== -1) {
      kycStore.screeningResults[sIdx].completed = true;
      kycStore.screeningResults[sIdx].checks = checks;
      (kycStore.screeningResults[sIdx] as any).subScores = subScores;
      kycStore.screeningResults[sIdx].advisoryAccepted = false;
      kycStore.screeningResults[sIdx].advisoryAcceptedBy = null;
      kycStore.screeningResults[sIdx].advisoryAcceptedAt = null;
    }

    if (aIdx !== -1) {
      kycStore.approvals[aIdx].approvalStatus = 'Pending'; // Pending Review
      kycStore.approvals[aIdx].submittedBy = performedBy;
      kycStore.approvals[aIdx].submittedOn = dateStr;
      
      const clearCount = checks.filter(c => 
        ["Clear", "Verified", "Active", "Valid", "Active company", "No sanctions found", "Excellent", "Good", "Fair"].includes(c.status)
      ).length;
      const advisoryCount = checks.length - clearCount;
      const screeningText = advisoryCount === 0 ? 'All clear' : `${clearCount}/8 Clear + ${advisoryCount} advisory`;
      kycStore.approvals[aIdx].remarks = `AML screening checks completed (Run #${runId}). Score: ${riskScore}, Risk: ${riskLevel}. ${screeningText}.`;
    }

    // Unshift to audit logs
    kycStore.auditLogs.unshift({
      timestamp: dateStr + ' ' + timeStr,
      actor: performedBy,
      action: `Vendor screened by ${performedBy}. Score: ${riskScore}, Risk: ${riskLevel}`
    });

    saveKycDataLocal(kycStore);
    refreshVendors();
  };

  const acceptAdvisory = (vendorId: string, username: string, timestamp: string) => {
    const kycStore = getKycDataLocal();
    const sIdx = kycStore.screeningResults.findIndex(sr => sr.vendorId === vendorId);
    if (sIdx !== -1) {
      kycStore.screeningResults[sIdx].advisoryAccepted = true;
      kycStore.screeningResults[sIdx].advisoryAcceptedBy = username;
      kycStore.screeningResults[sIdx].advisoryAcceptedAt = timestamp;
    }
    saveKycDataLocal(kycStore);
    refreshVendors();
  };

  const submitDecision = async (
    vendorId: string,
    decision: 'Approve' | 'Conditional Approval' | 'Hold' | 'Reject',
    remarks: string,
    authority: string
  ) => {
    const kycStore = getKycDataLocal();
    const vIdx = kycStore.vendors.findIndex(kv => kv.vendorId === vendorId);
    const aIdx = kycStore.approvals.findIndex(a => a.vendorId === vendorId);

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const dateTimeStr = dateStr + ' ' + now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    if (decision === 'Approve' || decision === 'Conditional Approval') {
      if (vIdx !== -1) {
        kycStore.vendors[vIdx].kycStatus = 'Approved';
        kycStore.vendors[vIdx].status = 'Active';
      }
      if (aIdx !== -1) {
        kycStore.approvals[aIdx].approvalStatus = decision === 'Approve' ? 'Approved' : 'Conditional';
        kycStore.approvals[aIdx].submittedBy = authority;
        kycStore.approvals[aIdx].submittedOn = dateStr;
        kycStore.approvals[aIdx].remarks = remarks;
      }

      kycStore.auditLogs.unshift({
        timestamp: dateTimeStr,
        actor: authority,
        action: `${decision === 'Approve' ? 'Approved' : 'Conditionally Approved'} ${kycStore.vendors[vIdx]?.vendorName}`
      });

      // parallel call to server approve
      try {
        await axios.post(`/api/vendors/${vendorId}/approve`, {
          remarks,
          performedBy: authority
        });
      } catch (e) {
        console.error('Server approve endpoint failed', e);
      }

    } else if (decision === 'Reject') {
      if (vIdx !== -1) {
        kycStore.vendors[vIdx].kycStatus = 'Rejected';
        kycStore.vendors[vIdx].status = 'Rejected';
      }
      if (aIdx !== -1) {
        kycStore.approvals[aIdx].approvalStatus = 'Rejected';
        kycStore.approvals[aIdx].submittedBy = authority;
        kycStore.approvals[aIdx].submittedOn = dateStr;
        kycStore.approvals[aIdx].remarks = remarks;
      }

      kycStore.auditLogs.unshift({
        timestamp: dateTimeStr,
        actor: authority,
        action: `Rejected ${kycStore.vendors[vIdx]?.vendorName}`
      });

      // parallel call to server reject
      try {
        await axios.post(`/api/vendors/${vendorId}/reject`, {
          remarks,
          performedBy: authority
        });
      } catch (e) {
        console.error('Server reject endpoint failed', e);
      }

    } else if (decision === 'Hold') {
      if (vIdx !== -1) {
        kycStore.vendors[vIdx].kycStatus = 'Under Review';
        kycStore.vendors[vIdx].status = 'Pending Approval';
      }
      if (aIdx !== -1) {
        kycStore.approvals[aIdx].approvalStatus = 'Hold';
        kycStore.approvals[aIdx].submittedBy = authority;
        kycStore.approvals[aIdx].submittedOn = dateStr;
        kycStore.approvals[aIdx].remarks = remarks;
      }

      kycStore.auditLogs.unshift({
        timestamp: dateTimeStr,
        actor: authority,
        action: `Placed on Hold ${kycStore.vendors[vIdx]?.vendorName}`
      });
    }

    saveKycDataLocal(kycStore);
    await refreshVendors();
  };

  return (
    <VendorContext.Provider value={{
      vendors,
      kycData,
      loading,
      refreshVendors,
      registerVendor,
      updateVendor,
      deleteVendor,
      completeScreening,
      acceptAdvisory,
      submitDecision
    }}>
      {children}
    </VendorContext.Provider>
  );
};

export const useVendors = () => {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error('useVendors must be used within a VendorProvider');
  }
  return context;
};
