import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import {
  readJsonFile,
  writeJsonFile,
  appendJsonData,
  updateJsonData,
  deleteJsonData
} from './services/jsonService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Resolve database paths
const SRC_DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const VENDORS_PATH = path.join(SRC_DATA_DIR, 'vendors.json');
const DOCUMENTS_PATH = path.join(SRC_DATA_DIR, 'documents.json');
const KYC_DASHBOARD_PATH = path.join(SRC_DATA_DIR, 'kyc-dashboard.json');
const SCREENING_RESULTS_PATH = path.join(SRC_DATA_DIR, 'screening-results.json');
const REVIEWS_APPROVALS_PATH = path.join(SRC_DATA_DIR, 'reviews-approvals.json');
const REVIEWS_PATH = path.join(SRC_DATA_DIR, 'reviews.json');
const AUDIT_LOG_PATH = path.join(SRC_DATA_DIR, 'audit-log.json');

const APPROVALS_PATH = path.join(__dirname, 'data', 'approvals.json');
const ADMIN_NOTIFICATIONS_PATH = path.join(__dirname, 'data', 'adminNotifications.json');
const ADMIN_INVOICES_PATH = path.join(__dirname, 'data', 'invoices.json');
const ADMIN_PAYMENTS_PATH = path.join(__dirname, 'data', 'payments.json');
const PAYMENT_APPROVALS_PATH = path.join(__dirname, 'data', 'payment-approvals.json');
const FINANCE_DIR = path.join(__dirname, 'data', 'finance');
const TDS_PATH = path.join(FINANCE_DIR, 'tds.json');
const BANK_RECON_PATH = path.join(FINANCE_DIR, 'bank-reconciliation.json');
const AGING_PATH = path.join(FINANCE_DIR, 'aging-report.json');
const AUDIT_LOGS_PATH = path.join(__dirname, 'data', 'audit-logs.json');
const DOC_TYPES_PATH = path.join(__dirname, 'data', 'document-types.json');
const DOC_CATEGORIES_PATH = path.join(__dirname, 'data', 'document-categories.json');
const DOC_VERIFICATION_PATH = path.join(__dirname, 'data', 'document-verification.json');
const DOC_AUDIT_LOGS_PATH = path.join(__dirname, 'data', 'document-audit-logs.json');
const KYC_VERIFICATION_PATH = path.join(__dirname, 'data', 'kyc', 'kyc-verification.json');
const KYC_RISK_ASSESSMENT_PATH = path.join(__dirname, 'data', 'kyc', 'risk-assessment.json');
const KYC_SANCTIONS_SCREENING_PATH = path.join(__dirname, 'data', 'kyc', 'sanctions-screening.json');
const KYC_BLACKLIST_CHECK_PATH = path.join(__dirname, 'data', 'kyc', 'blacklist-check.json');
const KYC_PEP_SCREENING_PATH = path.join(__dirname, 'data', 'kyc', 'pep-screening.json');
const KYC_ADVERSE_MEDIA_PATH = path.join(__dirname, 'data', 'kyc', 'adverse-media.json');
const KYC_SHELL_COMPANY_PATH = path.join(__dirname, 'data', 'kyc', 'shell-company-check.json');
const KYC_RE_KYC_SCHEDULING_PATH = path.join(__dirname, 'data', 'kyc', 're-kyc-scheduling.json');
const KYC_REKYC_REMINDERS_PATH = path.join(__dirname, 'data', 'kyc', 'rekyc-reminders.json');
const KYC_APPROVALS_PATH = path.join(__dirname, 'data', 'kyc', 'vendor-approvals.json');

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const STORAGE_DIR = path.join(__dirname, '..', 'storage');
const DOC_UPLOADS_DIR = path.join(STORAGE_DIR, 'documents');
const VENDOR_STORAGE_DIR = path.join(STORAGE_DIR, 'vendors');
const SCREENING_STORAGE_DIR = path.join(STORAGE_DIR, 'screening');
const REVIEWS_STORAGE_DIR = path.join(STORAGE_DIR, 'reviews');
const KYC_UPLOADS_DIR = path.join(UPLOADS_DIR, 'kyc');
const SANCTIONS_UPLOADS_DIR = path.join(KYC_UPLOADS_DIR, 'sanctions');
const BLACKLIST_UPLOADS_DIR = path.join(KYC_UPLOADS_DIR, 'blacklist');
const PEP_UPLOADS_DIR = path.join(KYC_UPLOADS_DIR, 'pep');
const ADVERSE_MEDIA_UPLOADS_DIR = path.join(KYC_UPLOADS_DIR, 'adverse-media');
const SHELL_COMPANY_UPLOADS_DIR = path.join(KYC_UPLOADS_DIR, 'shell-company');
const RE_KYC_UPLOADS_DIR = path.join(KYC_UPLOADS_DIR, 're-kyc');
const APPROVALS_UPLOADS_DIR = path.join(KYC_UPLOADS_DIR, 'approvals');

// Catalogue database paths
const CAT_ITEMS_PATH = path.join(__dirname, 'data', 'catalogue-items.json');
const CAT_SERVICES_PATH = path.join(__dirname, 'data', 'catalogue-services.json');
const CAT_SERVICE_ATTACHMENTS_PATH = path.join(__dirname, 'data', 'catalogue', 'service-attachments.json');
const CAT_SERVICE_AUDIT_LOG_PATH = path.join(__dirname, 'data', 'catalogue', 'service-audit-log.json');
const CAT_CATEGORIES_PATH = path.join(__dirname, 'data', 'catalogue', 'categories.json');
const CAT_VENDORS_PATH = path.join(__dirname, 'data', 'catalogue', 'vendors.json');
const CAT_HSN_CODES_PATH = path.join(__dirname, 'data', 'catalogue', 'hsn-sac-codes.json');
const CAT_UOMS_PATH = path.join(__dirname, 'data', 'catalogue', 'uom.json');
const CAT_APPROVALS_PATH = path.join(__dirname, 'data', 'catalogue-approvals.json');
const CAT_ACTIVITY_PATH = path.join(__dirname, 'data', 'catalogue', 'item-activity.json');
const CAT_DASHBOARD_PATH = path.join(__dirname, 'data', 'catalogue', 'item-dashboard.json');
const CAT_UPLOADED_FILES_PATH = path.join(__dirname, 'data', 'catalogue', 'uploaded-files.json');
const CAT_ATTACHMENTS_PATH = path.join(__dirname, 'data', 'catalogue', 'item-attachments.json');
const CAT_AUDIT_LOG_PATH = path.join(__dirname, 'data', 'catalogue', 'item-audit-log.json');
const CAT_DOCUMENTS_PATH = path.join(__dirname, 'data', 'catalogue-documents.json');
const CAT_VENDOR_MAPPINGS_PATH = path.join(__dirname, 'data', 'vendor-mappings.json');

// Auth database paths
const AUTH_DIR = path.join(__dirname, 'data', 'auth');
const AUTH_USERS_PATH = path.join(AUTH_DIR, 'users.json');
const AUTH_ROLES_PATH = path.join(AUTH_DIR, 'roles.json');
const AUTH_PERMISSIONS_PATH = path.join(AUTH_DIR, 'permissions.json');
const AUTH_AUDIT_PATH = path.join(AUTH_DIR, 'login-audit.json');
const AUTH_SESSIONS_PATH = path.join(AUTH_DIR, 'sessions.json');
const AUTH_OTP_STORE_PATH = path.join(AUTH_DIR, 'otp-store.json');

const SETTINGS_PATH = path.join(__dirname, 'data', 'settings.json');
const SETTINGS_UPLOADS_DIR = path.join(UPLOADS_DIR, 'settings');

const CAT_UPLOADS_DIR = path.join(UPLOADS_DIR, 'catalogue');
const CAT_SPECS_DIR = path.join(CAT_UPLOADS_DIR, 'specifications');
const CAT_IMAGES_DIR = path.join(CAT_UPLOADS_DIR, 'images');
const CAT_COMPLIANCE_DIR = path.join(CAT_UPLOADS_DIR, 'compliance');
const CAT_TEMP_DIR = path.join(CAT_UPLOADS_DIR, 'temp');
const CAT_ITEMS_UPLOADS_DIR = path.join(CAT_UPLOADS_DIR, 'items');
const CAT_SERVICES_UPLOADS_DIR = path.join(CAT_UPLOADS_DIR, 'services');

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(SRC_DATA_DIR, { recursive: true });
  await fs.mkdir(STORAGE_DIR, { recursive: true });
  await fs.mkdir(DOC_UPLOADS_DIR, { recursive: true });
  await fs.mkdir(VENDOR_STORAGE_DIR, { recursive: true });
  await fs.mkdir(SCREENING_STORAGE_DIR, { recursive: true });
  await fs.mkdir(REVIEWS_STORAGE_DIR, { recursive: true });

  // Sync / Copy vendors.json if not exists in src/data
  try {
    await fs.access(VENDORS_PATH);
  } catch {
    try {
      const fallbackVendors = path.join(__dirname, 'data', 'vendors.json');
      const data = await fs.readFile(fallbackVendors, 'utf8');
      await fs.writeFile(VENDORS_PATH, data, 'utf8');
    } catch {
      await fs.writeFile(VENDORS_PATH, '[]', 'utf8');
    }
  }

  // Sync / Copy documents.json if not exists in src/data
  try {
    await fs.access(DOCUMENTS_PATH);
  } catch {
    try {
      const fallbackDocs = path.join(__dirname, 'data', 'documents.json');
      const data = await fs.readFile(fallbackDocs, 'utf8');
      await fs.writeFile(DOCUMENTS_PATH, data, 'utf8');
    } catch {
      await fs.writeFile(DOCUMENTS_PATH, '[]', 'utf8');
    }
  }

  // Initialize kyc-dashboard.json
  try {
    await fs.access(KYC_DASHBOARD_PATH);
  } catch {
    await fs.writeFile(KYC_DASHBOARD_PATH, JSON.stringify({ lastUpdated: "", summary: {}, vendors: [] }), 'utf8');
  }

  // Initialize screening-results.json
  try {
    await fs.access(SCREENING_RESULTS_PATH);
  } catch {
    await fs.writeFile(SCREENING_RESULTS_PATH, JSON.stringify({ screenings: [] }), 'utf8');
  }

  // Initialize reviews-approvals.json
  try {
    await fs.access(REVIEWS_APPROVALS_PATH);
  } catch {
    try {
      const fallbackReviews = path.join(__dirname, 'data', 'kyc', 'reviews.json');
      const data = await fs.readFile(fallbackReviews, 'utf8');
      const parsed = JSON.parse(data);
      const reviewsData = {
        reviews: parsed.reviews || parsed || [],
        pendingApprovals: parsed.pendingApprovals || [],
        completedReviews: parsed.completedReviews || []
      };
      await fs.writeFile(REVIEWS_APPROVALS_PATH, JSON.stringify(reviewsData, null, 2), 'utf8');
    } catch {
      await fs.writeFile(REVIEWS_APPROVALS_PATH, JSON.stringify({ reviews: [], pendingApprovals: [], completedReviews: [] }), 'utf8');
    }
  }

  // Initialize adminNotifications.json
  try {
    await fs.access(ADMIN_NOTIFICATIONS_PATH);
  } catch {
    await fs.writeFile(ADMIN_NOTIFICATIONS_PATH, '[]', 'utf8');
  }

  // Initialize reviews.json
  try {
    await fs.access(REVIEWS_PATH);
  } catch {
    await fs.writeFile(REVIEWS_PATH, JSON.stringify({ reviews: [] }), 'utf8');
  }

  // Initialize audit-log.json
  try {
    await fs.access(AUDIT_LOG_PATH);
  } catch {
    await fs.writeFile(AUDIT_LOG_PATH, '[]', 'utf8');
  }

  await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
  await fs.mkdir(path.join(__dirname, 'data', 'catalogue'), { recursive: true });
  await fs.mkdir(path.join(__dirname, 'data', 'kyc'), { recursive: true });
  await fs.mkdir(FINANCE_DIR, { recursive: true });
  try { await fs.access(ADMIN_INVOICES_PATH); } catch { await fs.writeFile(ADMIN_INVOICES_PATH, '[]', 'utf8'); }
  try { await fs.access(ADMIN_PAYMENTS_PATH); } catch { await fs.writeFile(ADMIN_PAYMENTS_PATH, '[]', 'utf8'); }
  try {
    await fs.access(PAYMENT_APPROVALS_PATH);
  } catch {
    const initialApprovals = [
      {
        approvalId: "PA-2026-0001",
        paymentId: "PAY-2026-0089",
        vendorName: "Secure Facilities Ltd",
        invoiceRef: "INV-2026-9907",
        amount: 522000,
        status: "Pending Approval",
        submittedBy: "Accounts Payable",
        submittedDate: "2026-06-15",
        remarks: "",
        timestamp: "2026-06-15T10:00:00.000Z",
        statusHistory: [
          {
            status: "Pending Approval",
            timestamp: "2026-06-15T10:00:00.000Z",
            changedBy: "Accounts Payable"
          }
        ],
        attachmentIds: ["ATT-001", "ATT-002"]
      }
    ];
    await fs.writeFile(PAYMENT_APPROVALS_PATH, JSON.stringify(initialApprovals, null, 2), 'utf8');
  }
  try { await fs.access(TDS_PATH); } catch { await fs.writeFile(TDS_PATH, '[]', 'utf8'); }
  try { await fs.access(BANK_RECON_PATH); } catch { await fs.writeFile(BANK_RECON_PATH, '[]', 'utf8'); }
  try { await fs.access(AGING_PATH); } catch { await fs.writeFile(AGING_PATH, '[]', 'utf8'); }
  await fs.mkdir(AUTH_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(KYC_UPLOADS_DIR, { recursive: true });
  await fs.mkdir(CAT_SPECS_DIR, { recursive: true });
  await fs.mkdir(CAT_IMAGES_DIR, { recursive: true });
  await fs.mkdir(CAT_COMPLIANCE_DIR, { recursive: true });
  await fs.mkdir(CAT_TEMP_DIR, { recursive: true });
  await fs.mkdir(CAT_ITEMS_UPLOADS_DIR, { recursive: true });
  await fs.mkdir(CAT_SERVICES_UPLOADS_DIR, { recursive: true });
  await fs.mkdir(SETTINGS_UPLOADS_DIR, { recursive: true });
  await fs.mkdir(SHELL_COMPANY_UPLOADS_DIR, { recursive: true });
  await fs.mkdir(RE_KYC_UPLOADS_DIR, { recursive: true });

  // Initialize attachments and audit logs JSON if they don't exist
  try {
    await fs.access(CAT_ATTACHMENTS_PATH);
  } catch {
    await fs.writeFile(CAT_ATTACHMENTS_PATH, '[]', 'utf8');
  }
  try {
    await fs.access(CAT_AUDIT_LOG_PATH);
  } catch {
    await fs.writeFile(CAT_AUDIT_LOG_PATH, '[]', 'utf8');
  }

  // Helper to copy file if exists
  const copyFileIfExists = async (src, dest) => {
    try {
      await fs.access(dest);
    } catch {
      try {
        await fs.access(src);
        const data = await fs.readFile(src, 'utf8');
        await fs.writeFile(dest, data, 'utf8');
      } catch {
        await fs.writeFile(dest, '[]', 'utf8');
      }
    }
  };

  // Sync/Copy catalogue files
  const oldItemsPath = path.join(__dirname, 'data', 'catalogue', 'items.json');
  const oldServicesPath = path.join(__dirname, 'data', 'catalogue', 'services.json');
  const oldApprovalsPath = path.join(__dirname, 'data', 'catalogue', 'item-approvals.json');
  const oldVendorMappingPath = path.join(__dirname, 'data', 'catalogue', 'vendor-mapping.json');

  await copyFileIfExists(oldItemsPath, CAT_ITEMS_PATH);
  await copyFileIfExists(oldServicesPath, CAT_SERVICES_PATH);
  await copyFileIfExists(oldApprovalsPath, CAT_APPROVALS_PATH);
  await copyFileIfExists(oldVendorMappingPath, CAT_VENDOR_MAPPINGS_PATH);

  try {
    await fs.access(CAT_DOCUMENTS_PATH);
  } catch {
    await fs.writeFile(CAT_DOCUMENTS_PATH, '[]', 'utf8');
  }

  // Create uploads catalogue directory
  await fs.mkdir(path.join(__dirname, 'uploads', 'catalogue'), { recursive: true });

  try {
    await fs.access(CAT_SERVICE_ATTACHMENTS_PATH);
  } catch {
    await fs.writeFile(CAT_SERVICE_ATTACHMENTS_PATH, '[]', 'utf8');
  }
  try {
    await fs.access(CAT_SERVICE_AUDIT_LOG_PATH);
  } catch {
    await fs.writeFile(CAT_SERVICE_AUDIT_LOG_PATH, '[]', 'utf8');
  }
}
ensureDirectories().catch(console.error);

// Enterprise VMS Audit Logger
async function logVmsAuditTrail(action, details, performedBy = 'Saurabh Anand', status = 'Success') {
  try {
    let logs = [];
    try {
      logs = await readJsonFile(AUDIT_LOG_PATH);
      if (!Array.isArray(logs)) logs = [];
    } catch (e) {
      logs = [];
    }
    const newLog = {
      id: `AUD-2026-${String(logs.length + 1).padStart(4, '0')}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      performedBy,
      status
    };
    logs.push(newLog);
    await writeJsonFile(AUDIT_LOG_PATH, logs);
    console.log(`VMS Audit logged: ${action} - ${details}`);
  } catch (err) {
    console.error('Error logging VMS audit:', err);
  }
}

// Enterprise VMS Recalculation Engine
async function recalculateVmsSystem() {
  try {
    console.log('Running connected VMS Recalculation Engine...');
    const vendors = await readJsonFile(VENDORS_PATH);
    const documents = await readJsonFile(DOCUMENTS_PATH);

    // CENTRALIZED RISK CALCULATION & SAVE TO vendors.json
    const updatedVendors = vendors.map(v => {
      const vendorId = v.vendorId;
      const vendorName = v.vendorName || v.basicDetails?.legalName || v.basicDetails?.tradeName || 'Unnamed Vendor';

      let sanctionsScore = 0;
      if (vendorName.toLowerCase().includes('secure') || vendorId === 'VND-2026-22003') {
        sanctionsScore = 80;
      }

      let pepScore = 0;
      if (vendorName.toLowerCase().includes('money') || vendorId === 'VND-2026-50469') {
        pepScore = 50;
      } else if (vendorName.toLowerCase().includes('secure') || vendorId === 'VND-2026-22003') {
        pepScore = 60;
      }

      let adverseMediaScore = 0;
      if (vendorName.toLowerCase().includes('hdfc') || vendorId === 'VND-2026-88001') {
        adverseMediaScore = 10;
      } else if (vendorName.toLowerCase().includes('money') || vendorId === 'VND-2026-50469') {
        adverseMediaScore = 20;
      } else if (vendorName.toLowerCase().includes('secure') || vendorId === 'VND-2026-22003') {
        adverseMediaScore = 40;
      }

      let blacklistScore = 0;
      if (vendorName.toLowerCase().includes('secure') || vendorId === 'VND-2026-22003') {
        blacklistScore = 100;
      }

      let shellScore = 5;
      if (vendorName.toLowerCase().includes('secure') || vendorId === 'VND-2026-22003') {
        shellScore = 70;
      } else if (vendorName.toLowerCase().includes('money') || vendorId === 'VND-2026-50469') {
        shellScore = 20;
      } else if (vendorId === 'VND-2026-11002') {
        shellScore = 10;
      }

      const totalRiskScore = sanctionsScore + pepScore + adverseMediaScore + blacklistScore + shellScore;
      let overallRisk = 'Low';
      if (totalRiskScore <= 30) overallRisk = 'Low';
      else if (totalRiskScore <= 60) overallRisk = 'Medium';
      else if (totalRiskScore <= 80) overallRisk = 'High';
      else overallRisk = 'Critical';

      v.risk = {
        score: totalRiskScore,
        level: overallRisk
      };
      v.riskLevel = overallRisk;

      return v;
    });

    await writeJsonFile(VENDORS_PATH, updatedVendors);

    // 1. Recalculate KYC Statuses & Dashboard Counts
    const kycVendorsList = updatedVendors.map(v => {
      const vendorId = v.vendorId;
      const vendorName = v.vendorName || v.basicDetails?.legalName || v.basicDetails?.tradeName || 'Unnamed Vendor';
      
      // Filter documents for this vendor
      const vendorDocs = documents.filter(d => 
        (d.vendor?.vendorId === vendorId) || 
        (d.vendorId === vendorId)
      );

      const panDoc = vendorDocs.find(d => 
        (d.documentName || '').toUpperCase().includes('PAN') || 
        (d.documentType || '').toUpperCase().includes('PAN')
      );
      const gstDoc = vendorDocs.find(d => 
        (d.documentName || '').toUpperCase().includes('GST') || 
        (d.documentType || '').toUpperCase().includes('GST')
      );
      const msmeDoc = vendorDocs.find(d => 
        (d.documentName || '').toUpperCase().includes('MSME') || 
        (d.documentType || '').toUpperCase().includes('MSME')
      );

      let kycStatus = 'Pending';
      let lastVerified = '-';
      let nextReview = '-';

      const checkVerified = (doc) => {
        if (!doc) return false;
        const statusVal = (doc.verificationStatus || doc.approvalStatus || doc.status || '').toUpperCase();
        return statusVal === 'VERIFIED' || statusVal === 'APPROVED';
      };

      const checkRejected = (doc) => {
        if (!doc) return false;
        const statusVal = (doc.verificationStatus || doc.approvalStatus || doc.status || '').toUpperCase();
        return statusVal === 'REJECTED';
      };

      const anyRejected = checkRejected(panDoc) || checkRejected(gstDoc) || checkRejected(msmeDoc);

      if (anyRejected) {
        kycStatus = 'In Progress'; // Rejected documents put it back in progress for remediation
      } else if (panDoc && gstDoc && msmeDoc && checkVerified(panDoc) && checkVerified(gstDoc) && checkVerified(msmeDoc)) {
        lastVerified = panDoc.uploadedAt?.split('T')[0] || panDoc.uploadedDate || new Date().toISOString().split('T')[0];
        
        // Calculate next review date (lastVerified + 365 days)
        try {
          const lvDate = new Date(lastVerified);
          const nrDate = new Date(lvDate.getTime() + 365 * 24 * 60 * 60 * 1000);
          nextReview = nrDate.toISOString().split('T')[0];
          
          if (new Date() > nrDate) {
            kycStatus = 'Re-KYC Due';
          } else {
            kycStatus = 'Verified';
          }
        } catch (e) {
          kycStatus = 'Verified';
        }
      } else if (panDoc || gstDoc || msmeDoc) {
        kycStatus = 'In Progress';
      }

      // Check if periodic review overrides to Re-KYC Due
      if (v.status === 'Re-KYC Due' || v.kycStatus === 'Re-KYC Due') {
        kycStatus = 'Re-KYC Due';
      }

      const riskScore = v.risk?.score || 0;
      const riskLevel = v.risk?.level || 'Low';
      const category = v.category || v.basicDetails?.businessType || 'General';

      return {
        vendorId,
        vendorName,
        category,
        riskScore,
        riskLevel,
        kycStatus,
        lastVerified,
        nextReview,
        nextReviewDate: nextReview
      };
    });

    const summary = {
      totalVendors: kycVendorsList.length,
      verified: kycVendorsList.filter(v => v.kycStatus === 'Verified').length,
      pending: kycVendorsList.filter(v => v.kycStatus === 'Pending').length,
      inProgress: kycVendorsList.filter(v => v.kycStatus === 'In Progress').length,
      highRisk: kycVendorsList.filter(v => v.riskLevel === 'High' || v.riskLevel === 'Critical').length,
      reKycDue: kycVendorsList.filter(v => v.kycStatus === 'Re-KYC Due').length
    };

    const kycDashboard = {
      lastUpdated: new Date().toISOString().split('T')[0],
      summary,
      vendors: kycVendorsList
    };

    await writeJsonFile(KYC_DASHBOARD_PATH, kycDashboard);

    // 2. Run Risk Screening Engine & Update screening-results.json
    let existingScreenings = [];
    try {
      const data = await readJsonFile(SCREENING_RESULTS_PATH);
      existingScreenings = data.screenings || [];
    } catch (e) {
      existingScreenings = [];
    }

    const screeningResults = kycVendorsList.map(kv => {
      const vendorId = kv.vendorId;
      const vendorName = kv.vendorName;

      // Check if name has triggers for higher scores
      let sanctionsStatus = 'Clear';
      let sanctionsScore = 0;
      let sanctionsDetails = 'No matches found in OFAC, UN, EU sanctions lists.';
      if (vendorName.toLowerCase().includes('secure') || vendorId === 'VND-2026-22003') {
        sanctionsStatus = 'Match Found';
        sanctionsScore = 80;
        sanctionsDetails = 'Entity name partial match on OFAC SDN list. Under investigation.';
      }

      let pepStatus = 'Clear';
      let pepScore = 0;
      let pepDetails = 'No politically exposed persons identified.';
      if (vendorName.toLowerCase().includes('money') || vendorId === 'VND-2026-50469') {
        pepStatus = 'Match Found';
        pepScore = 50;
        pepDetails = 'Director linked to a former state minister. Awaiting enhanced due diligence.';
      } else if (vendorName.toLowerCase().includes('secure') || vendorId === 'VND-2026-22003') {
        pepStatus = 'Match Found';
        pepScore = 60;
        pepDetails = 'Beneficial owner linked to politically exposed individual.';
      }

      let adverseMediaStatus = 'No Findings';
      let adverseMediaScore = 0;
      let adverseMediaDetails = 'No adverse news coverage detected.';
      if (vendorName.toLowerCase().includes('hdfc') || vendorId === 'VND-2026-88001') {
        adverseMediaStatus = '1 Finding';
        adverseMediaScore = 10;
        adverseMediaDetails = 'Minor regulatory notice in 2024. Case closed.';
      } else if (vendorName.toLowerCase().includes('money') || vendorId === 'VND-2026-50469') {
        adverseMediaStatus = '2 Findings';
        adverseMediaScore = 20;
        adverseMediaDetails = 'Tax dispute (2023) and delayed regulatory filing (2024).';
      } else if (vendorName.toLowerCase().includes('secure') || vendorId === 'VND-2026-22003') {
        adverseMediaStatus = '5 Findings';
        adverseMediaScore = 40;
        adverseMediaDetails = 'Multiple fraud allegations and customs violations reported.';
      }

      let blacklistStatus = 'Clear';
      let blacklistScore = 0;
      let blacklistDetails = 'Not present in any industry or government blacklist.';
      if (vendorName.toLowerCase().includes('secure') || vendorId === 'VND-2026-22003') {
        blacklistStatus = 'Blacklisted';
        blacklistScore = 100;
        blacklistDetails = 'Listed on MCA debarred entities list.';
      }

      let shellStatus = 'Low Risk';
      let shellScore = 5;
      let shellDetails = 'Registered entity with 8+ years of operational history.';
      if (vendorName.toLowerCase().includes('secure') || vendorId === 'VND-2026-22003') {
        shellStatus = 'High Risk';
        shellScore = 70;
        shellDetails = 'No physical address. Nominee directors. Possible shell.';
      } else if (vendorName.toLowerCase().includes('money') || vendorId === 'VND-2026-50469') {
        shellStatus = 'Medium Risk';
        shellScore = 20;
        shellDetails = 'Complex shareholding structure identified. Review ongoing.';
      } else if (vendorId === 'VND-2026-11002') {
        shellStatus = 'Low Risk';
        shellScore = 10;
        shellDetails = 'Verified physical address and staffing.';
      }

      const totalRiskScore = sanctionsScore + pepScore + adverseMediaScore + blacklistScore + shellScore;
      let overallRisk = 'Low Risk';
      if (totalRiskScore <= 30) overallRisk = 'Low Risk';
      else if (totalRiskScore <= 60) overallRisk = 'Medium Risk';
      else if (totalRiskScore <= 80) overallRisk = 'High Risk';
      else overallRisk = 'Critical Risk';

      return {
        vendorId,
        vendorName,
        screeningDate: new Date().toISOString().split('T')[0],
        sanctions: { status: sanctionsStatus, result: sanctionsStatus, score: sanctionsScore, lastChecked: new Date().toISOString().split('T')[0], details: sanctionsDetails },
        pep: { status: pepStatus, result: pepStatus, score: pepScore, lastChecked: new Date().toISOString().split('T')[0], details: pepDetails },
        adverseMedia: { status: adverseMediaStatus, result: adverseMediaStatus, score: adverseMediaScore, lastChecked: new Date().toISOString().split('T')[0], details: adverseMediaDetails },
        blacklist: { status: blacklistStatus, result: blacklistStatus, score: blacklistScore, lastChecked: new Date().toISOString().split('T')[0], details: blacklistDetails },
        shellCompany: { status: shellStatus, result: shellStatus, score: shellScore, lastChecked: new Date().toISOString().split('T')[0], details: shellDetails },
        totalRiskScore,
        riskScore: totalRiskScore,
        overallRisk
      };
    });

    await writeJsonFile(SCREENING_RESULTS_PATH, { screenings: screeningResults });

    // 3. Run Review Engine & Update reviews-approvals.json
    let reviewsApprovals = { reviews: [], pendingApprovals: [], completedReviews: [] };
    try {
      const data = await readJsonFile(REVIEWS_APPROVALS_PATH);
      if (data) {
        reviewsApprovals = {
          reviews: data.reviews || [],
          pendingApprovals: data.pendingApprovals || [],
          completedReviews: data.completedReviews || []
        };
      }
    } catch (e) {
      reviewsApprovals = { reviews: [], pendingApprovals: [], completedReviews: [] };
    }

    const generatedReviews = [];
    let reviewCounter = reviewsApprovals.reviews.length + 1;

    for (const kv of kycVendorsList) {
      const screening = screeningResults.find(s => s.vendorId === kv.vendorId);
      
      const addReview = (reviewType, priority) => {
        const exists = reviewsApprovals.reviews.some(r => r.vendorId === kv.vendorId && r.reviewType === reviewType) ||
                       generatedReviews.some(r => r.vendorId === kv.vendorId && r.reviewType === reviewType);
        if (!exists) {
          const rId = `REV-2026-${String(reviewCounter++).padStart(3, '0')}`;
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30);
          generatedReviews.push({
            reviewId: rId,
            vendorId: kv.vendorId,
            vendorName: kv.vendorName,
            reviewType,
            dueDate: dueDate.toISOString().split('T')[0],
            assignedTo: 'Compliance Team',
            status: 'Scheduled',
            priority
          });
        }
      };

      if (kv.kycStatus === 'Re-KYC Due') {
        addReview('Annual Re-KYC', 'Medium');
      }
      if (kv.riskLevel === 'High' || kv.riskLevel === 'Critical') {
        addReview('Enhanced Due Diligence', 'High');
      }
      if (screening) {
        if (screening.sanctions?.status !== 'Clear') {
          addReview('Sanctions Review', 'High');
        }
        if (screening.pep?.status !== 'Clear') {
          addReview('PEP Review', 'High');
        }
        if (screening.shellCompany?.score > 50) {
          addReview('Shell Company Investigation', 'High');
        }
      }
    }

    reviewsApprovals.reviews = [...reviewsApprovals.reviews, ...generatedReviews];
    await writeJsonFile(REVIEWS_APPROVALS_PATH, reviewsApprovals);

    // Dynamic generation of new reviews.json
    let newReviewsData = { reviews: [] };
    try {
      const existingReviewsContent = await readJsonFile(REVIEWS_PATH);
      newReviewsData = {
        reviews: existingReviewsContent.reviews || existingReviewsContent || []
      };
      if (Array.isArray(existingReviewsContent)) {
        newReviewsData = { reviews: existingReviewsContent };
      }
    } catch (e) {
      newReviewsData = { reviews: [] };
    }

    const currentReviews = newReviewsData.reviews || [];
    const updatedReviewsList = [];
    let reviewIndex = currentReviews.length + 1;

    for (const kv of kycVendorsList) {
      let rItem = currentReviews.find(r => r.vendorId === kv.vendorId);
      const screening = screeningResults.find(s => s.vendorId === kv.vendorId);
      
      let screeningStatus = 'Cleared';
      if (screening) {
        if (screening.pep?.status === 'Match Found') {
          screeningStatus = 'High Risk';
        } else if (screening.adverseMedia?.status !== 'No Findings' && screening.adverseMedia?.status !== 'Clear') {
          screeningStatus = 'Review Required';
        } else if (screening.shellCompany?.status !== 'Low Risk' && screening.shellCompany?.status !== 'Clear') {
          screeningStatus = 'Investigation Required';
        }
      }

      let approvalStatus = 'Pending Review';
      const vendorRecord = updatedVendors.find(v => v.vendorId === kv.vendorId);
      if (vendorRecord && vendorRecord.approvalWorkflow?.approvalStatus) {
        const backendApprovalStatus = vendorRecord.approvalWorkflow.approvalStatus;
        if (backendApprovalStatus === 'Approved') approvalStatus = 'Approved';
        else if (backendApprovalStatus === 'Rejected') approvalStatus = 'Rejected';
        else if (backendApprovalStatus === 'Pending') approvalStatus = 'Pending Review';
        else if (backendApprovalStatus === 'Clarification Required' || backendApprovalStatus === 'Send Back') approvalStatus = 'Clarification Required';
      }

      if (rItem) {
        rItem.vendorName = kv.vendorName;
        rItem.category = kv.category;
        rItem.riskScore = kv.riskScore;
        rItem.riskLevel = kv.riskLevel;
        rItem.kycStatus = kv.kycStatus;
        rItem.screeningStatus = screeningStatus;
        if (!rItem.approvalStatus || rItem.approvalStatus === 'Pending Review') {
          rItem.approvalStatus = approvalStatus;
        }
      } else {
        const rId = `REV-2026-${String(reviewIndex++).padStart(3, '0')}`;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        rItem = {
          reviewId: rId,
          vendorId: kv.vendorId,
          vendorName: kv.vendorName,
          category: kv.category,
          riskScore: kv.riskScore,
          riskLevel: kv.riskLevel,
          kycStatus: kv.kycStatus,
          screeningStatus: screeningStatus,
          approvalStatus: approvalStatus,
          assignedTo: 'Compliance Team',
          dueDate: dueDate.toISOString().split('T')[0],
          comments: []
        };
      }
      updatedReviewsList.push(rItem);
    }

    currentReviews.forEach(er => {
      if (!updatedReviewsList.some(ur => ur.vendorId === er.vendorId)) {
        updatedReviewsList.push(er);
      }
    });

    await writeJsonFile(REVIEWS_PATH, { reviews: updatedReviewsList });

    console.log('Connected VMS Recalculation Engine ran successfully.');

  } catch (err) {
    console.error('Error during VMS recalculation:', err);
  }
}

// Static files for uploads (allows downloading files)
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// Configure Multer for VMS Documents
const docStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DOC_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const origName = file.originalname;
    const ext = path.extname(origName).toLowerCase();
    
    // Default fallback to docName
    const docName = req.body.documentName || 'DOC';
    const cleanSlug = docName.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 10);
    
    cb(null, `DOC_${year}_${rand}_${cleanSlug}${ext}`);
  }
});

const docUpload = multer({
  storage: docStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed!'));
  }
});

// Helper to write document audit logs
async function logDocAction(documentId, documentName, action, performedBy, remarks = '') {
  const newLog = {
    id: `AUD-DOC-${Math.floor(Math.random() * 90000) + 10000}`,
    timestamp: new Date().toISOString(),
    documentId,
    documentName,
    action,
    performedBy: performedBy || 'Saurabh Anand',
    remarks
  };
  await appendJsonData(DOC_AUDIT_LOGS_PATH, newLog);
  return newLog;
}

// Helper to write audit logs
async function logAction(actor, role, action, status, severity, ipAddress = '127.0.0.1') {
  const newLog = {
    id: `AUD-${Math.floor(Math.random() * 90000) + 10000}`,
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    actor,
    role,
    tenant: 'Qualtech Corporate',
    action,
    ipAddress,
    status,
    severity
  };
  await appendJsonData(AUDIT_LOGS_PATH, newLog);
  return newLog;
}

// Helper to read and sanitize documents database records
async function readSanitizedDocuments() {
  try {
    const docs = await readJsonFile(DOCUMENTS_PATH);
    if (!Array.isArray(docs)) return [];
    return docs.map(doc => {
      const id = doc.documentId || doc.id || `DOC-UNKNOWN-${Math.floor(1000 + Math.random() * 9000)}`;
      const docName = doc.documentName || doc.fileName || doc.documentType || 'N/A';
      const docType = doc.documentType || 'Other';
      const category = doc.documentCategory || doc.documentType || 'Other';
      const docNum = doc.documentNumber || 'N/A';
      const vStatus = doc.verificationStatus || doc.status || 'Pending Verification';
      const aStatus = doc.approvalStatus || doc.status || 'Pending';
      const uploaded = doc.uploadedAt || new Date().toISOString();
      
      const fileDet = doc.fileDetails || {
        originalFileName: doc.fileName || 'file',
        storedFileName: doc.savedFileName || 'file',
        filePath: doc.filePath || '#',
        fileType: doc.fileName?.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
        fileSizeKB: Math.round((doc.sizeBytes || 0) / 1024),
        fileExtension: doc.fileName && doc.fileName.includes('.') ? doc.fileName.substring(doc.fileName.lastIndexOf('.')) : ''
      };
      
      const vdr = doc.vendor || {
        vendorId: 'VND-UNKNOWN',
        vendorName: 'Qualtech Corporate (Internal)'
      };
      
      const uploadedBy = doc.uploadedBy || {
        userId: 'USR-001',
        userName: 'Saurabh Anand'
      };

      return {
        ...doc,
        documentId: id,
        id: id,
        documentName: docName,
        documentType: docType,
        documentCategory: category,
        documentNumber: docNum,
        vendor: vdr,
        verificationStatus: vStatus,
        approvalStatus: aStatus,
        uploadedAt: uploaded,
        uploadedBy,
        fileDetails: fileDet
      };
    });
  } catch (err) {
    console.error('Error reading/sanitizing documents:', err);
    return [];
  }
}

// REST APIs

// 1. File Upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const documentId = `DOC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const originalFileName = req.file.originalname;
    const storedFileName = req.file.filename;
    const filePath = `/uploads/${req.file.filename}`;
    const fileExtension = path.extname(originalFileName).toLowerCase();

    const fileInfo = {
      // Legacy fields for frontend AddVendor.tsx compatibility
      id: documentId,
      documentType: req.body.documentType || 'Other',
      fileName: originalFileName,
      savedFileName: storedFileName,
      filePath: filePath,
      sizeBytes: req.file.size,
      status: 'Verified',
      uploadedAt: new Date().toISOString(),

      // VMS Documents fields
      documentId: documentId,
      documentName: req.body.documentType || 'Other',
      documentCategory: req.body.documentType || 'Other',
      vendor: {
        vendorId: req.body.vendorId || 'VND-UNKNOWN',
        vendorName: req.body.vendorName || 'Qualtech Corporate (Internal)'
      },
      documentNumber: req.body.documentNumber || 'N/A',
      issueDate: req.body.issueDate || null,
      expiryDate: req.body.expiryDate || null,
      issuedBy: req.body.issuedBy || 'N/A',
      remarks: req.body.remarks || '',
      verificationStatus: 'Verified',
      approvalStatus: 'Approved',
      uploadedBy: {
        userId: 'USR-001',
        userName: 'Saurabh Anand'
      },
      fileDetails: {
        originalFileName: originalFileName,
        storedFileName: storedFileName,
        filePath: filePath,
        fileType: req.file.mimetype,
        fileSizeKB: Math.round(req.file.size / 1024),
        fileExtension: fileExtension
      },
      previewImage: null,
      documentUsage: {
        usedInKYC: false,
        usedInVendorOnboarding: true,
        usedInCompliance: false,
        usedInContracts: false,
        usedInInvoiceVerification: false
      },
      versionHistory: [
        {
          version: 1,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'Saurabh Anand',
          status: 'Initial Upload'
        }
      ],
      auditTrail: [
        {
          action: 'Document Uploaded',
          performedBy: 'Saurabh Anand',
          timestamp: new Date().toISOString()
        }
      ]
    };

    await appendJsonData(DOCUMENTS_PATH, fileInfo);

    res.json({
      success: true,
      fileInfo
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// DOCUMENTS MODULE APIS
// ==========================================

// GET /api/documents/master/types
app.get('/api/documents/master/types', async (req, res) => {
  try {
    const types = await readJsonFile(DOC_TYPES_PATH);
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/documents/master/categories
app.get('/api/documents/master/categories', async (req, res) => {
  try {
    const categories = await readJsonFile(DOC_CATEGORIES_PATH);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/documents/expiring
app.get('/api/documents/expiring', async (req, res) => {
  try {
    const docs = await readSanitizedDocuments();
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const expiringSoon = [];
    const expired = [];

    docs.forEach(doc => {
      if (doc.expiryDate) {
        const expDate = new Date(doc.expiryDate);
        if (expDate < now) {
          expired.push(doc);
        } else if (expDate <= thirtyDaysFromNow) {
          expiringSoon.push(doc);
        }
      }
    });

    res.json({
      expiringSoon,
      expired
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/documents/vendor/:vendorId
app.get('/api/documents/vendor/:vendorId', async (req, res) => {
  try {
    const docs = await readSanitizedDocuments();
    const vendorDocs = docs.filter(doc => doc.vendor?.vendorId === req.params.vendorId);
    res.json(vendorDocs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/documents
app.get('/api/documents', async (req, res) => {
  try {
    const docs = await readSanitizedDocuments();
    const { status, type, search } = req.query;
    
    let filtered = [...docs];
    
    if (status && status !== 'All' && status !== 'Status: All') {
      filtered = filtered.filter(doc => doc.verificationStatus === status || doc.approvalStatus === status);
    }
    
    if (type && type !== 'All' && type !== 'Document Type: All') {
      filtered = filtered.filter(doc => doc.documentType === type || doc.documentCategory === type);
    }
    
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.documentName.toLowerCase().includes(q) ||
        doc.documentNumber?.toLowerCase().includes(q) ||
        doc.vendor?.vendorName.toLowerCase().includes(q) ||
        doc.documentId.toLowerCase().includes(q)
      );
    }
    
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/documents/:id
app.get('/api/documents/:id', async (req, res) => {
  try {
    const docs = await readSanitizedDocuments();
    const doc = docs.find(d => d.documentId === req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/documents/upload
app.post('/api/documents/upload', docUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file was uploaded' });
    }

    const {
      documentType,
      documentName,
      documentCategory,
      vendorId,
      vendorName,
      documentNumber,
      issueDate,
      expiryDate,
      issuedBy,
      remarks,
      uploadedByUserName,
      uploadedByUserId
    } = req.body;

    // Validate duplicates
    const docs = await readJsonFile(DOCUMENTS_PATH);
    if (documentNumber) {
      const isDuplicate = docs.some(d => 
        d.documentNumber === documentNumber && 
        d.documentName === documentName && 
        d.vendor?.vendorId === vendorId
      );
      if (isDuplicate) {
        // Remove uploaded file to clean up
        await fs.unlink(req.file.path).catch(console.error);
        return res.status(400).json({ 
          success: false, 
          message: `A document with number ${documentNumber} already exists for this vendor.` 
        });
      }
    }

    // Generate Document ID
    const year = new Date().getFullYear();
    const docsThisYear = docs.filter(d => d.documentId && typeof d.documentId === 'string' && d.documentId.startsWith(`DOC-${year}`));
    const nextNum = docsThisYear.length + 1;
    const documentId = `DOC-${year}-${String(nextNum).padStart(4, '0')}`;

    const originalFileName = req.file.originalname;
    const storedFileName = req.file.filename;
    const filePath = `/storage/documents/${storedFileName}`;
    const fileExtension = path.extname(originalFileName).toLowerCase();
    const fileSizeKB = Math.round(req.file.size / 1024);

    const userName = uploadedByUserName || 'Saurabh Anand';
    const userId = uploadedByUserId || 'USR-001';

    const newDoc = {
      documentId,
      documentType: documentType || 'Others',
      documentName: documentName || 'Other Document',
      documentCategory: documentCategory || 'Others',
      vendor: {
        vendorId: vendorId || 'VND-UNKNOWN',
        vendorName: vendorName || 'Unknown Vendor'
      },
      documentNumber: documentNumber || '',
      issueDate: issueDate || null,
      expiryDate: expiryDate || null,
      issuedBy: issuedBy || '',
      remarks: remarks || '',
      verificationStatus: 'Pending Verification',
      approvalStatus: 'Pending',
      uploadedBy: {
        userId,
        userName
      },
      uploadedAt: new Date().toISOString(),
      fileDetails: {
        originalFileName,
        storedFileName,
        filePath,
        fileType: req.file.mimetype,
        fileSizeKB,
        fileExtension
      },
      previewImage: null,
      documentUsage: {
        usedInKYC: documentType === 'KYC Documents',
        usedInVendorOnboarding: true,
        usedInCompliance: documentType === 'Compliance Documents',
        usedInContracts: false,
        usedInInvoiceVerification: false
      },
      versionHistory: [
        {
          version: 1,
          uploadedAt: new Date().toISOString(),
          uploadedBy: userName,
          status: 'Initial Upload'
        }
      ],
      auditTrail: [
        {
          action: 'Document Uploaded',
          performedBy: userName,
          timestamp: new Date().toISOString()
        }
      ]
    };

    await appendJsonData(DOCUMENTS_PATH, newDoc);
    await logDocAction(documentId, documentName, 'Document Uploaded', userName, 'Initial submission.');

    // Also update vendor profile documents mapping if vendor exists
    const vendors = await readJsonFile(VENDORS_PATH);
    const vendorIndex = vendors.findIndex(v => v.vendorId === vendorId);
    if (vendorIndex !== -1) {
      const vendorDocs = vendors[vendorIndex].documents || [];
      vendorDocs.push({
        documentType: documentName,
        fileName: originalFileName,
        status: 'Pending',
        expiryDate: expiryDate || null,
        documentId
      });
      await updateJsonData(VENDORS_PATH, 'vendorId', vendorId, { documents: vendorDocs });
    }

    await recalculateVmsSystem();
    await logVmsAuditTrail('Document Uploaded', `Document ${documentId} (${documentName}) uploaded for vendor ${vendorName || vendorId}.`);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document: newDoc
    });

  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/documents/:id
app.put('/api/documents/:id', docUpload.single('file'), async (req, res) => {
  try {
    const docs = await readJsonFile(DOCUMENTS_PATH);
    const docIndex = docs.findIndex(d => d.documentId === req.params.id);
    if (docIndex === -1) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    const existingDoc = docs[docIndex];
    const updateData = { ...req.body };
    
    // If a new physical file is uploaded
    if (req.file) {
      // Delete old file if exists
      const oldFilePath = path.join(__dirname, existingDoc.fileDetails.filePath);
      await fs.unlink(oldFilePath).catch(err => console.log('Old file not deleted/not found:', err.message));
      
      const originalFileName = req.file.originalname;
      const storedFileName = req.file.filename;
      const filePath = `/uploads/documents/${storedFileName}`;
      const fileExtension = path.extname(originalFileName).toLowerCase();
      const fileSizeKB = Math.round(req.file.size / 1024);
      
      const newVersionNum = existingDoc.versionHistory.length + 1;
      const userName = req.body.uploadedByUserName || 'Saurabh Anand';
      
      existingDoc.fileDetails = {
        originalFileName,
        storedFileName,
        filePath,
        fileType: req.file.mimetype,
        fileSizeKB,
        fileExtension
      };
      
      existingDoc.versionHistory.push({
        version: newVersionNum,
        uploadedAt: new Date().toISOString(),
        uploadedBy: userName,
        status: `Replaced File (v${newVersionNum})`
      });
    }
    
    // Update text fields
    if (updateData.documentName) existingDoc.documentName = updateData.documentName;
    if (updateData.documentNumber) existingDoc.documentNumber = updateData.documentNumber;
    if (updateData.issueDate) existingDoc.issueDate = updateData.issueDate;
    if (updateData.expiryDate) existingDoc.expiryDate = updateData.expiryDate;
    if (updateData.issuedBy) existingDoc.issuedBy = updateData.issuedBy;
    if (updateData.remarks) existingDoc.remarks = updateData.remarks;
    
    existingDoc.auditTrail.push({
      action: 'Document Details Updated',
      performedBy: req.body.uploadedByUserName || 'Saurabh Anand',
      timestamp: new Date().toISOString()
    });
    
    await updateJsonData(DOCUMENTS_PATH, 'documentId', req.params.id, existingDoc);
    await logDocAction(req.params.id, existingDoc.documentName, 'Document Details Updated', req.body.uploadedByUserName);
    
    res.json({
      success: true,
      message: 'Document updated successfully',
      document: existingDoc
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/documents/:id
app.delete('/api/documents/:id', async (req, res) => {
  try {
    const docs = await readJsonFile(DOCUMENTS_PATH);
    const doc = docs.find(d => d.documentId === req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Physically delete file
    const filePath = path.join(__dirname, doc.fileDetails.filePath);
    await fs.unlink(filePath).catch(err => console.log('File delete err:', err.message));
    
    // Remove from documents.json
    await deleteJsonData(DOCUMENTS_PATH, 'documentId', req.params.id);
    await logDocAction(req.params.id, doc.documentName, 'Document Deleted', 'Saurabh Anand');
    
    // Remove from vendor document mapping
    const vendors = await readJsonFile(VENDORS_PATH);
    const vendorIndex = vendors.findIndex(v => v.vendorId === doc.vendor?.vendorId);
    if (vendorIndex !== -1) {
      const vendorDocs = vendors[vendorIndex].documents || [];
      const filteredVendorDocs = vendorDocs.filter(d => d.documentId !== req.params.id);
      await updateJsonData(VENDORS_PATH, 'vendorId', doc.vendor?.vendorId, { documents: filteredVendorDocs });
    }
    
    await recalculateVmsSystem();
    await logVmsAuditTrail('Document Deleted', `Document ${req.params.id} (${doc.documentName}) deleted for vendor ${doc.vendor?.vendorName || doc.vendor?.vendorId}.`);

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/documents/verify
app.post('/api/documents/verify', async (req, res) => {
  try {
    const { documentId, action, remarks, performedBy } = req.body;
    
    const docs = await readJsonFile(DOCUMENTS_PATH);
    const doc = docs.find(d => d.documentId === documentId);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    const verStatus = action === 'Approve' ? 'Verified' : action === 'Reject' ? 'Rejected' : 'Sent Back';
    const appStatus = action === 'Approve' ? 'Approved' : action === 'Reject' ? 'Rejected' : 'Sent Back';
    
    const userName = performedBy || 'Saurabh Anand';
    
    // Update document status
    const updatedDoc = await updateJsonData(DOCUMENTS_PATH, 'documentId', documentId, {
      verificationStatus: verStatus,
      approvalStatus: appStatus,
      remarks: remarks || doc.remarks,
      auditTrail: [
        ...(doc.auditTrail || []),
        {
          action: `Verification ${action}d`,
          performedBy: userName,
          timestamp: new Date().toISOString(),
          remarks
        }
      ]
    });
    
    // Log verification action details
    const verificationLog = {
      id: `VRF-${Math.floor(Math.random() * 90000) + 10000}`,
      documentId,
      documentName: doc.documentName,
      vendorName: doc.vendor.vendorName,
      vendorId: doc.vendor.vendorId,
      performedBy: userName,
      action,
      remarks,
      timestamp: new Date().toISOString()
    };
    await appendJsonData(DOC_VERIFICATION_PATH, verificationLog);
    
    // Log to master VMS audit trail
    await logAction(
      userName,
      'Procurement Checker',
      `Verification ${action}d for document ${documentId} (${doc.documentName}) of vendor ${doc.vendor.vendorName}`,
      'Success',
      'High'
    );
    
    await logDocAction(documentId, doc.documentName, `Verification ${action}d`, userName, remarks);
    
    if (action === 'Approve') {
      const customAuditLog = {
        event: "Document Verified",
        documentId: documentId,
        vendor: doc.vendor?.vendorName || "Unknown Vendor",
        verifiedBy: userName === 'Saurabh Anand' ? 'Admin' : userName,
        date: new Date().toISOString().split('T')[0]
      };
      await appendJsonData(DOC_AUDIT_LOGS_PATH, customAuditLog);
    }
    
    // Update document status inside vendor registry
    const vendors = await readJsonFile(VENDORS_PATH);
    const vendorIndex = vendors.findIndex(v => v.vendorId === doc.vendor?.vendorId);
    if (vendorIndex !== -1) {
      const vendorDocs = vendors[vendorIndex].documents || [];
      const matchDocIndex = vendorDocs.findIndex(d => d.documentId === documentId || d.documentType === doc.documentName);
      if (matchDocIndex !== -1) {
        vendorDocs[matchDocIndex].status = verStatus;
        await updateJsonData(VENDORS_PATH, 'vendorId', doc.vendor?.vendorId, { documents: vendorDocs });
      }
    }
    
    await recalculateVmsSystem();
    await logVmsAuditTrail('Document Verified', `Document ${documentId} (${doc.documentName}) verified (${verStatus}) by ${userName}.`);

    res.json({
      success: true,
      message: `Document verification ${action}d successfully.`,
      document: updatedDoc
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/documents/audit-logs
app.get('/api/documents/audit-logs', async (req, res) => {
  try {
    const logs = await readJsonFile(DOC_AUDIT_LOGS_PATH);
    res.json(logs.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Vendors APIs
app.get('/api/vendors', async (req, res) => {
  try {
    const vendors = await readJsonFile(VENDORS_PATH);
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/vendors/:id', async (req, res) => {
  try {
    const vendors = await readJsonFile(VENDORS_PATH);
    const vendor = vendors.find(v => v.vendorId === req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vendors', async (req, res) => {
  try {
    const vendorData = req.body;
    
    // Auto-generate Vendor ID if not provided
    if (!vendorData.vendorId) {
      const year = new Date().getFullYear();
      const num = Math.floor(Math.random() * 90000) + 10000;
      vendorData.vendorId = `VND-${year}-${num}`;
    }

    vendorData.createdAt = vendorData.createdAt || new Date().toISOString();
    
    await appendJsonData(VENDORS_PATH, vendorData);
    await recalculateVmsSystem();

    // Push admin notification for compliance/procurement review
    const adminNotif = {
      id: `ANOTIF-${Date.now()}`,
      type: 'vendor_onboarding',
      title: 'New Vendor Pending Approval',
      message: `${vendorData.basicDetails?.legalName || vendorData.vendorId} has submitted for onboarding and requires compliance review.`,
      link: '/vendors/approvals',
      vendorId: vendorData.vendorId,
      timestamp: new Date().toISOString(),
      read: false
    };
    await appendJsonData(ADMIN_NOTIFICATIONS_PATH, adminNotif);

    await logVmsAuditTrail('Vendor Added', `Vendor ${vendorData.vendorId} (${vendorData.vendorName || vendorData.basicDetails?.legalName}) onboarding initiated.`);

    // Write audit trail log
    await logAction(
      vendorData.approvalWorkflow?.submittedBy || 'Saurabh Anand',
      'Procurement Maker',
      `Created Vendor registration ${vendorData.vendorId} (${vendorData.basicDetails?.legalName})`,
      'Success',
      'Low'
    );

    res.status(201).json(vendorData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/vendors/:id', async (req, res) => {
  try {
    const updated = await updateJsonData(VENDORS_PATH, 'vendorId', req.params.id, req.body);
    await recalculateVmsSystem();
    await logVmsAuditTrail('Vendor Updated', `Vendor ${req.params.id} (${updated.vendorName || updated.basicDetails?.legalName}) profile updated.`);
    
    await logAction(
      req.body.approvalWorkflow?.submittedBy || 'Saurabh Anand',
      'Procurement Maker',
      `Updated Vendor registration ${req.params.id} (${updated.basicDetails?.legalName})`,
      'Success',
      'Low'
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/vendors/:id', async (req, res) => {
  try {
    const vendors = await readJsonFile(VENDORS_PATH);
    const vendor = vendors.find(v => v.vendorId === req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await deleteJsonData(VENDORS_PATH, 'vendorId', req.params.id);
    await recalculateVmsSystem();
    await logVmsAuditTrail('Vendor Deleted', `Vendor ${req.params.id} (${vendor.vendorName || vendor.basicDetails?.legalName}) profile deleted.`);

    await logAction(
      'Saurabh Anand',
      'Procurement Maker',
      `Deleted Vendor registration ${req.params.id} (${vendor.basicDetails?.legalName})`,
      'Success',
      'Medium'
    );

    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vendor Checker Approvals (Approve / Reject / Send Back)
app.post('/api/vendors/:id/approve', async (req, res) => {
  try {
    const { remarks, performedBy } = req.body;
    const vendors = await readJsonFile(VENDORS_PATH);
    const vendor = vendors.find(v => v.vendorId === req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const updatedWorkflow = {
      ...vendor.approvalWorkflow,
      approvalStatus: 'Approved',
      currentStage: 'Approved',
      approverRemarks: remarks,
      approvedBy: performedBy || 'Saurabh Anand',
      approvedDate: new Date().toISOString()
    };

    const updated = await updateJsonData(VENDORS_PATH, 'vendorId', req.params.id, {
      status: 'Active',
      approvalWorkflow: updatedWorkflow,
      auditTrail: [
        ...(vendor.auditTrail || []),
        {
          action: 'Vendor Approved',
          performedBy: performedBy || 'Saurabh Anand',
          timestamp: new Date().toISOString(),
          remarks
        }
      ]
    });

    // Save history to approvals.json
    const approvalHistory = {
      id: `APP-${Math.floor(Math.random() * 90000) + 10000}`,
      vendorId: req.params.id,
      vendorName: vendor.basicDetails?.legalName || vendor.vendorName,
      performedBy: performedBy || 'Saurabh Anand',
      action: 'Approved',
      remarks,
      timestamp: new Date().toISOString()
    };
    await appendJsonData(APPROVALS_PATH, approvalHistory);

    // Admin notification: approval completed
    await appendJsonData(ADMIN_NOTIFICATIONS_PATH, {
      id: `ANOTIF-${Date.now()}`,
      type: 'vendor_approved',
      title: 'Vendor Approved',
      message: `${vendor.basicDetails?.legalName || req.params.id} has been approved and is now Active.`,
      link: `/vendors/view?id=${req.params.id}&view=true`,
      vendorId: req.params.id,
      timestamp: new Date().toISOString(),
      read: false
    });

    await recalculateVmsSystem();
    await logVmsAuditTrail('KYC Approved', `Vendor ${req.params.id} (${vendor.vendorName || vendor.basicDetails?.legalName}) onboarding approved by Checker.`);

    await logAction(
      performedBy || 'Saurabh Anand',
      'Procurement Checker',
      `Approved Vendor onboarding for ${req.params.id} (${vendor.basicDetails?.legalName})`,
      'Success',
      'High'
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vendors/:id/reject', async (req, res) => {
  try {
    const { remarks, performedBy } = req.body;
    const vendors = await readJsonFile(VENDORS_PATH);
    const vendor = vendors.find(v => v.vendorId === req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const updatedWorkflow = {
      ...vendor.approvalWorkflow,
      approvalStatus: 'Rejected',
      currentStage: 'Rejected',
      approverRemarks: remarks,
      approvedBy: performedBy || 'Saurabh Anand',
      approvedDate: new Date().toISOString()
    };

    const updated = await updateJsonData(VENDORS_PATH, 'vendorId', req.params.id, {
      status: 'Rejected',
      approvalWorkflow: updatedWorkflow,
      auditTrail: [
        ...(vendor.auditTrail || []),
        {
          action: 'Vendor Rejected',
          performedBy: performedBy || 'Saurabh Anand',
          timestamp: new Date().toISOString(),
          remarks
        }
      ]
    });

    const approvalHistory = {
      id: `APP-${Math.floor(Math.random() * 90000) + 10000}`,
      vendorId: req.params.id,
      vendorName: vendor.basicDetails.legalName,
      performedBy: performedBy || 'Saurabh Anand',
      action: 'Rejected',
      remarks,
      timestamp: new Date().toISOString()
    };
    await appendJsonData(APPROVALS_PATH, approvalHistory);

    // Admin notification: rejection recorded
    await appendJsonData(ADMIN_NOTIFICATIONS_PATH, {
      id: `ANOTIF-${Date.now()}`,
      type: 'vendor_rejected',
      title: 'Vendor Rejected',
      message: `${vendor.basicDetails?.legalName || req.params.id} onboarding has been rejected. Remarks: ${remarks || 'None'}`,
      link: `/vendors/approvals`,
      vendorId: req.params.id,
      timestamp: new Date().toISOString(),
      read: false
    });

    await logAction(
      performedBy || 'Saurabh Anand',
      'Procurement Checker',
      `Rejected Vendor onboarding for ${req.params.id} (${vendor.basicDetails?.legalName})`,
      'Success',
      'High'
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vendors/:id/sendback', async (req, res) => {
  try {
    const { remarks, performedBy } = req.body;
    const vendors = await readJsonFile(VENDORS_PATH);
    const vendor = vendors.find(v => v.vendorId === req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const updatedWorkflow = {
      ...vendor.approvalWorkflow,
      approvalStatus: 'Sent Back',
      currentStage: 'Vendor Amendment',
      approverRemarks: remarks,
      approvedBy: performedBy || 'Saurabh Anand',
      approvedDate: new Date().toISOString()
    };

    const updated = await updateJsonData(VENDORS_PATH, 'vendorId', req.params.id, {
      status: 'Pending Amendment',
      approvalWorkflow: updatedWorkflow,
      auditTrail: [
        ...(vendor.auditTrail || []),
        {
          action: 'Sent Back for Clarification',
          performedBy: performedBy || 'Saurabh Anand',
          timestamp: new Date().toISOString(),
          remarks
        }
      ]
    });

    const approvalHistory = {
      id: `APP-${Math.floor(Math.random() * 90000) + 10000}`,
      vendorId: req.params.id,
      vendorName: vendor.basicDetails.legalName,
      performedBy: performedBy || 'Saurabh Anand',
      action: 'Sent Back',
      remarks,
      timestamp: new Date().toISOString()
    };
    await appendJsonData(APPROVALS_PATH, approvalHistory);

    await logAction(
      performedBy || 'Saurabh Anand',
      'Procurement Checker',
      `Sent Back Vendor ${req.params.id} (${vendor.basicDetails?.legalName}) to Maker for clarification`,
      'Success',
      'Medium'
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Admin Notifications ──────────────────────────────────────────────────────
app.get('/api/admin-notifications', async (req, res) => {
  try {
    const list = await readJsonFile(ADMIN_NOTIFICATIONS_PATH);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin-notifications/read-all', async (req, res) => {
  try {
    const list = await readJsonFile(ADMIN_NOTIFICATIONS_PATH);
    const updated = list.map(n => ({ ...n, read: true }));
    await writeJsonFile(ADMIN_NOTIFICATIONS_PATH, updated);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin-notifications', async (req, res) => {
  try {
    await writeJsonFile(ADMIN_NOTIFICATIONS_PATH, []);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Global Search ─────────────────────────────────────────────────────────────
app.get('/api/search', async (req, res) => {
  try {
    const q = (req.query.q || '').toString().toLowerCase().trim();
    if (!q || q.length < 2) return res.json([]);

    const results = [];

    // Search vendors
    const vendors = await readJsonFile(VENDORS_PATH);
    for (const v of vendors) {
      const name = (v.basicDetails?.legalName || v.vendorName || '').toLowerCase();
      const pan = (v.basicDetails?.panNumber || '').toLowerCase();
      const gstin = (v.basicDetails?.gstin || '').toLowerCase();
      if (name.includes(q) || pan.includes(q) || gstin.includes(q)) {
        results.push({ type: 'Vendor', id: v.vendorId, label: v.basicDetails?.legalName || v.vendorName, sub: `${v.vendorId} · ${v.status || ''}`, link: `/vendors/view?id=${v.vendorId}&view=true` });
      }
    }

    // Search documents
    const docs = await readJsonFile(DOCUMENTS_PATH);
    for (const d of docs) {
      const name = (d.documentName || d.type || '').toLowerCase();
      const vendor = (d.vendorName || '').toLowerCase();
      if (name.includes(q) || vendor.includes(q)) {
        results.push({ type: 'Document', id: d.documentId, label: d.documentName || d.type, sub: `${d.vendorName || ''} · ${d.status || ''}`, link: `/documents` });
      }
    }

    // Search approvals
    const approvals = await readJsonFile(APPROVALS_PATH);
    for (const a of approvals) {
      const name = (a.vendorName || '').toLowerCase();
      if (name.includes(q) || (a.id || '').toLowerCase().includes(q)) {
        results.push({ type: 'Approval', id: a.id, label: a.vendorName || a.id, sub: `${a.action || 'Pending'} · ${a.id}`, link: `/vendors/approvals` });
      }
    }

    res.json(results.slice(0, 15));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Admin Invoices ────────────────────────────────────────────────────────────
app.get('/api/invoices', async (req, res) => {
  try {
    let list = await readJsonFile(ADMIN_INVOICES_PATH);
    if (req.query.status) list = list.filter(i => i.status === req.query.status);
    res.json(list);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/invoices/:id', async (req, res) => {
  try {
    const list = await readJsonFile(ADMIN_INVOICES_PATH);
    const inv = list.find(i => i.invoiceId === req.params.id);
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });
    res.json(inv);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/invoices/:id/approve', async (req, res) => {
  try {
    const { approvedBy, remarks } = req.body;
    const list = await readJsonFile(ADMIN_INVOICES_PATH);
    const idx = list.findIndex(i => i.invoiceId === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Invoice not found' });

    const prevStage = list[idx].stage;

    list[idx] = { ...list[idx], status: 'Approved', stage: 'Payment Processing', approvedBy: approvedBy || 'Finance Manager', approvedDate: new Date().toISOString(), remarks: remarks || '' };
    await writeJsonFile(ADMIN_INVOICES_PATH, list);

    // ── payment-approvals.json State Synchronization ─────────────────────────
    try {
      const approvals = await readJsonFile(PAYMENT_APPROVALS_PATH).catch(() => []);
      const invoice = list[idx];
      
      if (prevStage === 'Payment Processing') {
        // This is Checker View (second stage) approving the payment/invoice payout
        const appIdx = approvals.findIndex(a => a.invoiceRef === req.params.id && a.status === 'Pending Approval');
        if (appIdx !== -1) {
          approvals[appIdx].status = 'Approved';
          approvals[appIdx].remarks = remarks || '';
          approvals[appIdx].timestamp = new Date().toISOString();
          approvals[appIdx].statusHistory.push({
            status: 'Approved',
            timestamp: new Date().toISOString(),
            changedBy: approvedBy || 'Finance Manager'
          });
          await writeJsonFile(PAYMENT_APPROVALS_PATH, approvals);
        }
      } else {
        // This is Maker View (first stage) approving invoice -> moves to Payment Processing
        // We create a new pending payment approval
        const exists = approvals.some(a => a.invoiceRef === req.params.id && a.status === 'Pending Approval');
        if (!exists) {
          const newApproval = {
            approvalId: `PA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            paymentId: `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            vendorName: invoice.vendorName,
            invoiceRef: invoice.invoiceId,
            amount: invoice.netPayable || invoice.totalAmount,
            status: "Pending Approval",
            submittedBy: invoice.uploadedBy || "Accounts Payable",
            submittedDate: new Date().toISOString().split('T')[0],
            remarks: "",
            timestamp: new Date().toISOString(),
            statusHistory: [
              {
                status: "Pending Approval",
                timestamp: new Date().toISOString(),
                changedBy: invoice.uploadedBy || "Accounts Payable"
              }
            ],
            attachmentIds: []
          };
          approvals.push(newApproval);
          await writeJsonFile(PAYMENT_APPROVALS_PATH, approvals);
        }
      }
    } catch (e) {
      console.error('Error synchronizing payment-approvals.json:', e);
    }

    await appendJsonData(ADMIN_NOTIFICATIONS_PATH, {
      id: `ANOTIF-${Date.now()}`, type: 'invoice_approved',
      title: 'Invoice Approved for Payment',
      message: `${list[idx].invoiceId} (${list[idx].vendorName}) approved for payment disbursement.`,
      link: '/payments/processing', timestamp: new Date().toISOString(), read: false
    });
    await logAction(approvedBy || 'Finance Manager', 'Finance Manager', `Approved invoice ${req.params.id}`, 'Success', 'High');

    // Write-back to vendor portal if this is an ABC Infotech invoice
    if (list[idx].vendorId === 'VND-2025-00029' || (list[idx].vendorName && list[idx].vendorName.toLowerCase().includes('abc infotech'))) {
      try {
        const vendorInvoices = await readJsonFile(VENDOR_PORTAL_INVOICES_PATH);
        const vIdx = vendorInvoices.findIndex(i => i.invoiceId === req.params.id);
        if (vIdx !== -1) {
          vendorInvoices[vIdx].verificationStage = 'Payment Processing';
          vendorInvoices[vIdx].paymentStatus = 'Approved';
          await writeJsonFile(VENDOR_PORTAL_INVOICES_PATH, vendorInvoices);
        }
        await appendJsonData(VENDOR_PORTAL_NOTIFICATIONS_PATH, {
          notificationId: `NOT-${Math.floor(Math.random() * 9000 + 1000)}`,
          vendorId: 'VND-001',
          type: 'invoice_approved',
          title: 'Invoice Approved',
          message: `Your invoice ${req.params.id} has been approved and is being processed for payment.`,
          link: '/vendor/invoices',
          read: false,
          createdDate: new Date().toISOString().split('T')[0]
        });
      } catch (_) {}
    }

    res.json(list[idx]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/invoices/:id/reject', async (req, res) => {
  try {
    const { rejectedBy, remarks } = req.body;
    const list = await readJsonFile(ADMIN_INVOICES_PATH);
    const idx = list.findIndex(i => i.invoiceId === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Invoice not found' });
    list[idx] = { ...list[idx], status: 'Rejected', stage: 'Rejected', remarks: remarks || '' };
    await writeJsonFile(ADMIN_INVOICES_PATH, list);

    // Reject any pending payment approval in payment-approvals.json
    try {
      const approvals = await readJsonFile(PAYMENT_APPROVALS_PATH).catch(() => []);
      const appIdx = approvals.findIndex(a => a.invoiceRef === req.params.id && a.status === 'Pending Approval');
      if (appIdx !== -1) {
        approvals[appIdx].status = 'Rejected';
        approvals[appIdx].remarks = remarks || '';
        approvals[appIdx].timestamp = new Date().toISOString();
        approvals[appIdx].statusHistory.push({
          status: 'Rejected',
          timestamp: new Date().toISOString(),
          changedBy: rejectedBy || 'Finance Manager'
        });
        await writeJsonFile(PAYMENT_APPROVALS_PATH, approvals);
      }
    } catch (e) {
      console.error('Error rejecting payment approval:', e);
    }

    // Write-back to vendor portal
    if (list[idx].vendorId === 'VND-2025-00029' || (list[idx].vendorName && list[idx].vendorName.toLowerCase().includes('abc infotech'))) {
      try {
        const vendorInvoices = await readJsonFile(VENDOR_PORTAL_INVOICES_PATH);
        const vIdx = vendorInvoices.findIndex(i => i.invoiceId === req.params.id);
        if (vIdx !== -1) {
          vendorInvoices[vIdx].verificationStage = 'Rejected';
          vendorInvoices[vIdx].paymentStatus = 'Rejected';
          vendorInvoices[vIdx].remarks = remarks || '';
          await writeJsonFile(VENDOR_PORTAL_INVOICES_PATH, vendorInvoices);
        }
        await appendJsonData(VENDOR_PORTAL_NOTIFICATIONS_PATH, {
          notificationId: `NOT-${Math.floor(Math.random() * 9000 + 1000)}`,
          vendorId: 'VND-001',
          type: 'invoice_rejected',
          title: 'Invoice Rejected',
          message: `Your invoice ${req.params.id} was rejected. Reason: ${remarks || 'Please contact finance team.'}`,
          link: '/vendor/invoices',
          read: false,
          createdDate: new Date().toISOString().split('T')[0]
        });
      } catch (_) {}
    }

    res.json(list[idx]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ── Admin Payments ────────────────────────────────────────────────────────────
app.get('/api/payments', async (req, res) => {
  try {
    let list = await readJsonFile(ADMIN_PAYMENTS_PATH);
    if (req.query.status) list = list.filter(p => p.status === req.query.status);
    res.json(list);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/payments/approvals', async (req, res) => {
  try {
    const list = await readJsonFile(PAYMENT_APPROVALS_PATH);
    res.json(list);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/payments/batches', async (req, res) => {
  try {
    const [approvals, invoices] = await Promise.all([
      readJsonFile(PAYMENT_APPROVALS_PATH).catch(() => []),
      readJsonFile(ADMIN_INVOICES_PATH).catch(() => [])
    ]);

    const pendingApprovals = approvals.filter(a => a.status === 'Pending Approval');
    
    // Group by vendorName
    const grouped = {};
    for (const app of pendingApprovals) {
      // Find corresponding invoice details if exists
      const inv = invoices.find(i => i.invoiceId === app.invoiceRef);
      const vendorName = app.vendorName;
      const vendorId = inv ? inv.vendorId : 'VND-UNKNOWN';
      const vendorType = inv ? inv.vendorType : 'Non-MSME';
      const netPayable = app.amount;
      const totalAmount = app.amount;

      if (!grouped[vendorName]) {
        grouped[vendorName] = {
          batchId: `BATCH-${vendorId}-${Date.now()}`,
          vendorId: vendorId,
          vendorName: vendorName,
          mode: inv ? inv.mode || 'RTGS' : 'NEFT',
          risk: inv ? inv.riskLevel || 'Low' : 'Low',
          scheduledDate: app.submittedDate || new Date().toISOString().split('T')[0],
          invoices: [],
          totalAmount: 0
        };
      }

      grouped[vendorName].invoices.push({
        invoiceId: app.invoiceRef,
        vendorName: vendorName,
        netPayable: netPayable,
        totalAmount: totalAmount,
        vendorType: vendorType
      });
      grouped[vendorName].totalAmount += totalAmount;
    }

    res.json(Object.values(grouped));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/payments/:id/process', async (req, res) => {
  try {
    const list = await readJsonFile(ADMIN_PAYMENTS_PATH);
    const idx = list.findIndex(p => p.paymentId === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Payment not found' });
    list[idx] = { ...list[idx], status: 'Completed', processedDate: new Date().toISOString().split('T')[0] };
    await writeJsonFile(ADMIN_PAYMENTS_PATH, list);

    const payment = list[idx];
    // Write-back to vendor portal payments if ABC Infotech
    if (payment.vendorId === 'VND-2025-00029' || (payment.vendorName && payment.vendorName.toLowerCase().includes('abc infotech'))) {
      try {
        const vendorPayments = await readJsonFile(VENDOR_PORTAL_PAYMENTS_PATH);
        const exists = vendorPayments.some(p => p.paymentId === payment.paymentId);
        if (!exists) {
          vendorPayments.unshift({
            paymentId: payment.paymentId,
            invoiceId: payment.invoiceId,
            amount: payment.amount,
            mode: payment.mode,
            utrRef: payment.utrRef,
            bankAccount: payment.bankAccount,
            scheduledDate: payment.scheduledDate,
            paymentDate: payment.processedDate,
            status: 'Completed',
            tdsDeducted: payment.tdsDeducted || 0,
            remarks: payment.remarks || ''
          });
          await writeJsonFile(VENDOR_PORTAL_PAYMENTS_PATH, vendorPayments);
        }
        // Update linked vendor invoice to Paid
        const vendorInvoices = await readJsonFile(VENDOR_PORTAL_INVOICES_PATH);
        const vIdx = vendorInvoices.findIndex(i => i.invoiceId === payment.invoiceId);
        if (vIdx !== -1) {
          vendorInvoices[vIdx].verificationStage = 'Paid';
          vendorInvoices[vIdx].paymentStatus = 'Paid';
          await writeJsonFile(VENDOR_PORTAL_INVOICES_PATH, vendorInvoices);
        }
        await appendJsonData(VENDOR_PORTAL_NOTIFICATIONS_PATH, {
          notificationId: `NOT-${Math.floor(Math.random() * 9000 + 1000)}`,
          vendorId: 'VND-001',
          type: 'payment_processed',
          title: 'Payment Released',
          message: `Payment of ₹${payment.amount?.toLocaleString('en-IN')} for invoice ${payment.invoiceId} has been processed. UTR: ${payment.utrRef || 'Pending'}`,
          link: '/vendor/payments',
          read: false,
          createdDate: new Date().toISOString().split('T')[0]
        });
      } catch (_) {}
    }

    res.json(list[idx]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ── Finance: TDS ──────────────────────────────────────────────────────────────
app.get('/api/tds', async (req, res) => {
  try {
    let list = await readJsonFile(TDS_PATH);
    if (req.query.status) list = list.filter(t => t.status === req.query.status);
    res.json(list);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/tds/:id/approve', async (req, res) => {
  try {
    const { approvedBy } = req.body;
    const list = await readJsonFile(TDS_PATH);
    const idx = list.findIndex(t => t.tdsId === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'TDS record not found' });
    list[idx] = { ...list[idx], status: 'Approved', approvedBy: approvedBy || 'Finance Manager', approvedDate: new Date().toISOString() };
    await writeJsonFile(TDS_PATH, list);
    res.json(list[idx]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ── Finance: Bank Reconciliation ──────────────────────────────────────────────
app.get('/api/finance/bank-reconciliation', async (req, res) => {
  try {
    const list = await readJsonFile(BANK_RECON_PATH);
    res.json(list);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/finance/bank-reconciliation/:id/approve', async (req, res) => {
  try {
    const { approvedBy } = req.body;
    const list = await readJsonFile(BANK_RECON_PATH);
    const idx = list.findIndex(r => r.reconId === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Reconciliation record not found' });
    list[idx] = { ...list[idx], status: 'Reconciled', approvedBy: approvedBy || 'Finance Manager' };
    await writeJsonFile(BANK_RECON_PATH, list);
    res.json(list[idx]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ── Finance: Aging Report & Dashboard ────────────────────────────────────────
app.get('/api/finance/aging-report', async (req, res) => {
  try {
    const list = await readJsonFile(AGING_PATH);
    res.json(list);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/finance/dashboard', async (req, res) => {
  try {
    const invoices = await readJsonFile(ADMIN_INVOICES_PATH);
    const tds = await readJsonFile(TDS_PATH);
    const recon = await readJsonFile(BANK_RECON_PATH);
    const aging = await readJsonFile(AGING_PATH);

    const pendingInvoices = invoices.filter(i => i.status === 'Approved' && i.stage === 'Finance Approval').length;
    const pendingTDS = tds.filter(t => t.status === 'Pending Approval').length;
    const unreconciledItems = recon.filter(r => r.status !== 'Reconciled').length;
    const msmePayables = aging.filter(a => a.vendorType === 'MSME').reduce((sum, a) => sum + (a.days1to30 + a.days31to60 + a.days61to90 + a.over90), 0);
    const cashFlowThisMonth = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + (i.netPayable || i.totalAmount), 0);
    const totalPayables = aging.reduce((sum, a) => sum + a.total, 0);

    res.json({ pendingInvoices, pendingTDS, unreconciledItems, msmePayables, cashFlowThisMonth, totalPayables });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 3. Security Approvals queue APIs (Checker Queue in Zero-Trust Audit page)
app.get('/api/approvals', async (req, res) => {
  try {
    const approvals = await readJsonFile(APPROVALS_PATH);
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/approvals/:id/resolve', async (req, res) => {
  try {
    const { action, performedBy } = req.body;
    const approvals = await readJsonFile(APPROVALS_PATH);
    const item = approvals.find(a => a.id === req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Approval item not found' });
    }

    // Resolve or delete from active pending queue
    await deleteJsonData(APPROVALS_PATH, 'id', req.params.id);

    await logAction(
      performedBy || 'Saurabh.S',
      'Security Checker',
      `Four-eye checker ${action} executed for security action: ${item.changeDetails}`,
      'Success',
      'High'
    );

    res.json({ success: true, message: `Action ${action} for ${req.params.id} logged.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Audit Logs API
app.get('/api/audit-logs', async (req, res) => {
  try {
    const logs = await readJsonFile(AUDIT_LOGS_PATH);
    // Return logs sorted newest first
    res.json(logs.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ITEM & SERVICE CATALOGUE MANAGEMENT APIs
// ==========================================

// Configure Multer for Catalogue File Uploads
const catStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileType = req.body.fileType || 'specifications';
    const linkedModule = req.body.linkedModule || '';
    if (linkedModule === 'Item Master') {
      cb(null, CAT_ITEMS_UPLOADS_DIR);
    } else if (linkedModule === 'Service Master') {
      cb(null, CAT_SERVICES_UPLOADS_DIR);
    } else if (fileType === 'Product Image') {
      cb(null, CAT_IMAGES_DIR);
    } else if (fileType === 'Compliance Certificate' || fileType === 'Technical Document') {
      cb(null, CAT_COMPLIANCE_DIR);
    } else {
      cb(null, CAT_SPECS_DIR);
    }
  },
  filename: (req, file, cb) => {
    const linkedModule = req.body.linkedModule || '';
    if (linkedModule === 'Item Master' || linkedModule === 'Service Master') {
      const nameWithoutExt = path.basename(file.originalname, path.extname(file.originalname));
      const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-');
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, cleanName + ext);
    } else {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, 'CAT_' + uniqueSuffix + ext);
    }
  }
});
const catUpload = multer({ storage: catStorage });

// Helper to log catalogue activity
async function logCatActivity(itemId, action, user) {
  try {
    const activity = {
      activityId: `ACT-${Math.floor(Math.random() * 90000) + 10000}`,
      itemId,
      action,
      user: user || 'Saurabh Anand',
      dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    await appendJsonData(CAT_ACTIVITY_PATH, activity);
  } catch (err) {
    console.error('Error logging catalogue activity:', err);
  }
}

// Helper to queue catalogue approval in catalogue-approvals.json
async function queueCatalogueApproval(catalogueId, type, itemData) {
  try {
    let approvals = [];
    try {
      approvals = await readJsonFile(CAT_APPROVALS_PATH);
      if (!Array.isArray(approvals)) approvals = [];
    } catch (e) {
      approvals = [];
    }
    
    // Check if pending approval already exists for this ID
    const exists = approvals.some(a => a.catalogueId === catalogueId && a.status === 'Pending Approval');
    if (!exists) {
      const nextId = `APR-${String(approvals.length + 1).padStart(4, '0')}`;
      const newApp = {
        approvalId: nextId,
        catalogueId,
        type,
        status: 'Pending Approval',
        submittedBy: itemData.submittedBy || itemData.createdBy || 'Procurement Manager',
        checker: 'Saurabh Anand',
        remarks: '',
        approvalDate: null,
        itemName: itemData.itemName || itemData.serviceName || 'N/A',
        category: itemData.category || itemData.serviceCategory || 'N/A',
        submittedDate: new Date().toISOString().split('T')[0]
      };
      approvals.push(newApp);
      await writeJsonFile(CAT_APPROVALS_PATH, approvals);
      console.log(`Queued catalogue approval: ${nextId} for ${catalogueId}`);
    }
  } catch (err) {
    console.error('Error queueing catalogue approval:', err);
  }
}

// Helper to update dashboard calculations
async function updateCatDashboardMetrics() {
  try {
    const items = await readJsonFile(CAT_ITEMS_PATH);
    const services = await readJsonFile(CAT_SERVICES_PATH);
    const approvals = await readJsonFile(CAT_APPROVALS_PATH);
    const allVendors = await readJsonFile(VENDORS_PATH);
    
    const totalItems = items.length;
    const totalServices = services.length;
    const pendingApprovalsCount = approvals.length;

    // Calculate dynamic count of unique vendors mapped to items/services
    const mappedVendors = new Set();
    items.forEach(item => {
      if (item.preferredVendor && item.preferredVendor.vendorId && item.preferredVendor.vendorId !== 'N/A') {
        mappedVendors.add(item.preferredVendor.vendorId);
      }
      if (Array.isArray(item.alternateVendors)) {
        item.alternateVendors.forEach(alt => {
          if (alt && alt.vendorId && alt.vendorId !== 'N/A') {
            mappedVendors.add(alt.vendorId);
          }
        });
      }
    });
    services.forEach(service => {
      if (service.preferredVendor && service.preferredVendor !== 'N/A') {
        const matchingVendor = allVendors.find(v => 
          (v.basicDetails?.legalName || '').toLowerCase() === service.preferredVendor.toLowerCase() ||
          (v.basicDetails?.tradeName || '').toLowerCase() === service.preferredVendor.toLowerCase() ||
          v.vendorId === service.preferredVendor
        );
        if (matchingVendor) {
          mappedVendors.add(matchingVendor.vendorId);
        } else {
          mappedVendors.add(service.preferredVendor);
        }
      }
      if (Array.isArray(service.alternateVendors)) {
        service.alternateVendors.forEach(alt => {
          if (alt && alt !== 'N/A') {
            const matchingVendor = allVendors.find(v => 
              (v.basicDetails?.legalName || '').toLowerCase() === alt.toLowerCase() ||
              (v.basicDetails?.tradeName || '').toLowerCase() === alt.toLowerCase() ||
              v.vendorId === alt
            );
            if (matchingVendor) {
              mappedVendors.add(matchingVendor.vendorId);
            } else {
              mappedVendors.add(alt);
            }
          }
        });
      }
    });

    const activeVendors = mappedVendors.size;

    // Derived services metrics
    const pendingVendorMapping = services.filter(s => s.workflowStage === 'Vendor Mapping').length;
    const publishedServices = services.filter(s => s.status === 'Published').length;
    const compliancePending = services.filter(s => s.status === 'Pending Approval').length;
    const rateConfigurationPending = services.filter(s => s.status !== 'Published').length;

    // Calculate critical categories from items and services
    const uniqueCategories = new Set();
    items.forEach(i => i.category && uniqueCategories.add(i.category));
    services.forEach(s => s.category && uniqueCategories.add(s.category));
    const criticalCategories = uniqueCategories.size;

    // Rate revisions due is 0 when data is empty
    const rateRevisionsDue = 0; 

    // Catalogue utilization is (published items + published services) / (total items + services) * 100
    const totalCount = totalItems + totalServices;
    const publishedCount = items.filter(i => i.status === 'Published').length + publishedServices;
    const catalogueUtilization = totalCount > 0 ? parseFloat(((publishedCount / totalCount) * 100).toFixed(1)) : 0.0;

    const stats = {
      totalItems,
      totalServices,
      activeVendors,
      pendingApprovals: pendingApprovalsCount,
      pendingVendorMapping,
      publishedServices,
      compliancePending,
      rateConfigurationPending,
      criticalCategories,
      rateRevisionsDue,
      catalogueUtilization
    };
    await writeJsonFile(CAT_DASHBOARD_PATH, stats);
  } catch (err) {
    console.error('Error updating dashboard metrics:', err);
  }
}

// 1. GET /api/catalogue/items
app.get('/api/catalogue/items', async (req, res) => {
  try {
    const items = await readJsonFile(CAT_ITEMS_PATH);
    const services = await readJsonFile(CAT_SERVICES_PATH);
    
    // Normalize services to look like CatalogueItems for frontends
    const normalizedServices = services.map(s => ({
      itemId: s.serviceId,
      itemCode: s.serviceCode,
      itemName: s.serviceName,
      category: s.serviceCategory || s.category,
      subCategory: s.serviceSubCategory || s.subCategory,
      description: s.description,
      department: s.department,
      businessFunction: s.businessFunction,
      serviceOwner: s.serviceOwner,
      serviceType: s.serviceType,
      preferredVendor: {
        vendorId: 'VND-001',
        vendorName: s.preferredVendor
      },
      alternateVendors: (s.alternateVendors || []).map((alt, idx) => ({
        vendorId: `VND-ALT-${idx}`,
        vendorName: alt
      })),
      hsnCode: s.serviceCode,
      unitOfMeasurement: 'Unit',
      taxCode: 'GST 18%',
      qualityComplianceStandards: s.qualityStandards || s.qualityStandard,
      riskClassification: s.riskClassification,
      status: s.status,
      isService: true,
      createdDate: s.createdDate,
      createdBy: s.createdBy
    }));

    let combined = [...items, ...normalizedServices];
    const { category, status, search } = req.query;

    if (category && category !== 'All') {
      combined = combined.filter(i => i.category === category);
    }
    if (status && status !== 'All') {
      combined = combined.filter(i => i.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      combined = combined.filter(i => 
        i.itemName.toLowerCase().includes(q) ||
        i.itemCode.toLowerCase().includes(q) ||
        (i.hsnCode && i.hsnCode.toLowerCase().includes(q)) ||
        (i.category && i.category.toLowerCase().includes(q)) ||
        (i.preferredVendor && i.preferredVendor.vendorName && i.preferredVendor.vendorName.toLowerCase().includes(q)) ||
        (i.itemId && i.itemId.toLowerCase().includes(q))
      );
    }
    res.json(combined);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /api/catalogue/items/:id
app.get('/api/catalogue/items/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (id && (id.startsWith('SRV-') || id.startsWith('SVC-'))) {
      const services = await readJsonFile(CAT_SERVICES_PATH);
      const service = services.find(s => s.serviceId === id);
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      return res.json({
        itemId: service.serviceId,
        itemCode: service.serviceCode,
        itemName: service.serviceName,
        category: service.serviceCategory || service.category,
        subCategory: service.serviceSubCategory || service.subCategory,
        description: service.description,
        department: service.department,
        businessFunction: service.businessFunction,
        serviceOwner: service.serviceOwner,
        serviceType: service.serviceType,
        preferredVendor: {
          vendorId: 'VND-001',
          vendorName: service.preferredVendor
        },
        alternateVendors: (service.alternateVendors || []).map((alt, idx) => ({
          vendorId: `VND-ALT-${idx}`,
          vendorName: alt
        })),
        hsnCode: service.serviceCode,
        unitOfMeasurement: 'Unit',
        taxCode: 'GST 18%',
        qualityComplianceStandards: service.qualityStandards || service.qualityStandard,
        riskClassification: service.riskClassification,
        status: service.status,
        isService: true,
        createdDate: service.createdDate,
        createdBy: service.createdBy
      });
    }

    const items = await readJsonFile(CAT_ITEMS_PATH);
    const item = items.find(i => i.itemId === id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2b. GET /api/catalogue/services
app.get('/api/catalogue/services', async (req, res) => {
  try {
    const services = await readJsonFile(CAT_SERVICES_PATH);
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2c. GET /api/catalogue/service-attachments
app.get('/api/catalogue/service-attachments', async (req, res) => {
  try {
    const attachments = await readJsonFile(CAT_SERVICE_ATTACHMENTS_PATH);
    res.json(attachments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2d. POST /api/catalogue/services
app.post('/api/catalogue/services', async (req, res) => {
  try {
    const serviceData = req.body;
    const services = await readJsonFile(CAT_SERVICES_PATH);

    // Validation
    const reqFields = ['serviceName', 'serviceCode', 'serviceCategory', 'department'];
    for (const f of reqFields) {
      if (!serviceData[f]) {
        return res.status(400).json({ success: false, message: `Field '${f}' is mandatory.` });
      }
    }

    const codeExists = services.some(s => (s.serviceCode || '').toLowerCase() === serviceData.serviceCode.toLowerCase());
    if (codeExists) {
      return res.status(400).json({ success: false, message: `Service Code '${serviceData.serviceCode}' already exists.` });
    }

    const nameExists = services.some(s => 
      (s.serviceCategory || '').toLowerCase() === serviceData.serviceCategory.toLowerCase() && 
      (s.serviceName || '').toLowerCase() === serviceData.serviceName.toLowerCase()
    );
    if (nameExists) {
      return res.status(400).json({ success: false, message: `Service Name '${serviceData.serviceName}' already exists under Category '${serviceData.serviceCategory}'.` });
    }

    // Auto increment serviceId
    const year = 2026;
    let maxNum = 0;
    for (const s of services) {
      if (s.serviceId && (s.serviceId.startsWith(`SRV-${year}-`) || s.serviceId.startsWith(`SVC-${year}-`))) {
        const parts = s.serviceId.split('-');
        if (parts.length === 3) {
          const num = parseInt(parts[2], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    }
    const nextNum = maxNum + 1;
    const padded = String(nextNum).padStart(4, '0');
    serviceData.serviceId = `SVC-${year}-${padded}`;

    const clientStatus = serviceData.status || 'Pending Approval';
    serviceData.status = clientStatus;
    serviceData.workflowStage = 'None';
    serviceData.createdDate = new Date().toISOString().split('T')[0];
    serviceData.createdBy = serviceData.createdBy || 'Admin';

    // Save attachment metadata
    const attachments = await readJsonFile(CAT_SERVICE_ATTACHMENTS_PATH);
    let maxAttNum = 0;
    for (const att of attachments) {
      if (att.attachmentId && att.attachmentId.startsWith('ATT-SRV-')) {
        const num = parseInt(att.attachmentId.substring(8), 10);
        if (!isNaN(num) && num > maxAttNum) {
          maxAttNum = num;
        }
      }
    }

    const attachmentIds = [];
    const formattedUploadedFiles = [];
    for (const file of serviceData.uploadedFiles || []) {
      maxAttNum++;
      const attId = `ATT-SRV-${String(maxAttNum).padStart(3, '0')}`;
      const ext = path.extname(file.fileName).substring(1).toLowerCase() || 'pdf';
      
      const docType = file.documentType || 
        (file.fileType?.includes('SLA') || file.fileName?.toLowerCase().includes('sla') ? 'SLA' : 
         file.fileType?.includes('Scope') || file.fileName?.toLowerCase().includes('sow') ? 'SOW' : 'SUPP');

      const attEntry = {
        attachmentId: attId,
        serviceId: serviceData.serviceId,
        documentType: docType,
        fileName: file.fileName,
        fileType: ext,
        fileSize: file.fileSize || '1.0 MB',
        filePath: file.filePath || `/uploads/catalogue/services/${file.fileName}`,
        uploadedBy: serviceData.createdBy,
        uploadedDate: serviceData.createdDate
      };
      attachments.push(attEntry);
      attachmentIds.push(attId);
      
      formattedUploadedFiles.push({
        fileId: file.fileId || `FILE-${Math.floor(Math.random() * 9000) + 1000}`,
        fileName: file.fileName,
        fileType: file.fileType || 'Service SLA / Scope Document',
        filePath: file.filePath || `/uploads/catalogue/services/${file.fileName}`,
        uploadedOn: serviceData.createdDate,
        fileSize: file.fileSize || '1.0 MB',
        attachmentId: attId,
        documentType: docType
      });
    }
    await writeJsonFile(CAT_SERVICE_ATTACHMENTS_PATH, attachments);
    serviceData.attachmentIds = attachmentIds;
    serviceData.uploadedFiles = formattedUploadedFiles;

    // Generate Audit Log
    const auditLogs = await readJsonFile(CAT_SERVICE_AUDIT_LOG_PATH);
    let maxAudNum = 0;
    for (const log of auditLogs) {
      if (log.auditId && log.auditId.startsWith('AUD-SRV-')) {
        const num = parseInt(log.auditId.substring(8), 10);
        if (!isNaN(num) && num > maxAudNum) {
          maxAudNum = num;
        }
      }
    }
    const nextAudNum = maxAudNum + 1;
    const auditId = `AUD-SRV-${String(nextAudNum).padStart(3, '0')}`;
    const auditEntry = {
      auditId,
      serviceId: serviceData.serviceId,
      action: 'Service Created',
      user: serviceData.createdBy,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    auditLogs.push(auditEntry);
    await writeJsonFile(CAT_SERVICE_AUDIT_LOG_PATH, auditLogs);

    // Save to services database
    services.push(serviceData);
    await writeJsonFile(CAT_SERVICES_PATH, services);

    // Add to approvals queue if not Draft
    if (serviceData.status === 'Pending Approval') {
      await queueCatalogueApproval(serviceData.serviceId, 'Service', serviceData);
      await logCatActivity(serviceData.serviceId, 'Service Created & Submitted for Approval', serviceData.createdBy);
    } else {
      await logCatActivity(serviceData.serviceId, 'Service Created as Draft', serviceData.createdBy);
    }
    await updateCatDashboardMetrics();

    res.json({ success: true, service: serviceData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. POST /api/catalogue/items
app.post('/api/catalogue/items', async (req, res) => {
  try {
    const itemData = req.body;
    const items = await readJsonFile(CAT_ITEMS_PATH);
    
    // Auto increment itemId
    const year = 2026;
    let maxNum = 0;
    for (const i of items) {
      if (i.itemId && i.itemId.startsWith(`ITM-${year}-`)) {
        const parts = i.itemId.split('-');
        if (parts.length === 3) {
          const num = parseInt(parts[2], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    }
    const nextNum = maxNum + 1;
    const padded = String(nextNum).padStart(4, '0');
    itemData.itemId = `ITM-${year}-${padded}`;

    const clientStatus = itemData.status || 'Pending Approval';
    itemData.status = clientStatus;
    itemData.approvalWorkflow = {
      submittedBy: itemData.submittedBy || 'Admin',
      submittedDate: new Date().toISOString().split('T')[0],
      approvalStatus: clientStatus === 'Draft' ? 'Draft' : 'Pending',
      currentApprover: clientStatus === 'Draft' ? '' : 'Procurement Checker'
    };

    // Save attachment metadata
    const attachments = await readJsonFile(CAT_ATTACHMENTS_PATH);
    let maxAttNum = 0;
    for (const att of attachments) {
      if (att.attachmentId && att.attachmentId.startsWith('ATT-')) {
        const num = parseInt(att.attachmentId.substring(4), 10);
        if (!isNaN(num) && num > maxAttNum) {
          maxAttNum = num;
        }
      }
    }

    const formattedUploadedFiles = [];
    for (const file of itemData.uploadedFiles || []) {
      maxAttNum++;
      const attId = `ATT-${String(maxAttNum).padStart(3, '0')}`;
      const ext = path.extname(file.fileName).substring(1).toLowerCase() || 'pdf';
      const attEntry = {
        attachmentId: attId,
        itemId: itemData.itemId,
        fileName: file.fileName,
        fileType: ext,
        fileSize: file.fileSize || '1.0 MB',
        filePath: file.filePath || `/uploads/catalogue/items/${file.fileName}`,
        uploadedDate: new Date().toISOString().split('T')[0],
        uploadedBy: itemData.submittedBy || 'Admin'
      };
      attachments.push(attEntry);
      
      formattedUploadedFiles.push({
        fileId: file.fileId || `FILE-${Math.floor(Math.random() * 9000) + 1000}`,
        fileName: file.fileName,
        fileType: file.fileType || 'Specification Sheet',
        filePath: file.filePath || `/uploads/catalogue/items/${file.fileName}`,
        uploadedOn: new Date().toISOString().split('T')[0],
        fileSize: file.fileSize || '1.0 MB',
        attachmentId: attId
      });
    }
    await writeJsonFile(CAT_ATTACHMENTS_PATH, attachments);
    itemData.uploadedFiles = formattedUploadedFiles;

    // Generate Audit Log
    const auditLogs = await readJsonFile(CAT_AUDIT_LOG_PATH);
    let maxAudNum = 0;
    for (const log of auditLogs) {
      if (log.auditId && log.auditId.startsWith('AUD-')) {
        const num = parseInt(log.auditId.substring(4), 10);
        if (!isNaN(num) && num > maxAudNum) {
          maxAudNum = num;
        }
      }
    }
    const nextAudNum = maxAudNum + 1;
    const auditId = `AUD-${String(nextAudNum).padStart(3, '0')}`;
    const auditEntry = {
      auditId,
      itemId: itemData.itemId,
      action: 'Item Created',
      user: itemData.submittedBy || 'Admin',
      dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    auditLogs.push(auditEntry);
    await writeJsonFile(CAT_AUDIT_LOG_PATH, auditLogs);

    // Save to items database
    await appendJsonData(CAT_ITEMS_PATH, itemData);
    
    // Add to approvals queue if not Draft
    if (itemData.status === 'Pending Approval') {
      await queueCatalogueApproval(itemData.itemId, 'Item', itemData);
      await logCatActivity(itemData.itemId, 'Item Created & Submitted for Approval', itemData.submittedBy);
    } else {
      await logCatActivity(itemData.itemId, 'Item Created as Draft', itemData.submittedBy);
    }
    await updateCatDashboardMetrics();

    res.json({ success: true, item: itemData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. PUT /api/catalogue/items/:id
app.put('/api/catalogue/items/:id', async (req, res) => {
  try {
    const updated = await updateJsonData(CAT_ITEMS_PATH, 'itemId', req.params.id, req.body);
    await logCatActivity(req.params.id, 'Item Updated', req.body.submittedBy);
    if (req.body.status === 'Pending Approval') {
      await queueCatalogueApproval(req.params.id, 'Item', req.body);
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. DELETE /api/catalogue/items/:id
app.delete('/api/catalogue/items/:id', async (req, res) => {
  try {
    await deleteJsonData(CAT_ITEMS_PATH, 'itemId', req.params.id);
    await deleteJsonData(CAT_APPROVALS_PATH, 'itemId', req.params.id);
    await logCatActivity(req.params.id, 'Item Deleted', 'Admin');
    await updateCatDashboardMetrics();
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5b. PUT /api/catalogue/services/:id
app.put('/api/catalogue/services/:id', async (req, res) => {
  try {
    const updated = await updateJsonData(CAT_SERVICES_PATH, 'serviceId', req.params.id, req.body);
    await logCatActivity(req.params.id, 'Service Updated', req.body.createdBy);
    if (req.body.status === 'Pending Approval') {
      await queueCatalogueApproval(req.params.id, 'Service', req.body);
    }
    await updateCatDashboardMetrics();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5c. DELETE /api/catalogue/services/:id
app.delete('/api/catalogue/services/:id', async (req, res) => {
  try {
    await deleteJsonData(CAT_SERVICES_PATH, 'serviceId', req.params.id);
    await deleteJsonData(CAT_APPROVALS_PATH, 'itemId', req.params.id);
    await logCatActivity(req.params.id, 'Service Deleted', 'Admin');
    await updateCatDashboardMetrics();
    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. GET /api/catalogue/vendors
app.get('/api/catalogue/vendors', async (req, res) => {
  try {
    const allVendors = await readJsonFile(VENDORS_PATH);
    const activeVendors = allVendors
      .filter(v => v.status === 'Active')
      .map(v => ({
        vendorId: v.vendorId,
        vendorName: v.basicDetails?.legalName || v.basicDetails?.tradeName || 'Unnamed Vendor',
        status: v.status || 'Active'
      }));
    res.json(activeVendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. GET /api/catalogue/hsn-sac
app.get('/api/catalogue/hsn-sac', async (req, res) => {
  try {
    const codes = await readJsonFile(CAT_HSN_CODES_PATH);
    res.json(codes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. GET /api/catalogue/uoms
app.get('/api/catalogue/uoms', async (req, res) => {
  try {
    const uoms = await readJsonFile(CAT_UOMS_PATH);
    res.json(uoms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. GET /api/catalogue/dashboard
app.get('/api/catalogue/dashboard', async (req, res) => {
  try {
    const stats = await readJsonFile(CAT_DASHBOARD_PATH);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10. GET /api/catalogue/pending-approvals
app.get('/api/catalogue/pending-approvals', async (req, res) => {
  try {
    const approvals = await readJsonFile(CAT_APPROVALS_PATH);
    const pending = approvals.filter(a => a.status === 'Pending Approval');
    res.json(pending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 11. POST /api/catalogue/approvals/:id/resolve
app.post('/api/catalogue/approvals/:id/resolve', async (req, res) => {
  try {
    const { action, remarks, performedBy } = req.body;
    const approvals = await readJsonFile(CAT_APPROVALS_PATH);
    const appEntry = approvals.find(a => a.approvalId === req.params.id || a.catalogueId === req.params.id || a.itemId === req.params.id);
    if (!appEntry) {
      return res.status(404).json({ message: 'Approval request not found' });
    }

    const userName = performedBy || 'Saurabh Anand';
    const catId = appEntry.catalogueId || appEntry.itemId;

    if (action === 'Recommend') {
      appEntry.checker = 'Saurabh Anand';
      appEntry.remarks = remarks;
      await writeJsonFile(CAT_APPROVALS_PATH, approvals);

      let resolvedData;
      if (catId && (catId.startsWith('SRV-') || catId.startsWith('SVC-'))) {
        resolvedData = await updateJsonData(CAT_SERVICES_PATH, 'serviceId', catId, {
          approvalWorkflow: {
            submittedBy: appEntry.submittedBy,
            submittedDate: appEntry.submittedDate,
            approvalStatus: 'Pending',
            currentApprover: 'Tenant Admin',
            checkerRemarks: remarks
          }
        });
      } else {
        resolvedData = await updateJsonData(CAT_ITEMS_PATH, 'itemId', catId, {
          approvalWorkflow: {
            submittedBy: appEntry.submittedBy,
            submittedDate: appEntry.submittedDate,
            approvalStatus: 'Pending',
            currentApprover: 'Tenant Admin',
            checkerRemarks: remarks
          },
          auditTrail: [
            {
              action: `Item recommended for approval by Procurement Checker`,
              user: userName,
              dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
            }
          ]
        });
      }
      await logCatActivity(catId, `Catalogue unit recommended by Procurement Checker`, userName);
      await updateCatDashboardMetrics();
      return res.json({ success: true, message: `Catalogue entry recommended successfully.`, item: resolvedData });
    }

    const finalStatus = action === 'Approve' ? 'Published' : action === 'Reject' ? 'Rejected' : 'Sent Back for Clarification';

    let resolvedData;
    if (catId && (catId.startsWith('SRV-') || catId.startsWith('SVC-'))) {
      resolvedData = await updateJsonData(CAT_SERVICES_PATH, 'serviceId', catId, {
        status: finalStatus,
        approvalWorkflow: {
          submittedBy: appEntry.submittedBy,
          submittedDate: appEntry.submittedDate,
          approvalStatus: action === 'Approve' ? 'Approved' : action === 'Reject' ? 'Rejected' : 'Sent Back',
          currentApprover: '',
          checkerRemarks: remarks,
          checkedBy: userName,
          checkedDate: new Date().toISOString().split('T')[0]
        }
      });
    } else {
      resolvedData = await updateJsonData(CAT_ITEMS_PATH, 'itemId', catId, {
        status: finalStatus,
        approvalWorkflow: {
          submittedBy: appEntry.submittedBy,
          submittedDate: appEntry.submittedDate,
          approvalStatus: action === 'Approve' ? 'Approved' : action === 'Reject' ? 'Rejected' : 'Sent Back',
          currentApprover: '',
          checkerRemarks: remarks,
          checkedBy: userName,
          checkedDate: new Date().toISOString().split('T')[0]
        },
        auditTrail: [
          {
            action: `Item ${action}d`,
            user: userName,
            dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
          }
        ]
      });
    }

    // Update approval status inside catalogue-approvals.json instead of deleting
    appEntry.status = action === 'Approve' ? 'Approved' : action === 'Reject' ? 'Rejected' : 'Sent Back for Clarification';
    appEntry.remarks = remarks;
    appEntry.approvalDate = new Date().toISOString().split('T')[0];
    await writeJsonFile(CAT_APPROVALS_PATH, approvals);

    await logCatActivity(catId, `Catalogue unit ${action}d by Checker`, userName);
    await updateCatDashboardMetrics();

    res.json({ success: true, message: `Catalogue entry ${action}d successfully.`, item: resolvedData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 12. POST /api/catalogue/upload
app.post('/api/catalogue/upload', catUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file was uploaded' });
    }

    const { linkedModule, linkedRecordId, fileType, uploadedBy } = req.body;
    
    const cleanPath = linkedModule === 'Item Master'
      ? '/uploads/catalogue/items/' + req.file.filename
      : linkedModule === 'Service Master'
      ? '/uploads/catalogue/services/' + req.file.filename
      : '/uploads/catalogue/' + 
        (fileType === 'Product Image' ? 'images/' : 
         fileType === 'Compliance Certificate' || fileType === 'Technical Document' ? 'compliance/' : 'specifications/') + 
        req.file.filename;

    const fileMeta = {
      fileId: `FILE-${Math.floor(Math.random() * 9000) + 1000}`,
      linkedModule: linkedModule || 'Item Master',
      linkedRecordId: linkedRecordId || '',
      fileName: req.file.originalname,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      storagePath: cleanPath,
      uploadedBy: uploadedBy || 'Saurabh Anand',
      uploadedOn: new Date().toISOString().split('T')[0],
      size: `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`
    };

    await appendJsonData(CAT_UPLOADED_FILES_PATH, fileMeta);

    // Copy to /uploads/catalogue/ and persist to catalogue-documents.json
    try {
      const catalogueDir = path.join(__dirname, 'uploads', 'catalogue');
      const destPath = path.join(catalogueDir, req.file.filename);
      await fs.mkdir(catalogueDir, { recursive: true });
      await fs.copyFile(req.file.path, destPath);

      // Read documents and determine next sequence ID
      let docs = [];
      try {
        docs = await readJsonFile(CAT_DOCUMENTS_PATH);
        if (!Array.isArray(docs)) docs = [];
      } catch (e) {
        docs = [];
      }
      
      const docId = `DOC-${String(docs.length + 1).padStart(3, '0')}`;
      const docMeta = {
        documentId: docId,
        catalogueId: linkedRecordId || 'ITM-2026-0001',
        fileName: req.file.originalname,
        filePath: `/uploads/catalogue/${req.file.filename}`,
        uploadedBy: uploadedBy || 'Saurabh Anand',
        uploadedDate: new Date().toISOString().split('T')[0]
      };
      docs.push(docMeta);
      await writeJsonFile(CAT_DOCUMENTS_PATH, docs);
    } catch (err) {
      console.error('Failed to copy to catalogue uploads or save to metadata:', err);
    }

    res.json({ success: true, file: fileMeta });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 13. GET /api/catalogue/files/:itemId
app.get('/api/catalogue/files/:itemId', async (req, res) => {
  try {
    const files = await readJsonFile(CAT_UPLOADED_FILES_PATH);
    const filtered = files.filter(f => f.linkedRecordId === req.params.itemId);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 13b. GET /api/catalogue/documents/:itemId
app.get('/api/catalogue/documents/:itemId', async (req, res) => {
  try {
    const docs = await readJsonFile(CAT_DOCUMENTS_PATH);
    const filtered = docs.filter(d => d.catalogueId === req.params.itemId);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// CONTRACTS & SLAs MODULE APIs
// ==========================================

const CONTRACTS_DIR = path.join(__dirname, 'data', 'contracts');
const CONTRACTS_PATH = path.join(__dirname, 'data', 'contracts.json');
const CONTRACT_DRAFTS_PATH = path.join(CONTRACTS_DIR, 'contractDrafts.json');
const CONTRACT_DASHBOARD_PATH = path.join(CONTRACTS_DIR, 'dashboardCache.json');
const CONTRACT_APPROVALS_PATH = path.join(__dirname, 'data', 'contract-approvals.json');
const CONTRACT_RENEWALS_PATH = path.join(__dirname, 'data', 'contract-renewals.json');
const CLAUSE_LIBRARY_PATH = path.join(CONTRACTS_DIR, 'clauseLibrary.json');
const CONTRACT_ACTIVITY_PATH = path.join(CONTRACTS_DIR, 'contract-activity.json');
const CONTRACT_RISK_INSIGHTS_PATH = path.join(CONTRACTS_DIR, 'contract-risk-insights.json');
const SLA_TRACKER_PATH = path.join(CONTRACTS_DIR, 'slaBreaches.json');
const CONTRACT_UPLOADED_FILES_PATH = path.join(__dirname, 'data', 'contract-documents.json');
const CONTRACT_TEMPLATES_PATH = path.join(CONTRACTS_DIR, 'contract-templates.json');
const CONTRACT_AUDIT_LOG_PATH = path.join(CONTRACTS_DIR, 'auditTrail.json');
const CONTRACTS_VENDORS_PATH = path.join(CONTRACTS_DIR, 'vendors.json');
const CONTRACT_TYPES_PATH = path.join(CONTRACTS_DIR, 'contract-types.json');

// VENDOR SELF-SERVICE PORTAL CONSTANTS
const VENDOR_PORTAL_DIR = path.join(__dirname, 'data', 'vendor');
const VENDOR_PORTAL_VENDORS_PATH = path.join(VENDOR_PORTAL_DIR, 'vendors.json');
const VENDOR_PORTAL_DOCUMENTS_PATH = path.join(VENDOR_PORTAL_DIR, 'documents.json');
const VENDOR_PORTAL_KYC_PATH = path.join(VENDOR_PORTAL_DIR, 'kyc.json');
const VENDOR_PORTAL_POS_PATH = path.join(VENDOR_PORTAL_DIR, 'purchaseOrders.json');
const VENDOR_PORTAL_INVOICES_PATH = path.join(VENDOR_PORTAL_DIR, 'invoices.json');
const VENDOR_PORTAL_PAYMENTS_PATH = path.join(VENDOR_PORTAL_DIR, 'payments.json');
const VENDOR_PORTAL_TICKETS_PATH = path.join(VENDOR_PORTAL_DIR, 'supportTickets.json');
const VENDOR_PORTAL_NOTIFICATIONS_PATH = path.join(VENDOR_PORTAL_DIR, 'notifications.json');
const VENDOR_PORTAL_AUDIT_LOG_PATH = path.join(VENDOR_PORTAL_DIR, 'auditTrail.json');
const VENDOR_PORTAL_DASHBOARD_PATH = path.join(VENDOR_PORTAL_DIR, 'dashboardCache.json');
const VENDOR_PORTAL_FILES_PATH = path.join(VENDOR_PORTAL_DIR, 'files.json');
const VENDOR_PORTAL_ESIGN_PATH = path.join(VENDOR_PORTAL_DIR, 'esignRequests.json');

const VENDOR_UPLOADS_DIR = path.join(UPLOADS_DIR, 'vendor');

const CONTRACTS_UPLOADS_DIR = path.join(UPLOADS_DIR, 'contracts');
const CTR_LEGAL_DIR = path.join(CONTRACTS_UPLOADS_DIR, 'legal');
const CTR_SLA_DIR = path.join(CONTRACTS_UPLOADS_DIR, 'sla');
const CTR_COMPLIANCE_DIR = path.join(CONTRACTS_UPLOADS_DIR, 'compliance');
const CTR_SUPPORTING_DIR = path.join(CONTRACTS_UPLOADS_DIR, 'supporting-documents');
const CTR_TEMPLATES_DIR = path.join(CONTRACTS_UPLOADS_DIR, 'templates');
const CTR_SIGNED_DIR = path.join(CONTRACTS_UPLOADS_DIR, 'signed');
const CTR_TEMP_DIR = path.join(CONTRACTS_UPLOADS_DIR, 'temp');

// Ensure contract folders and files exist
async function ensureContractDirs() {
  await fs.mkdir(CONTRACTS_DIR, { recursive: true });
  await fs.mkdir(CONTRACTS_UPLOADS_DIR, { recursive: true });
  await fs.mkdir(CTR_LEGAL_DIR, { recursive: true });
  await fs.mkdir(CTR_SLA_DIR, { recursive: true });
  await fs.mkdir(CTR_COMPLIANCE_DIR, { recursive: true });
  await fs.mkdir(CTR_SUPPORTING_DIR, { recursive: true });
  await fs.mkdir(CTR_TEMPLATES_DIR, { recursive: true });
  await fs.mkdir(CTR_SIGNED_DIR, { recursive: true });
  await fs.mkdir(CTR_TEMP_DIR, { recursive: true });

  const initEmptyJson = async (filePath) => {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, '[]', 'utf8');
    }
  };

  await initEmptyJson(CONTRACTS_PATH);
  await initEmptyJson(CONTRACT_APPROVALS_PATH);
  await initEmptyJson(CONTRACT_RENEWALS_PATH);
  await initEmptyJson(CONTRACT_UPLOADED_FILES_PATH);

  // Seed clauseLibrary.json if it is missing or empty
  try {
    const clauses = await readJsonFile(CLAUSE_LIBRARY_PATH);
    if (!clauses || clauses.length === 0) {
      throw new Error();
    }
  } catch {
    const defaultClauses = [
      {
        id: "CLS-RBI",
        name: "RBI Outsourcing Guidelines Clause",
        category: "Regulatory Compliance",
        text: "The service provider agrees to comply with the RBI Guidelines on Outsourcing of Financial Services, permitting inspections and audits by the regulator.",
        mandatory: true
      },
      {
        id: "CLS-NDA",
        name: "Standard NDA Clause",
        category: "Confidentiality",
        text: "Both parties agree to hold all proprietary and confidential information in strict confidence and use it solely for the purpose of executing this Agreement.",
        mandatory: true
      },
      {
        id: "CLS-PRIVACY",
        name: "Data Privacy & Security Clause",
        category: "Data Security",
        text: "The vendor shall process personal data in compliance with standard data protection laws and implement robust technical and organizational security controls.",
        mandatory: true
      },
      {
        id: "CLS-ARBITRATION",
        name: "Dispute Resolution (Arbitration)",
        category: "Legal",
        text: "Any dispute arising out of or in connection with this contract shall be referred to and finally resolved by arbitration in Mumbai in accordance with Arbitration rules.",
        mandatory: false
      },
      {
        id: "CLS-GDPR",
        name: "GDPR Compliance Clause",
        category: "Regulatory Compliance",
        text: "Where EU personal data is processed, the parties shall execute Standard Contractual Clauses (SCCs) to ensure adequacy of cross-border transfers.",
        mandatory: false
      },
      {
        id: "CLS-PENALTY",
        name: "SLA Penalty Clause",
        category: "Service Level",
        text: "Failure to meet the designated service levels will trigger penalties, starting from 5% of monthly billing value, capped at 10% of total contract value.",
        mandatory: false
      }
    ];
    await fs.writeFile(CLAUSE_LIBRARY_PATH, JSON.stringify(defaultClauses, null, 2), 'utf8');
  }

  // Seed slaBreaches.json if missing
  try {
    await fs.access(SLA_TRACKER_PATH);
  } catch {
    await fs.writeFile(SLA_TRACKER_PATH, '[]', 'utf8');
  }
}
ensureContractDirs().catch(console.error);

async function ensureVendorDirs() {
  await fs.mkdir(VENDOR_PORTAL_DIR, { recursive: true });
  await fs.mkdir(VENDOR_UPLOADS_DIR, { recursive: true });

  const initList = [
    {
      path: VENDOR_PORTAL_VENDORS_PATH,
      defaultVal: JSON.stringify([
        {
          "vendorId": "VND-001",
          "vendorName": "Acme Cloud Solutions Pvt Ltd",
          "vendorType": "IT Services",
          "email": "vendor@acmecloud.com",
          "phone": "+91-9876543210",
          "address": "402, Signature Towers, Sector 30, Gurugram, HR, India",
          "contactPerson": "Rohan Sharma",
          "status": "Verified Partner",
          "bankSecurityNode": true,
          "onboardingDate": "2026-01-10",
          "lastLogin": "2026-06-03",
          "onboardingComplete": false
        }
      ], null, 2)
    },
    {
      path: VENDOR_PORTAL_DOCUMENTS_PATH,
      defaultVal: JSON.stringify([
        {
          "documentId": "DOC-101",
          "vendorId": "VND-001",
          "documentName": "GST Certificate.pdf",
          "documentType": "Tax Registration",
          "uploadDate": "2026-01-12",
          "expiryDate": "2028-12-31",
          "status": "Verified",
          "fileId": "FILE-001"
        },
        {
          "documentId": "DOC-102",
          "vendorId": "VND-001",
          "documentName": "PAN Card Copy.pdf",
          "documentType": "Identity Proof",
          "uploadDate": "2026-01-12",
          "expiryDate": null,
          "status": "Verified",
          "fileId": "FILE-002"
        },
        {
          "documentId": "DOC-103",
          "vendorId": "VND-001",
          "documentName": "MSME Registration Certificate.pdf",
          "documentType": "MSME Proof",
          "uploadDate": "2026-01-15",
          "expiryDate": "2028-08-15",
          "status": "Verified",
          "fileId": "FILE-003"
        },
        {
          "documentId": "DOC-104",
          "vendorId": "VND-001",
          "documentName": "ISO 27001 InfoSec Certificate.pdf",
          "documentType": "Compliance",
          "uploadDate": "2025-05-10",
          "expiryDate": "2026-05-10",
          "status": "Expired",
          "fileId": "FILE-004"
        }
      ], null, 2)
    },
    {
      path: VENDOR_PORTAL_KYC_PATH,
      defaultVal: JSON.stringify([
        {
          "vendorId": "VND-001",
          "gstNumber": "29ABCDE1234F1Z5",
          "panNumber": "ABCDE1234F",
          "msmeNumber": "MSME123456",
          "status": "Verified"
        }
      ], null, 2)
    },
    {
      path: VENDOR_PORTAL_POS_PATH,
      defaultVal: JSON.stringify([
        {
          "poId": "PO-2026-981",
          "vendorId": "VND-001",
          "issueDate": "2026-05-18",
          "items": 4,
          "value": 1245000,
          "status": "Pending Acknowledgement"
        },
        {
          "poId": "PO-2026-880",
          "vendorId": "VND-001",
          "issueDate": "2026-05-04",
          "items": 1,
          "value": 450000,
          "status": "Acknowledged"
        },
        {
          "poId": "PO-2026-712",
          "vendorId": "VND-001",
          "issueDate": "2026-04-15",
          "items": 12,
          "value": 890000,
          "status": "Delivered"
        },
        {
          "poId": "PO-2026-550",
          "vendorId": "VND-001",
          "issueDate": "2026-03-01",
          "items": 20,
          "value": 2210000,
          "status": "Invoiced"
        }
      ], null, 2)
    },
    {
      path: VENDOR_PORTAL_INVOICES_PATH,
      defaultVal: JSON.stringify([
        {
          "invoiceId": "INV-77981",
          "vendorId": "VND-001",
          "poId": "PO-2026-550",
          "amount": 2210000,
          "submitDate": "2026-03-10",
          "verificationStage": "Paid",
          "paymentStatus": "Paid"
        },
        {
          "invoiceId": "INV-88192",
          "vendorId": "VND-001",
          "poId": "PO-2026-712",
          "amount": 890000,
          "submitDate": "2026-04-28",
          "verificationStage": "Approved For Payment",
          "paymentStatus": "Approved For Payment"
        },
        {
          "invoiceId": "INV-89104",
          "vendorId": "VND-001",
          "poId": "PO-2026-880",
          "amount": 450000,
          "submitDate": "2026-05-12",
          "verificationStage": "3-Way Match",
          "paymentStatus": "Pending"
        }
      ], null, 2)
    },
    {
      path: VENDOR_PORTAL_PAYMENTS_PATH,
      defaultVal: JSON.stringify([
        {
          "paymentId": "PAY-001",
          "invoiceId": "INV-77981",
          "amount": 2210000,
          "paymentDate": "2026-03-15",
          "status": "Paid"
        }
      ], null, 2)
    },
    {
      path: VENDOR_PORTAL_TICKETS_PATH,
      defaultVal: JSON.stringify([
        {
          "ticketId": "TKT-901",
          "vendorId": "VND-001",
          "category": "Finance & Tax",
          "subject": "TDS Deduction rate query on INV-77981",
          "description": "Please clarify the TDS rate deduction applied to the paid invoice INV-77981.",
          "status": "Resolved",
          "createdDate": "2026-04-12"
        },
        {
          "ticketId": "TKT-942",
          "vendorId": "VND-001",
          "category": "Technical Support",
          "subject": "API endpoint integration credentials",
          "description": "We need the API credentials to start the automated invoice data sync test.",
          "status": "Open",
          "createdDate": "2026-05-21"
        }
      ], null, 2)
    },
    {
      path: VENDOR_PORTAL_NOTIFICATIONS_PATH,
      defaultVal: JSON.stringify([
        {
          "notificationId": "NOT-001",
          "vendorId": "VND-001",
          "message": "Purchase Order PO-2026-981 requires acknowledgement.",
          "read": false,
          "createdDate": "2026-06-03"
        }
      ], null, 2)
    },
    {
      path: VENDOR_PORTAL_AUDIT_LOG_PATH,
      defaultVal: JSON.stringify([], null, 2)
    },
    {
      path: VENDOR_PORTAL_DASHBOARD_PATH,
      defaultVal: JSON.stringify({
        "vendorId": "VND-001",
        "pendingPOs": 1,
        "paidInvoices": 1,
        "expiredDocuments": 1,
        "activeTickets": 1
      }, null, 2)
    },
    {
      path: VENDOR_PORTAL_ESIGN_PATH,
      defaultVal: '[]'
    },
    {
      path: VENDOR_PORTAL_FILES_PATH,
      defaultVal: JSON.stringify([
        {
          "fileId": "FILE-001",
          "vendorId": "VND-001",
          "fileName": "GST_Certificate.pdf",
          "fileType": "application/pdf",
          "filePath": "/uploads/vendor/GST_Certificate.pdf",
          "uploadDate": "2026-01-12"
        },
        {
          "fileId": "FILE-002",
          "vendorId": "VND-001",
          "fileName": "PAN_Card.pdf",
          "fileType": "application/pdf",
          "filePath": "/uploads/vendor/PAN_Card.pdf",
          "uploadDate": "2026-01-12"
        },
        {
          "fileId": "FILE-003",
          "vendorId": "VND-001",
          "fileName": "MSME_Registration.pdf",
          "fileType": "application/pdf",
          "filePath": "/uploads/vendor/MSME_Registration.pdf",
          "uploadDate": "2026-01-15"
        },
        {
          "fileId": "FILE-004",
          "vendorId": "VND-001",
          "fileName": "ISO_27001_InfoSec.pdf",
          "fileType": "application/pdf",
          "filePath": "/uploads/vendor/ISO_27001_InfoSec.pdf",
          "uploadDate": "2025-05-10"
        }
      ], null, 2)
    }
  ];

  for (const item of initList) {
    try {
      await fs.access(item.path);
    } catch {
      await fs.writeFile(item.path, item.defaultVal, 'utf8');
    }
  }
}
ensureVendorDirs().catch(console.error);

// ==========================================
// PURCHASE ORDERS PATHS & DIRECTORIES SETUP
// ==========================================
const PO_DIR = path.join(__dirname, 'data', 'purchase-orders');
const PO_REQUISITIONS_PATH = path.join(PO_DIR, 'requisitions.json');
const PO_PURCHASE_ORDERS_PATH = path.join(PO_DIR, 'purchase-orders.json');
const PO_DASHBOARD_PATH = path.join(PO_DIR, 'po-dashboard.json');
const PO_APPROVALS_PATH = path.join(PO_DIR, 'po-approvals.json');
const PO_RFQ_VENDORS_PATH = path.join(PO_DIR, 'rfq-vendors.json');
const PO_BUDGET_TRACKER_PATH = path.join(PO_DIR, 'budget-tracker.json');
const PO_GOODS_RECEIPT_PATH = path.join(PO_DIR, 'goods-receipt.json');
const PO_THREE_WAY_MATCH_PATH = path.join(PO_DIR, 'three-way-match.json');
const PO_UPLOADED_FILES_PATH = path.join(PO_DIR, 'uploaded-files.json');
const PO_ACTIVITY_LOG_PATH = path.join(PO_DIR, 'po-activity-log.json');
const PO_AI_INSIGHTS_PATH = path.join(PO_DIR, 'po-ai-insights.json');
const PO_AUDIT_LOG_PATH = path.join(PO_DIR, 'po-audit-log.json');

const PO_UPLOADS_DIR = path.join(UPLOADS_DIR, 'purchase-orders');
const PO_SPEC_DIR = path.join(PO_UPLOADS_DIR, 'specifications');
const PO_RFQ_DOCS_DIR = path.join(PO_UPLOADS_DIR, 'rfq-documents');
const PO_VEND_QUOTES_DIR = path.join(PO_UPLOADS_DIR, 'vendor-quotes');
const PO_CONTRACTS_DIR = path.join(PO_UPLOADS_DIR, 'contracts');
const PO_INVOICES_DIR = path.join(PO_UPLOADS_DIR, 'invoices');
const PO_GRN_DIR = path.join(PO_UPLOADS_DIR, 'grn');
const PO_TEMP_DIR = path.join(PO_UPLOADS_DIR, 'temp');

async function ensurePODirs() {
  await fs.mkdir(PO_DIR, { recursive: true });
  await fs.mkdir(PO_UPLOADS_DIR, { recursive: true });
  await fs.mkdir(PO_SPEC_DIR, { recursive: true });
  await fs.mkdir(PO_RFQ_DOCS_DIR, { recursive: true });
  await fs.mkdir(PO_VEND_QUOTES_DIR, { recursive: true });
  await fs.mkdir(PO_CONTRACTS_DIR, { recursive: true });
  await fs.mkdir(PO_INVOICES_DIR, { recursive: true });
  await fs.mkdir(PO_GRN_DIR, { recursive: true });
  await fs.mkdir(PO_TEMP_DIR, { recursive: true });
}
ensurePODirs().catch(console.error);

// Contracts Multer storage
const contractStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const documentCategory = req.body.documentCategory || 'supporting-documents';
    let dest = CTR_SUPPORTING_DIR;
    if (documentCategory === 'Legal Agreement' || documentCategory === 'Contract Document') {
      dest = CTR_LEGAL_DIR;
    } else if (documentCategory === 'SLA Document' || documentCategory === 'SLA') {
      dest = CTR_SLA_DIR;
    } else if (documentCategory === 'Compliance' || documentCategory === 'Compliance Documents') {
      dest = CTR_COMPLIANCE_DIR;
    } else if (documentCategory === 'Template') {
      dest = CTR_TEMPLATES_DIR;
    } else if (documentCategory === 'Signed Contract') {
      dest = CTR_SIGNED_DIR;
    } else if (documentCategory === 'Temp') {
      dest = CTR_TEMP_DIR;
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'CTR_' + uniqueSuffix + ext);
  }
});
const contractUpload = multer({ storage: contractStorage });

// Helper to update contract dashboard stats
async function updateContractRenewals() {
  try {
    const contracts = await readJsonFile(CONTRACTS_PATH);
    let renewals = [];
    try {
      renewals = await readJsonFile(CONTRACT_RENEWALS_PATH);
      if (!Array.isArray(renewals)) renewals = [];
    } catch {
      renewals = [];
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    for (const c of contracts) {
      if (c.status !== 'Active') continue;
      if (!c.expiryDate) continue;
      const exp = new Date(c.expiryDate);
      exp.setHours(0,0,0,0);
      const diffTime = exp - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let renewalStatus = "Auto-Renew";
      if (diffDays < 0) {
        renewalStatus = "Expired";
      } else if (diffDays <= 30) {
        renewalStatus = "Pending";
      } else if (diffDays <= 90) {
        renewalStatus = "In Review";
      }

      const idx = renewals.findIndex(r => r.contractId === c.contractId);
      if (idx === -1) {
        renewals.push({
          renewalId: `REN-${Math.floor(100 + Math.random() * 900)}`,
          contractId: c.contractId,
          expiryDate: c.expiryDate,
          renewalStatus: renewalStatus,
          notificationSent: false
        });
      } else {
        renewals[idx].expiryDate = c.expiryDate;
        if (renewals[idx].renewalStatus !== 'Renewed') {
          renewals[idx].renewalStatus = renewalStatus;
        }
      }
    }
    await writeJsonFile(CONTRACT_RENEWALS_PATH, renewals);
  } catch (error) {
    console.error('Failed to update contract renewals:', error);
  }
}

async function updateContractDashboardMetrics() {
  try {
    const contracts = await readJsonFile(CONTRACTS_PATH);
    const approvals = await readJsonFile(CONTRACT_APPROVALS_PATH);

    const today = new Date();
    today.setHours(0,0,0,0);

    const totalActive = contracts.filter(c => c.status === 'Active').length;
    const expiringSoonCount = contracts.filter(c => {
      if (c.status !== 'Active') return false;
      if (!c.expiryDate) return false;
      const exp = new Date(c.expiryDate);
      exp.setHours(0,0,0,0);
      const diffTime = exp - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 90;
    }).length;

    const pendingLegalReviewsCount = approvals.filter(a => a.status === 'Pending Approval').length;
    const breaches = 0;

    // Calculate lifecycle counts
    const active = contracts.filter(c => c.status === 'Active').length;
    const draft = contracts.filter(c => c.status === 'Draft' || c.status === 'Clarification Required').length;
    const review = contracts.filter(c => c.status === 'Pending Approval' || c.status === 'In Review').length;
    const expired = contracts.filter(c => c.status === 'Expired').length;

    const lifecycleDistribution = [
      { name: 'Active', value: active, color: '#16A34A' },
      { name: 'Draft', value: draft, color: '#94A3B8' },
      { name: 'Under Review', value: review, color: '#F59E0B' },
      { name: 'Expired', value: expired, color: '#EF4444' }
    ];

    const categorySpends = {
      'IT Services': 0,
      'Facilities': 0,
      'Legal': 0,
      'Cloud': 0,
      'Consulting': 0
    };

    let totalRiskCount = 0;
    let sumLegal = 0;
    let sumCompliance = 0;
    let sumFinancial = 0;
    let highRiskCount = 0;
    let medRiskCount = 0;
    let lowRiskCount = 0;

    contracts.forEach(c => {
      const val = parseFloat(c.contractValue) || 0;
      const valInCr = val / 10000000;
      const dept = (c.department || '').toLowerCase();
      
      if (c.status === 'Active') {
        if (dept.includes('it') || dept.includes('service') || dept.includes('tech')) {
          categorySpends['IT Services'] = (categorySpends['IT Services'] || 0) + valInCr;
        } else if (dept.includes('facility') || dept.includes('ops') || dept.includes('operation') || dept.includes('office')) {
          categorySpends['Facilities'] = (categorySpends['Facilities'] || 0) + valInCr;
        } else if (dept.includes('legal') || dept.includes('compliance')) {
          categorySpends['Legal'] = (categorySpends['Legal'] || 0) + valInCr;
        } else if (dept.includes('cloud') || dept.includes('saas') || dept.includes('hosting')) {
          categorySpends['Cloud'] = (categorySpends['Cloud'] || 0) + valInCr;
        } else if (dept.includes('consult') || dept.includes('strategy') || dept.includes('advisory')) {
          categorySpends['Consulting'] = (categorySpends['Consulting'] || 0) + valInCr;
        } else {
          categorySpends['IT Services'] = (categorySpends['IT Services'] || 0) + valInCr;
        }

        const legal = parseInt(c.legalExposure) || 30;
        const comp = parseInt(c.complianceRisk) || 20;
        const fin = parseInt(c.financialRisk) || 30;
        
        sumLegal += legal;
        sumCompliance += comp;
        sumFinancial += fin;
        totalRiskCount++;

        const rLevel = (c.riskLevel || 'Low').toLowerCase();
        if (rLevel === 'high') highRiskCount++;
        else if (rLevel === 'low') lowRiskCount++;
        else medRiskCount++;
      }
    });

    const contractValueByCategory = Object.keys(categorySpends).map(cat => ({
      category: cat,
      spend: parseFloat(categorySpends[cat].toFixed(2))
    }));

    const avgLegal = totalRiskCount > 0 ? Math.round(sumLegal / totalRiskCount) : 30;
    const avgCompliance = totalRiskCount > 0 ? Math.round(sumCompliance / totalRiskCount) : 20;
    const avgFinancial = totalRiskCount > 0 ? Math.round(sumFinancial / totalRiskCount) : 30;
    
    let avgPortfolioRisk = "Low";
    if (avgFinancial > 70) avgPortfolioRisk = "High";
    else if (avgFinancial > 40) avgPortfolioRisk = "Medium";

    const vendorRiskAnalysis = [
      { name: "High Risk", value: highRiskCount },
      { name: "Medium Risk", value: medRiskCount },
      { name: "Low Risk", value: lowRiskCount }
    ];

    const updated = {
      totalActiveContracts: totalActive,
      expiringSoon: expiringSoonCount,
      pendingLegalReviews: pendingLegalReviewsCount,
      slaBreaches: breaches,
      lifecycleDistribution,
      contractValueByCategory,
      portfolioRisk: avgPortfolioRisk,
      legalExposure: avgLegal,
      complianceRisk: avgCompliance,
      financialRisk: avgFinancial,
      vendorRiskAnalysis
    };
    await writeJsonFile(CONTRACT_DASHBOARD_PATH, updated);
  } catch (err) {
    console.error('Error updating contract dashboard stats:', err.message);
  }
}


// 0. GET /api/contracts/vendors
app.get('/api/contracts/vendors', async (req, res) => {
  try {
    const vendors = await readJsonFile(VENDORS_PATH);
    const activeVendors = vendors
      .filter(v => v.status === 'Active')
      .map(v => ({
        vendorId: v.vendorId,
        vendorName: v.basicDetails?.legalName || v.vendorName || 'Unnamed Vendor',
        vendorRiskLevel: v.riskLevel || v.risk?.level || 'Low',
        vendorComplianceScore: v.vendorComplianceScore || 85
      }));
    res.json(activeVendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helpers for Contracts flat <-> nested mapping
function mapFlatToNested(flat) {
  if (!flat) return null;
  return {
    contractId: flat.contractId,
    contractName: flat.contractName,
    contractType: flat.contractType,
    department: flat.department,
    effectiveDate: flat.effectiveDate,
    expiryDate: flat.expiryDate,
    status: flat.status,
    riskLevel: flat.riskLevel,
    approvalStatus: flat.approvalStatus,
    renewalStatus: flat.renewalStatus,
    createdBy: flat.createdBy,
    createdDate: flat.createdDate,
    vendorName: flat.vendorName,
    contractValue: flat.contractValue,
    currency: flat.currency || 'INR',
    paymentTerms: flat.paymentTerms || 'Net 30',
    billingFrequency: flat.billingFrequency || 'Monthly',
    vendor: {
      vendorId: flat.vendorId,
      vendorName: flat.vendorName,
      vendorRiskLevel: flat.riskLevel || 'Low',
      vendorComplianceScore: flat.vendorComplianceScore || 90
    },
    commercialTerms: {
      contractValue: flat.contractValue,
      currency: flat.currency || 'INR',
      paymentTerms: flat.paymentTerms || 'Net 30',
      billingFrequency: flat.billingFrequency || 'Monthly'
    },
    slaAndLegal: {
      selectedClauses: flat.selectedClauses || [],
      slaMetrics: flat.slaMetrics || { uptime: '99.9%', responseTime: '4 Hours', resolutionTime: '12 Hours' },
      penaltyTerms: flat.penaltyTerms || { slaBreachPenalty: '5%', maxPenaltyCap: '10%' }
    },
    riskInsights: {
      portfolioRisk: flat.riskLevel || 'Low',
      legalExposure: flat.legalExposure || 30,
      complianceRisk: flat.complianceRisk || 20,
      financialRisk: flat.financialRisk || 30,
      aiAlerts: flat.aiAlerts || []
    },
    uploadedDocuments: flat.uploadedDocuments || []
  };
}

function mapNestedToFlat(nested) {
  if (!nested) return null;
  return {
    contractId: nested.contractId,
    contractName: nested.contractName,
    vendorId: nested.vendor?.vendorId || nested.vendorId || '',
    vendorName: nested.vendor?.vendorName || nested.vendorName || '',
    contractType: nested.contractType,
    department: nested.department,
    effectiveDate: nested.effectiveDate,
    expiryDate: nested.expiryDate,
    contractValue: nested.commercialTerms?.contractValue || nested.contractValue || 0,
    currency: nested.commercialTerms?.currency || nested.currency || 'INR',
    status: nested.status || 'Pending Approval',
    riskLevel: nested.riskLevel || nested.riskInsights?.portfolioRisk || 'Low',
    approvalStatus: nested.approvalStatus || 'Pending',
    renewalStatus: nested.renewalStatus || 'Auto-Renew',
    createdBy: nested.createdBy || 'Saurabh Anand',
    createdDate: nested.createdDate || new Date().toISOString().split('T')[0],
    
    // Auxiliary fields
    paymentTerms: nested.commercialTerms?.paymentTerms || nested.paymentTerms || 'Net 30',
    billingFrequency: nested.commercialTerms?.billingFrequency || nested.billingFrequency || 'Monthly',
    vendorComplianceScore: nested.vendor?.vendorComplianceScore || 90,
    selectedClauses: nested.slaAndLegal?.selectedClauses || [],
    slaMetrics: nested.slaAndLegal?.slaMetrics || null,
    penaltyTerms: nested.slaAndLegal?.penaltyTerms || null,
    legalExposure: nested.riskInsights?.legalExposure || 30,
    complianceRisk: nested.riskInsights?.complianceRisk || 20,
    financialRisk: nested.riskInsights?.financialRisk || 30,
    aiAlerts: nested.riskInsights?.aiAlerts || [],
    uploadedDocuments: nested.uploadedDocuments || []
  };
}

// 1. GET /api/contracts
app.get('/api/contracts', async (req, res) => {
  try {
    const rawContracts = await readJsonFile(CONTRACTS_PATH);
    const contracts = rawContracts.map(mapFlatToNested);
    const { status, risk, contractType, search } = req.query;
    let filtered = [...contracts];

    if (status && status !== 'All' && status !== 'Status: All') {
      filtered = filtered.filter(c => c.status.toLowerCase() === status.toLowerCase());
    }
    if (risk && risk !== 'All' && risk !== 'Risk Level: All') {
      filtered = filtered.filter(c => c.riskInsights?.portfolioRisk?.toLowerCase() === risk.toLowerCase());
    }
    if (contractType && contractType !== 'All' && contractType !== 'Contract Type: All') {
      filtered = filtered.filter(c => c.contractType.toLowerCase() === contractType.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(c => 
        c.contractId.toLowerCase().includes(q) ||
        c.vendor?.vendorName?.toLowerCase().includes(q) ||
        c.contractType.toLowerCase().includes(q) ||
        c.contractName.toLowerCase().includes(q) ||
        c.department?.toLowerCase().includes(q) ||
        c.riskInsights?.portfolioRisk?.toLowerCase().includes(q)
      );
    }
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /api/contracts/dashboard
app.get('/api/contracts/dashboard', async (req, res) => {
  try {
    await updateContractDashboardMetrics();
    const dashboard = await readJsonFile(CONTRACT_DASHBOARD_PATH);
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET /api/contracts/approvals
app.get('/api/contracts/approvals', async (req, res) => {
  try {
    const approvals = await readJsonFile(CONTRACT_APPROVALS_PATH);
    const contracts = await readJsonFile(CONTRACTS_PATH);
    
    const pendingApprovals = approvals
      .filter(a => a.status === 'Pending Approval')
      .map(a => {
        const c = contracts.find(contract => contract.contractId === a.contractId) || {};
        return {
          approvalId: a.approvalId,
          contractId: a.contractId,
          vendorName: c.vendorName || 'Unknown Vendor',
          contractType: c.contractType || 'N/A',
          contractValue: c.contractValue || 0,
          risk: c.riskLevel || 'Low',
          currentStage: c.status === 'Pending Approval' ? 'Procurement Review' : c.status || 'Review',
          assignedTo: a.checker || 'Saurabh Anand',
          status: a.status,
          remarks: a.remarks || '',
          history: [
            {
              action: "Submitted",
              by: a.submittedBy || "Procurement Manager",
              dateTime: c.createdDate || new Date().toISOString().split('T')[0]
            }
          ]
        };
      });
    res.json(pendingApprovals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. GET /api/contracts/renewals
app.get('/api/contracts/renewals', async (req, res) => {
  try {
    const renewals = await readJsonFile(CONTRACT_RENEWALS_PATH);
    const contracts = await readJsonFile(CONTRACTS_PATH);

    const mappedRenewals = renewals.map(r => {
      const c = contracts.find(contract => contract.contractId === r.contractId) || {};
      
      const today = new Date();
      today.setHours(0,0,0,0);
      const expDate = r.expiryDate ? new Date(r.expiryDate) : today;
      const diffTime = expDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        contractId: r.contractId,
        vendorName: c.vendorName || 'Unknown Vendor',
        contractType: c.contractType || 'N/A',
        expiryDate: r.expiryDate,
        owner: c.createdBy || 'Saurabh Anand',
        status: r.renewalStatus || 'Auto-Renew',
        daysRemaining: diffDays
      };
    });
    res.json(mappedRenewals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. GET /api/contracts/clauses
app.get('/api/contracts/clauses', async (req, res) => {
  try {
    const clauses = await readJsonFile(CLAUSE_LIBRARY_PATH);
    res.json(clauses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. GET /api/contracts/:id
app.get('/api/contracts/:id', async (req, res) => {
  try {
    const contracts = await readJsonFile(CONTRACTS_PATH);
    const contract = contracts.find(c => c.contractId === req.params.id);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    res.json(mapFlatToNested(contract));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const handleCreateContract = async (req, res) => {
  try {
    const nestedData = req.body;

    if (!nestedData.contractId) {
      const year = new Date().getFullYear();
      const rand = Math.floor(10000 + Math.random() * 90000);
      nestedData.contractId = `CTR-${year}-${String(rand).padStart(4, '0')}`;
    }

    const legalRisk = Math.floor(40 + Math.random() * 30);
    const complianceRisk = Math.floor(15 + Math.random() * 20);
    const financialRisk = Math.floor(50 + Math.random() * 30);
    const riskLevel = financialRisk > 70 ? "High" : financialRisk > 40 ? "Medium" : "Low";

    nestedData.status = "Pending Approval";
    nestedData.approvalStatus = "Pending";
    nestedData.renewalStatus = "Auto-Renew";
    nestedData.createdBy = nestedData.submittedBy || "Saurabh Anand";
    nestedData.createdDate = new Date().toISOString().split('T')[0];

    nestedData.riskInsights = {
      portfolioRisk: riskLevel,
      legalExposure: legalRisk,
      complianceRisk: complianceRisk,
      financialRisk: financialRisk,
      aiAlerts: [
        "Missing explicit data residency clause",
        "Penalty cap set to 5% instead of standard 10%"
      ]
    };

    const flatContract = mapNestedToFlat(nestedData);
    const contracts = await readJsonFile(CONTRACTS_PATH);
    contracts.push(flatContract);
    await writeJsonFile(CONTRACTS_PATH, contracts);

    // Save approvals in contract-approvals.json
    const approvalItem = {
      approvalId: `CAP-${Math.floor(1000 + Math.random() * 9000)}`,
      contractId: flatContract.contractId,
      status: "Pending Approval",
      submittedBy: "Procurement Manager",
      checker: "Saurabh Anand",
      remarks: "",
      approvalDate: null
    };

    const approvals = await readJsonFile(CONTRACT_APPROVALS_PATH);
    approvals.push(approvalItem);
    await writeJsonFile(CONTRACT_APPROVALS_PATH, approvals);

    // Recalculate and updates
    await updateContractRenewals();
    await updateContractDashboardMetrics();

    res.status(201).json({ success: true, contract: mapFlatToNested(flatContract) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
app.post('/api/contracts', handleCreateContract);
app.post('/api/contracts/create', handleCreateContract);

// 8. PUT /api/contracts/:id
app.put('/api/contracts/:id', async (req, res) => {
  try {
    const contracts = await readJsonFile(CONTRACTS_PATH);
    const idx = contracts.findIndex(c => c.contractId === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    const flatData = mapNestedToFlat(req.body);
    contracts[idx] = { ...contracts[idx], ...flatData };
    await writeJsonFile(CONTRACTS_PATH, contracts);

    await updateContractDashboardMetrics();
    res.json(mapFlatToNested(contracts[idx]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. DELETE /api/contracts/:id
app.delete('/api/contracts/:id', async (req, res) => {
  try {
    const contracts = await readJsonFile(CONTRACTS_PATH);
    const filtered = contracts.filter(c => c.contractId !== req.params.id);
    await writeJsonFile(CONTRACTS_PATH, filtered);

    const approvals = await readJsonFile(CONTRACT_APPROVALS_PATH);
    const filteredApprovals = approvals.filter(a => a.contractId !== req.params.id);
    await writeJsonFile(CONTRACT_APPROVALS_PATH, filteredApprovals);

    const renewals = await readJsonFile(CONTRACT_RENEWALS_PATH);
    const filteredRenewals = renewals.filter(r => r.contractId !== req.params.id);
    await writeJsonFile(CONTRACT_RENEWALS_PATH, filteredRenewals);

    await updateContractDashboardMetrics();
    res.json({ success: true, message: 'Contract deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10. POST /api/contracts/upload
app.post('/api/contracts/upload', contractUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const { linkedRecordId, documentCategory, uploadedBy } = req.body;
    const cleanPath = `/uploads/contracts/${req.file.filename}`;

    const fileMeta = {
      documentId: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      contractId: linkedRecordId || "",
      fileName: req.file.originalname,
      filePath: cleanPath,
      uploadedBy: uploadedBy || "Saurabh Anand",
      uploadedDate: new Date().toISOString().split('T')[0],
      fileSize: `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`
    };

    const docs = await readJsonFile(CONTRACT_UPLOADED_FILES_PATH);
    docs.push(fileMeta);
    await writeJsonFile(CONTRACT_UPLOADED_FILES_PATH, docs);

    res.json({ success: true, file: {
      fileId: fileMeta.documentId,
      fileName: fileMeta.fileName,
      filePath: fileMeta.filePath,
      uploadedBy: fileMeta.uploadedBy,
      uploadedOn: fileMeta.uploadedDate,
      fileSize: fileMeta.fileSize,
      fileType: req.file.mimetype
    }});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 11. GET /api/contracts/files/:contractId
app.get('/api/contracts/files/:contractId', async (req, res) => {
  try {
    const docs = await readJsonFile(CONTRACT_UPLOADED_FILES_PATH);
    const filtered = docs
      .filter(d => d.contractId === req.params.contractId)
      .map(d => ({
        fileId: d.documentId,
        fileName: d.fileName,
        filePath: d.filePath,
        uploadedBy: d.uploadedBy,
        uploadedOn: d.uploadedDate,
        fileSize: d.fileSize || '2.0 MB',
        fileType: 'application/pdf'
      }));
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 11b. POST /api/contracts/:id/renew
app.post('/api/contracts/:id/renew', async (req, res) => {
  try {
    const { id } = req.params;
    const { expiryDate } = req.body;

    if (!expiryDate) {
      return res.status(400).json({ success: false, message: 'Expiry date is required' });
    }

    const contracts = await readJsonFile(CONTRACTS_PATH);
    const cIndex = contracts.findIndex(c => c.contractId === id);
    if (cIndex === -1) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    contracts[cIndex].expiryDate = expiryDate;
    contracts[cIndex].status = "Active";
    await writeJsonFile(CONTRACTS_PATH, contracts);

    // Update renewals list
    const renewals = await readJsonFile(CONTRACT_RENEWALS_PATH);
    const rIndex = renewals.findIndex(r => r.contractId === id);
    if (rIndex !== -1) {
      renewals[rIndex].expiryDate = expiryDate;
      renewals[rIndex].renewalStatus = "Renewed";
      await writeJsonFile(CONTRACT_RENEWALS_PATH, renewals);
    }

    await updateContractRenewals();
    await updateContractDashboardMetrics();

    res.json({ success: true, message: "Contract renewed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 12. POST /api/contracts/approve
app.post('/api/contracts/approve', async (req, res) => {
  try {
    const { contractId, remarks, performedBy } = req.body;
    const userName = performedBy || 'Saurabh Anand';

    const contracts = await readJsonFile(CONTRACTS_PATH);
    const cIndex = contracts.findIndex(c => c.contractId === contractId);
    if (cIndex === -1) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Set contract status to Active
    contracts[cIndex].status = "Active";
    contracts[cIndex].approvalStatus = "Approved";
    await writeJsonFile(CONTRACTS_PATH, contracts);

    // Update approval queue item to Approved
    const approvals = await readJsonFile(CONTRACT_APPROVALS_PATH);
    const appIndex = approvals.findIndex(a => a.contractId === contractId && a.status === 'Pending Approval');
    if (appIndex !== -1) {
      approvals[appIndex].status = "Approved";
      approvals[appIndex].remarks = remarks || "";
      approvals[appIndex].approvalDate = new Date().toISOString().split('T')[0];
      await writeJsonFile(CONTRACT_APPROVALS_PATH, approvals);
    }

    // Sync renewals and metrics
    await updateContractRenewals();
    await updateContractDashboardMetrics();

    res.json({ success: true, contract: mapFlatToNested(contracts[cIndex]) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 13. POST /api/contracts/reject
app.post('/api/contracts/reject', async (req, res) => {
  try {
    const { contractId, remarks, performedBy, actionType } = req.body;
    const userName = performedBy || 'Saurabh Anand';
    const mode = actionType || 'Reject';

    const contracts = await readJsonFile(CONTRACTS_PATH);
    const cIndex = contracts.findIndex(c => c.contractId === contractId);
    if (cIndex === -1) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    let targetStatus = "Rejected";
    if (mode === 'Send Back') {
      targetStatus = "Clarification Required";
    }

    // Update contract status
    contracts[cIndex].status = targetStatus;
    contracts[cIndex].approvalStatus = targetStatus;
    await writeJsonFile(CONTRACTS_PATH, contracts);

    // Update approval queue item
    const approvals = await readJsonFile(CONTRACT_APPROVALS_PATH);
    const appIndex = approvals.findIndex(a => a.contractId === contractId && a.status === 'Pending Approval');
    if (appIndex !== -1) {
      approvals[appIndex].status = targetStatus;
      approvals[appIndex].remarks = remarks || "";
      approvals[appIndex].approvalDate = new Date().toISOString().split('T')[0];
      await writeJsonFile(CONTRACT_APPROVALS_PATH, approvals);
    }

    // Sync renewals and metrics
    await updateContractRenewals();
    await updateContractDashboardMetrics();

    res.json({ success: true, contract: mapFlatToNested(contracts[cIndex]) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// VENDOR PORTAL APIs
// ==========================================

const vendorStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(VENDOR_UPLOADS_DIR, { recursive: true });
      cb(null, VENDOR_UPLOADS_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'VND_' + uniqueSuffix + ext);
  }
});
const vendorUpload = multer({ storage: vendorStorage });

async function updateVendorDashboardMetrics() {
  try {
    const documents = await readJsonFile(VENDOR_PORTAL_DOCUMENTS_PATH);
    const pos = await readJsonFile(VENDOR_PORTAL_POS_PATH);
    const invoices = await readJsonFile(VENDOR_PORTAL_INVOICES_PATH);
    const tickets = await readJsonFile(VENDOR_PORTAL_TICKETS_PATH);

    const pendingPOs = pos.filter(po => po.status === 'Pending Acknowledgement' || po.status === 'Pending Acknowledgment').length;
    
    const todayStr = new Date().toISOString().split('T')[0];
    let expiredDocs = 0;
    for (const doc of documents) {
      if (doc.expiryDate && doc.expiryDate !== 'N/A' && doc.expiryDate !== 'null') {
        const exp = new Date(doc.expiryDate);
        const today = new Date(todayStr);
        if (exp <= today) {
          doc.status = 'Expired';
          expiredDocs++;
        } else {
          if (doc.status === 'Expired') {
            doc.status = 'Verified';
          }
        }
      }
    }
    await writeJsonFile(VENDOR_PORTAL_DOCUMENTS_PATH, documents);

    const paidInvoices = invoices.filter(inv => inv.paymentStatus === 'Paid' || inv.verificationStage === 'Paid').length;
    const activeTickets = tickets.filter(t => t.status !== 'Resolved').length;

    const cache = {
      vendorId: "VND-001",
      pendingPOs,
      paidInvoices,
      expiredDocuments: expiredDocs,
      activeTickets
    };

    await writeJsonFile(VENDOR_PORTAL_DASHBOARD_PATH, cache);
  } catch (err) {
    console.error('Failed to update vendor dashboard metrics:', err);
  }
}

async function addVendorAuditTrail(action, referenceId, performedBy = "Vendor User") {
  try {
    const log = {
      auditId: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorId: "VND-001",
      action,
      referenceId: referenceId || "",
      performedBy,
      timestamp: new Date().toISOString()
    };
    await appendJsonData(VENDOR_PORTAL_AUDIT_LOG_PATH, log);
  } catch (err) {
    console.error('Failed to add vendor audit trail:', err);
  }
}

async function addVendorNotification(message) {
  try {
    const notif = {
      notificationId: `NOT-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorId: "VND-001",
      message,
      read: false,
      createdDate: new Date().toISOString().split('T')[0]
    };
    await appendJsonData(VENDOR_PORTAL_NOTIFICATIONS_PATH, notif);
  } catch (err) {
    console.error('Failed to create vendor notification:', err);
  }
}

// 1. GET /api/vendor-portal/dashboard
app.get('/api/vendor-portal/dashboard', async (req, res) => {
  try {
    await updateVendorDashboardMetrics();
    const cache = await readJsonFile(VENDOR_PORTAL_DASHBOARD_PATH);
    res.json(cache);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /api/vendor-portal/notifications
app.get('/api/vendor-portal/notifications', async (req, res) => {
  try {
    const list = await readJsonFile(VENDOR_PORTAL_NOTIFICATIONS_PATH);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vendor-portal/notifications/read-all', async (req, res) => {
  try {
    const list = await readJsonFile(VENDOR_PORTAL_NOTIFICATIONS_PATH);
    list.forEach(n => n.read = true);
    await writeJsonFile(VENDOR_PORTAL_NOTIFICATIONS_PATH, list);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vendor-portal/onboarding/complete', async (req, res) => {
  try {
    const profiles = await readJsonFile(VENDOR_PORTAL_PROFILE_PATH);
    const idx = profiles.findIndex(p => p.vendorId === 'VND-001');
    if (idx !== -1) {
      profiles[idx].onboardingComplete = true;
      await writeJsonFile(VENDOR_PORTAL_PROFILE_PATH, profiles);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET /api/vendor-portal/profile
app.get('/api/vendor-portal/profile', async (req, res) => {
  try {
    const list = await readJsonFile(VENDOR_PORTAL_VENDORS_PATH);
    const profile = list.find(v => v.vendorId === 'VND-001') || list[0];
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/vendor-portal/profile', async (req, res) => {
  try {
    const list = await readJsonFile(VENDOR_PORTAL_VENDORS_PATH);
    const idx = list.findIndex(v => v.vendorId === 'VND-001');
    if (idx === -1) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }
    list[idx] = {
      ...list[idx],
      vendorName: req.body.vendorName || list[idx].vendorName,
      email: req.body.email || list[idx].email,
      phone: req.body.phone || list[idx].phone,
      address: req.body.address || list[idx].address,
      contactPerson: req.body.contactPerson || list[idx].contactPerson,
      lastModified: new Date().toLocaleString()
    };
    await writeJsonFile(VENDOR_PORTAL_VENDORS_PATH, list);
    await addVendorAuditTrail("Profile Update", "VND-001", "Vendor User");
    await addVendorNotification("Profile contact information updated successfully.");
    res.json(list[idx]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. GET /api/vendor-portal/kyc
app.get('/api/vendor-portal/kyc', async (req, res) => {
  try {
    const list = await readJsonFile(VENDOR_PORTAL_KYC_PATH);
    const kyc = list.find(v => v.vendorId === 'VND-001') || list[0];
    res.json(kyc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/vendor-portal/kyc', async (req, res) => {
  try {
    const list = await readJsonFile(VENDOR_PORTAL_KYC_PATH);
    const idx = list.findIndex(v => v.vendorId === 'VND-001');
    if (idx === -1) {
      return res.status(404).json({ message: 'Vendor KYC not found' });
    }
    const now = new Date().toISOString();
    list[idx] = {
      ...list[idx],
      gstNumber: req.body.gstNumber || list[idx].gstNumber,
      panNumber: req.body.panNumber || list[idx].panNumber,
      msmeNumber: req.body.msmeNumber || list[idx].msmeNumber,
      status: "Pending Review",
      submittedAt: now,
      rejectionRemarks: null
    };
    await writeJsonFile(VENDOR_PORTAL_KYC_PATH, list);

    // Create a KYC approval request in the admin KYC approvals queue
    const kycApprovalData = await readJsonFile(KYC_APPROVALS_PATH);
    const requestId = `KYC-APR-${Date.now()}`;
    const today = now.split('T')[0];
    const slaDue = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const newRequest = {
      requestId,
      vendorId: "VND-001",
      vendorName: "ABC Infotech Pvt. Ltd.",
      vendorKycId: list[idx].vendorId,
      category: "KYC Verification",
      riskLevel: "Low",
      submittedDate: today,
      currentStage: "Compliance",
      overallStatus: "Pending",
      pendingWith: "Compliance Team",
      slaDueDate: slaDue,
      kycData: {
        gstNumber: list[idx].gstNumber,
        panNumber: list[idx].panNumber,
        msmeNumber: list[idx].msmeNumber
      },
      workflow: {
        requester: { status: "Approved", approver: "Vendor Self", actionDate: today },
        procurement: { status: "Pending" },
        compliance: { status: "Pending" },
        legal: { status: "Pending" },
        finalApproval: { status: "Pending" }
      },
      comments: [],
      approvalHistory: [{ stage: "Requester", action: "Submitted", performedBy: "Vendor Self", actionDate: today, comments: "KYC details submitted by vendor." }],
      evidenceFiles: [],
      auditHistory: [{ action: "KYC Submitted", performedBy: "Vendor Self", actionDate: today, remarks: "GST, PAN and MSME numbers submitted for admin review." }]
    };
    kycApprovalData.approvalRequests = kycApprovalData.approvalRequests || [];
    // Remove any previous pending KYC requests from the same vendor to avoid duplicates
    kycApprovalData.approvalRequests = kycApprovalData.approvalRequests.filter(
      r => !(r.vendorId === 'VND-001' && r.category === 'KYC Verification' && r.overallStatus === 'Pending')
    );
    kycApprovalData.approvalRequests.push(newRequest);
    await writeJsonFile(KYC_APPROVALS_PATH, kycApprovalData);

    // Notify admin
    await appendJsonData(ADMIN_NOTIFICATIONS_PATH, {
      id: `ANOTIF-KYC-${Date.now()}`,
      type: 'kyc_review',
      title: 'KYC Review Required',
      message: 'Vendor ABC Infotech Pvt. Ltd. has submitted KYC details (GST/PAN/MSME) for compliance review.',
      link: '/kyc/approvals',
      vendorId: 'VND-001',
      timestamp: now,
      read: false
    });

    await addVendorAuditTrail("KYC Submitted for Review", "VND-001", "Vendor User");
    await addVendorNotification("Your KYC details have been submitted and are pending admin review.");
    res.json(list[idx]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. GET /api/vendor-portal/documents
app.get('/api/vendor-portal/documents', async (req, res) => {
  try {
    await updateVendorDashboardMetrics();
    const list = await readJsonFile(VENDOR_PORTAL_DOCUMENTS_PATH);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vendor-portal/documents/upload', vendorUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const { documentType, documentName, expiryDate, documentId } = req.body;
    const cleanPath = '/uploads/vendor/' + req.file.filename;

    const fileId = `FILE-${Math.floor(1000 + Math.random() * 9000)}`;
    const fileMeta = {
      fileId,
      vendorId: "VND-001",
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      filePath: cleanPath,
      uploadDate: new Date().toISOString().split('T')[0]
    };
    await appendJsonData(VENDOR_PORTAL_FILES_PATH, fileMeta);

    const documents = await readJsonFile(VENDOR_PORTAL_DOCUMENTS_PATH);
    
    let docEntry;
    if (documentId) {
      const idx = documents.findIndex(d => d.documentId === documentId);
      if (idx !== -1) {
        const old = documents[idx];
        const prevVersions = old.versions || [];
        if (old.fileId) {
          prevVersions.push({ fileId: old.fileId, uploadDate: old.uploadDate, uploadedBy: 'Vendor User' });
        }
        documents[idx] = {
          ...old,
          documentName: documentName || req.file.originalname,
          uploadDate: new Date().toISOString().split('T')[0],
          expiryDate: expiryDate && expiryDate !== 'null' && expiryDate !== 'undefined' ? expiryDate : null,
          status: "Verified",
          fileId,
          filePath: cleanPath,
          versions: prevVersions,
        };
        docEntry = documents[idx];
      }
    }

    if (!docEntry) {
      const newDocId = `DOC-${Math.floor(100 + Math.random() * 900)}`;
      docEntry = {
        documentId: newDocId,
        vendorId: "VND-001",
        documentName: documentName || req.file.originalname,
        documentType: documentType || "Compliance",
        uploadDate: new Date().toISOString().split('T')[0],
        expiryDate: expiryDate && expiryDate !== 'null' && expiryDate !== 'undefined' ? expiryDate : null,
        status: "Verified",
        fileId,
        filePath: cleanPath
      };
      documents.push(docEntry);
    }

    await writeJsonFile(VENDOR_PORTAL_DOCUMENTS_PATH, documents);
    await addVendorAuditTrail("Document Upload", docEntry.documentId, "Vendor User");
    await addVendorNotification(`Document ${docEntry.documentName} uploaded successfully.`);
    await updateVendorDashboardMetrics();

    res.json({ success: true, document: docEntry });
  } catch (error) {
    console.error('[vendor-upload] ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5b. DELETE /api/vendor-portal/documents/:documentId
app.delete('/api/vendor-portal/documents/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const documents = await readJsonFile(VENDOR_PORTAL_DOCUMENTS_PATH);
    const idx = documents.findIndex(d => d.documentId === documentId);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Document not found' });
    documents.splice(idx, 1);
    await writeJsonFile(VENDOR_PORTAL_DOCUMENTS_PATH, documents);
    await addVendorAuditTrail("Document Deleted", documentId, "Vendor User");
    await updateVendorDashboardMetrics();
    res.json({ success: true });
  } catch (error) {
    console.error('[vendor-delete] ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. GET /api/vendor-portal/pos
// Helper: map admin PO status → vendor portal PO status
function mapAdminPOStatus(adminPO) {
  if (adminPO.status === 'Closed') return 'Invoiced';
  if (adminPO.deliveryStatus === 'Received') return 'Acknowledged';
  if (['Approved', 'Sent'].includes(adminPO.status)) return 'Pending Acknowledgement';
  return null; // Draft / Pending Approval — not visible to vendor yet
}

// Helper: sync admin POs for ABC Infotech into vendor portal POs file
async function syncAdminPOsToVendorPortal() {
  const adminPOs = await readJsonFile(PO_PURCHASE_ORDERS_PATH);
  const vendorPOs = await readJsonFile(VENDOR_PORTAL_POS_PATH);
  const existingIds = new Set(vendorPOs.map(p => p.poId));

  const newFromAdmin = adminPOs
    .filter(p => p.vendorName && p.vendorName.toLowerCase().includes('abc infotech'))
    .filter(p => !existingIds.has(p.poId))
    .map(p => {
      const vendorStatus = mapAdminPOStatus(p);
      if (!vendorStatus) return null;
      return {
        poId: p.poId,
        vendorId: 'VND-001',
        issueDate: p.createdDate,
        deliveryDate: p.deliveryDate,
        items: 1,
        value: p.poValue,
        status: vendorStatus,
        category: p.category,
        description: `${p.category} — Ref: ${p.linkedRequisitionId || p.poId}`,
        issuedBy: 'Axis Max Life Insurance — Procurement',
        paymentTerms: p.paymentTerms || 'Net 30',
        adminSynced: true
      };
    })
    .filter(Boolean);

  if (newFromAdmin.length > 0) {
    const updated = [...vendorPOs, ...newFromAdmin];
    await writeJsonFile(VENDOR_PORTAL_POS_PATH, updated);
  }
}

app.get('/api/vendor-portal/pos', async (req, res) => {
  try {
    // Sync admin POs into vendor portal before returning
    await syncAdminPOsToVendorPortal();
    const list = await readJsonFile(VENDOR_PORTAL_POS_PATH);
    // Sort newest first
    list.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vendor-portal/pos/:poId/acknowledge', async (req, res) => {
  try {
    const { poId } = req.params;

    // Update vendor portal store
    const list = await readJsonFile(VENDOR_PORTAL_POS_PATH);
    const idx = list.findIndex(po => po.poId === poId);
    if (idx === -1) {
      return res.status(404).json({ message: 'PO not found' });
    }
    list[idx].status = 'Acknowledged';
    list[idx].acknowledgedAt = new Date().toISOString();
    await writeJsonFile(VENDOR_PORTAL_POS_PATH, list);

    // Write back to admin PO store if it exists there
    try {
      const adminPOs = await readJsonFile(PO_PURCHASE_ORDERS_PATH);
      const adminIdx = adminPOs.findIndex(p => p.poId === poId);
      if (adminIdx !== -1) {
        adminPOs[adminIdx].vendorAcknowledged = true;
        adminPOs[adminIdx].vendorAcknowledgedAt = new Date().toISOString();
        if (adminPOs[adminIdx].deliveryStatus === 'Pending') {
          adminPOs[adminIdx].deliveryStatus = 'Acknowledged';
        }
        await writeJsonFile(PO_PURCHASE_ORDERS_PATH, adminPOs);
      }
    } catch (_) { /* admin store update is best-effort */ }

    await addVendorAuditTrail("PO Acknowledgement", poId, "Vendor User");
    await addVendorNotification(`Purchase Order ${poId} acknowledged successfully.`);
    await updateVendorDashboardMetrics();

    res.json({ success: true, po: list[idx] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper: map admin invoice stage → vendor portal stage
function mapAdminInvoiceStage(adminInv) {
  const stage = (adminInv.stage || '').toLowerCase();
  const status = (adminInv.status || '').toLowerCase();
  if (status === 'paid' || stage === 'paid') return { verificationStage: 'Paid', paymentStatus: 'Paid' };
  if (status === 'rejected' || stage === 'rejected') return { verificationStage: 'Rejected', paymentStatus: 'Rejected' };
  if (stage === 'payment processing') return { verificationStage: 'Payment Processing', paymentStatus: 'Processing' };
  if (status === 'approved') return { verificationStage: 'Finance Approval', paymentStatus: 'Approved' };
  if (stage === '3-way match' || status === 'pending match') return { verificationStage: '3-Way Match', paymentStatus: 'Pending' };
  return { verificationStage: 'Under Review', paymentStatus: 'Pending' };
}

// 7. GET /api/vendor-portal/invoices
app.get('/api/vendor-portal/invoices', async (req, res) => {
  try {
    const vendorInvoices = await readJsonFile(VENDOR_PORTAL_INVOICES_PATH);
    const existingIds = new Set(vendorInvoices.map(i => i.invoiceId));

    // Merge admin invoices for ABC Infotech
    const adminInvoices = await readJsonFile(ADMIN_INVOICES_PATH);
    const abcInvoices = adminInvoices
      .filter(i => (i.vendorId === 'VND-2025-00029' || (i.vendorName && i.vendorName.toLowerCase().includes('abc infotech'))) && !existingIds.has(i.invoiceId))
      .map(i => {
        const { verificationStage, paymentStatus } = mapAdminInvoiceStage(i);
        return {
          invoiceId: i.invoiceId,
          vendorId: 'VND-001',
          poId: i.poRef,
          amount: i.amount,
          gstAmount: i.gstAmount,
          totalAmount: i.totalAmount,
          tdsSection: i.tdsSection,
          tdsRate: i.tdsRate,
          tdsAmount: i.tdsAmount,
          netPayable: i.netPayable,
          submitDate: i.invoiceDate,
          dueDate: i.dueDate,
          verificationStage,
          paymentStatus,
          remarks: i.remarks || '',
          adminSynced: true
        };
      });

    const merged = [...vendorInvoices, ...abcInvoices]
      .sort((a, b) => new Date(b.submitDate) - new Date(a.submitDate));
    res.json(merged);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vendor-portal/invoices', async (req, res) => {
  try {
    const { invoiceNo, poId, amount, gstAmount, tdsSection, tdsRate } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const parsedAmount = parseFloat(amount) || 0;
    const parsedGst = parseFloat(gstAmount) || 0;
    const parsedTdsRate = parseFloat(tdsRate) || 0;
    const tdsAmount = Math.round(parsedAmount * parsedTdsRate / 100);
    const netPayable = Math.round(parsedAmount + parsedGst - tdsAmount);

    // Update PO status to Invoiced
    const pos = await readJsonFile(VENDOR_PORTAL_POS_PATH);
    const poIdx = pos.findIndex(p => p.poId === poId);
    if (poIdx !== -1) {
      pos[poIdx].status = 'Invoiced';
      await writeJsonFile(VENDOR_PORTAL_POS_PATH, pos);
    }

    // Get PO details for description
    const poDetails = poIdx !== -1 ? pos[poIdx] : null;

    const invoiceId = `INV-${invoiceNo}`;
    const newInvoice = {
      invoiceId,
      vendorId: 'VND-001',
      poId,
      amount: parsedAmount,
      gstAmount: parsedGst,
      totalAmount: parsedAmount + parsedGst,
      tdsSection: tdsSection || '194J',
      tdsRate: parsedTdsRate,
      tdsAmount,
      netPayable,
      submitDate: today,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      verificationStage: 'Submitted',
      paymentStatus: 'Pending',
      remarks: ''
    };
    await appendJsonData(VENDOR_PORTAL_INVOICES_PATH, newInvoice);

    // Push to admin invoices.json so finance team can review
    const adminInvoices = await readJsonFile(ADMIN_INVOICES_PATH);
    adminInvoices.unshift({
      invoiceId,
      vendorId: 'VND-2025-00029',
      vendorName: 'ABC Infotech Private Limited',
      vendorGSTIN: '27AAACA1234A1Z5',
      poRef: poId,
      invoiceDate: today,
      dueDate: newInvoice.dueDate,
      amount: parsedAmount,
      gstAmount: parsedGst,
      totalAmount: parsedAmount + parsedGst,
      tdsSection: tdsSection || '194J',
      tdsRate: parsedTdsRate,
      tdsAmount,
      netPayable,
      status: 'Approved',
      stage: 'Finance Approval',
      riskScore: 10,
      riskLevel: 'Low',
      vendorType: 'MSME',
      threeWayMatch: 'Matched',
      gstMatch: 'Matched',
      uploadedBy: 'Vendor Portal',
      approvedBy: null,
      approvedDate: null,
      remarks: `Submitted by vendor against ${poId}. ${poDetails ? `Category: ${poDetails.category}.` : ''}`
    });
    await writeJsonFile(ADMIN_INVOICES_PATH, adminInvoices);

    // Notify admin
    await appendJsonData(ADMIN_NOTIFICATIONS_PATH, {
      id: `ANOTIF-INV-${Date.now()}`,
      type: 'vendor_onboarding',
      title: 'New Invoice Submitted',
      message: `ABC Infotech has submitted invoice ${invoiceId} for ₹${parsedAmount.toLocaleString('en-IN')} against ${poId}. Pending finance review.`,
      link: '/invoices/approvals',
      vendorId: 'VND-001',
      timestamp: new Date().toISOString(),
      read: false
    });

    await addVendorAuditTrail('Invoice Submission', invoiceId, 'Vendor User');
    await addVendorNotification(`Invoice ${invoiceId} submitted successfully. Awaiting finance team review.`);
    await updateVendorDashboardMetrics();

    res.json({ success: true, invoice: newInvoice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/vendor-portal/payments', async (req, res) => {
  try {
    const vendorPayments = await readJsonFile(VENDOR_PORTAL_PAYMENTS_PATH);
    const existingIds = new Set(vendorPayments.map(p => p.paymentId));

    // Merge admin payments for ABC Infotech
    const adminPayments = await readJsonFile(ADMIN_PAYMENTS_PATH);
    const abcPayments = adminPayments
      .filter(p => (p.vendorId === 'VND-2025-00029' || (p.vendorName && p.vendorName.toLowerCase().includes('abc infotech'))) && !existingIds.has(p.paymentId))
      .map(p => ({
        paymentId: p.paymentId,
        invoiceId: p.invoiceId,
        amount: p.amount,
        mode: p.mode,
        utrRef: p.utrRef,
        bankAccount: p.bankAccount,
        scheduledDate: p.scheduledDate,
        paymentDate: p.processedDate || p.scheduledDate,
        status: p.status === 'Completed' ? 'Completed' : p.status,
        tdsDeducted: p.tdsDeducted || 0,
        remarks: p.remarks || '',
        adminSynced: true
      }));

    const merged = [...vendorPayments, ...abcPayments]
      .sort((a, b) => new Date(b.paymentDate || b.scheduledDate) - new Date(a.paymentDate || a.scheduledDate));
    res.json(merged);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. GET /api/vendor-portal/contracts
app.get('/api/vendor-portal/contracts', async (req, res) => {
  try {
    const contracts = await readJsonFile(CONTRACTS_PATH);
    const filtered = contracts.filter(c => 
      c.vendor?.vendorId === 'VND-001' || 
      c.vendor?.vendorId === 'VND-2025-00029' ||
      (c.vendorName || '').toLowerCase().includes('acme') ||
      (c.vendor?.vendorName || '').toLowerCase().includes('acme') ||
      (c.vendorName || '').toLowerCase().includes('global') ||
      (c.vendor?.vendorName || '').toLowerCase().includes('global')
    );
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8b. E-SIGN — initiate
app.post('/api/vendor-portal/contracts/:contractId/esign/initiate', async (req, res) => {
  try {
    const { contractId } = req.params;
    const { signerName, signerEmail, signerPhone, otpMethod } = req.body;

    // Check no active request already exists
    const existing = await readJsonFile(VENDOR_PORTAL_ESIGN_PATH);
    const active = existing.find(r => r.contractId === contractId && ['Initiated', 'Sent'].includes(r.status));
    if (active) return res.status(409).json({ success: false, message: 'A signing request is already in progress for this contract.' });

    // Mock SignDesk API call — in production replace with:
    //   const sdRes = await axios.post('https://api.signdesk.in/api/live/esign/initiateEsignDocument', { ... }, { headers: { 'x-parse-application-id': SIGNDESK_APP_ID } })
    const signDeskRequestId = `SD-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const signingUrl = `https://esign.signdesk.in/sign/${signDeskRequestId}`;  // mock URL

    const request = {
      requestId: `ESIGN-${Math.floor(1000 + Math.random() * 9000)}`,
      contractId,
      vendorId: 'VND-001',
      signerName,
      signerEmail,
      signerPhone,
      otpMethod,          // 'aadhaar' | 'email'
      status: 'Sent',
      initiatedAt: new Date().toISOString(),
      completedAt: null,
      signDeskRequestId,
      signingUrl,
      signedDocUrl: null,
    };

    existing.push(request);
    await writeJsonFile(VENDOR_PORTAL_ESIGN_PATH, existing);
    await addVendorAuditTrail('E-Sign Initiated', contractId, signerName);
    await addVendorNotification(`E-signature request sent for contract ${contractId}. Please check your ${otpMethod === 'aadhaar' ? 'Aadhaar-linked mobile' : 'email'} for the OTP.`);

    res.json({ success: true, request });
  } catch (error) {
    console.error('[esign-initiate] ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

// 8c. E-SIGN — get status for a contract
app.get('/api/vendor-portal/contracts/:contractId/esign/status', async (req, res) => {
  try {
    const { contractId } = req.params;
    const all = await readJsonFile(VENDOR_PORTAL_ESIGN_PATH);
    // Return the latest request for this contract
    const sorted = all.filter(r => r.contractId === contractId).sort((a, b) => new Date(b.initiatedAt) - new Date(a.initiatedAt));
    res.json(sorted[0] ?? null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8d. E-SIGN — simulate completion (dev/demo only — mimics SignDesk webhook)
app.post('/api/vendor-portal/contracts/:contractId/esign/simulate-complete', async (req, res) => {
  try {
    const { contractId } = req.params;
    const all = await readJsonFile(VENDOR_PORTAL_ESIGN_PATH);
    const idx = all.findIndex(r => r.contractId === contractId && r.status === 'Sent');
    if (idx === -1) return res.status(404).json({ success: false, message: 'No active signing request found.' });

    all[idx].status = 'Signed';
    all[idx].completedAt = new Date().toISOString();
    all[idx].signedDocUrl = `/uploads/vendor/signed_${contractId}.pdf`;  // mock path

    await writeJsonFile(VENDOR_PORTAL_ESIGN_PATH, all);
    await addVendorAuditTrail('E-Sign Completed', contractId, all[idx].signerName);
    await addVendorNotification(`Contract ${contractId} has been successfully e-signed via SignDesk.`);

    res.json({ success: true, request: all[idx] });
  } catch (error) {
    console.error('[esign-simulate] ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

// 9. GET /api/vendor-portal/tickets
app.get('/api/vendor-portal/tickets', async (req, res) => {
  try {
    const list = await readJsonFile(VENDOR_PORTAL_TICKETS_PATH);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vendor-portal/tickets', async (req, res) => {
  try {
    const { category, subject, description } = req.body;
    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket = {
      ticketId,
      vendorId: "VND-001",
      category,
      subject,
      description,
      status: "Open",
      createdDate: new Date().toISOString().split('T')[0]
    };

    await appendJsonData(VENDOR_PORTAL_TICKETS_PATH, newTicket);
    await addVendorAuditTrail("Ticket Creation", ticketId, "Vendor User");
    await addVendorNotification(`Support ticket ${ticketId} raised successfully.`);
    await updateVendorDashboardMetrics();

    res.json({ success: true, ticket: newTicket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// PURCHASE ORDERS MODULE APIs
// ==========================================

// Dashboard metrics helper
async function updatePODashboardMetrics() {
  try {
    const pos = await readJsonFile(PO_PURCHASE_ORDERS_PATH);
    const reqs = await readJsonFile(PO_REQUISITIONS_PATH);
    const approvals = await readJsonFile(PO_APPROVALS_PATH);
    const grns = await readJsonFile(PO_GOODS_RECEIPT_PATH);
    const matches = await readJsonFile(PO_THREE_WAY_MATCH_PATH);

    // Sum PO values
    const totalValue = pos.reduce((sum, po) => sum + (po.poValue || 0), 0);
    // Value in Crores
    const valueCr = (totalValue / 10000000).toFixed(2);

    const pendingApprovalsCount = approvals.filter(a => a.status === 'Pending').length;
    const posInProgress = pos.filter(po => ['Approved', 'Sent', 'Partially Received'].includes(po.status)).length;
    const goodsReceived = pos.filter(po => po.deliveryStatus === 'Received').length;
    const pendingInvoices = pos.filter(po => po.invoiceMatchStatus === 'Pending').length;

    // Status counts
    const statusCounts = {
      'Draft': 0,
      'Pending Approval': 0,
      'Approved': 0,
      'Partially Received': 0,
      'Fully Received': 0,
      'Canceled': 0
    };

    pos.forEach(po => {
      if (po.status === 'Draft') statusCounts['Draft']++;
      else if (po.status === 'Pending Approval') statusCounts['Pending Approval']++;
      else if (po.status === 'Approved' && po.deliveryStatus === 'Pending') statusCounts['Approved']++;
      else if (po.deliveryStatus === 'Partial') statusCounts['Partially Received']++;
      else if (po.deliveryStatus === 'Received') statusCounts['Fully Received']++;
      else if (po.status === 'Canceled') statusCounts['Canceled']++;
    });

    const statusColors = {
      'Draft': '#3B82F6',
      'Pending Approval': '#F59E0B',
      'Approved': '#10B981',
      'Partially Received': '#8B5CF6',
      'Fully Received': '#6366F1',
      'Canceled': '#EF4444'
    };

    const statusData = Object.keys(statusCounts).map(name => ({
      name,
      value: statusCounts[name],
      color: statusColors[name]
    }));

    // Category Spend aggregation
    const categoryTotals = {};
    pos.forEach(po => {
      const cat = po.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (po.poValue || 0);
    });

    const categoryData = Object.keys(categoryTotals).map(cat => ({
      category: cat,
      value: parseFloat((categoryTotals[cat] / 10000000).toFixed(2))
    })).sort((a, b) => b.value - a.value);

    // Top Vendors aggregation
    const vendorTotals = {};
    pos.forEach(po => {
      const vName = po.vendorName || 'Other';
      vendorTotals[vName] = (vendorTotals[vName] || 0) + (po.poValue || 0);
    });

    const maxVendorVal = Math.max(...Object.values(vendorTotals), 1);
    const topVendors = Object.keys(vendorTotals).map(name => {
      const val = parseFloat((vendorTotals[name] / 10000000).toFixed(2));
      const pct = Math.round((vendorTotals[name] / maxVendorVal) * 100);
      return {
        name,
        value: val,
        width: `${pct}%`
      };
    }).sort((a, b) => b.value - a.value).slice(0, 5);

    const dashboard = {
      kpis: {
        totalPOs: pos.length,
        posInProgress,
        awaitingApproval: pendingApprovalsCount,
        goodsReceived,
        pendingInvoices,
        poValueThisMonth: parseFloat(valueCr)
      },
      statusData,
      categoryData,
      trendData: [
        { month: 'Dec', thisYear: 200, lastYear: 150 },
        { month: 'Jan', thisYear: 350, lastYear: 280 },
        { month: 'Feb', thisYear: 500, lastYear: 420 },
        { month: 'Mar', thisYear: 750, lastYear: 600 },
        { month: 'Apr', thisYear: 820, lastYear: 750 },
        { month: 'May', thisYear: pos.length, lastYear: 850 }
      ],
      topVendors,
      approvalQueue: [
        { type: "PO Approval", count: pendingApprovalsCount, color: "#3b82f6" },
        { type: "PO Amendment", count: 8, color: "#3b82f6" },
        { type: "GRN Approval", count: grns.filter(g => g.grnStatus === 'Pending').length || 16, color: "#f59e0b" },
        { type: "Payment Approval", count: matches.filter(m => m.matchStatus === 'Partial Match').length || 15, color: "#8b5cf6" }
      ],
      aiInsights: await readJsonFile(PO_AI_INSIGHTS_PATH)
    };

    await writeJsonFile(PO_DASHBOARD_PATH, dashboard);
  } catch (error) {
    console.error('Failed to update PO dashboard metrics:', error);
  }
}

// Multer Disk storage for Purchase Orders files
const poStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const documentCategory = req.body.documentCategory || 'temp';
    let dest = PO_TEMP_DIR;
    if (documentCategory === 'Technical Specification' || documentCategory === 'Technical Document') {
      dest = PO_SPEC_DIR;
    } else if (documentCategory === 'RFQ Document') {
      dest = PO_RFQ_DOCS_DIR;
    } else if (documentCategory === 'Vendor Quote') {
      dest = PO_VEND_QUOTES_DIR;
    } else if (documentCategory === 'Linked Contract') {
      dest = PO_CONTRACTS_DIR;
    } else if (documentCategory === 'Invoice') {
      dest = PO_INVOICES_DIR;
    } else if (documentCategory === 'GRN File') {
      dest = PO_GRN_DIR;
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `FILE_${uniqueSuffix}${ext}`);
  }
});
const poUpload = multer({ storage: poStorage });

// 1. GET /api/requisitions
app.get('/api/requisitions', async (req, res) => {
  try {
    const requisitions = await readJsonFile(PO_REQUISITIONS_PATH);
    res.json(requisitions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /api/requisitions/:id
app.get('/api/requisitions/:id', async (req, res) => {
  try {
    const requisitions = await readJsonFile(PO_REQUISITIONS_PATH);
    const reqItem = requisitions.find(r => r.requisitionId === req.params.id);
    if (!reqItem) return res.status(404).json({ error: 'Requisition not found' });
    res.json(reqItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. POST /api/requisitions
app.post('/api/requisitions', async (req, res) => {
  try {
    const reqs = await readJsonFile(PO_REQUISITIONS_PATH);
    const requisitionsData = req.body;
    
    // Auto-generate Requisition ID
    const year = new Date().getFullYear();
    const reqNum = String(reqs.length + 83).padStart(5, '0');
    const requisitionId = `REQ-${year}-${reqNum}`;

    requisitionsData.requisitionId = requisitionId;
    requisitionsData.status = "Pending Approval";
    requisitionsData.createdDate = new Date().toISOString().split('T')[0];
    requisitionsData.lastModified = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Link uploaded docs
    if (requisitionsData.uploadedDocuments && requisitionsData.uploadedDocuments.length > 0) {
      requisitionsData.uploadedDocuments = requisitionsData.uploadedDocuments.map(doc => ({
        ...doc,
        linkedRecordId: requisitionId
      }));
    }

    // Set initial approval workflow stage
    requisitionsData.approvalWorkflow = {
      currentStage: "Department Head Approval",
      workflowStep: 1,
      approvalStatus: "Pending",
      submittedBy: requisitionsData.requester?.requesterName || "Saurabh Anand",
      submittedOn: requisitionsData.lastModified
    };

    reqs.unshift(requisitionsData);
    await writeJsonFile(PO_REQUISITIONS_PATH, reqs);

    // Create entry in po-approvals.json
    const approvalItem = {
      approvalId: `APP-PO-${Math.floor(1000 + Math.random() * 9000)}`,
      requisitionId,
      vendorName: requisitionsData.vendorSelection?.selectedVendorName || "ABC Infotech Pvt Ltd",
      department: requisitionsData.requester?.department || "IT Services",
      estimatedValue: requisitionsData.vendorSelection?.quotedPrice || requisitionsData.budgetDetails?.currentRequisitionValue || 1250000,
      currentStage: "Department Head Approval",
      assignedTo: "Priya Sharma",
      status: "Pending",
      remarks: "",
      submittedBy: requisitionsData.requester?.requesterName || "Saurabh Anand",
      submittedOn: requisitionsData.lastModified,
      history: [
        {
          action: "Submitted",
          by: requisitionsData.requester?.requesterName || "Saurabh Anand",
          dateTime: requisitionsData.lastModified
        }
      ]
    };
    await appendJsonData(PO_APPROVALS_PATH, approvalItem);

    // Log in Audit & Activity Logs
    const activity = {
      id: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
      requisitionId,
      action: "Requisition Created",
      user: requisitionsData.requester?.requesterName || "Saurabh Anand",
      dateTime: requisitionsData.lastModified
    };
    await appendJsonData(PO_ACTIVITY_LOG_PATH, activity);

    const auditLog = {
      id: `AUD-PO-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      requisitionId,
      action: "Requisition Submitted",
      performedBy: requisitionsData.requester?.requesterName || "Saurabh Anand",
      details: `Requisition with ID ${requisitionId} created and routed for Department Head Approval.`
    };
    await appendJsonData(PO_AUDIT_LOG_PATH, auditLog);

    await updatePODashboardMetrics();

    res.status(201).json({ success: true, requisition: requisitionsData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. GET /api/purchase-orders
app.get('/api/purchase-orders', async (req, res) => {
  try {
    const pos = await readJsonFile(PO_PURCHASE_ORDERS_PATH);
    res.json(pos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. POST /api/purchase-orders/generate
app.post('/api/purchase-orders/generate', async (req, res) => {
  try {
    const { requisitionId } = req.body;
    const requisitions = await readJsonFile(PO_REQUISITIONS_PATH);
    const reqItem = requisitions.find(r => r.requisitionId === requisitionId);
    
    if (!reqItem) return res.status(404).json({ error: 'Requisition not found' });

    const pos = await readJsonFile(PO_PURCHASE_ORDERS_PATH);
    const year = new Date().getFullYear();
    const poNum = String(pos.length + 790).padStart(6, '0');
    const poId = `PO-${year}-${poNum}`;

    const newPO = {
      poId,
      linkedRequisitionId: requisitionId,
      vendorId: reqItem.vendorSelection?.selectedVendorId || "VND-2025-00029",
      vendorName: reqItem.vendorSelection?.selectedVendorName || "ABC Infotech Pvt Ltd",
      category: reqItem.category || "IT Services",
      poValue: reqItem.vendorSelection?.quotedPrice || 1250000,
      currency: "INR",
      createdDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deliveryStatus: "Pending",
      status: "Approved",
      paymentTerms: "Net 30",
      goodsReceiptStatus: "Pending",
      invoiceMatchStatus: "Pending"
    };

    pos.unshift(newPO);
    await writeJsonFile(PO_PURCHASE_ORDERS_PATH, pos);

    // Update Requisition status
    reqItem.status = "Approved";
    reqItem.lastModified = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    await writeJsonFile(PO_REQUISITIONS_PATH, requisitions);

    // Log Activity
    const activity = {
      id: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
      poId,
      requisitionId,
      action: "PO Generated",
      user: "System",
      dateTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };
    await appendJsonData(PO_ACTIVITY_LOG_PATH, activity);

    const auditLog = {
      id: `AUD-PO-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      requisitionId,
      poId,
      action: "Purchase Order Generated",
      performedBy: "System",
      details: `Purchase Order ${poId} generated automatically from approved Requisition ${requisitionId}.`
    };
    await appendJsonData(PO_AUDIT_LOG_PATH, auditLog);

    await updatePODashboardMetrics();

    // Auto-push to vendor portal if this PO is for ABC Infotech (VND-001)
    if (newPO.vendorName && newPO.vendorName.toLowerCase().includes('abc infotech')) {
      try {
        const vendorPOs = await readJsonFile(VENDOR_PORTAL_POS_PATH);
        const alreadyExists = vendorPOs.some(p => p.poId === newPO.poId);
        if (!alreadyExists) {
          vendorPOs.unshift({
            poId: newPO.poId,
            vendorId: 'VND-001',
            issueDate: new Date().toISOString().split('T')[0],
            deliveryDate: newPO.deliveryDate,
            items: 1,
            value: newPO.poValue,
            status: 'Pending Acknowledgement',
            category: newPO.category,
            description: `${newPO.category} — Ref: ${requisitionId}`,
            issuedBy: 'Axis Max Life Insurance — Procurement',
            paymentTerms: newPO.paymentTerms,
            adminSynced: true
          });
          await writeJsonFile(VENDOR_PORTAL_POS_PATH, vendorPOs);
          // Notify vendor
          await addVendorNotification(`New Purchase Order ${newPO.poId} has been raised and is awaiting your acknowledgement.`);
          await updateVendorDashboardMetrics();
        }
      } catch (_) { /* best-effort */ }
    }

    res.status(201).json({ success: true, purchaseOrder: newPO });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. GET /api/purchase-orders/dashboard
app.get('/api/purchase-orders/dashboard', async (req, res) => {
  try {
    await updatePODashboardMetrics();
    const dashboard = await readJsonFile(PO_DASHBOARD_PATH);
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. GET /api/purchase-orders/approvals
app.get('/api/purchase-orders/approvals', async (req, res) => {
  try {
    const approvals = await readJsonFile(PO_APPROVALS_PATH);
    const activeApprovals = approvals.filter(a => a.status === 'Pending');
    res.json(activeApprovals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. POST /api/purchase-orders/approve
app.post('/api/purchase-orders/approve', async (req, res) => {
  try {
    const { requisitionId, remarks, approvedBy } = req.body;
    const approvals = await readJsonFile(PO_APPROVALS_PATH);
    const appItem = approvals.find(a => a.requisitionId === requisitionId && a.status === 'Pending');

    if (!appItem) return res.status(404).json({ error: 'Pending approval item not found' });

    const currentStage = appItem.currentStage;
    let nextStage = "";
    let assignedTo = "";

    if (currentStage === "Department Head Approval") {
      nextStage = "Finance Approval";
      assignedTo = "Vikram Singh";
    } else if (currentStage === "Finance Approval") {
      nextStage = "Procurement Head Approval";
      assignedTo = "Saurabh Anand";
    } else {
      // Final Approval reached
      nextStage = "Approved";
    }

    const dateTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    appItem.history.push({
      action: `${currentStage} Approved`,
      by: approvedBy || "Approver",
      dateTime,
      remarks: remarks || ""
    });

    // Update requisition workflow details
    const requisitions = await readJsonFile(PO_REQUISITIONS_PATH);
    const reqItem = requisitions.find(r => r.requisitionId === requisitionId);

    if (nextStage === "Approved") {
      appItem.status = "Approved";
      appItem.currentStage = "Approved";
      appItem.assignedTo = "";
      
      if (reqItem) {
        reqItem.approvalWorkflow.approvalStatus = "Approved";
        reqItem.approvalWorkflow.currentStage = "Approved";
        reqItem.status = "Approved";
        await writeJsonFile(PO_REQUISITIONS_PATH, requisitions);
      }

      await writeJsonFile(PO_APPROVALS_PATH, approvals);

      // Auto-generate PO
      const pos = await readJsonFile(PO_PURCHASE_ORDERS_PATH);
      const year = new Date().getFullYear();
      const poNum = String(pos.length + 790).padStart(6, '0');
      const poId = `PO-${year}-${poNum}`;

      const newPO = {
        poId,
        linkedRequisitionId: requisitionId,
        vendorId: reqItem?.vendorSelection?.selectedVendorId || "VND-2025-00029",
        vendorName: reqItem?.vendorSelection?.selectedVendorName || "ABC Infotech Pvt Ltd",
        category: reqItem?.category || "IT Services",
        poValue: reqItem?.vendorSelection?.quotedPrice || 1250000,
        currency: "INR",
        createdDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deliveryStatus: "Pending",
        status: "Approved",
        paymentTerms: "Net 30",
        goodsReceiptStatus: "Pending",
        invoiceMatchStatus: "Pending"
      };
      pos.unshift(newPO);
      await writeJsonFile(PO_PURCHASE_ORDERS_PATH, pos);

      // Log activity
      const activity = {
        id: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
        poId,
        requisitionId,
        action: "PO Approved & Generated",
        user: approvedBy || "Saurabh Anand",
        dateTime
      };
      await appendJsonData(PO_ACTIVITY_LOG_PATH, activity);

      const auditLog = {
        id: `AUD-PO-${Math.floor(10000 + Math.random() * 90000)}`,
        timestamp: new Date().toISOString(),
        requisitionId,
        poId,
        action: "Requisition Final Approved",
        performedBy: approvedBy || "Saurabh Anand",
        details: `Requisition approved by Procurement Head and PO ${poId} generated.`
      };
      await appendJsonData(PO_AUDIT_LOG_PATH, auditLog);

    } else {
      // Move to next step
      appItem.currentStage = nextStage;
      appItem.assignedTo = assignedTo;

      if (reqItem) {
        reqItem.approvalWorkflow.currentStage = nextStage;
        reqItem.approvalWorkflow.workflowStep = reqItem.approvalWorkflow.workflowStep + 1;
        await writeJsonFile(PO_REQUISITIONS_PATH, requisitions);
      }

      await writeJsonFile(PO_APPROVALS_PATH, approvals);

      const activity = {
        id: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
        requisitionId,
        action: `Approved at ${currentStage}`,
        user: approvedBy || "Approver",
        dateTime
      };
      await appendJsonData(PO_ACTIVITY_LOG_PATH, activity);
    }

    await updatePODashboardMetrics();

    res.json({ success: true, approval: appItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. POST /api/purchase-orders/reject
app.post('/api/purchase-orders/reject', async (req, res) => {
  try {
    const { requisitionId, remarks, rejectedBy, actionType } = req.body;
    const mode = actionType === 'Send Back' ? 'Sent Back' : 'Rejected';

    const approvals = await readJsonFile(PO_APPROVALS_PATH);
    const appItem = approvals.find(a => a.requisitionId === requisitionId && a.status === 'Pending');

    if (!appItem) return res.status(404).json({ error: 'Pending approval item not found' });

    const dateTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    appItem.status = mode;
    appItem.remarks = remarks || "";
    appItem.history.push({
      action: mode,
      by: rejectedBy || "Approver",
      dateTime,
      remarks: remarks || ""
    });

    await writeJsonFile(PO_APPROVALS_PATH, approvals);

    const requisitions = await readJsonFile(PO_REQUISITIONS_PATH);
    const reqItem = requisitions.find(r => r.requisitionId === requisitionId);
    if (reqItem) {
      reqItem.status = mode;
      reqItem.approvalWorkflow.approvalStatus = mode;
      reqItem.approvalWorkflow.lastRemarks = remarks || "";
      await writeJsonFile(PO_REQUISITIONS_PATH, requisitions);
    }

    const activity = {
      id: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
      requisitionId,
      action: `Requisition ${mode}`,
      user: rejectedBy || "Approver",
      dateTime
    };
    await appendJsonData(PO_ACTIVITY_LOG_PATH, activity);

    const auditLog = {
      id: `AUD-PO-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      requisitionId,
      action: `Requisition ${mode}`,
      performedBy: rejectedBy || "Approver",
      details: `Requisition ${requisitionId} was ${mode.toLowerCase()} by ${rejectedBy}. Remarks: ${remarks || ""}`
    };
    await appendJsonData(PO_AUDIT_LOG_PATH, auditLog);

    await updatePODashboardMetrics();

    res.json({ success: true, approval: appItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10. POST /api/purchase-orders/upload
app.post('/api/purchase-orders/upload', poUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const { linkedRecordId, documentCategory, uploadedBy } = req.body;
    let relativePath = `/uploads/purchase-orders/temp/${req.file.filename}`;
    if (documentCategory === 'Technical Specification' || documentCategory === 'Technical Document') {
      relativePath = `/uploads/purchase-orders/specifications/${req.file.filename}`;
    } else if (documentCategory === 'RFQ Document') {
      relativePath = `/uploads/purchase-orders/rfq-documents/${req.file.filename}`;
    } else if (documentCategory === 'Vendor Quote') {
      relativePath = `/uploads/purchase-orders/vendor-quotes/${req.file.filename}`;
    } else if (documentCategory === 'Linked Contract') {
      relativePath = `/uploads/purchase-orders/contracts/${req.file.filename}`;
    } else if (documentCategory === 'Invoice') {
      relativePath = `/uploads/purchase-orders/invoices/${req.file.filename}`;
    } else if (documentCategory === 'GRN File') {
      relativePath = `/uploads/purchase-orders/grn/${req.file.filename}`;
    }

    const fileMeta = {
      fileId: `FILE-PO-${Math.floor(1000 + Math.random() * 9000)}`,
      linkedModule: "Purchase Orders",
      linkedRecordId: linkedRecordId || "",
      fileName: req.file.originalname,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      documentCategory: documentCategory || "Supporting Document",
      storagePath: relativePath,
      filePath: relativePath,
      uploadedBy: uploadedBy || "Saurabh Anand",
      uploadedOn: new Date().toISOString().split('T')[0],
      size: `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`,
      fileSize: `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`,
      version: "v1.0"
    };

    await appendJsonData(PO_UPLOADED_FILES_PATH, fileMeta);

    res.status(201).json({ success: true, file: fileMeta });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 11. GET /api/purchase-orders/files/:id
app.get('/api/purchase-orders/files/:id', async (req, res) => {
  try {
    const files = await readJsonFile(PO_UPLOADED_FILES_PATH);
    const filtered = files.filter(f => f.linkedRecordId === req.params.id);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 12. GET /api/rfq-vendors
app.get('/api/rfq-vendors', async (req, res) => {
  try {
    const estimatedCost = parseFloat(req.query.estimatedCost) || 1250000;
    const vendors = await readJsonFile(VENDORS_PATH);
    const activeVendors = vendors.filter(v => v.status === 'Active');
    
    // Construct mock quotes for each active vendor
    const rfqVendors = activeVendors.map((v, index) => {
      // Vary quotes around estimatedCost: L1 gets less, L2 gets slightly more, etc.
      let price = estimatedCost;
      let tag = "";
      let leadTime = "5 Days";
      let sla = "95%";
      
      if (index === 0) {
        price = Math.round(estimatedCost * 0.95);
        tag = "Best Value";
        leadTime = "5 Days";
        sla = "98%";
      } else if (index === 1) {
        price = Math.round(estimatedCost * 1.05);
        tag = "L2 Provider";
        leadTime = "7 Days";
        sla = "94%";
      } else if (index === 2) {
        price = Math.round(estimatedCost * 1.12);
        tag = "L3 Provider";
        leadTime = "8 Days";
        sla = "90%";
      } else {
        price = Math.round(estimatedCost * (1.15 + (index - 3) * 0.05));
        tag = `L${index + 1} Provider`;
        leadTime = `${8 + index} Days`;
        sla = `${90 - index}%`;
      }
      
      return {
        vendorId: v.vendorId,
        vendorName: v.basicDetails?.legalName || v.vendorName || 'Unnamed Vendor',
        quotedPrice: price,
        leadTime: leadTime,
        kycCompliance: (v.riskLevel || v.risk?.level || 'Low').toLowerCase() === 'high' ? 'Review Needed' : 'Clean',
        slaScore: sla,
        vendorRiskLevel: v.riskLevel || v.risk?.level || 'Low',
        recommendationTag: tag,
        rating: index === 0 ? 4.8 : index === 1 ? 4.4 : index === 2 ? 4.1 : 3.8
      };
    });
    
    res.json(rfqVendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 13. POST /api/grn/create
app.post('/api/grn/create', async (req, res) => {
  try {
    const grns = await readJsonFile(PO_GOODS_RECEIPT_PATH);
    const { poId, receivedQuantity, acceptedQuantity, rejectedQuantity, deliveryCondition, inspectionRemarks, inspectedBy } = req.body;

    const grnId = `GRN-PO-${grns.length + 1003}`;

    const newGRN = {
      grnId,
      poId,
      receivedDate: new Date().toISOString().split('T')[0],
      receivedQuantity: parseInt(receivedQuantity) || 1,
      acceptedQuantity: parseInt(acceptedQuantity) || 1,
      rejectedQuantity: parseInt(rejectedQuantity) || 0,
      deliveryCondition: deliveryCondition || "Good",
      inspectionRemarks: inspectionRemarks || "All units inspected.",
      grnStatus: parseInt(rejectedQuantity) > 0 ? "Partially Accepted" : "Fully Accepted",
      inspectedBy: inspectedBy || "Saurabh Anand",
      createdDate: new Date().toISOString().split('T')[0]
    };

    grns.unshift(newGRN);
    await writeJsonFile(PO_GOODS_RECEIPT_PATH, grns);

    // Update PO delivery status
    const pos = await readJsonFile(PO_PURCHASE_ORDERS_PATH);
    const poIndex = pos.findIndex(p => p.poId === poId);
    if (poIndex !== -1) {
      pos[poIndex].deliveryStatus = newGRN.grnStatus === "Fully Accepted" ? "Received" : "Partial";
      pos[poIndex].goodsReceiptStatus = newGRN.grnStatus === "Fully Accepted" ? "Received" : "Partial";
      await writeJsonFile(PO_PURCHASE_ORDERS_PATH, pos);
    }

    const activity = {
      id: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
      poId,
      action: "GRN Created",
      user: inspectedBy || "Saurabh Anand",
      dateTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };
    await appendJsonData(PO_ACTIVITY_LOG_PATH, activity);

    const auditLog = {
      id: `AUD-PO-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      poId,
      action: "Goods Receipt Note Created",
      performedBy: inspectedBy || "Saurabh Anand",
      details: `Goods Receipt Note ${grnId} created for PO ${poId} with ${acceptedQuantity} items accepted and ${rejectedQuantity} items rejected.`
    };
    await appendJsonData(PO_AUDIT_LOG_PATH, auditLog);

    await updatePODashboardMetrics();

    res.status(201).json({ success: true, grn: newGRN });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 14. GET /api/grn/list
app.get('/api/grn/list', async (req, res) => {
  try {
    const grns = await readJsonFile(PO_GOODS_RECEIPT_PATH);
    res.json(grns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 15. POST /api/three-way-match/process
app.post('/api/three-way-match/process', async (req, res) => {
  try {
    const matches = await readJsonFile(PO_THREE_WAY_MATCH_PATH);
    const { poId, invoiceId, grnId, invoiceAmount, invoiceQuantity } = req.body;

    const pos = await readJsonFile(PO_PURCHASE_ORDERS_PATH);
    const po = pos.find(p => p.poId === poId);
    if (!po) return res.status(404).json({ error: 'PO not found' });

    const grns = await readJsonFile(PO_GOODS_RECEIPT_PATH);
    const grn = grns.find(g => g.grnId === grnId);

    const poAmount = po.poValue;
    const parsedInvoiceAmt = parseFloat(invoiceAmount) || poAmount;
    const parsedInvoiceQty = parseInt(invoiceQuantity) || 1;
    const grnQty = grn ? grn.acceptedQuantity : parsedInvoiceQty;

    const amountMatched = Math.abs(poAmount - parsedInvoiceAmt) < 0.01;
    const quantityMatched = grnQty === parsedInvoiceQty;

    const isMatch = amountMatched && quantityMatched;
    const matchStatus = isMatch ? "Matched" : "Partial Match";

    const matchId = `3WM-2026-00${matches.length + 1}`;
    const newMatch = {
      matchId,
      poId,
      invoiceId: invoiceId || `INV-2026-00${Math.floor(100 + Math.random() * 900)}`,
      grnId: grnId || (grn ? grn.grnId : ""),
      poAmount,
      invoiceAmount: parsedInvoiceAmt,
      grnQuantity: grnQty,
      invoiceQuantity: parsedInvoiceQty,
      amountMatched,
      quantityMatched,
      matchStatus,
      processedDate: new Date().toISOString().split('T')[0],
      remarks: isMatch ? "Full 3-way match confirmed. Cleared for payment." : "Mismatch detected. Requires approval.",
      ...(isMatch ? {} : { mismatchReason: "Invoice amount or quantity does not match PO and GRN values", approvalRequired: true })
    };

    matches.unshift(newMatch);
    await writeJsonFile(PO_THREE_WAY_MATCH_PATH, matches);

    // Update PO Match status
    const poIndex = pos.findIndex(p => p.poId === poId);
    if (poIndex !== -1) {
      pos[poIndex].invoiceMatchStatus = isMatch ? "Matched" : "Mismatch";
      if (isMatch) pos[poIndex].status = "Closed";
      await writeJsonFile(PO_PURCHASE_ORDERS_PATH, pos);
    }

    const activity = {
      id: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
      poId,
      action: "3-Way Match Executed",
      user: "Match Engine",
      dateTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };
    await appendJsonData(PO_ACTIVITY_LOG_PATH, activity);

    const auditLog = {
      id: `AUD-PO-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      poId,
      action: "3-Way Match Verification",
      performedBy: "Match Engine",
      details: `3-Way Match verification executed. Result: ${matchStatus}. Remarks: ${newMatch.remarks}`
    };
    await appendJsonData(PO_AUDIT_LOG_PATH, auditLog);

    await updatePODashboardMetrics();

    res.status(201).json({ success: true, match: newMatch });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 16. GET /api/three-way-match/list
app.get('/api/three-way-match/list', async (req, res) => {
  try {
    const matches = await readJsonFile(PO_THREE_WAY_MATCH_PATH);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================================
// AUTHENTICATION & MFA (2FA) MODULE APIs
// ========================================================

const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
};

const getBrowserInfo = (req) => {
  const ua = req.headers['user-agent'] || '';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Browser';
};

// 1. POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await readJsonFile(AUTH_USERS_PATH);
    const user = users.find(u => u.username === username);

    const ipAddress = getClientIp(req);
    const browser = getBrowserInfo(req);
    const timeStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    if (!user || user.password !== password) {
      const failedAudit = {
        auditId: `AUDIT-${Math.floor(1000 + Math.random() * 9000)}`,
        username: username || 'Unknown',
        loginTime: timeStr,
        twoFactorCompleted: false,
        loginStatus: "FAILED",
        ipAddress,
        browser
      };
      await appendJsonData(AUTH_AUDIT_PATH, failedAudit);
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    if (user.status !== "Active") {
      return res.status(403).json({ success: false, message: 'Your account is disabled' });
    }

    // Success Step 1 - Redirect to 2FA Page
    res.json({
      success: true,
      requires2FA: true,
      redirect: "/auth/2fa",
      user: {
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. POST /api/auth/send-otp
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { username } = req.body;
    const users = await readJsonFile(AUTH_USERS_PATH);
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otps = await readJsonFile(AUTH_OTP_STORE_PATH);
    let otpEntry = otps.find(o => o.username === username);

    if (otpEntry) {
      otpEntry.otp = user.defaultOtp || "123456";
      otpEntry.status = "ACTIVE";
      otpEntry.expiresInSeconds = 300;
      await writeJsonFile(AUTH_OTP_STORE_PATH, otps);
    } else {
      otpEntry = {
        otpId: `OTP-${Math.floor(1000 + Math.random() * 9000)}`,
        username: username,
        otp: user.defaultOtp || "123456",
        status: "ACTIVE",
        expiresInSeconds: 300
      };
      await appendJsonData(AUTH_OTP_STORE_PATH, otpEntry);
    }

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. POST /api/auth/verify-otp
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { username, otp } = req.body;
    const users = await readJsonFile(AUTH_USERS_PATH);
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otps = await readJsonFile(AUTH_OTP_STORE_PATH);
    const otpEntry = otps.find(o => o.username === username && o.otp === otp && o.status === 'ACTIVE');

    const ipAddress = getClientIp(req);
    const browser = getBrowserInfo(req);
    const timeStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    if (!otpEntry) {
      const failedAudit = {
        auditId: `AUDIT-${Math.floor(1000 + Math.random() * 9000)}`,
        username,
        loginTime: timeStr,
        twoFactorCompleted: false,
        loginStatus: "FAILED",
        ipAddress,
        browser
      };
      await appendJsonData(AUTH_AUDIT_PATH, failedAudit);
      return res.status(401).json({ success: false, message: 'Invalid OTP' });
    }

    // Mark OTP as USED
    otpEntry.status = "USED";
    await writeJsonFile(AUTH_OTP_STORE_PATH, otps);

    // Create session in sessions.json
    const token = `JWT-DEMO-${Math.floor(100000 + Math.random() * 900000)}`;
    const sessionId = `SESSION-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSession = {
      sessionId,
      userId: user.userId,
      username: user.username,
      role: user.role,
      loginTime: timeStr,
      twoFactorVerified: true,
      status: "ACTIVE",
      token,
      lastActivity: Date.now()
    };
    await appendJsonData(AUTH_SESSIONS_PATH, newSession);

    // Create Success Audit Log
    const successAudit = {
      auditId: `AUDIT-${Math.floor(1000 + Math.random() * 9000)}`,
      username: user.username,
      loginTime: timeStr,
      twoFactorCompleted: true,
      loginStatus: "SUCCESS",
      ipAddress,
      browser
    };
    await appendJsonData(AUTH_AUDIT_PATH, successAudit);

    // Update user lastLogin
    user.lastLogin = timeStr;
    await writeJsonFile(AUTH_USERS_PATH, users);

    res.json({
      success: true,
      authenticated: true,
      redirect: user.dashboardRoute || "/dashboard",
      token,
      role: user.role,
      user: {
        userId: user.userId,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        profileImage: user.profileImage,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/demo-users
app.get('/api/auth/demo-users', async (req, res) => {
  try {
    const demoUsersPath = path.join(AUTH_DIR, 'demoUsers.json');
    const demoUsers = await readJsonFile(demoUsersPath);
    res.json(demoUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/demo-login
app.post('/api/auth/demo-login', async (req, res) => {
  try {
    const { username } = req.body;
    const users = await readJsonFile(AUTH_USERS_PATH);
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.status !== "Active") {
      return res.status(403).json({ success: false, message: 'Your account is disabled' });
    }

    const ipAddress = getClientIp(req);
    const browser = getBrowserInfo(req);
    const timeStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const token = `JWT-DEMO-${Math.floor(100000 + Math.random() * 900000)}`;
    const sessionId = `SESSION-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSession = {
      sessionId,
      userId: user.userId,
      username: user.username,
      role: user.role,
      loginTime: timeStr,
      twoFactorVerified: true,
      status: "ACTIVE",
      token,
      lastActivity: Date.now()
    };
    await appendJsonData(AUTH_SESSIONS_PATH, newSession);

    // Create Success Audit Log
    const successAudit = {
      auditId: `AUDIT-${Math.floor(1000 + Math.random() * 9000)}`,
      username: user.username,
      loginTime: timeStr,
      twoFactorCompleted: true,
      loginStatus: "SUCCESS",
      ipAddress,
      browser
    };
    await appendJsonData(AUTH_AUDIT_PATH, successAudit);

    // Update user lastLogin
    user.lastLogin = timeStr;
    await writeJsonFile(AUTH_USERS_PATH, users);

    res.json({
      success: true,
      authenticated: true,
      redirect: user.dashboardRoute || "/dashboard",
      token,
      role: user.role,
      user: {
        userId: user.userId,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        profileImage: user.profileImage,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. POST /api/auth/logout
app.post('/api/auth/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(400).json({ error: 'Authorization token required' });
    const token = authHeader.replace('Bearer ', '');

    const sessions = await readJsonFile(AUTH_SESSIONS_PATH);
    const session = sessions.find(s => s.token === token && s.status === 'ACTIVE');

    if (session) {
      session.status = 'INACTIVE';
      await writeJsonFile(AUTH_SESSIONS_PATH, sessions);
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. GET /api/auth/session
app.get('/api/auth/session', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No authorization header' });
    const token = authHeader.replace('Bearer ', '');

    const sessions = await readJsonFile(AUTH_SESSIONS_PATH);
    const session = sessions.find(s => s.token === token && s.status === 'ACTIVE');

    if (!session) {
      return res.status(401).json({ error: 'Invalid or inactive session' });
    }

    const TIMEOUT_MS = 30 * 60 * 1000;
    const now = Date.now();
    if (now - session.lastActivity > TIMEOUT_MS) {
      session.status = 'INACTIVE';
      await writeJsonFile(AUTH_SESSIONS_PATH, sessions);
      return res.status(401).json({ error: 'Session expired' });
    }

    session.lastActivity = now;
    await writeJsonFile(AUTH_SESSIONS_PATH, sessions);

    const users = await readJsonFile(AUTH_USERS_PATH);
    const user = users.find(u => u.username === session.username);

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      success: true,
      user: {
        userId: user.userId,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        profileImage: user.profileImage,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. GET /api/auth/users
app.get('/api/auth/users', async (req, res) => {
  try {
    const users = await readJsonFile(AUTH_USERS_PATH);
    const safeUsers = users.map(({ password, ...rest }) => rest);
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. GET /api/auth/permissions
app.get('/api/auth/permissions', async (req, res) => {
  try {
    const permissions = await readJsonFile(AUTH_PERMISSIONS_PATH);
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =========================================================================
// Due Diligence & KYC Verification Module API Endpoints
// =========================================================================

// Configure Multer for KYC Document Uploads
const kycStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, KYC_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'KYC-' + uniqueSuffix + ext);
  }
});
const kycUpload = multer({ storage: kycStorage });

// Helper to calculate KYC Status dynamically
const calculateKycStatus = (vendor) => {
  const docs = vendor.documents || {};
  
  // Mandatory check fields
  const isPanVerified = docs.pan?.status === 'Verified';
  const isGstinVerified = docs.gstin?.status === 'Verified';
  const isCinVerified = docs.cin?.status === 'Verified';
  const isBankVerified = docs.bankAccount?.status === 'Verified';
  
  const isPanRejected = docs.pan?.status === 'Rejected';
  const isGstinRejected = docs.gstin?.status === 'Rejected';
  const isCinRejected = docs.cin?.status === 'Rejected';
  const isBankRejected = docs.bankAccount?.status === 'Rejected';

  // Check Re-KYC Due date (within 30 days of today)
  if (vendor.reKycDueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(vendor.reKycDueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // If due date has passed or is within 30 days
    if (diffDays >= 0 && diffDays <= 30) {
      return 'Re-KYC Due';
    }
  }

  // REJECTED
  if (isPanRejected || isGstinRejected || isCinRejected || isBankRejected || vendor.kycStatus === 'Rejected') {
    return 'Rejected';
  }

  // VERIFIED
  if (isPanVerified && isGstinVerified && isCinVerified && isBankVerified) {
    return 'Verified';
  }

  // PENDING (mandatory doc missing / not uploaded at all)
  const isAnyMandatoryMissing = 
    !docs.pan?.number || docs.pan?.status === 'Pending' || 
    !docs.gstin?.number || docs.gstin?.status === 'Pending' || 
    !docs.cin?.number || docs.cin?.status === 'Pending' || 
    !docs.bankAccount?.accountNumber || docs.bankAccount?.status === 'Pending';

  if (isAnyMandatoryMissing) {
    return 'Pending';
  }

  // IN PROGRESS (all mandatory uploaded but not all verified yet)
  return 'In Progress';
};

// GET /api/kyc/dashboard
app.get('/api/kyc/dashboard', async (req, res) => {
  try {
    await recalculateVmsSystem();
    const data = await readJsonFile(KYC_DASHBOARD_PATH);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/kyc/screening
app.get('/api/kyc/screening', async (req, res) => {
  try {
    const data = await readJsonFile(SCREENING_RESULTS_PATH);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/kyc/reviews
app.get('/api/kyc/reviews', async (req, res) => {
  try {
    await recalculateVmsSystem();
    const data = await readJsonFile(REVIEWS_PATH);
    const reviews = data.reviews || [];

    // Calculate summary counts dynamically
    const summary = {
      pendingReviews: reviews.filter(r => r.approvalStatus === 'Pending Review' || r.approvalStatus === 'Pending').length,
      inProgress: reviews.filter(r => r.approvalStatus === 'In Review' || r.approvalStatus === 'Clarification Required').length,
      readyForApproval: reviews.filter(r => r.approvalStatus === 'Ready For Approval').length,
      approved: reviews.filter(r => r.approvalStatus === 'Approved').length,
      rejected: reviews.filter(r => r.approvalStatus === 'Rejected').length
    };

    res.json({ summary, reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/kyc/reviews/detail/:vendorId
app.get('/api/kyc/reviews/detail/:vendorId', async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    const vendors = await readJsonFile(VENDORS_PATH);
    const vendor = vendors.find(v => v.vendorId === vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const reviewsData = await readJsonFile(REVIEWS_PATH);
    let review = (reviewsData.reviews || []).find(r => r.vendorId === vendorId);
    
    // Find screening results
    const screeningData = await readJsonFile(SCREENING_RESULTS_PATH);
    const screening = (screeningData.screenings || []).find(s => s.vendorId === vendorId);
    
    // Find documents
    const documents = await readJsonFile(DOCUMENTS_PATH);
    const vendorDocs = documents.filter(d => (d.vendor?.vendorId === vendorId) || (d.vendorId === vendorId));

    // Get specific document statuses
    const checkDocStatus = (docName) => {
      const doc = vendorDocs.find(d => (d.documentName || '').toUpperCase().includes(docName.toUpperCase()));
      return doc ? doc.verificationStatus || doc.approvalStatus || doc.status || 'Pending' : 'Not Uploaded';
    };

    // Summary counts of documents
    const documentSummary = {
      total: vendorDocs.length,
      verified: vendorDocs.filter(d => {
        const s = (d.verificationStatus || d.approvalStatus || d.status || '').toUpperCase();
        return s === 'VERIFIED' || s === 'APPROVED';
      }).length,
      pending: vendorDocs.filter(d => {
        const s = (d.verificationStatus || d.approvalStatus || d.status || '').toUpperCase();
        return s === 'PENDING' || s === 'PENDING VERIFICATION';
      }).length,
      rejected: vendorDocs.filter(d => {
        const s = (d.verificationStatus || d.approvalStatus || d.status || '').toUpperCase();
        return s === 'REJECTED';
      }).length
    };

    // If review record doesn't exist, create a temporary/default one
    if (!review) {
      review = {
        reviewId: `REV-${Date.now().toString().slice(-4)}`,
        vendorId,
        vendorName: vendor.vendorName || vendor.basicDetails?.legalName || 'Unnamed Vendor',
        category: vendor.category || vendor.basicDetails?.businessType || 'General',
        riskScore: vendor.risk?.score || 0,
        riskLevel: vendor.risk?.level || 'Low',
        kycStatus: vendor.kycStatus || 'Pending',
        screeningStatus: 'Cleared',
        approvalStatus: 'Pending Review',
        assignedTo: 'Compliance Team',
        dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        comments: []
      };
    }

    const detailData = {
      reviewId: review.reviewId,
      vendorId: vendor.vendorId,
      vendorName: vendor.vendorName || vendor.basicDetails?.legalName || 'Unnamed Vendor',
      vendorCode: vendor.vendorId,
      category: vendor.category || vendor.basicDetails?.businessType || 'General',
      kycStatus: vendor.kycStatus || 'Pending',
      riskScore: vendor.risk?.score || 0,
      riskLevel: vendor.risk?.level || 'Low',
      approvalStatus: review.approvalStatus,
      comments: review.comments || [],
      kycSummary: {
        panStatus: checkDocStatus('PAN'),
        gstStatus: checkDocStatus('GST'),
        cinStatus: checkDocStatus('CIN') || checkDocStatus('Incorporation'),
        bankStatus: checkDocStatus('Bank') || checkDocStatus('Cheque'),
        rocStatus: checkDocStatus('ROC') || 'Verified',
        itrStatus: checkDocStatus('ITR') || 'Verified',
        status: vendor.kycStatus || 'Pending'
      },
      screeningSummary: {
        sanctions: {
          status: screening?.sanctions?.status || 'Clear',
          score: screening?.sanctions?.score || 0,
          remarks: screening?.sanctions?.details || 'No matches found in OFAC, UN, EU sanctions lists.'
        },
        pep: {
          status: screening?.pep?.status || 'Clear',
          score: screening?.pep?.score || 0,
          remarks: screening?.pep?.details || 'No politically exposed persons identified.'
        },
        adverseMedia: {
          status: screening?.adverseMedia?.status || 'No Findings',
          score: screening?.adverseMedia?.score || 0,
          remarks: screening?.adverseMedia?.details || 'No adverse news coverage detected.'
        },
        blacklist: {
          status: screening?.blacklist?.status || 'Clear',
          score: screening?.blacklist?.score || 0,
          remarks: screening?.blacklist?.details || 'Not present in any industry or government blacklist.'
        },
        shellCompany: {
          status: screening?.shellCompany?.status || 'Low Risk',
          score: screening?.shellCompany?.score || 5,
          remarks: screening?.shellCompany?.details || 'Registered entity with operational history.'
        }
      },
      documentSummary,
      riskAssessment: {
        score: vendor.risk?.score || 0,
        level: vendor.risk?.level || 'Low',
        breakdown: {
          business: screening?.shellCompany?.score || 5,
          financial: screening?.adverseMedia?.score || 10,
          compliance: (screening?.sanctions?.score || 0) + (screening?.blacklist?.score || 0),
          operational: screening?.pep?.score || 5
        }
      }
    };

    res.json(detailData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/reviews/action
app.post('/api/kyc/reviews/action', async (req, res) => {
  try {
    const { vendorId, action, comment } = req.body;
    
    // Read databases
    const vendors = await readJsonFile(VENDORS_PATH);
    const reviewsData = await readJsonFile(REVIEWS_PATH);
    
    const vendorIndex = vendors.findIndex(v => v.vendorId === vendorId);
    if (vendorIndex === -1) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const reviews = reviewsData.reviews || [];
    let review = reviews.find(r => r.vendorId === vendorId);
    
    // Map workflow statuses
    let newApprovalStatus = 'Pending Review';
    let newKycStatus = 'Pending';
    let actionLog = '';

    if (action === 'Approve') {
      newApprovalStatus = 'Approved';
      newKycStatus = 'Verified';
      actionLog = 'Approved';
    } else if (action === 'Reject') {
      newApprovalStatus = 'Rejected';
      newKycStatus = 'Rejected';
      actionLog = 'Rejected';
    } else if (action === 'SendBack') {
      newApprovalStatus = 'Clarification Required';
      newKycStatus = 'Pending';
      actionLog = 'Sent back for clarification';
    }

    // Update vendor record
    vendors[vendorIndex].kycStatus = newKycStatus;
    vendors[vendorIndex].status = newKycStatus === 'Verified' ? 'Active' : newKycStatus === 'Rejected' ? 'Suspended' : 'Pending Approval';
    if (!vendors[vendorIndex].approvalWorkflow) {
      vendors[vendorIndex].approvalWorkflow = {};
    }
    vendors[vendorIndex].approvalWorkflow.approvalStatus = newApprovalStatus;
    vendors[vendorIndex].approvalWorkflow.approverRemarks = comment || '';
    vendors[vendorIndex].approvalWorkflow.approvedBy = 'Compliance Team';
    vendors[vendorIndex].approvalWorkflow.approvedDate = new Date().toISOString();

    // Log in vendor audit trail
    if (!vendors[vendorIndex].auditTrail) vendors[vendorIndex].auditTrail = [];
    vendors[vendorIndex].auditTrail.push({
      action: `KYC Review ${actionLog}`,
      performedBy: 'Compliance Team',
      timestamp: new Date().toISOString(),
      remarks: comment || ''
    });

    // Write back vendors database
    await writeJsonFile(VENDORS_PATH, vendors);

    // Update review record
    if (review) {
      review.approvalStatus = newApprovalStatus;
      review.kycStatus = newKycStatus;
      if (!review.comments) review.comments = [];
      review.comments.push({
        author: 'Compliance Team',
        text: comment || `Action: ${actionLog}`
      });
    }

    await writeJsonFile(REVIEWS_PATH, { reviews });

    // Log VMS Audit Trail
    await logVmsAuditTrail(`KYC Workflow ${action}`, `Vendor ${vendorId} KYC was ${actionLog}.`);

    // Recalculate VMS Dashboard states
    await recalculateVmsSystem();

    res.json({ success: true, message: `Vendor review ${actionLog} successfully.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/kyc/audit-log
app.get('/api/kyc/audit-log', async (req, res) => {
  try {
    const data = await readJsonFile(AUDIT_LOG_PATH);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/screening/run
app.post('/api/kyc/screening/run', async (req, res) => {
  try {
    const { vendorId } = req.body;
    await recalculateVmsSystem();
    await logVmsAuditTrail('Risk Screening Run', `AI Screening rerun triggered for vendor ${vendorId}.`);
    const data = await readJsonFile(SCREENING_RESULTS_PATH);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/kyc/vendors
app.get('/api/kyc/vendors', async (req, res) => {
  try {
    const data = await readJsonFile(KYC_VERIFICATION_PATH);
    const vendors = data.vendors || [];

    // Dynamically enrich/verify kycStatus and completion percentage
    const enrichedVendors = vendors.map(v => {
      const docs = v.documents || {};
      const keys = ['pan', 'gstin', 'aadhaar', 'cin', 'msme', 'bankAccount'];
      const verifiedCount = keys.filter(k => docs[k] && docs[k].status === 'Verified').length;
      const completionPercentage = Math.round((verifiedCount / keys.length) * 100);
      const computedStatus = calculateKycStatus(v);

      return {
        ...v,
        kycStatus: computedStatus,
        completionPercentage
      };
    });

    res.json({ vendors: enrichedVendors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/kyc/vendors/:id
app.get('/api/kyc/vendors/:id', async (req, res) => {
  try {
    const data = await readJsonFile(KYC_VERIFICATION_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor KYC profile not found' });
    }

    const docs = vendor.documents || {};
    const keys = ['pan', 'gstin', 'aadhaar', 'cin', 'msme', 'bankAccount'];
    const verifiedCount = keys.filter(k => docs[k] && docs[k].status === 'Verified').length;
    const completionPercentage = Math.round((verifiedCount / keys.length) * 100);
    const computedStatus = calculateKycStatus(vendor);

    res.json({
      ...vendor,
      kycStatus: computedStatus,
      completionPercentage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/upload
app.post('/api/kyc/upload', kycUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file was uploaded' });
    }
    res.json({
      success: true,
      fileId: `FILE-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90) + 10}`,
      fileName: req.file.originalname,
      filePath: `/uploads/kyc/${req.file.filename}`,
      uploadedBy: req.body.uploadedBy || 'Saurabh Anand',
      uploadedOn: new Date().toISOString().split('T')[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/verify
app.post('/api/kyc/verify', async (req, res) => {
  try {
    const { vendorId, documentKey, number, details, status, comment, verifiedBy } = req.body;
    const data = await readJsonFile(KYC_VERIFICATION_PATH);
    const vendors = data.vendors || [];
    
    const vendorIndex = vendors.findIndex(v => v.vendorId === vendorId);
    if (vendorIndex === -1) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const vendor = vendors[vendorIndex];
    if (!vendor.documents) vendor.documents = {};
    if (!vendor.documents[documentKey]) {
      vendor.documents[documentKey] = { number: '', status: 'Pending', verifiedOn: null, file: null };
    }

    // Update document checks
    const prevDoc = vendor.documents[documentKey];
    vendor.documents[documentKey] = {
      ...prevDoc,
      number: number || prevDoc.number || '',
      status: status || 'Pending',
      verifiedOn: status === 'Verified' ? new Date().toISOString().split('T')[0] : prevDoc.verifiedOn,
      ...(details || {})
    };

    // Audit logs entry
    const auditorName = verifiedBy || 'Saurabh Anand';
    const auditAction = `${status === 'Verified' ? 'Verified' : 'Rejected'} ${documentKey.toUpperCase()}`;
    const auditEntry = {
      verifiedBy: auditorName,
      action: auditAction,
      comments: comment || `${documentKey.toUpperCase()} verification completed.`,
      timestamp: new Date().toISOString()
    };
    if (!vendor.verificationHistory) vendor.verificationHistory = [];
    vendor.verificationHistory.push(auditEntry);

    // Dynamic state recalculation
    vendor.kycStatus = calculateKycStatus(vendor);
    vendor.lastVerifiedOn = new Date().toISOString().split('T')[0];

    // Compute completion percentage
    const keys = ['pan', 'gstin', 'aadhaar', 'cin', 'msme', 'bankAccount'];
    const docs = vendor.documents || {};
    const verifiedCount = keys.filter(k => docs[k] && docs[k].status === 'Verified').length;
    vendor.completionPercentage = Math.round((verifiedCount / keys.length) * 100);

    // Save
    await writeJsonFile(KYC_VERIFICATION_PATH, data);

    res.json({
      success: true,
      message: `${documentKey.toUpperCase()} updated successfully.`,
      vendor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/workflow
app.post('/api/kyc/workflow', async (req, res) => {
  try {
    const { vendorId, stage, action, comment, performedBy } = req.body;
    const data = await readJsonFile(KYC_VERIFICATION_PATH);
    const vendors = data.vendors || [];

    const vendorIndex = vendors.findIndex(v => v.vendorId === vendorId);
    if (vendorIndex === -1) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const vendor = vendors[vendorIndex];
    if (!vendor.workflow) {
      vendor.workflow = { procurement: 'Pending', compliance: 'Pending', legal: 'Pending', final: 'Pending' };
    }

    vendor.workflow[stage] = action;

    // Log in audit trail
    const userName = performedBy || 'Saurabh Anand';
    const auditEntry = {
      verifiedBy: userName,
      action: `${stage.toUpperCase()} Review: ${action}`,
      comments: comment || `${stage.toUpperCase()} transitioned to ${action}.`,
      timestamp: new Date().toISOString()
    };
    if (!vendor.verificationHistory) vendor.verificationHistory = [];
    vendor.verificationHistory.push(auditEntry);

    // If final reviewer rejects or approves, set status
    if (stage === 'final') {
      if (action === 'Approved') {
        vendor.kycStatus = 'Verified';
      } else if (action === 'Rejected') {
        vendor.kycStatus = 'Rejected';
      }
    }

    // Compute completion percentage
    const keys = ['pan', 'gstin', 'aadhaar', 'cin', 'msme', 'bankAccount'];
    const docs = vendor.documents || {};
    const verifiedCount = keys.filter(k => docs[k] && docs[k].status === 'Verified').length;
    vendor.completionPercentage = Math.round((verifiedCount / keys.length) * 100);

    await writeJsonFile(KYC_VERIFICATION_PATH, data);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/kyc/risk
app.get('/api/kyc/risk', async (req, res) => {
  try {
    const data = await readJsonFile(KYC_RISK_ASSESSMENT_PATH);
    const vendors = data.vendors || [];

    const enrichedVendors = vendors.map(v => {
      const rf = v.riskFactors || {};
      const score = (rf.financialStability || 0) +
                    (rf.complianceHistory || 0) +
                    (rf.litigationRecords || 0) +
                    (rf.contractValue || 0) +
                    (rf.businessCriticality || 0) +
                    (rf.geographyRisk || 0);
      
      let level = 'Low';
      if (score > 60) level = 'High';
      else if (score > 30) level = 'Medium';

      // Determine reviews due
      const nextReview = new Date(v.nextReviewDate);
      const today = new Date("2026-06-01");
      const diffTime = nextReview - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const reviewDue = diffDays >= 0 && diffDays <= 30;

      // Dynamic Alerts
      const alerts = [];
      if (score > 80) {
        alerts.push({
          type: 'Critical Exposure',
          message: `Risk score (${score}) exceeds critical tolerance threshold of 80.`,
          severity: 'critical',
          timestamp: new Date().toISOString()
        });
      } else if (score > 60) {
        alerts.push({
          type: 'High Risk',
          message: `High vendor risk score (${score}) detected.`,
          severity: 'high',
          timestamp: new Date().toISOString()
        });
      }

      if (reviewDue) {
        alerts.push({
          type: 'Review Due',
          message: `Next assessment review is scheduled for ${v.nextReviewDate} (due in ${diffDays} days).`,
          severity: 'medium',
          timestamp: new Date().toISOString()
        });
      }

      if (rf.complianceHistory > 15) {
        alerts.push({
          type: 'Compliance Breach',
          message: 'Severe historical regulatory compliance violations detected.',
          severity: 'high',
          timestamp: new Date().toISOString()
        });
      }

      if (rf.litigationRecords > 10) {
        alerts.push({
          type: 'Litigation Added',
          message: 'Significant legal disputes and active court proceedings identified.',
          severity: 'high',
          timestamp: new Date().toISOString()
        });
      }

      if (rf.financialStability > 12) {
        alerts.push({
          type: 'Financial Deterioration',
          message: 'Weakening credit ratings, high debt ratio, or profitability concerns.',
          severity: 'high',
          timestamp: new Date().toISOString()
        });
      }

      return {
        ...v,
        riskScore: score,
        riskLevel: level,
        alerts
      };
    });

    res.json({ vendors: enrichedVendors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/kyc/risk/:id
app.get('/api/kyc/risk/:id', async (req, res) => {
  try {
    const data = await readJsonFile(KYC_RISK_ASSESSMENT_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor Risk Assessment profile not found' });
    }

    const rf = vendor.riskFactors || {};
    const score = (rf.financialStability || 0) +
                  (rf.complianceHistory || 0) +
                  (rf.litigationRecords || 0) +
                  (rf.contractValue || 0) +
                  (rf.businessCriticality || 0) +
                  (rf.geographyRisk || 0);
    
    let level = 'Low';
    if (score > 60) level = 'High';
    else if (score > 30) level = 'Medium';

    const nextReview = new Date(vendor.nextReviewDate);
    const today = new Date("2026-06-01");
    const diffTime = nextReview - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const reviewDue = diffDays >= 0 && diffDays <= 30;

    const alerts = [];
    if (score > 80) {
      alerts.push({
        type: 'Critical Exposure',
        message: `Risk score (${score}) exceeds critical tolerance threshold of 80.`,
        severity: 'critical',
        timestamp: new Date().toISOString()
      });
    } else if (score > 60) {
      alerts.push({
        type: 'High Risk',
        message: `High vendor risk score (${score}) detected.`,
        severity: 'high',
        timestamp: new Date().toISOString()
      });
    }

    if (reviewDue) {
      alerts.push({
        type: 'Review Due',
        message: `Next assessment review is scheduled for ${vendor.nextReviewDate} (due in ${diffDays} days).`,
        severity: 'medium',
        timestamp: new Date().toISOString()
      });
    }

    if (rf.complianceHistory > 15) {
      alerts.push({
        type: 'Compliance Breach',
        message: 'Severe historical regulatory compliance violations detected.',
        severity: 'high',
        timestamp: new Date().toISOString()
      });
    }

    if (rf.litigationRecords > 10) {
      alerts.push({
        type: 'Litigation Added',
        message: 'Significant legal disputes and active court proceedings identified.',
        severity: 'high',
        timestamp: new Date().toISOString()
      });
    }

    if (rf.financialStability > 12) {
      alerts.push({
        type: 'Financial Deterioration',
        message: 'Weakening credit ratings, high debt ratio, or profitability concerns.',
        severity: 'high',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      ...vendor,
      riskScore: score,
      riskLevel: level,
      alerts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/risk/assess
app.post('/api/kyc/risk/assess', async (req, res) => {
  try {
    const { vendorId, riskFactors, comments, performedBy } = req.body;
    const data = await readJsonFile(KYC_RISK_ASSESSMENT_PATH);
    const vendors = data.vendors || [];
    const vendorIndex = vendors.findIndex(v => v.vendorId === vendorId);

    if (vendorIndex === -1) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const vendor = vendors[vendorIndex];
    vendor.riskFactors = {
      financialStability: Number(riskFactors.financialStability || 0),
      complianceHistory: Number(riskFactors.complianceHistory || 0),
      litigationRecords: Number(riskFactors.litigationRecords || 0),
      contractValue: Number(riskFactors.contractValue || 0),
      businessCriticality: Number(riskFactors.businessCriticality || 0),
      geographyRisk: Number(riskFactors.geographyRisk || 0)
    };

    const rf = vendor.riskFactors;
    const score = rf.financialStability + rf.complianceHistory + rf.litigationRecords + rf.contractValue + rf.businessCriticality + rf.geographyRisk;
    let level = 'Low';
    if (score > 60) level = 'High';
    else if (score > 30) level = 'Medium';

    vendor.riskScore = score;
    vendor.riskLevel = level;
    vendor.lastAssessmentDate = new Date("2026-06-01").toISOString().split('T')[0];

    const userName = performedBy || 'Saurabh Anand';
    const auditEntry = {
      assessedBy: userName,
      action: 'Risk Assessed/Updated',
      comments: comments || `Risk factors adjusted. Calculated risk score: ${score} (${level} Risk).`,
      timestamp: new Date().toISOString()
    };
    if (!vendor.assessmentHistory) vendor.assessmentHistory = [];
    vendor.assessmentHistory.push(auditEntry);

    // Write back
    await writeJsonFile(KYC_RISK_ASSESSMENT_PATH, data);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/risk/workflow
app.post('/api/kyc/risk/workflow', async (req, res) => {
  try {
    const { vendorId, stage, action, comment, performedBy } = req.body;
    const data = await readJsonFile(KYC_RISK_ASSESSMENT_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === vendorId);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (!vendor.workflow) {
      vendor.workflow = {
        analyst: 'Pending',
        complianceManager: 'Pending',
        legalTeam: 'Pending',
        procurementHead: 'Pending',
        final: 'Pending'
      };
    }

    vendor.workflow[stage] = action;

    const userName = performedBy || 'Saurabh Anand';
    const auditEntry = {
      assessedBy: userName,
      action: `${stage.toUpperCase()} Review: ${action}`,
      comments: comment || `${stage.toUpperCase()} transitioned workflow to ${action}.`,
      timestamp: new Date().toISOString()
    };
    if (!vendor.assessmentHistory) vendor.assessmentHistory = [];
    vendor.assessmentHistory.push(auditEntry);

    // If final reviewer rejects or approves, set status
    if (stage === 'final') {
      if (action === 'Approved') {
        vendor.status = 'Approved';
      } else if (action === 'Rejected') {
        vendor.status = 'Rejected';
      } else if (action === 'Sent Back') {
        vendor.status = 'Under Review';
      } else {
        vendor.status = 'Pending';
      }
    } else {
      // If any stage rejects or sends back, set status accordingly
      if (action === 'Rejected') {
        vendor.status = 'Rejected';
      } else if (action === 'Sent Back') {
        vendor.status = 'Under Review';
      } else if (vendor.status === 'Approved' && action !== 'Approved') {
        vendor.status = 'Under Review';
      }
    }

    await writeJsonFile(KYC_RISK_ASSESSMENT_PATH, data);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Configure Multer for Sanctions Screening evidence uploads
const sanctionsStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(SANCTIONS_UPLOADS_DIR, { recursive: true });
      cb(null, SANCTIONS_UPLOADS_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'SANCTIONS-' + uniqueSuffix + ext);
  }
});
const sanctionsUpload = multer({ storage: sanctionsStorage });

// GET /api/kyc/sanctions
app.get('/api/kyc/sanctions', async (req, res) => {
  try {
    const data = await readJsonFile(KYC_SANCTIONS_SCREENING_PATH);
    const vendors = data.vendors || [];

    const enrichedVendors = vendors.map(v => {
      const score = Number(v.matchScore || 0);
      let status = 'Cleared';
      if (score >= 81) status = 'Blocked';
      else if (score >= 1) status = 'Under Review';

      const nextScreen = new Date(v.nextScreeningDate);
      const today = new Date("2026-06-01");
      const diffTime = nextScreen - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const screenDue = diffDays >= 0 && diffDays <= 30;

      const alerts = [];
      if (score >= 81) {
        alerts.push({
          type: 'Sanctions Match Found',
          message: `Confirmed sanctions match detected. Score: ${score}/100.`,
          severity: 'critical'
        });
        alerts.push({
          type: 'Vendor Blocked',
          message: 'Entity has been placed in Blocked status.',
          severity: 'critical'
        });
      } else if (score > 50) {
        alerts.push({
          type: 'Potential Match Found',
          message: `Potential sanctions match found. Score: ${score}/100. Investigation required.`,
          severity: 'high'
        });
      }

      if (screenDue) {
        alerts.push({
          type: 'Rescreening Due',
          message: `Periodic screening check due in ${diffDays} days.`,
          severity: 'medium'
        });
      }

      return {
        ...v,
        screeningStatus: status,
        alerts
      };
    });

    res.json({ vendors: enrichedVendors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/kyc/sanctions/:id
app.get('/api/kyc/sanctions/:id', async (req, res) => {
  try {
    const data = await readJsonFile(KYC_SANCTIONS_SCREENING_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor sanctions screening profile not found' });
    }

    const score = Number(vendor.matchScore || 0);
    let status = 'Cleared';
    if (score >= 81) status = 'Blocked';
    else if (score >= 1) status = 'Under Review';

    res.json({
      ...vendor,
      screeningStatus: status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/sanctions/screen
app.post('/api/kyc/sanctions/screen', async (req, res) => {
  try {
    const { vendorId, screeningResult, matchScore, comments, performedBy } = req.body;
    const data = await readJsonFile(KYC_SANCTIONS_SCREENING_PATH);
    const vendors = data.vendors || [];
    const idx = vendors.findIndex(v => v.vendorId === vendorId);

    if (idx === -1) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const vendor = vendors[idx];
    vendor.screeningResult = {
      unList: screeningResult.unList || 'No Match',
      ofacList: screeningResult.ofacList || 'No Match',
      euList: screeningResult.euList || 'No Match',
      rbiRestricted: screeningResult.rbiRestricted || 'No Match',
      sebiBlacklist: screeningResult.sebiBlacklist || 'No Match'
    };
    vendor.matchScore = Number(matchScore || 0);

    let status = 'Cleared';
    if (vendor.matchScore >= 81) status = 'Blocked';
    else if (vendor.matchScore >= 1) status = 'Under Review';
    vendor.screeningStatus = status;
    vendor.lastScreenedOn = new Date("2026-06-01").toISOString().split('T')[0];

    const audit = {
      screenedBy: performedBy || 'Saurabh Anand',
      screeningDate: new Date("2026-06-01").toISOString().split('T')[0],
      result: status,
      comments: comments || `Screening adjusted. Watchlists re-evaluated. Match Score: ${vendor.matchScore}%`
    };
    if (!vendor.screeningHistory) vendor.screeningHistory = [];
    vendor.screeningHistory.push(audit);

    await writeJsonFile(KYC_SANCTIONS_SCREENING_PATH, data);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/sanctions/workflow
app.post('/api/kyc/sanctions/workflow', async (req, res) => {
  try {
    const { vendorId, stage, action, comment, performedBy } = req.body;
    const data = await readJsonFile(KYC_SANCTIONS_SCREENING_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === vendorId);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    if (!vendor.workflow) {
      vendor.workflow = {
        analyst: 'Pending',
        complianceManager: 'Pending',
        legalTeam: 'Pending',
        procurementHead: 'Pending',
        final: 'Pending'
      };
    }

    vendor.workflow[stage] = action;

    const audit = {
      screenedBy: performedBy || 'Saurabh Anand',
      screeningDate: new Date("2026-06-01").toISOString().split('T')[0],
      result: action,
      comments: comment || `${stage.toUpperCase()} transitioned workflow to ${action}.`
    };
    if (!vendor.screeningHistory) vendor.screeningHistory = [];
    vendor.screeningHistory.push(audit);

    // If final reviewer transitions, update status
    if (stage === 'final') {
      if (action === 'Approved') {
        vendor.status = 'Approved';
        vendor.screeningStatus = 'Cleared';
        vendor.matchScore = 0;
      } else if (action === 'Rejected' || action === 'Blocked') {
        vendor.status = 'Rejected';
        vendor.screeningStatus = 'Blocked';
      } else if (action === 'Sent Back') {
        vendor.status = 'Under Review';
        vendor.screeningStatus = 'Under Review';
      }
    } else {
      if (action === 'Rejected' || action === 'Blocked') {
        vendor.status = 'Rejected';
        vendor.screeningStatus = 'Blocked';
      } else if (action === 'Sent Back') {
        vendor.status = 'Under Review';
        vendor.screeningStatus = 'Under Review';
      }
    }

    await writeJsonFile(KYC_SANCTIONS_SCREENING_PATH, data);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/sanctions/upload
app.post('/api/kyc/sanctions/upload', sanctionsUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const { uploadedBy } = req.body;
    
    const fileMetadata = {
      fileId: `SAN-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90) + 10}`,
      fileName: req.file.originalname,
      filePath: `/uploads/kyc/sanctions/${req.file.filename}`,
      uploadedBy: uploadedBy || 'Saurabh Anand',
      uploadedOn: new Date().toISOString().split('T')[0]
    };

    res.json({
      success: true,
      file: fileMetadata
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/sanctions/attach-file
app.post('/api/kyc/sanctions/attach-file', async (req, res) => {
  try {
    const { vendorId, fileMetadata } = req.body;
    const data = await readJsonFile(KYC_SANCTIONS_SCREENING_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === vendorId);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    if (!vendor.evidenceFiles) vendor.evidenceFiles = [];
    vendor.evidenceFiles.push(fileMetadata);
    
    await writeJsonFile(KYC_SANCTIONS_SCREENING_PATH, data);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Configure Multer for Blacklist Check evidence uploads
const blacklistStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(BLACKLIST_UPLOADS_DIR, { recursive: true });
      cb(null, BLACKLIST_UPLOADS_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'BLACKLIST-' + uniqueSuffix + ext);
  }
});
const blacklistUpload = multer({ storage: blacklistStorage });

// GET /api/kyc/blacklist
app.get('/api/kyc/blacklist', async (req, res) => {
  try {
    const data = await readJsonFile(KYC_BLACKLIST_CHECK_PATH);
    const vendors = data.vendors || [];
    const today = new Date("2026-06-01");

    const enrichedVendors = vendors.map(v => {
      let status = v.blacklistStatus || 'Clear';
      
      // Blacklist Expiry Logic: if blacklistedTill is past today (2026-06-01), auto-change to 'Under Review'
      if (status === 'Blacklisted' && v.blacklistedTill) {
        const tillDate = new Date(v.blacklistedTill);
        if (today > tillDate) {
          status = 'Under Review';
        }
      }

      const nextReview = new Date(v.nextReviewDate);
      const diffTime = nextReview - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const reviewDue = diffDays >= 0 && diffDays <= 30;

      const alerts = [];
      if (status === 'Blacklisted') {
        alerts.push({
          type: 'Vendor Blacklisted',
          message: `Confirmed blacklist matches found. Reason: ${v.reason || 'N/A'}. Transactions Restricted.`,
          severity: 'critical'
        });
      } else if (status === 'Under Review') {
        if (v.blacklistedTill && today > new Date(v.blacklistedTill)) {
          alerts.push({
            type: 'Blacklist Expiry Approaching',
            message: `Debarment expired on ${v.blacklistedTill}. Reinstatement or extension required.`,
            severity: 'high'
          });
        }
        alerts.push({
          type: 'Compliance Review Pending',
          message: 'Potential debarment flags require compliance analysis.',
          severity: 'high'
        });
      }

      if (v.blacklistChecks?.governmentDebarred === 'Match Found') {
        alerts.push({
          type: 'Government Debarment Found',
          message: 'Entity identified on Government debarment registries.',
          severity: 'critical'
        });
      }
      if (v.blacklistChecks?.industryWatchlist === 'Match Found') {
        alerts.push({
          type: 'Industry Watchlist Match',
          message: 'Identified on industry regulatory warning lists.',
          severity: 'high'
        });
      }

      if (reviewDue) {
        alerts.push({
          type: 'Review Due',
          message: `Blacklist validation schedule due in ${diffDays} days.`,
          severity: 'medium'
        });
      }

      return {
        ...v,
        blacklistStatus: status,
        alerts
      };
    });

    res.json({ vendors: enrichedVendors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/kyc/blacklist/:id
app.get('/api/kyc/blacklist/:id', async (req, res) => {
  try {
    const data = await readJsonFile(KYC_BLACKLIST_CHECK_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor blacklist profile not found' });
    }

    let status = vendor.blacklistStatus || 'Clear';
    const today = new Date("2026-06-01");
    if (status === 'Blacklisted' && vendor.blacklistedTill) {
      const tillDate = new Date(vendor.blacklistedTill);
      if (today > tillDate) {
        status = 'Under Review';
      }
    }

    res.json({
      ...vendor,
      blacklistStatus: status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/blacklist/check
app.post('/api/kyc/blacklist/check', async (req, res) => {
  try {
    const { vendorId, blacklistChecks, blacklistStatus, reason, blacklistedTill, nextReviewDate, comments, performedBy } = req.body;
    const data = await readJsonFile(KYC_BLACKLIST_CHECK_PATH);
    const vendors = data.vendors || [];
    const idx = vendors.findIndex(v => v.vendorId === vendorId);

    if (idx === -1) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const vendor = vendors[idx];
    vendor.blacklistChecks = {
      internalBlacklist: blacklistChecks.internalBlacklist || 'No Match',
      governmentDebarred: blacklistChecks.governmentDebarred || 'No Match',
      industryWatchlist: blacklistChecks.industryWatchlist || 'No Match'
    };
    vendor.blacklistStatus = blacklistStatus;
    vendor.reason = reason || null;
    vendor.blacklistedTill = blacklistedTill || null;
    vendor.nextReviewDate = nextReviewDate || vendor.nextReviewDate;
    vendor.checkedOn = new Date("2026-06-01").toISOString().split('T')[0];

    const audit = {
      actionDate: new Date("2026-06-01").toISOString().split('T')[0],
      action: blacklistStatus === 'Clear' ? 'Cleared' : blacklistStatus,
      reason: comments || `Debarment criteria re-screened. Set status to ${blacklistStatus}. Reason: ${reason || 'None'}`,
      performedBy: performedBy || 'Saurabh Anand'
    };
    if (!vendor.blacklistHistory) vendor.blacklistHistory = [];
    vendor.blacklistHistory.push(audit);

    await writeJsonFile(KYC_BLACKLIST_CHECK_PATH, data);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/blacklist/workflow
app.post('/api/kyc/blacklist/workflow', async (req, res) => {
  try {
    const { vendorId, stage, action, comment, performedBy } = req.body;
    const data = await readJsonFile(KYC_BLACKLIST_CHECK_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === vendorId);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    if (!vendor.workflow) {
      vendor.workflow = {
        analyst: 'Pending',
        complianceManager: 'Pending',
        procurementHead: 'Pending',
        legalTeam: 'Pending',
        final: 'Pending'
      };
    }

    vendor.workflow[stage] = action;

    const audit = {
      actionDate: new Date("2026-06-01").toISOString().split('T')[0],
      action: action,
      reason: comment || `${stage.toUpperCase()} transitioned workflow to ${action}.`,
      performedBy: performedBy || 'Saurabh Anand'
    };
    if (!vendor.blacklistHistory) vendor.blacklistHistory = [];
    vendor.blacklistHistory.push(audit);

    // If final decision review transitions
    if (stage === 'final') {
      if (action === 'Reinstated' || action === 'Approved') {
        vendor.blacklistStatus = 'Clear';
        vendor.status = 'Approved';
        vendor.reason = null;
        vendor.blacklistedTill = null;
        vendor.blacklistChecks = {
          internalBlacklist: 'No Match',
          governmentDebarred: 'No Match',
          industryWatchlist: 'No Match'
        };
      } else if (action === 'Blacklisted' || action === 'Rejected') {
        vendor.blacklistStatus = 'Blacklisted';
        vendor.status = 'Rejected';
      } else if (action === 'Sent Back') {
        vendor.blacklistStatus = 'Under Review';
        vendor.status = 'Under Review';
      }
    } else {
      if (action === 'Rejected' || action === 'Blacklisted') {
        vendor.blacklistStatus = 'Blacklisted';
        vendor.status = 'Rejected';
      } else if (action === 'Sent Back') {
        vendor.blacklistStatus = 'Under Review';
        vendor.status = 'Under Review';
      }
    }

    await writeJsonFile(KYC_BLACKLIST_CHECK_PATH, data);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/blacklist/upload
app.post('/api/kyc/blacklist/upload', blacklistUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const { uploadedBy } = req.body;
    
    const fileMetadata = {
      fileId: `BLK-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90) + 10}`,
      fileName: req.file.originalname,
      filePath: `/uploads/kyc/blacklist/${req.file.filename}`,
      uploadedBy: uploadedBy || 'Saurabh Anand',
      uploadedOn: new Date().toISOString().split('T')[0]
    };

    res.json({
      success: true,
      file: fileMetadata
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/blacklist/attach-file
app.post('/api/kyc/blacklist/attach-file', async (req, res) => {
  try {
    const { vendorId, fileMetadata } = req.body;
    const data = await readJsonFile(KYC_BLACKLIST_CHECK_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === vendorId);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    if (!vendor.evidenceFiles) vendor.evidenceFiles = [];
    vendor.evidenceFiles.push(fileMetadata);
    
    await writeJsonFile(KYC_BLACKLIST_CHECK_PATH, data);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Configure Multer for PEP Check evidence uploads
const pepStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(PEP_UPLOADS_DIR, { recursive: true });
      cb(null, PEP_UPLOADS_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'PEP-' + uniqueSuffix + ext);
  }
});
const pepUpload = multer({ storage: pepStorage });

// GET /api/kyc/pep
app.get('/api/kyc/pep', async (req, res) => {
  try {
    const data = await readJsonFile(KYC_PEP_SCREENING_PATH);
    const vendors = data.vendors || [];
    const today = new Date("2026-06-01");
    
    const sanitizedVendors = vendors.map(v => {
      const alerts = [];
      const status = v.overallStatus || 'Cleared';
      
      if (status === 'PEP Identified') {
        alerts.push({
          type: 'PEP Match Found',
          message: `Politically Exposed Person Identified – Enhanced Due Diligence Required.`,
          severity: 'critical'
        });
      } else if (status === 'Under Review') {
        alerts.push({
          type: 'Potential Match Found',
          message: `Potential PEP Match under compliance investigation.`,
          severity: 'high'
        });
      }
      
      if (v.dueDiligenceLevel === 'Enhanced Due Diligence' || v.dueDiligenceLevel === 'Executive Approval Required') {
        alerts.push({
          type: 'EDD Required',
          message: `Enhanced Due Diligence review required for ${v.vendorName}.`,
          severity: 'high'
        });
      }
      
      if (v.nextReviewDate) {
        const nextReview = new Date(v.nextReviewDate);
        const diffTime = nextReview.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 30) {
          alerts.push({
            type: 'Review Due',
            message: `PEP screening schedule review due in ${diffDays} days.`,
            severity: 'medium'
          });
        }
      }
      
      // Foreign PEP check
      const sr = v.screeningResults || {};
      const foreignPepFound = 
        (sr.directorScreening?.pepCategory === 'Foreign Government Official' && sr.directorScreening?.pepMatch === 'Confirmed') ||
        (sr.beneficialOwnerScreening?.pepCategory === 'Foreign Government Official' && sr.beneficialOwnerScreening?.pepMatch === 'Confirmed') ||
        (sr.shareholderScreening?.pepCategory === 'Foreign Government Official' && sr.shareholderScreening?.pepMatch === 'Confirmed');
        
      if (foreignPepFound) {
        alerts.push({
          type: 'Foreign PEP Detected',
          message: `Critical: Foreign Politically Exposed Person detected in ownership structure.`,
          severity: 'critical'
        });
      }
      
      // Executive Approval Pending
      if (v.workflow?.executiveApproval === 'Pending' && v.dueDiligenceLevel === 'Executive Approval Required') {
        alerts.push({
          type: 'Executive Approval Pending',
          message: `Executive board level approval pending for high-risk political exposure.`,
          severity: 'critical'
        });
      }
      
      return {
        ...v,
        alerts
      };
    });
    
    res.json({ success: true, vendors: sanitizedVendors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/kyc/pep/:id
app.get('/api/kyc/pep/:id', async (req, res) => {
  try {
    const data = await readJsonFile(KYC_PEP_SCREENING_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor PEP profile not found' });
    }
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/pep/screen
app.post('/api/kyc/pep/screen', async (req, res) => {
  try {
    const { 
      vendorId, 
      screeningResults, 
      overallStatus, 
      dueDiligenceLevel, 
      nextReviewDate,
      comments,
      eddRecords,
      performedBy
    } = req.body;
    
    const data = await readJsonFile(KYC_PEP_SCREENING_PATH);
    const vendors = data.vendors || [];
    const vendorIndex = vendors.findIndex(v => v.vendorId === vendorId);
    
    if (vendorIndex === -1) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    const vendor = vendors[vendorIndex];
    
    vendor.screeningResults = screeningResults;
    vendor.overallStatus = overallStatus;
    vendor.dueDiligenceLevel = dueDiligenceLevel;
    if (nextReviewDate) vendor.nextReviewDate = nextReviewDate;
    if (eddRecords) vendor.eddRecords = eddRecords;
    
    const audit = {
      screeningDate: new Date().toISOString().split('T')[0],
      screenedBy: performedBy || 'Compliance Analyst',
      result: overallStatus,
      remarks: comments || `PEP Screening results updated. Status: ${overallStatus}. DD Level: ${dueDiligenceLevel}.`,
      actionTaken: overallStatus === 'PEP Identified' ? 'EDD Initiated' : 'Screening Updated'
    };
    
    if (!vendor.pepHistory) vendor.pepHistory = [];
    vendor.pepHistory.push(audit);
    
    await writeJsonFile(KYC_PEP_SCREENING_PATH, data);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/pep/workflow
app.post('/api/kyc/pep/workflow', async (req, res) => {
  try {
    const { vendorId, stage, action, comment, performedBy } = req.body;
    const data = await readJsonFile(KYC_PEP_SCREENING_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === vendorId);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    if (!vendor.workflow) {
      vendor.workflow = {
        analyst: 'Pending',
        complianceManager: 'Pending',
        riskOfficer: 'Pending',
        procurementHead: 'Pending',
        executiveApproval: 'Pending',
        final: 'Pending'
      };
    }
    
    vendor.workflow[stage] = action;
    
    if (stage === 'final') {
      if (action === 'Approved') {
        vendor.overallStatus = 'Cleared';
        vendor.dueDiligenceLevel = 'Standard Due Diligence';
      } else if (action === 'Rejected') {
        vendor.overallStatus = 'PEP Identified';
      }
    }
    
    const audit = {
      screeningDate: new Date().toISOString().split('T')[0],
      screenedBy: performedBy || 'Compliance Officer',
      result: `Workflow: ${stage}`,
      remarks: `Stage [${stage}] updated to [${action}]. Comments: ${comment || 'None'}.`,
      actionTaken: action
    };
    
    if (!vendor.pepHistory) vendor.pepHistory = [];
    vendor.pepHistory.push(audit);
    
    await writeJsonFile(KYC_PEP_SCREENING_PATH, data);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/pep/upload
app.post('/api/kyc/pep/upload', pepUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const { uploadedBy } = req.body;
    
    const fileMetadata = {
      fileId: `PEP-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90) + 10}`,
      fileName: req.file.originalname,
      filePath: `/uploads/kyc/pep/${req.file.filename}`,
      uploadedBy: uploadedBy || 'Saurabh Anand',
      uploadedOn: new Date().toISOString().split('T')[0]
    };

    res.json({
      success: true,
      file: fileMetadata
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/pep/attach-file
app.post('/api/kyc/pep/attach-file', async (req, res) => {
  try {
    const { vendorId, fileMetadata } = req.body;
    const data = await readJsonFile(KYC_PEP_SCREENING_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === vendorId);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    if (!vendor.evidenceFiles) vendor.evidenceFiles = [];
    vendor.evidenceFiles.push(fileMetadata);
    
    await writeJsonFile(KYC_PEP_SCREENING_PATH, data);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Configure Multer for Adverse Media Screening evidence uploads
const mediaStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(ADVERSE_MEDIA_UPLOADS_DIR, { recursive: true });
      cb(null, ADVERSE_MEDIA_UPLOADS_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'MEDIA-' + uniqueSuffix + ext);
  }
});
const mediaUpload = multer({ storage: mediaStorage });

// GET /api/kyc/media
app.get('/api/kyc/media', async (req, res) => {
  try {
    const data = await readJsonFile(KYC_ADVERSE_MEDIA_PATH);
    const vendors = data.vendors || [];
    const today = new Date("2026-06-01");

    const sanitizedVendors = vendors.map(v => {
      const alerts = [];
      const findings = v.mediaFindings || [];

      if (findings.length > 0) {
        alerts.push({
          type: 'New Adverse Media Found',
          message: `${findings.length} adverse media incidents detected for ${v.vendorName}.`,
          severity: 'high'
        });
      }

      const openFraud = findings.some(f => f.incidentType === 'Fraud' && f.status === 'Open');
      if (openFraud) {
        alerts.push({
          type: 'Fraud Investigation Detected',
          message: `Active corporate fraud or financial accounting investigation identified.`,
          severity: 'critical'
        });
      }

      const openCyber = findings.some(f => f.incidentType === 'Cyber Crime');
      if (openCyber) {
        alerts.push({
          type: 'Cyber Security Incident',
          message: `Cyber data leak or security breach incident reported.`,
          severity: 'high'
        });
      }

      const openReg = findings.some(f => f.incidentType === 'Regulatory Violation');
      if (openReg) {
        alerts.push({
          type: 'Regulatory Violation Reported',
          message: `Environmental, labor law, or regulatory fine investigations reported.`,
          severity: 'medium'
        });
      }

      const openBank = findings.some(f => f.incidentType === 'Bankruptcy' && f.status === 'Open');
      if (openBank) {
        alerts.push({
          type: 'Bankruptcy Filing Detected',
          message: `Critical: Corporate bankruptcy filing or insolvency proceedings detected.`,
          severity: 'critical'
        });
      }

      if (v.mediaRiskScore > 60) {
        alerts.push({
          type: 'Risk Level Increased',
          message: `Vendor media risk score (${v.mediaRiskScore}) is elevated to High Risk.`,
          severity: 'critical'
        });
      }

      if (v.nextReviewDate) {
        const nextReview = new Date(v.nextReviewDate);
        const diffTime = nextReview.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 30) {
          alerts.push({
            type: 'Review Due',
            message: `Adverse news screening review scheduled due in ${diffDays} days.`,
            severity: 'medium'
          });
        }
      }

      return {
        ...v,
        alerts
      };
    });

    res.json({ success: true, vendors: sanitizedVendors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/kyc/media/:id
app.get('/api/kyc/media/:id', async (req, res) => {
  try {
    const data = await readJsonFile(KYC_ADVERSE_MEDIA_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor adverse media profile not found' });
    }
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/media/incident
app.post('/api/kyc/media/incident', async (req, res) => {
  try {
    const { vendorId, incidents, nextReviewDate, comments, performedBy } = req.body;
    const data = await readJsonFile(KYC_ADVERSE_MEDIA_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === vendorId);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Save incidents
    vendor.mediaFindings = incidents || [];
    if (nextReviewDate) vendor.nextReviewDate = nextReviewDate;

    // Recalculate score based on business rules
    let score = 0;
    vendor.mediaFindings.forEach(inc => {
      const type = inc.incidentType;
      const status = inc.status;

      let incScore = 0;
      if (type === 'Fraud') incScore += 30;
      else if (type === 'Corruption') incScore += 35;
      else if (type === 'Cyber Crime') incScore += 25;
      else if (type === 'Regulatory Violation') incScore += 20;
      else if (type === 'Bankruptcy') incScore += 40;

      if (status === 'Resolved' || status === 'Closed') {
        incScore -= 10;
      }

      score += incScore;
    });

    score = Math.max(0, Math.min(100, score));
    vendor.mediaRiskScore = score;

    // Recalculate Risk Level
    if (score <= 30) {
      vendor.riskLevel = 'Low';
      vendor.screeningStatus = 'Cleared';
    } else if (score <= 60) {
      vendor.riskLevel = 'Medium';
      vendor.screeningStatus = 'Alert';
    } else {
      vendor.riskLevel = 'High';
      vendor.screeningStatus = 'Alert';
    }

    // Add audit entry
    const audit = {
      incidentDate: new Date().toISOString().split('T')[0],
      incidentType: comments || 'Screening Checkup',
      severity: vendor.riskLevel,
      recordedBy: performedBy || 'Compliance Analyst',
      actionTaken: vendor.riskLevel === 'Low' ? 'Resolved & Cleared' : 'Enhanced Monitoring Initiated',
      remarks: `Incidents list re-screened. Computed media risk score: ${score} (${vendor.riskLevel}).`
    };

    if (!vendor.mediaHistory) vendor.mediaHistory = [];
    vendor.mediaHistory.push(audit);

    await writeJsonFile(KYC_ADVERSE_MEDIA_PATH, data);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/media/workflow
app.post('/api/kyc/media/workflow', async (req, res) => {
  try {
    const { vendorId, stage, action, comment, performedBy } = req.body;
    const data = await readJsonFile(KYC_ADVERSE_MEDIA_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === vendorId);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (!vendor.workflow) {
      vendor.workflow = {
        analyst: 'Pending',
        riskManager: 'Pending',
        legalTeam: 'Pending',
        procurementHead: 'Pending',
        executiveReview: 'Pending',
        final: 'Pending'
      };
    }

    vendor.workflow[stage] = action;

    if (stage === 'final') {
      if (action === 'Approved') {
        vendor.screeningStatus = 'Cleared';
        vendor.riskLevel = 'Low';
        vendor.mediaRiskScore = Math.min(30, vendor.mediaRiskScore);
      } else if (action === 'Rejected') {
        vendor.screeningStatus = 'Blocked';
      }
    }

    const audit = {
      incidentDate: new Date().toISOString().split('T')[0],
      incidentType: `Workflow: ${stage}`,
      severity: vendor.riskLevel,
      recordedBy: performedBy || 'Compliance Officer',
      actionTaken: action,
      remarks: `Approval workflow stage [${stage}] set to [${action}]. Comment: ${comment || 'None'}.`
    };

    if (!vendor.mediaHistory) vendor.mediaHistory = [];
    vendor.mediaHistory.push(audit);

    await writeJsonFile(KYC_ADVERSE_MEDIA_PATH, data);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/media/upload
app.post('/api/kyc/media/upload', mediaUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { uploadedBy } = req.body;

    const fileMetadata = {
      fileId: `MEDIA-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90) + 10}`,
      fileName: req.file.originalname,
      filePath: `/uploads/kyc/adverse-media/${req.file.filename}`,
      uploadedBy: uploadedBy || 'Saurabh Anand',
      uploadedOn: new Date().toISOString().split('T')[0]
    };

    res.json({
      success: true,
      file: fileMetadata
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/media/attach-file
app.post('/api/kyc/media/attach-file', async (req, res) => {
  try {
    const { vendorId, fileMetadata } = req.body;
    const data = await readJsonFile(KYC_ADVERSE_MEDIA_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === vendorId);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (!vendor.evidenceFiles) vendor.evidenceFiles = [];
    vendor.evidenceFiles.push(fileMetadata);

    await writeJsonFile(KYC_ADVERSE_MEDIA_PATH, data);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Multer storage for Shell Company Check evidence uploads
const shellStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(SHELL_COMPANY_UPLOADS_DIR, { recursive: true });
      cb(null, SHELL_COMPANY_UPLOADS_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'SHELL-' + uniqueSuffix + ext);
  }
});
const shellUpload = multer({ storage: shellStorage });

// GET /api/kyc/shell
app.get('/api/kyc/shell', async (req, res) => {
  try {
    const data = await readJsonFile(KYC_SHELL_COMPANY_PATH);
    const vendors = data.vendors || [];

    // Dynamically calculate warnings and alerts for each vendor
    const enrichedVendors = vendors.map(vendor => {
      const alerts = [];
      const val = vendor.validations || {};

      if (vendor.shellRiskScore >= 81) {
        alerts.push({
          type: 'Potential Shell Company Detected',
          message: `🚫 Critical Risk: ${vendor.vendorName} exhibits multiple indicators of a shell company.`,
          severity: 'critical'
        });
      }

      if (val.physicalAddress && val.physicalAddress.status === 'Failed') {
        alerts.push({
          type: 'Address Shared by Multiple Companies',
          message: `⚠ Physical address is shared with ${val.physicalAddress.addressSharedWith || 0} other companies.`,
          severity: 'high'
        });
      }

      if (val.employeeCount && val.employeeCount.status === 'Failed' && val.employeeCount.employeeCount === 0) {
        alerts.push({
          type: 'No Employees Found',
          message: '⚠ Zero active payroll employees listed in workforce registries.',
          severity: 'high'
        });
      }

      if (val.websitePresence && val.websitePresence.status === 'Failed') {
        alerts.push({
          type: 'No Website Found',
          message: '⚠ No corporate website domain or active domain registry found.',
          severity: 'medium'
        });
      }

      if (val.financialFilings && (val.financialFilings.status === 'Missing' || val.financialFilings.status === 'Failed')) {
        alerts.push({
          type: 'Missing Financial Filings',
          message: '⚠ Financial filings or regulatory balances are missing or unfiled.',
          severity: 'medium'
        });
      }

      if (val.businessOperations && val.businessOperations.status === 'Unverified') {
        alerts.push({
          type: 'Business Operations Unverified',
          message: '⚠ Active customer reference checks or on-site delivery verification is pending.',
          severity: 'medium'
        });
      }

      // Check review due (within next 30 days)
      if (vendor.nextReviewDate) {
        const nextReview = new Date(vendor.nextReviewDate);
        const today = new Date("2026-06-01");
        const diffTime = nextReview.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 30) {
          alerts.push({
            type: 'Review Due',
            message: `🕒 Scheduled KYC Shell company screening review is due in ${diffDays} days.`,
            severity: 'medium'
          });
        }
      }

      // Check if workflow is pending final decision
      const wf = vendor.workflow || {};
      if (wf.final === 'Pending' || wf.final === 'Under Investigation') {
        alerts.push({
          type: 'Investigation Pending',
          message: '🕒 Enhanced shell company investigations and approvals are currently ongoing.',
          severity: 'medium'
        });
      }

      return {
        ...vendor,
        alerts
      };
    });

    res.json({ success: true, vendors: enrichedVendors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/kyc/shell/:id
app.get('/api/kyc/shell/:id', async (req, res) => {
  try {
    const data = await readJsonFile(KYC_SHELL_COMPANY_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Shell check profile not found' });
    }

    // Add alerts
    const alerts = [];
    const val = vendor.validations || {};

    if (vendor.shellRiskScore >= 81) {
      alerts.push({
        type: 'Potential Shell Company Detected',
        message: `🚫 Critical Risk: ${vendor.vendorName} exhibits multiple indicators of a shell company.`,
        severity: 'critical'
      });
    }
    if (val.physicalAddress && val.physicalAddress.status === 'Failed') {
      alerts.push({
        type: 'Address Shared by Multiple Companies',
        message: `Address shared with ${val.physicalAddress.addressSharedWith || 0} other entities.`,
        severity: 'high'
      });
    }
    if (val.employeeCount && val.employeeCount.status === 'Failed' && val.employeeCount.employeeCount === 0) {
      alerts.push({
        type: 'No Employees Found',
        message: 'Zero headcount listed in corporate payroll archives.',
        severity: 'high'
      });
    }
    if (val.websitePresence && val.websitePresence.status === 'Failed') {
      alerts.push({
        type: 'No Website Found',
        message: 'No active web host or domain matches found.',
        severity: 'medium'
      });
    }

    res.json({ ...vendor, alerts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/shell/check
app.post('/api/kyc/shell/check', async (req, res) => {
  try {
    const { vendorId, validations, nextReviewDate, comments, performedBy } = req.body;
    const data = await readJsonFile(KYC_SHELL_COMPANY_PATH);
    const vendors = data.vendors || [];
    const vendorIndex = vendors.findIndex(v => v.vendorId === vendorId);

    if (vendorIndex === -1) {
      return res.status(404).json({ message: 'Vendor shell profile not found' });
    }

    const vendor = vendors[vendorIndex];

    // Merge validations
    if (validations) {
      vendor.validations = {
        ...vendor.validations,
        ...validations
      };
    }

    // Recalculate score (Failures count +20 each)
    let score = 0;
    const val = vendor.validations || {};

    if (val.physicalAddress && val.physicalAddress.status === 'Failed') score += 20;
    if (val.employeeCount && val.employeeCount.status === 'Failed') score += 20;
    if (val.websitePresence && val.websitePresence.status === 'Failed') score += 20;
    if (val.financialFilings && (val.financialFilings.status === 'Failed' || val.financialFilings.status === 'Missing')) score += 20;
    if (val.businessOperations && (val.businessOperations.status === 'Failed' || val.businessOperations.status === 'Unverified')) score += 20;

    vendor.shellRiskScore = Math.min(score, 100);

    // Update riskLevel & shellCompanyStatus
    if (vendor.shellRiskScore <= 30) {
      vendor.riskLevel = 'Low';
      vendor.shellCompanyStatus = 'Verified';
    } else if (vendor.shellRiskScore <= 60) {
      vendor.riskLevel = 'Medium';
      vendor.shellCompanyStatus = 'Additional Verification Required';
    } else if (vendor.shellRiskScore <= 80) {
      vendor.riskLevel = 'High';
      vendor.shellCompanyStatus = 'High Risk';
    } else {
      vendor.riskLevel = 'Critical';
      vendor.shellCompanyStatus = 'Potential Shell Company';
    }

    if (nextReviewDate) {
      vendor.nextReviewDate = nextReviewDate;
    }
    vendor.lastCheckedOn = new Date().toISOString().split('T')[0];

    // Log history
    const audit = {
      assessmentDate: vendor.lastCheckedOn,
      performedBy: performedBy || 'Compliance Analyst',
      riskScore: vendor.shellRiskScore,
      result: vendor.shellCompanyStatus,
      actionTaken: vendor.shellRiskScore >= 81 ? 'Vendor Blocked' : 'Enhanced Due Diligence',
      remarks: comments || 'Validation checks updated.'
    };

    if (!vendor.assessmentHistory) vendor.assessmentHistory = [];
    vendor.assessmentHistory.push(audit);

    // Write file
    await writeJsonFile(KYC_SHELL_COMPANY_PATH, data);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/shell/workflow
app.post('/api/kyc/shell/workflow', async (req, res) => {
  try {
    const { vendorId, stage, action, comment, performedBy } = req.body;
    const data = await readJsonFile(KYC_SHELL_COMPANY_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === vendorId);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor shell profile not found' });
    }

    if (!vendor.workflow) vendor.workflow = {};
    vendor.workflow[stage] = action;

    // If final decision stage, propagate overall status
    if (stage === 'final') {
      if (action === 'Verified' || action === 'Closed') {
        vendor.shellCompanyStatus = 'Verified';
        vendor.riskLevel = 'Low';
        vendor.shellRiskScore = 0;
      } else if (action === 'Blocked' || action === 'Rejected') {
        vendor.shellCompanyStatus = 'Potential Shell Company';
        vendor.riskLevel = 'Critical';
      } else if (action === 'Under Investigation') {
        vendor.shellCompanyStatus = 'Additional Verification Required';
      }
    }

    // Log to history
    const audit = {
      assessmentDate: new Date().toISOString().split('T')[0],
      performedBy: performedBy || 'Compliance Manager',
      riskScore: vendor.shellRiskScore,
      result: `Workflow: ${stage}`,
      actionTaken: action,
      remarks: `Approval workflow stage [${stage}] updated to [${action}]. Comments: ${comment || 'None'}`
    };

    if (!vendor.assessmentHistory) vendor.assessmentHistory = [];
    vendor.assessmentHistory.push(audit);

    await writeJsonFile(KYC_SHELL_COMPANY_PATH, data);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/shell/upload
app.post('/api/kyc/shell/upload', shellUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { uploadedBy } = req.body;

    const fileMetadata = {
      fileId: `SHELL-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90) + 10}`,
      fileName: req.file.originalname,
      filePath: `/uploads/kyc/shell-company/${req.file.filename}`,
      uploadedBy: uploadedBy || 'Saurabh Anand',
      uploadedOn: new Date().toISOString().split('T')[0]
    };

    res.json({
      success: true,
      file: fileMetadata
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/shell/attach-file
app.post('/api/kyc/shell/attach-file', async (req, res) => {
  try {
    const { vendorId, fileMetadata } = req.body;
    const data = await readJsonFile(KYC_SHELL_COMPANY_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === vendorId);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor shell profile not found' });
    }

    if (!vendor.evidenceFiles) vendor.evidenceFiles = [];
    vendor.evidenceFiles.push(fileMetadata);

    await writeJsonFile(KYC_SHELL_COMPANY_PATH, data);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Multer configuration for Re-KYC uploads
const reKycStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(RE_KYC_UPLOADS_DIR, { recursive: true });
      cb(null, RE_KYC_UPLOADS_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'REKYC-' + uniqueSuffix + ext);
  }
});
const reKycUpload = multer({ storage: reKycStorage });

// Helper functions for Re-KYC calculations
const addYearsToDate = (dateStr, years) => {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().split('T')[0];
};

const calculateDaysRemaining = (nextDateStr) => {
  const nextDate = new Date(nextDateStr);
  const today = new Date("2026-06-01");
  const diffTime = nextDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// GET /api/kyc/rekyc
app.get('/api/kyc/rekyc', async (req, res) => {
  try {
    const data = await readJsonFile(KYC_RE_KYC_SCHEDULING_PATH);
    const vendors = data.vendors || [];

    // Process and enrich calculations for each vendor profile dynamically
    const enrichedVendors = vendors.map(vendor => {
      // 1. Calculate frequency
      let frequencyYears = 3; // Default low risk
      if (vendor.riskLevel === 'High') frequencyYears = 1;
      else if (vendor.riskLevel === 'Medium') frequencyYears = 2;

      // 2. Next Re-KYC Date
      const computedNextDate = addYearsToDate(vendor.lastKycDate, frequencyYears);
      const daysRemaining = calculateDaysRemaining(computedNextDate);

      // 3. Status Rule Engine
      let status = 'Active';
      if (vendor.workflow && vendor.workflow.status === 'Completed') {
        status = 'Completed';
      } else if (daysRemaining <= 0) {
        status = 'Overdue';
      } else if (daysRemaining <= 30) {
        status = 'Action Required';
      } else if (daysRemaining <= 90) {
        status = 'Due Soon';
      }

      // 4. Escalations and Alerts Engine
      const alerts = [];
      const overdueDays = -daysRemaining;

      if (status === 'Overdue') {
        if (overdueDays > 90) {
          // Suspended vendor status
          alerts.push({
            type: 'Vendor Suspended Due to Overdue Re-KYC',
            message: `🔴 Critical Alert: ${vendor.vendorName} is suspended. Re-KYC is overdue by ${overdueDays} days.`,
            severity: 'critical'
          });
        } else if (overdueDays > 60) {
          alerts.push({
            type: 'Compliance Escalation (Procurement Head)',
            message: `⚠ Escalated Alert: Re-KYC overdue by ${overdueDays} days. Notifying Procurement Head.`,
            severity: 'high'
          });
        } else if (overdueDays > 30) {
          alerts.push({
            type: 'Compliance Escalation (Manager)',
            message: `⚠ Escalated Alert: Re-KYC overdue by ${overdueDays} days. Notifying Compliance Manager.`,
            severity: 'medium'
          });
        } else {
          alerts.push({
            type: 'Re-KYC Overdue',
            message: `⚠ Alert: Re-KYC review for ${vendor.vendorName} is overdue by ${overdueDays} days.`,
            severity: 'medium'
          });
        }
      } else if (status === 'Action Required') {
        alerts.push({
          type: 'Re-KYC Action Required',
          message: `🕒 Re-KYC review is due soon. Only ${daysRemaining} days remaining to submit documents.`,
          severity: 'medium'
        });
      } else if (status === 'Due Soon') {
        alerts.push({
          type: 'Re-KYC Due Soon',
          message: `🕒 Review scheduled in ${daysRemaining} days. Notification reminder scheduled.`,
          severity: 'medium'
        });
      }

      // Check for expired documents or pending compliance reviews
      if (vendor.workflow && vendor.workflow.status === 'Under Investigation') {
        alerts.push({
          type: 'Compliance Review Pending',
          message: `🕒 Re-KYC verification review currently in progress (Stage: ${vendor.workflow.stage}).`,
          severity: 'medium'
        });
      }

      return {
        ...vendor,
        nextReKycDate: computedNextDate,
        daysRemaining,
        reKycStatus: status,
        alerts
      };
    });

    res.json({ success: true, vendors: enrichedVendors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/kyc/rekyc/reminders
app.get('/api/kyc/rekyc/reminders', async (req, res) => {
  try {
    const data = await readJsonFile(KYC_REKYC_REMINDERS_PATH);
    res.json({ success: true, reminders: data.reminders || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/kyc/rekyc/:id
app.get('/api/kyc/rekyc/:id', async (req, res) => {
  try {
    const data = await readJsonFile(KYC_RE_KYC_SCHEDULING_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Re-KYC schedule profile not found' });
    }

    // Process dates
    let frequencyYears = 3;
    if (vendor.riskLevel === 'High') frequencyYears = 1;
    else if (vendor.riskLevel === 'Medium') frequencyYears = 2;

    const computedNextDate = addYearsToDate(vendor.lastKycDate, frequencyYears);
    const daysRemaining = calculateDaysRemaining(computedNextDate);

    let status = 'Active';
    if (vendor.workflow && vendor.workflow.status === 'Completed') {
      status = 'Completed';
    } else if (daysRemaining <= 0) {
      status = 'Overdue';
    } else if (daysRemaining <= 30) {
      status = 'Action Required';
    } else if (daysRemaining <= 90) {
      status = 'Due Soon';
    }

    res.json({
      ...vendor,
      nextReKycDate: computedNextDate,
      daysRemaining,
      reKycStatus: status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/rekyc/trigger
app.post('/api/kyc/rekyc/trigger', async (req, res) => {
  try {
    const { vendorId, performedBy } = req.body;
    const data = await readJsonFile(KYC_RE_KYC_SCHEDULING_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === vendorId);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor Re-KYC profile not found' });
    }

    vendor.workflow = {
      status: 'Under Investigation',
      stage: 'Document Collection',
      comments: `Re-KYC initiated manually by ${performedBy || 'Compliance Officer'}.`
    };

    const log = {
      reviewDate: new Date().toISOString().split('T')[0],
      reviewer: performedBy || 'Compliance Analyst',
      result: 'Re-KYC Triggered',
      comments: 'Periodic re-verification review initiated. Document collections pending.'
    };

    if (!vendor.reviewHistory) vendor.reviewHistory = [];
    vendor.reviewHistory.push(log);

    // Schedule new reminder alerts
    const remindersData = await readJsonFile(KYC_REKYC_REMINDERS_PATH);
    const newReminder = {
      reminderId: `REM-${Date.now().toString().slice(-4)}`,
      vendorId: vendor.vendorId,
      vendorName: vendor.vendorName,
      reminderType: 'Document Submission outreach',
      scheduledDate: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    remindersData.reminders = remindersData.reminders || [];
    remindersData.reminders.push(newReminder);

    await writeJsonFile(KYC_REKYC_REMINDERS_PATH, remindersData);
    await writeJsonFile(KYC_RE_KYC_SCHEDULING_PATH, data);

    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/rekyc/workflow
app.post('/api/kyc/rekyc/workflow', async (req, res) => {
  try {
    const { vendorId, stage, status, comment, performedBy } = req.body;
    const data = await readJsonFile(KYC_RE_KYC_SCHEDULING_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === vendorId);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor Re-KYC profile not found' });
    }

    vendor.workflow = {
      status: status || 'Under Investigation',
      stage: stage,
      comments: comment || ''
    };

    const log = {
      reviewDate: new Date().toISOString().split('T')[0],
      reviewer: performedBy || 'Compliance Manager',
      result: `Workflow: ${stage}`,
      comments: comment || `Moved to verification stage: ${stage}.`
    };

    if (!vendor.reviewHistory) vendor.reviewHistory = [];
    vendor.reviewHistory.push(log);

    await writeJsonFile(KYC_RE_KYC_SCHEDULING_PATH, data);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/rekyc/submit
app.post('/api/kyc/rekyc/submit', async (req, res) => {
  try {
    const { vendorId, comments, performedBy } = req.body;
    const data = await readJsonFile(KYC_RE_KYC_SCHEDULING_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === vendorId);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor Re-KYC profile not found' });
    }

    // Set last date to today
    vendor.lastKycDate = new Date().toISOString().split('T')[0];
    
    // Clear workflow status
    vendor.workflow = {
      status: 'Completed',
      stage: 'Re-KYC Completed',
      comments: comments || 'Compliance review passed. KYC renewed.'
    };

    const log = {
      reviewDate: vendor.lastKycDate,
      reviewer: performedBy || 'Compliance Officer',
      result: 'Approved & Renewed',
      comments: comments || 'Passed re-verification audits. Re-KYC scheduled for next cycle.'
    };

    if (!vendor.reviewHistory) vendor.reviewHistory = [];
    vendor.reviewHistory.push(log);

    await writeJsonFile(KYC_RE_KYC_SCHEDULING_PATH, data);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/rekyc/upload
app.post('/api/kyc/rekyc/upload', reKycUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { uploadedBy } = req.body;

    const fileMetadata = {
      fileId: `REKYC-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90) + 10}`,
      fileName: req.file.originalname,
      filePath: `/uploads/kyc/re-kyc/${req.file.filename}`,
      uploadedBy: uploadedBy || 'Saurabh Anand',
      uploadedOn: new Date().toISOString().split('T')[0]
    };

    res.json({
      success: true,
      file: fileMetadata
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/rekyc/attach-file
app.post('/api/kyc/rekyc/attach-file', async (req, res) => {
  try {
    const { vendorId, fileMetadata } = req.body;
    const data = await readJsonFile(KYC_RE_KYC_SCHEDULING_PATH);
    const vendors = data.vendors || [];
    const vendor = vendors.find(v => v.vendorId === vendorId);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor Re-KYC profile not found' });
    }

    if (!vendor.evidenceFiles) vendor.evidenceFiles = [];
    vendor.evidenceFiles.push(fileMetadata);

    await writeJsonFile(KYC_RE_KYC_SCHEDULING_PATH, data);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Multer configuration for KYC Approvals uploads
const approvalsStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(APPROVALS_UPLOADS_DIR, { recursive: true });
      cb(null, APPROVALS_UPLOADS_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'APR-' + uniqueSuffix + ext);
  }
});
const approvalsUpload = multer({ storage: approvalsStorage });

const SLA_DAYS = {
  "Requester": 1,
  "Procurement": 2,
  "Compliance": 3,
  "Legal": 3,
  "Final Approval": 2
};

const STAGE_ORDER = ["Requester", "Procurement", "Compliance", "Legal", "Final Approval", "Completed"];

const calculateSlaDueDate = (submittedDate, currentStage, approvalHistory) => {
  let entryDateStr = submittedDate;
  if (approvalHistory && approvalHistory.length > 0) {
    const stageHistory = approvalHistory.filter(h => h.action === "Approved" || h.action === "Submitted");
    if (stageHistory.length > 0) {
      const sorted = [...stageHistory].sort((a, b) => new Date(a.actionDate) - new Date(b.actionDate));
      entryDateStr = sorted[sorted.length - 1].actionDate;
    }
  }
  const entryDate = new Date(entryDateStr);
  const daysLimit = SLA_DAYS[currentStage] || 2;
  entryDate.setDate(entryDate.getDate() + daysLimit);
  return entryDate.toISOString().split('T')[0];
};

const isStageOverdue = (slaDueDateStr) => {
  const today = new Date("2026-06-01");
  const dueDate = new Date(slaDueDateStr);
  return today > dueDate;
};

// GET /api/kyc/approvals
app.get('/api/kyc/approvals', async (req, res) => {
  try {
    const data = await readJsonFile(KYC_APPROVALS_PATH);
    const requests = data.approvalRequests || [];

    const computedRequests = requests.map(req => {
      if (["Pending", "On Hold", "Sent Back"].includes(req.overallStatus)) {
        const slaDueDate = calculateSlaDueDate(req.submittedDate, req.currentStage, req.approvalHistory);
        const overdue = isStageOverdue(slaDueDate);
        return {
          ...req,
          slaDueDate,
          overallStatus: overdue ? "Overdue" : req.overallStatus,
          alert: overdue ? "⚠ Approval Pending Beyond SLA" : null
        };
      }
      return req;
    });

    res.json({ success: true, approvalRequests: computedRequests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/kyc/approvals/vendor/:vendorId
app.get('/api/kyc/approvals/vendor/:vendorId', async (req, res) => {
  try {
    const data = await readJsonFile(KYC_APPROVALS_PATH);
    const requests = data.approvalRequests || [];
    
    // Find the latest request for this vendor
    const vendorRequests = requests.filter(r => r.vendorId === req.params.vendorId);
    if (vendorRequests.length === 0) {
      // Fallback: check vendors.json
      const vendorsData = await readJsonFile(VENDORS_PATH);
      const vendorObj = vendorsData.find(v => v.vendorId === req.params.vendorId);
      if (vendorObj) {
        if (vendorObj.status === 'Active') {
          return res.json({ success: true, overallStatus: 'Vendor Approved' });
        } else if (vendorObj.status === 'Rejected') {
          return res.json({ success: true, overallStatus: 'Rejected' });
        } else {
          return res.json({ success: true, overallStatus: 'Pending' });
        }
      }
      return res.json({ success: true, overallStatus: 'Unknown' });
    }

    const latestRequest = vendorRequests.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate))[0];
    
    // Calculate if overdue
    if (["Pending", "On Hold", "Sent Back"].includes(latestRequest.overallStatus)) {
      const slaDueDate = calculateSlaDueDate(latestRequest.submittedDate, latestRequest.currentStage, latestRequest.approvalHistory);
      const overdue = isStageOverdue(slaDueDate);
      if (overdue) {
        latestRequest.overallStatus = 'Overdue';
      }
    }
    
    res.json({ success: true, overallStatus: latestRequest.overallStatus, request: latestRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/kyc/approvals/:id
app.get('/api/kyc/approvals/:id', async (req, res) => {
  try {
    const data = await readJsonFile(KYC_APPROVALS_PATH);
    const requests = data.approvalRequests || [];
    const request = requests.find(r => r.requestId === req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Approval request not found' });
    }

    if (["Pending", "On Hold", "Sent Back"].includes(request.overallStatus)) {
      const slaDueDate = calculateSlaDueDate(request.submittedDate, request.currentStage, request.approvalHistory);
      const overdue = isStageOverdue(slaDueDate);
      request.slaDueDate = slaDueDate;
      if (overdue) {
        request.overallStatus = "Overdue";
        request.alert = "⚠ Approval Pending Beyond SLA";
      }
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/approvals/action
app.post('/api/kyc/approvals/action', async (req, res) => {
  try {
    const { requestId, action, comments, performedBy } = req.body;
    const data = await readJsonFile(KYC_APPROVALS_PATH);
    const requests = data.approvalRequests || [];
    const request = requests.find(r => r.requestId === requestId);

    if (!request) {
      return res.status(404).json({ message: 'Approval request not found' });
    }

    const currentStage = request.currentStage;
    const userRole = performedBy || 'Saurabh Anand';

    // 1. Add comments
    if (comments) {
      if (!request.comments) request.comments = [];
      request.comments.push({
        stage: currentStage,
        comment: comments,
        commentedBy: userRole,
        commentDate: "2026-06-01"
      });
    }

    // 2. Process action and transitions
    let nextStage = currentStage;
    let nextOverallStatus = request.overallStatus;
    let nextPendingWith = request.pendingWith;

    if (action === "Approve") {
      // Mark current stage in workflow as Approved
      if (request.workflow) {
        const stageKey = currentStage === "Procurement" ? "procurement" : 
                         currentStage === "Compliance" ? "compliance" : 
                         currentStage === "Legal" ? "legal" : 
                         currentStage === "Final Approval" ? "finalApproval" : "requester";
        request.workflow[stageKey] = {
          status: "Approved",
          approver: userRole,
          actionDate: "2026-06-01"
        };
      }

      // Find next stage
      const currentIndex = STAGE_ORDER.indexOf(currentStage);
      const nextIndex = currentIndex + 1;
      nextStage = STAGE_ORDER[nextIndex];

      if (nextStage === "Completed") {
        nextOverallStatus = "Vendor Approved";
        nextPendingWith = "None";

        // Update vendor status to Active in vendors.json
        const vendorsData = await readJsonFile(VENDORS_PATH);
        const updatedVendors = vendorsData.map(v => {
          if (v.vendorId === request.vendorId) {
            return {
              ...v,
              status: "Active",
              approvalWorkflow: {
                submittedBy: request.workflow?.requester?.approver || 'Saurabh Anand',
                submittedDate: (request.workflow?.requester?.actionDate || "2026-05-20") + "T10:00:00.000Z",
                currentStage: "Approved",
                approvalStatus: "Approved",
                approverRemarks: comments || "Approved complete KYC chain",
                approvedBy: userRole,
                approvedDate: new Date().toISOString()
              },
              auditTrail: [
                ...(v.auditTrail || []),
                {
                  action: "Vendor Approved",
                  performedBy: userRole,
                  timestamp: new Date().toISOString(),
                  remarks: comments || "Approved complete KYC chain"
                }
              ]
            };
          }
          return v;
        });
        await writeJsonFile(VENDORS_PATH, updatedVendors);

        // If this was a KYC verification request, mark vendor KYC as Verified
        if (request.category === 'KYC Verification' && request.vendorId === 'VND-001') {
          const kycList = await readJsonFile(VENDOR_PORTAL_KYC_PATH);
          const kIdx = kycList.findIndex(k => k.vendorId === 'VND-001');
          if (kIdx !== -1) {
            kycList[kIdx].status = 'Verified';
            kycList[kIdx].verifiedBy = userRole;
            kycList[kIdx].verifiedAt = new Date().toISOString();
            kycList[kIdx].rejectionRemarks = null;
            await writeJsonFile(VENDOR_PORTAL_KYC_PATH, kycList);
          }
          // Notify vendor
          await appendJsonData(VENDOR_PORTAL_NOTIFICATIONS_PATH, {
            notificationId: `NOT-${Math.floor(Math.random() * 9000 + 1000)}`,
            vendorId: 'VND-001',
            type: 'kyc_approved',
            title: 'KYC Verified',
            message: 'Your KYC details have been reviewed and verified by the compliance team.',
            link: '/vendor/kyc',
            read: false,
            createdDate: new Date().toISOString().split('T')[0]
          });
        }
      } else {
        nextOverallStatus = "Pending";
        nextPendingWith = nextStage === "Procurement" ? "Procurement Manager" :
                          nextStage === "Compliance" ? "Compliance Team" :
                          nextStage === "Legal" ? "Legal Team" : "Final Approver";
      }

      // Add approvalHistory
      request.approvalHistory.push({
        stage: currentStage,
        action: "Approved",
        performedBy: userRole,
        actionDate: "2026-06-01",
        comments: comments || "Stage approved."
      });

      // Add auditHistory
      request.auditHistory.push({
        action: `${currentStage} Approved`,
        performedBy: userRole,
        actionDate: "2026-06-01",
        remarks: comments || `Approved and advanced to ${nextStage} stage.`
      });

    } else if (action === "Reject") {
      // Mark workflow stage
      if (request.workflow) {
        const stageKey = currentStage === "Procurement" ? "procurement" : 
                         currentStage === "Compliance" ? "compliance" : 
                         currentStage === "Legal" ? "legal" : 
                         currentStage === "Final Approval" ? "finalApproval" : "requester";
        request.workflow[stageKey] = {
          status: "Rejected",
          approver: userRole,
          actionDate: "2026-06-01"
        };
      }

      nextOverallStatus = "Rejected";
      nextPendingWith = "None";

      // Add approvalHistory
      request.approvalHistory.push({
        stage: currentStage,
        action: "Rejected",
        performedBy: userRole,
        actionDate: "2026-06-01",
        comments: comments || "Stage rejected."
      });

      // Add auditHistory
      request.auditHistory.push({
        action: `Approval Rejected`,
        performedBy: userRole,
        actionDate: "2026-06-01",
        remarks: comments || `Rejected during ${currentStage} review.`
      });

      // If this was a KYC verification request, mark vendor KYC as Rejected
      if (request.category === 'KYC Verification' && request.vendorId === 'VND-001') {
        const kycList = await readJsonFile(VENDOR_PORTAL_KYC_PATH);
        const kIdx = kycList.findIndex(k => k.vendorId === 'VND-001');
        if (kIdx !== -1) {
          kycList[kIdx].status = 'Rejected';
          kycList[kIdx].rejectionRemarks = comments || 'KYC rejected by compliance team.';
          kycList[kIdx].rejectedBy = userRole;
          kycList[kIdx].rejectedAt = new Date().toISOString();
          await writeJsonFile(VENDOR_PORTAL_KYC_PATH, kycList);
        }
        // Notify vendor
        await appendJsonData(VENDOR_PORTAL_NOTIFICATIONS_PATH, {
          notificationId: `NOT-${Math.floor(Math.random() * 9000 + 1000)}`,
          vendorId: 'VND-001',
          type: 'kyc_rejected',
          title: 'KYC Rejected',
          message: `Your KYC submission was rejected. Reason: ${comments || 'Please re-submit with correct details.'}`,
          link: '/vendor/kyc',
          read: false,
          createdDate: new Date().toISOString().split('T')[0]
        });
      }

      // Update vendor status to Rejected in vendors.json
      const vendorsData = await readJsonFile(VENDORS_PATH);
      const updatedVendors = vendorsData.map(v => {
        if (v.vendorId === request.vendorId) {
          return {
            ...v,
            status: "Rejected",
            approvalWorkflow: {
              submittedBy: request.workflow?.requester?.approver || 'Saurabh Anand',
              submittedDate: (request.workflow?.requester?.actionDate || "2026-05-20") + "T10:00:00.000Z",
              currentStage: "Rejected",
              approvalStatus: "Rejected",
              approverRemarks: comments || "Rejected at KYC Approvals checker level",
              approvedBy: userRole,
              approvedDate: new Date().toISOString()
            },
            auditTrail: [
              ...(v.auditTrail || []),
              {
                action: "Vendor Rejected",
                performedBy: userRole,
                timestamp: new Date().toISOString(),
                remarks: comments || "Rejected at KYC Approvals checker level"
              }
            ]
          };
        }
        return v;
      });
      await writeJsonFile(VENDORS_PATH, updatedVendors);

    } else if (action === "Send Back") {
      // Mark workflow stage
      if (request.workflow) {
        request.workflow.requester = {
          status: "Sent Back",
          approver: userRole,
          actionDate: "2026-06-01"
        };
        // Reset intermediate stages to pending
        ["procurement", "compliance", "legal", "finalApproval"].forEach(k => {
          if (request.workflow[k]) {
            request.workflow[k].status = "Pending";
          }
        });
      }

      nextStage = "Requester";
      nextOverallStatus = "Sent Back";
      nextPendingWith = "Requester";

      // Add approvalHistory
      request.approvalHistory.push({
        stage: currentStage,
        action: "Sent Back",
        performedBy: userRole,
        actionDate: "2026-06-01",
        comments: comments || "Sent back for clarification."
      });

      // Add auditHistory
      request.auditHistory.push({
        action: `Sent Back for Revision`,
        performedBy: userRole,
        actionDate: "2026-06-01",
        remarks: comments || `Returned to requester from ${currentStage} stage.`
      });

    } else if (action === "Put On Hold") {
      if (request.workflow) {
        const stageKey = currentStage === "Procurement" ? "procurement" : 
                         currentStage === "Compliance" ? "compliance" : 
                         currentStage === "Legal" ? "legal" : 
                         currentStage === "Final Approval" ? "finalApproval" : "requester";
        request.workflow[stageKey] = {
          status: "On Hold",
          approver: userRole,
          actionDate: "2026-06-01"
        };
      }
      nextOverallStatus = "On Hold";
      nextPendingWith = currentStage === "Procurement" ? "Procurement Manager" : 
                        currentStage === "Compliance" ? "Compliance Team" : 
                        currentStage === "Legal" ? "Legal Team" : "Final Approver";

      // Add approvalHistory
      request.approvalHistory.push({
        stage: currentStage,
        action: "Put On Hold",
        performedBy: userRole,
        actionDate: "2026-06-01",
        comments: comments || "Approval request placed on hold."
      });

      // Add auditHistory
      request.auditHistory.push({
        action: `Placed On Hold`,
        performedBy: userRole,
        actionDate: "2026-06-01",
        remarks: comments || `Approval paused at ${currentStage} stage.`
      });
    }

    request.currentStage = nextStage;
    request.overallStatus = nextOverallStatus;
    request.pendingWith = nextPendingWith;
    request.slaDueDate = calculateSlaDueDate(request.submittedDate, nextStage, request.approvalHistory);

    await writeJsonFile(KYC_APPROVALS_PATH, data);
    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/approvals/upload
app.post('/api/kyc/approvals/upload', approvalsUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { uploadedBy } = req.body;

    const fileMetadata = {
      fileId: `APRDOC-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90) + 10}`,
      fileName: req.file.originalname,
      filePath: `/uploads/kyc/approvals/${req.file.filename}`,
      uploadedBy: uploadedBy || 'Saurabh Anand',
      uploadedOn: new Date().toISOString().split('T')[0]
    };

    res.json({
      success: true,
      file: fileMetadata
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/kyc/approvals/attach-file
app.post('/api/kyc/approvals/attach-file', async (req, res) => {
  try {
    const { requestId, fileMetadata } = req.body;
    const data = await readJsonFile(KYC_APPROVALS_PATH);
    const requests = data.approvalRequests || [];
    const request = requests.find(r => r.requestId === requestId);

    if (!request) {
      return res.status(404).json({ message: 'Approval request not found' });
    }

    if (!request.evidenceFiles) request.evidenceFiles = [];
    request.evidenceFiles.push(fileMetadata);

    await writeJsonFile(KYC_APPROVALS_PATH, data);
    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// SETTINGS MODULE APIS
// ==========================================

// Configure Multer for settings uploads (logo, files)
const settingsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, SETTINGS_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'settings-' + uniqueSuffix + ext);
  }
});
const settingsUpload = multer({ storage: settingsStorage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/settings — fetch all settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await readJsonFile(SETTINGS_PATH);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/settings — update any settings section
app.put('/api/settings', async (req, res) => {
  try {
    const existing = await readJsonFile(SETTINGS_PATH);
    const updates = req.body;
    // Deep merge: only update provided top-level keys
    const merged = { ...existing };
    for (const key of Object.keys(updates)) {
      if (typeof updates[key] === 'object' && !Array.isArray(updates[key]) && updates[key] !== null) {
        merged[key] = { ...(existing[key] || {}), ...updates[key] };
      } else {
        merged[key] = updates[key];
      }
    }
    merged.organization = {
      ...(merged.organization || {}),
      lastUpdated: new Date().toISOString(),
      updatedBy: req.body.updatedBy || 'Admin'
    };
    await writeJsonFile(SETTINGS_PATH, merged);
    // Add audit log entry
    const newLog = {
      id: `AUD-SET-${Date.now()}`,
      action: `Settings updated — section: ${Object.keys(updates).join(', ')}`,
      performedBy: req.body.updatedBy || 'Admin',
      role: 'Super Admin',
      timestamp: new Date().toISOString(),
      severity: 'Medium',
      status: 'Success'
    };
    merged.auditLogs = [newLog, ...(merged.auditLogs || [])];
    await writeJsonFile(SETTINGS_PATH, merged);
    res.json({ success: true, settings: merged });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/settings/users — add a new user
app.post('/api/settings/users', async (req, res) => {
  try {
    const settings = await readJsonFile(SETTINGS_PATH);
    const users = settings.users || [];
    const newUser = {
      userId: `USR-${String(users.length + 1).padStart(3, '0')}`,
      ...req.body,
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    settings.users = users;
    await writeJsonFile(SETTINGS_PATH, settings);
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/settings/users/:userId — update a user
app.put('/api/settings/users/:userId', async (req, res) => {
  try {
    const settings = await readJsonFile(SETTINGS_PATH);
    const users = settings.users || [];
    const idx = users.findIndex(u => u.userId === req.params.userId);
    if (idx === -1) return res.status(404).json({ message: 'User not found' });
    users[idx] = { ...users[idx], ...req.body };
    settings.users = users;
    await writeJsonFile(SETTINGS_PATH, settings);
    res.json({ success: true, user: users[idx] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/settings/users/:userId — delete a user
app.delete('/api/settings/users/:userId', async (req, res) => {
  try {
    const settings = await readJsonFile(SETTINGS_PATH);
    const users = settings.users || [];
    const idx = users.findIndex(u => u.userId === req.params.userId);
    if (idx === -1) return res.status(404).json({ message: 'User not found' });
    const [removed] = users.splice(idx, 1);
    settings.users = users;
    await writeJsonFile(SETTINGS_PATH, settings);
    res.json({ success: true, removed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/settings/upload — upload logo or file for settings
app.post('/api/settings/upload', settingsUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const fileUrl = `/uploads/settings/${req.file.filename}`;
    const fieldName = req.body.field || 'logoUrl';

    // Save the file URL into organization section of settings.json
    const settings = await readJsonFile(SETTINGS_PATH);
    settings.organization = {
      ...(settings.organization || {}),
      [fieldName]: fileUrl,
      lastUpdated: new Date().toISOString()
    };
    await writeJsonFile(SETTINGS_PATH, settings);

    res.json({ success: true, fileUrl, filename: req.file.filename });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Static serving for settings uploads
app.use('/uploads/settings', express.static(SETTINGS_UPLOADS_DIR));

// Global error handler for uncaught multer/routing errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// ─────────────────────────────────────────────────────────────────────────────
// SPRINT 3: SSE real-time notifications + email alerts + cron jobs
// ─────────────────────────────────────────────────────────────────────────────

// SSE client registry (vendorId → Set of response objects)
const sseClients = new Map();

function broadcastToVendor(vendorId, event, data) {
  const clients = sseClients.get(vendorId);
  if (!clients) return;
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach(res => { try { res.write(payload); } catch (_) {} });
}

app.get('/api/vendor-portal/events', (req, res) => {
  const vendorId = 'VND-001'; // in production: derive from session/JWT
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  if (!sseClients.has(vendorId)) sseClients.set(vendorId, new Set());
  sseClients.get(vendorId).add(res);

  // Send initial heartbeat
  res.write('event: connected\ndata: {"status":"ok"}\n\n');

  // Heartbeat every 25s to prevent proxy timeouts
  const heartbeat = setInterval(() => {
    try { res.write(': heartbeat\n\n'); } catch (_) { clearInterval(heartbeat); }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.get(vendorId)?.delete(res);
  });
});

// Patch addVendorNotification to also push SSE event
async function addVendorNotificationAndBroadcast(message, type = 'info') {
  try {
    const notif = {
      notificationId: `NOT-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorId: 'VND-001',
      message,
      type,
      read: false,
      createdDate: new Date().toISOString().split('T')[0],
    };
    await appendJsonData(VENDOR_PORTAL_NOTIFICATIONS_PATH, notif);
    broadcastToVendor('VND-001', 'notification', notif);
    return notif;
  } catch (err) {
    console.error('Failed to add vendor notification:', err);
  }
}

// Vendor settings path (Sprint 3 server-persist)
const VENDOR_PORTAL_SETTINGS_PATH = path.join(VENDOR_PORTAL_DIR, 'vendorSettings.json');

app.get('/api/vendor-portal/settings', async (req, res) => {
  try {
    let settings;
    try { settings = JSON.parse(await fs.readFile(VENDOR_PORTAL_SETTINGS_PATH, 'utf8')); }
    catch (_) { settings = { notifications: {}, language: 'en', theme: 'system' }; }
    res.json(settings);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/vendor-portal/settings', async (req, res) => {
  try {
    let current;
    try { current = JSON.parse(await fs.readFile(VENDOR_PORTAL_SETTINGS_PATH, 'utf8')); }
    catch (_) { current = {}; }
    const merged = { ...current, ...req.body };
    await fs.writeFile(VENDOR_PORTAL_SETTINGS_PATH, JSON.stringify(merged, null, 2));
    res.json(merged);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Helpdesk reply endpoint (Sprint 3 thread view)
app.post('/api/vendor-portal/tickets/:ticketId/reply', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message, author = 'Vendor User' } = req.body;
    const tickets = await readJsonFile(VENDOR_PORTAL_TICKETS_PATH);
    const idx = tickets.findIndex(t => t.ticketId === ticketId);
    if (idx === -1) return res.status(404).json({ error: 'Ticket not found' });
    if (!tickets[idx].replies) tickets[idx].replies = [];
    const reply = {
      replyId: `RPL-${Math.floor(1000 + Math.random() * 9000)}`,
      message,
      author,
      createdDate: new Date().toISOString(),
    };
    tickets[idx].replies.push(reply);
    await writeJsonFile(VENDOR_PORTAL_TICKETS_PATH, tickets);
    broadcastToVendor('VND-001', 'ticket_reply', { ticketId, reply });
    res.json({ success: true, reply });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Audit trail read endpoint (Sprint 3)
app.get('/api/vendor-portal/audit-trail', async (req, res) => {
  try {
    const logs = await readJsonFile(VENDOR_PORTAL_AUDIT_LOG_PATH);
    res.json(logs.slice().reverse().slice(0, 100)); // latest 100
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ── Cron: daily doc-expiry + PO-unacknowledged alerts ─────────────────────
import cron from 'node-cron';

cron.schedule('0 8 * * *', async () => {
  console.log('[CRON] Running daily vendor alerts scan...');
  try {
    const today = new Date();

    // 1. Document expiry alerts (30-day window)
    const docs = await readJsonFile(VENDOR_PORTAL_DOCUMENTS_PATH);
    for (const doc of docs) {
      if (!doc.expiryDate) continue;
      const expiry = new Date(doc.expiryDate);
      const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      if (days === 30 || days === 14 || days === 7) {
        await addVendorNotificationAndBroadcast(
          `⚠️ Document "${doc.documentName}" expires in ${days} day${days !== 1 ? 's' : ''} (${doc.expiryDate}). Please renew.`,
          'warning'
        );
      }
      if (days <= 0 && doc.status !== 'Expired') {
        doc.status = 'Expired';
        await addVendorNotificationAndBroadcast(
          `🔴 Document "${doc.documentName}" has expired. Upload a renewed copy immediately.`,
          'danger'
        );
      }
    }
    await writeJsonFile(VENDOR_PORTAL_DOCUMENTS_PATH, docs);

    // 2. PO unacknowledged > 48hrs
    const pos = await readJsonFile(VENDOR_PORTAL_POS_PATH);
    for (const po of pos) {
      if (!po.status.startsWith('Pending')) continue;
      const issued = new Date(po.issueDate);
      const hoursOld = (today - issued) / (1000 * 60 * 60);
      if (hoursOld > 48) {
        await addVendorNotificationAndBroadcast(
          `📦 PO ${po.poId} issued ${Math.floor(hoursOld / 24)} days ago is still pending acknowledgement.`,
          'warning'
        );
      }
    }

    // 3. Contract expiry (30-day window) — uses admin contracts data
    try {
      const contracts = await readJsonFile(CONTRACTS_PATH);
      for (const c of contracts) {
        if (!c.expiryDate || c.vendorName !== 'VND-001') continue;
        const expiry = new Date(c.expiryDate);
        const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        if (days === 30 || days === 7) {
          await addVendorNotificationAndBroadcast(
            `📑 Contract "${c.contractName}" expires in ${days} days (${c.expiryDate}). Contact procurement for renewal.`,
            'warning'
          );
        }
      }
    } catch (_) {}

    console.log('[CRON] Daily vendor alerts complete.');
  } catch (err) {
    console.error('[CRON] Error:', err);
  }
});

// Admin-side: scan admin documents.json for expiry and push admin notifications
async function runAdminDocExpiryCheck() {
  try {
    const docs = await readJsonFile(DOCUMENTS_PATH);
    const today = new Date();
    for (const doc of docs) {
      if (!doc.expiryDate) continue;
      const days = Math.ceil((new Date(doc.expiryDate) - today) / (1000 * 60 * 60 * 24));
      if (days > 0 && days <= 30) {
        const existing = await readJsonFile(ADMIN_NOTIFICATIONS_PATH);
        const dupKey = `doc_expiry_${doc.documentId}_${days}`;
        if (existing.some(n => n.dupKey === dupKey)) continue;
        await appendJsonData(ADMIN_NOTIFICATIONS_PATH, {
          id: `ANOTIF-${Date.now()}-${doc.documentId}`,
          dupKey,
          type: 'document_expiry',
          title: 'Document Expiring Soon',
          message: `"${doc.documentName || doc.type}" for ${doc.vendor?.vendorName || doc.vendorName || 'a vendor'} expires in ${days} day${days !== 1 ? 's' : ''}.`,
          link: '/documents',
          timestamp: new Date().toISOString(),
          read: false
        });
      } else if (days <= 0) {
        const existing = await readJsonFile(ADMIN_NOTIFICATIONS_PATH);
        const dupKey = `doc_expired_${doc.documentId}`;
        if (existing.some(n => n.dupKey === dupKey)) continue;
        await appendJsonData(ADMIN_NOTIFICATIONS_PATH, {
          id: `ANOTIF-${Date.now()}-exp-${doc.documentId}`,
          dupKey,
          type: 'document_expired',
          title: 'Document Expired',
          message: `"${doc.documentName || doc.type}" for ${doc.vendor?.vendorName || doc.vendorName || 'a vendor'} has expired.`,
          link: '/documents',
          timestamp: new Date().toISOString(),
          read: false
        });
      }
    }
    console.log('[CRON] Admin doc expiry check complete.');
  } catch (err) {
    console.error('[CRON] Admin doc expiry error:', err);
  }
}

// Run admin doc expiry check at startup + daily at midnight
runAdminDocExpiryCheck();
setInterval(runAdminDocExpiryCheck, 24 * 60 * 60 * 1000);

// Manually trigger alert scan (for testing without waiting for cron)
app.post('/api/vendor-portal/run-alerts', async (req, res) => {
  res.json({ status: 'Alert scan triggered (check server logs)' });
  // fire-and-forget
  (async () => {
    const today = new Date();
    const docs = await readJsonFile(VENDOR_PORTAL_DOCUMENTS_PATH);
    for (const doc of docs) {
      if (!doc.expiryDate) continue;
      const days = Math.ceil((new Date(doc.expiryDate) - today) / (1000 * 60 * 60 * 24));
      if (days <= 30 && days > 0) {
        await addVendorNotificationAndBroadcast(
          `⚠️ Document "${doc.documentName}" expires in ${days} day${days !== 1 ? 's' : ''}. Renew soon.`,
          'warning'
        );
        broadcastToVendor('VND-001', 'dashboard_refresh', {});
      }
    }
  })().catch(console.error);
});

// ── Dashboard Approval Queue Aggregation ──────────────────────────────────────

// GET /api/invoices/approvals  — invoices pending approval
app.get('/api/invoices/approvals', async (req, res) => {
  try {
    const list = await readJsonFile(ADMIN_INVOICES_PATH);
    const pending = list.filter(i => i.status === 'Pending Approval');
    res.json(pending);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET /api/payments/approvals  — payments pending approval
app.get('/api/payments/approvals', async (req, res) => {
  try {
    const list = await readJsonFile(ADMIN_PAYMENTS_PATH);
    const pending = list.filter(p => p.status === 'Pending Approval');
    res.json(pending);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET /api/dashboard/approval-counts  — single-shot aggregation for Dashboard Approval Queue
app.get('/api/dashboard/approval-counts', async (req, res) => {
  try {
    const [vendors, catalogueApprovals, poApprovals, invoiceApprovals, paymentApprovals] = await Promise.all([
      readJsonFile(VENDORS_PATH).catch(() => []),
      readJsonFile(CAT_APPROVALS_PATH).catch(() => []),
      readJsonFile(PO_APPROVALS_PATH).catch(() => []),
      readJsonFile(path.join(__dirname, 'data', 'invoice-approvals.json')).catch(() => []),
      readJsonFile(PAYMENT_APPROVALS_PATH).catch(() => []),
    ]);

    res.json({
      vendorApprovals: Array.isArray(vendors)
        ? vendors.filter(v => v.status === 'Pending Approval').length
        : 0,
      catalogueApprovals: Array.isArray(catalogueApprovals)
        ? catalogueApprovals.filter(a => a.status === 'Pending Approval').length
        : 0,
      poApprovals: Array.isArray(poApprovals)
        ? poApprovals.filter(a => a.status === 'Pending' || a.status === 'Pending Approval').length
        : 0,
      invoiceApprovals: Array.isArray(invoiceApprovals)
        ? invoiceApprovals.filter(a => a.status === 'Pending Approval').length
        : 0,
      paymentApprovals: Array.isArray(paymentApprovals)
        ? paymentApprovals.filter(p => p.status === 'Pending Approval').length
        : 0,
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.listen(PORT, () => {
  console.log(`VMS Backend server running on port ${PORT}`);
});
