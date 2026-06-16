const initialKycData = {
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
      riskScore: 85,
      riskLevel: "Low",
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

export const getKycData = () => {
  const data = localStorage.getItem("vms_kyc_data");
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse KYC data, falling back to defaults", e);
    }
  }
  saveKycData(initialKycData);
  return initialKycData;
};

export const saveKycData = (data) => {
  localStorage.setItem("vms_kyc_data", JSON.stringify(data));
};

export const resetKycData = () => {
  saveKycData(initialKycData);
  return initialKycData;
};
