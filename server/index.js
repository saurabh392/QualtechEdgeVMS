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
const VENDORS_PATH = path.join(__dirname, 'data', 'vendors.json');
const DOCUMENTS_PATH = path.join(__dirname, 'data', 'documents.json');
const APPROVALS_PATH = path.join(__dirname, 'data', 'approvals.json');
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
const DOC_UPLOADS_DIR = path.join(UPLOADS_DIR, 'documents');
const KYC_UPLOADS_DIR = path.join(UPLOADS_DIR, 'kyc');
const SANCTIONS_UPLOADS_DIR = path.join(KYC_UPLOADS_DIR, 'sanctions');
const BLACKLIST_UPLOADS_DIR = path.join(KYC_UPLOADS_DIR, 'blacklist');
const PEP_UPLOADS_DIR = path.join(KYC_UPLOADS_DIR, 'pep');
const ADVERSE_MEDIA_UPLOADS_DIR = path.join(KYC_UPLOADS_DIR, 'adverse-media');
const SHELL_COMPANY_UPLOADS_DIR = path.join(KYC_UPLOADS_DIR, 'shell-company');
const RE_KYC_UPLOADS_DIR = path.join(KYC_UPLOADS_DIR, 're-kyc');
const APPROVALS_UPLOADS_DIR = path.join(KYC_UPLOADS_DIR, 'approvals');

// Catalogue database paths
const CAT_ITEMS_PATH = path.join(__dirname, 'data', 'catalogue', 'items.json');
const CAT_SERVICES_PATH = path.join(__dirname, 'data', 'catalogue', 'services.json');
const CAT_SERVICE_ATTACHMENTS_PATH = path.join(__dirname, 'data', 'catalogue', 'service-attachments.json');
const CAT_SERVICE_AUDIT_LOG_PATH = path.join(__dirname, 'data', 'catalogue', 'service-audit-log.json');
const CAT_CATEGORIES_PATH = path.join(__dirname, 'data', 'catalogue', 'categories.json');
const CAT_VENDORS_PATH = path.join(__dirname, 'data', 'catalogue', 'vendors.json');
const CAT_HSN_CODES_PATH = path.join(__dirname, 'data', 'catalogue', 'hsn-sac-codes.json');
const CAT_UOMS_PATH = path.join(__dirname, 'data', 'catalogue', 'uom.json');
const CAT_APPROVALS_PATH = path.join(__dirname, 'data', 'catalogue', 'item-approvals.json');
const CAT_ACTIVITY_PATH = path.join(__dirname, 'data', 'catalogue', 'item-activity.json');
const CAT_DASHBOARD_PATH = path.join(__dirname, 'data', 'catalogue', 'item-dashboard.json');
const CAT_UPLOADED_FILES_PATH = path.join(__dirname, 'data', 'catalogue', 'uploaded-files.json');
const CAT_ATTACHMENTS_PATH = path.join(__dirname, 'data', 'catalogue', 'item-attachments.json');
const CAT_AUDIT_LOG_PATH = path.join(__dirname, 'data', 'catalogue', 'item-audit-log.json');

// Auth database paths
const AUTH_DIR = path.join(__dirname, 'data', 'auth');
const AUTH_USERS_PATH = path.join(AUTH_DIR, 'users.json');
const AUTH_ROLES_PATH = path.join(AUTH_DIR, 'roles.json');
const AUTH_PERMISSIONS_PATH = path.join(AUTH_DIR, 'permissions.json');
const AUTH_AUDIT_PATH = path.join(AUTH_DIR, 'login-audit.json');
const AUTH_SESSIONS_PATH = path.join(AUTH_DIR, 'sessions.json');
const AUTH_OTP_STORE_PATH = path.join(AUTH_DIR, 'otp-store.json');

const CAT_UPLOADS_DIR = path.join(UPLOADS_DIR, 'catalogue');
const CAT_SPECS_DIR = path.join(CAT_UPLOADS_DIR, 'specifications');
const CAT_IMAGES_DIR = path.join(CAT_UPLOADS_DIR, 'images');
const CAT_COMPLIANCE_DIR = path.join(CAT_UPLOADS_DIR, 'compliance');
const CAT_TEMP_DIR = path.join(CAT_UPLOADS_DIR, 'temp');
const CAT_ITEMS_UPLOADS_DIR = path.join(CAT_UPLOADS_DIR, 'items');
const CAT_SERVICES_UPLOADS_DIR = path.join(CAT_UPLOADS_DIR, 'services');

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
  await fs.mkdir(path.join(__dirname, 'data', 'catalogue'), { recursive: true });
  await fs.mkdir(path.join(__dirname, 'data', 'kyc'), { recursive: true });
  await fs.mkdir(AUTH_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(DOC_UPLOADS_DIR, { recursive: true });
  await fs.mkdir(KYC_UPLOADS_DIR, { recursive: true });
  await fs.mkdir(CAT_SPECS_DIR, { recursive: true });
  await fs.mkdir(CAT_IMAGES_DIR, { recursive: true });
  await fs.mkdir(CAT_COMPLIANCE_DIR, { recursive: true });
  await fs.mkdir(CAT_TEMP_DIR, { recursive: true });
  await fs.mkdir(CAT_ITEMS_UPLOADS_DIR, { recursive: true });
  await fs.mkdir(CAT_SERVICES_UPLOADS_DIR, { recursive: true });
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

  // Initialize services database files
  try {
    await fs.access(CAT_SERVICES_PATH);
  } catch {
    await fs.writeFile(CAT_SERVICES_PATH, '[]', 'utf8');
  }
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
    const filePath = `/uploads/documents/${storedFileName}`;
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
      vendorName: vendor.basicDetails.legalName,
      performedBy: performedBy || 'Saurabh Anand',
      action: 'Approved',
      remarks,
      timestamp: new Date().toISOString()
    };
    await appendJsonData(APPROVALS_PATH, approvalHistory);

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

// Helper to update dashboard calculations
async function updateCatDashboardMetrics() {
  try {
    const items = await readJsonFile(CAT_ITEMS_PATH);
    const services = await readJsonFile(CAT_SERVICES_PATH);
    const approvals = await readJsonFile(CAT_APPROVALS_PATH);
    
    // Seed standard mock baseline count
    const totalItems = items.length + 8418;
    const totalServices = services.length + 1247;
    const pendingApprovalsCount = approvals.length + 13;

    // Derived services metrics
    const pendingVendorMapping = services.filter(s => s.workflowStage === 'Vendor Mapping').length + 8;
    const publishedServices = services.filter(s => s.status === 'Published').length + 1239;
    const compliancePending = services.filter(s => s.status === 'Pending Approval').length + 5;
    const rateConfigurationPending = services.filter(s => s.status !== 'Published').length + 12;

    const stats = {
      totalItems,
      totalServices,
      activeVendors: 103,
      pendingApprovals: pendingApprovalsCount,
      pendingVendorMapping,
      publishedServices,
      compliancePending,
      rateConfigurationPending,
      criticalCategories: 4,
      rateRevisionsDue: 8,
      catalogueUtilization: 87.5
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
    if (id && id.startsWith('SRV-')) {
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
      if (s.serviceId && s.serviceId.startsWith(`SRV-${year}-`)) {
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
    const padded = String(nextNum).padStart(5, '0');
    serviceData.serviceId = `SRV-${year}-${padded}`;

    serviceData.status = 'Pending Approval';
    serviceData.workflowStage = 'Vendor Mapping';
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

    // Add to approvals queue
    const approvalRequest = {
      approvalId: `APP-SRV-${Math.floor(100 + Math.random() * 900)}`,
      itemId: serviceData.serviceId,
      itemName: serviceData.serviceName,
      category: serviceData.serviceCategory,
      preferredVendor: serviceData.preferredVendor || 'N/A',
      submittedBy: serviceData.createdBy,
      submittedDate: serviceData.createdDate,
      status: 'Pending',
      currentApprover: 'Procurement Checker',
      isService: true
    };
    await appendJsonData(CAT_APPROVALS_PATH, approvalRequest);

    await logCatActivity(serviceData.serviceId, 'Service Created & Submitted for Approval', serviceData.createdBy);
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
    const padded = String(nextNum).padStart(5, '0');
    itemData.itemId = `ITM-${year}-${padded}`;

    itemData.status = 'Pending Approval';
    itemData.approvalWorkflow = {
      submittedBy: itemData.submittedBy || 'Admin',
      submittedDate: new Date().toISOString().split('T')[0],
      approvalStatus: 'Pending',
      currentApprover: 'Procurement Checker'
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
    
    // Add to approvals queue
    const approvalRequest = {
      approvalId: `APP-ITM-${Math.floor(100 + Math.random() * 900)}`,
      itemId: itemData.itemId,
      itemName: itemData.itemName,
      category: itemData.category,
      preferredVendor: itemData.preferredVendor?.vendorName || 'N/A',
      submittedBy: itemData.submittedBy || 'Admin',
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      currentApprover: 'Procurement Checker'
    };
    await appendJsonData(CAT_APPROVALS_PATH, approvalRequest);

    await logCatActivity(itemData.itemId, 'Item Created & Submitted for Approval', itemData.submittedBy);
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

// 6. GET /api/catalogue/vendors
app.get('/api/catalogue/vendors', async (req, res) => {
  try {
    const allVendors = await readJsonFile(VENDORS_PATH);
    const approved = allVendors
      .filter(v => v.approvalWorkflow?.approvalStatus === 'Approved')
      .map(v => ({
        vendorId: v.vendorId,
        vendorName: v.basicDetails?.legalName || v.basicDetails?.tradeName || 'Unnamed Vendor',
        status: v.status || 'Active'
      }));
    res.json(approved);
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
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 11. POST /api/catalogue/approvals/:id/resolve
app.post('/api/catalogue/approvals/:id/resolve', async (req, res) => {
  try {
    const { action, remarks, performedBy } = req.body;
    const approvals = await readJsonFile(CAT_APPROVALS_PATH);
    const appEntry = approvals.find(a => a.approvalId === req.params.id || a.itemId === req.params.id);
    if (!appEntry) {
      return res.status(404).json({ message: 'Approval request not found' });
    }

    const finalStatus = action === 'Approve' ? 'Published' : action === 'Reject' ? 'Rejected' : 'Draft';
    const userName = performedBy || 'Neha Sharma';

    let resolvedData;
    if (appEntry.itemId && appEntry.itemId.startsWith('SRV-')) {
      resolvedData = await updateJsonData(CAT_SERVICES_PATH, 'serviceId', appEntry.itemId, {
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
      resolvedData = await updateJsonData(CAT_ITEMS_PATH, 'itemId', appEntry.itemId, {
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

    await deleteJsonData(CAT_APPROVALS_PATH, 'itemId', appEntry.itemId);

    await logCatActivity(appEntry.itemId, `Catalogue unit ${action}d by Checker`, userName);
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

// ==========================================
// CONTRACTS & SLAs MODULE APIs
// ==========================================

const CONTRACTS_DIR = path.join(__dirname, 'data', 'contracts');
const CONTRACTS_PATH = path.join(CONTRACTS_DIR, 'contracts.json');
const CONTRACT_DASHBOARD_PATH = path.join(CONTRACTS_DIR, 'contract-dashboard.json');
const CONTRACT_APPROVALS_PATH = path.join(CONTRACTS_DIR, 'contract-approvals.json');
const CONTRACT_RENEWALS_PATH = path.join(CONTRACTS_DIR, 'contract-renewals.json');
const CLAUSE_LIBRARY_PATH = path.join(CONTRACTS_DIR, 'clause-library.json');
const CONTRACT_ACTIVITY_PATH = path.join(CONTRACTS_DIR, 'contract-activity.json');
const CONTRACT_RISK_INSIGHTS_PATH = path.join(CONTRACTS_DIR, 'contract-risk-insights.json');
const SLA_TRACKER_PATH = path.join(CONTRACTS_DIR, 'sla-tracker.json');
const CONTRACT_UPLOADED_FILES_PATH = path.join(CONTRACTS_DIR, 'uploaded-files.json');
const CONTRACT_TEMPLATES_PATH = path.join(CONTRACTS_DIR, 'contract-templates.json');
const CONTRACT_AUDIT_LOG_PATH = path.join(CONTRACTS_DIR, 'contract-audit-log.json');
const CONTRACTS_VENDORS_PATH = path.join(CONTRACTS_DIR, 'vendors.json');
const CONTRACT_TYPES_PATH = path.join(CONTRACTS_DIR, 'contract-types.json');

const CONTRACTS_UPLOADS_DIR = path.join(UPLOADS_DIR, 'contracts');
const CTR_LEGAL_DIR = path.join(CONTRACTS_UPLOADS_DIR, 'legal');
const CTR_SLA_DIR = path.join(CONTRACTS_UPLOADS_DIR, 'sla');
const CTR_COMPLIANCE_DIR = path.join(CONTRACTS_UPLOADS_DIR, 'compliance');
const CTR_SUPPORTING_DIR = path.join(CONTRACTS_UPLOADS_DIR, 'supporting-documents');
const CTR_TEMPLATES_DIR = path.join(CONTRACTS_UPLOADS_DIR, 'templates');
const CTR_SIGNED_DIR = path.join(CONTRACTS_UPLOADS_DIR, 'signed');
const CTR_TEMP_DIR = path.join(CONTRACTS_UPLOADS_DIR, 'temp');

// Ensure contract folders exist
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
}
ensureContractDirs().catch(console.error);

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
async function updateContractDashboardMetrics() {
  try {
    const contracts = await readJsonFile(CONTRACTS_PATH);
    const approvals = await readJsonFile(CONTRACT_APPROVALS_PATH);
    const sla = await readJsonFile(SLA_TRACKER_PATH);

    const totalActive = contracts.filter(c => c.status === 'Active').length + 843;
    const expiringSoonCount = contracts.filter(c => {
      if (c.status !== 'Active') return false;
      const exp = new Date(c.expiryDate);
      const diffTime = exp - new Date();
      const diffDays = Math.ceil(diffTime / (1024 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 30;
    }).length + 40;

    const pendingLegalReviewsCount = approvals.filter(a => a.currentStage === 'Legal Review').length + 62;
    const breaches = sla.reduce((sum, item) => sum + (item.breachCount || 0), 0) + 11;

    // Calculate lifecycle counts
    const active = contracts.filter(c => c.status === 'Active').length + 843;
    const draft = contracts.filter(c => c.status === 'Draft').length + 119;
    const review = contracts.filter(c => c.status === 'In Review').length + 62;
    const sig = contracts.filter(c => c.status === 'Pending Signature').length + 41;
    const expired = contracts.filter(c => c.status === 'Expired').length + 27;

    const lifecycleDistribution = [
      { name: 'Active', value: active, color: '#16A34A' },
      { name: 'Draft', value: draft, color: '#94A3B8' },
      { name: 'Under Review', value: review, color: '#F59E0B' },
      { name: 'Pending Signature', value: sig, color: '#3B82F6' },
      { name: 'Expired', value: expired, color: '#EF4444' }
    ];

    const currentDashboard = await readJsonFile(CONTRACT_DASHBOARD_PATH);
    const updated = {
      ...currentDashboard,
      totalActiveContracts: totalActive,
      expiringSoon: expiringSoonCount,
      pendingLegalReviews: pendingLegalReviewsCount,
      slaBreaches: breaches,
      lifecycleDistribution
    };
    await writeJsonFile(CONTRACT_DASHBOARD_PATH, updated);
  } catch (err) {
    console.error('Error updating contract dashboard stats:', err.message);
  }
}


// 0. GET /api/contracts/vendors
app.get('/api/contracts/vendors', async (req, res) => {
  try {
    const vendors = await readJsonFile(CONTRACTS_VENDORS_PATH);
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 1. GET /api/contracts
app.get('/api/contracts', async (req, res) => {

  try {
    const contracts = await readJsonFile(CONTRACTS_PATH);
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
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. GET /api/contracts/renewals
app.get('/api/contracts/renewals', async (req, res) => {
  try {
    const renewals = await readJsonFile(CONTRACT_RENEWALS_PATH);
    res.json(renewals);
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
    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. POST /api/contracts and /api/contracts/create
const handleCreateContract = async (req, res) => {
  try {
    const contractData = req.body;
    const contracts = await readJsonFile(CONTRACTS_PATH);

    if (!contractData.contractId) {
      const year = new Date().getFullYear();
      const rand = Math.floor(10000 + Math.random() * 90000);
      contractData.contractId = `CTR-${year}-${String(rand).padStart(5, '0')}`;
    }

    contractData.status = "In Review";
    contractData.createdDate = new Date().toISOString().split('T')[0];
    contractData.lastModified = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    contractData.approvalWorkflow = {
      currentStage: "Procurement Review",
      workflowStep: 1,
      approvalStatus: "Pending",
      currentApprover: "Procurement Team",
      submittedBy: contractData.submittedBy || "Saurabh Anand",
      submittedOn: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    // Calculate Mock AI Risk Insights
    const legalRisk = Math.floor(40 + Math.random() * 30);
    const complianceRisk = Math.floor(15 + Math.random() * 20);
    const financialRisk = Math.floor(50 + Math.random() * 30);
    const riskLevel = financialRisk > 70 ? "High" : financialRisk > 40 ? "Medium" : "Low";

    contractData.riskInsights = {
      portfolioRisk: riskLevel,
      legalExposure: legalRisk,
      complianceRisk: complianceRisk,
      financialRisk: financialRisk,
      aiAlerts: [
        "Missing explicit data residency clause",
        "Penalty cap set to 5% instead of standard 10%"
      ]
    };

    contractData.auditTrail = [
      {
        action: "Contract Created",
        user: contractData.submittedBy || "Saurabh Anand",
        dateTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      }
    ];

    await appendJsonData(CONTRACTS_PATH, contractData);

    // Save history in contract-approvals.json
    const approvalItem = {
      approvalId: `APP-CTR-${Math.floor(1000 + Math.random() * 9000)}`,
      contractId: contractData.contractId,
      vendorName: contractData.vendor?.vendorName || "Unknown Vendor",
      currentStage: "Procurement Review",
      assignedTo: "Procurement Team",
      status: "Pending",
      remarks: "",
      history: [
        {
          action: "Submitted",
          by: contractData.submittedBy || "Saurabh Anand",
          dateTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        }
      ]
    };
    await appendJsonData(CONTRACT_APPROVALS_PATH, approvalItem);

    // Log Activity
    const activity = {
      id: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
      contractId: contractData.contractId,
      action: "Contract Created",
      user: contractData.submittedBy || "Saurabh Anand",
      dateTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };
    await appendJsonData(CONTRACT_ACTIVITY_PATH, activity);

    // Audit Log
    const auditLog = {
      id: `AUD-CTR-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      contractId: contractData.contractId,
      action: "Contract Created & Submitted for Approval",
      performedBy: contractData.submittedBy || "Saurabh Anand",
      details: `Contract with ${contractData.vendor?.vendorName || 'Unknown Vendor'} created and routed to Procurement Review.`
    };
    await appendJsonData(CONTRACT_AUDIT_LOG_PATH, auditLog);

    // Risk Insights Cache
    const riskInsightsItem = {
      contractId: contractData.contractId,
      portfolioRisk: riskLevel,
      legalExposure: legalRisk,
      complianceRisk: complianceRisk,
      financialRisk: financialRisk,
      alerts: [
        { severity: "High", message: "Missing explicit data residency clause" },
        { severity: "Medium", message: "Penalty cap set below enterprise standard" }
      ]
    };
    await appendJsonData(CONTRACT_RISK_INSIGHTS_PATH, riskInsightsItem);

    await updateContractDashboardMetrics();

    res.status(201).json({ success: true, contract: contractData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
app.post('/api/contracts', handleCreateContract);
app.post('/api/contracts/create', handleCreateContract);

// 8. PUT /api/contracts/:id
app.put('/api/contracts/:id', async (req, res) => {
  try {
    const updated = await updateJsonData(CONTRACTS_PATH, 'contractId', req.params.id, req.body);

    const auditLog = {
      id: `AUD-CTR-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      contractId: req.params.id,
      action: "Contract Updated",
      performedBy: req.body.submittedBy || "Saurabh Anand",
      details: "Contract details updated in repository."
    };
    await appendJsonData(CONTRACT_AUDIT_LOG_PATH, auditLog);

    await updateContractDashboardMetrics();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. DELETE /api/contracts/:id
app.delete('/api/contracts/:id', async (req, res) => {
  try {
    await deleteJsonData(CONTRACTS_PATH, 'contractId', req.params.id);
    await deleteJsonData(CONTRACT_APPROVALS_PATH, 'contractId', req.params.id);
    await deleteJsonData(CONTRACT_RENEWALS_PATH, 'contractId', req.params.id);

    const auditLog = {
      id: `AUD-CTR-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      contractId: req.params.id,
      action: "Contract Deleted",
      performedBy: "Saurabh Anand",
      details: `Contract ${req.params.id} permanently deleted.`
    };
    await appendJsonData(CONTRACT_AUDIT_LOG_PATH, auditLog);

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
    const cleanPath = '/uploads/contracts/' + 
      (documentCategory === 'Legal Agreement' || documentCategory === 'Contract Document' ? 'legal/' :
       documentCategory === 'SLA Document' || documentCategory === 'SLA' ? 'sla/' :
       documentCategory === 'Compliance' ? 'compliance/' :
       documentCategory === 'Template' ? 'templates/' :
       documentCategory === 'Signed Contract' ? 'signed/' : 'supporting-documents/') +
      req.file.filename;

    const fileMeta = {
      fileId: `FILE-CTR-${Math.floor(1000 + Math.random() * 9000)}`,
      linkedModule: "Contracts",
      linkedRecordId: linkedRecordId || "",
      fileName: req.file.originalname,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      documentCategory: documentCategory || "supporting-documents",
      storagePath: cleanPath,
      filePath: cleanPath,
      uploadedBy: uploadedBy || "Saurabh Anand",
      uploadedOn: new Date().toISOString().split('T')[0],
      fileSize: `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`,
      size: `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`,
      version: "v1.0",
      isSigned: false
    };

    await appendJsonData(CONTRACT_UPLOADED_FILES_PATH, fileMeta);
    res.json({ success: true, file: fileMeta });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 11. GET /api/contracts/files/:contractId
app.get('/api/contracts/files/:contractId', async (req, res) => {
  try {
    const files = await readJsonFile(CONTRACT_UPLOADED_FILES_PATH);
    const filtered = files.filter(f => f.linkedRecordId === req.params.contractId);
    res.json(filtered);
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

    const contract = contracts[cIndex];
    let workflow = contract.approvalWorkflow || {};
    let nextStage = "";
    let nextStep = workflow.workflowStep || 1;
    let nextStatus = "In Review";

    if (workflow.workflowStep === 1) {
      nextStage = "Legal Review";
      nextStep = 2;
    } else if (workflow.workflowStep === 2) {
      nextStage = "Finance Review";
      nextStep = 3;
    } else if (workflow.workflowStep === 3) {
      nextStage = "Final Approval";
      nextStep = 4;
    } else if (workflow.workflowStep === 4) {
      nextStage = "Approved";
      nextStep = 4;
      nextStatus = "Active";
    }

    contract.status = nextStatus;
    contract.approvalWorkflow = {
      ...workflow,
      currentStage: nextStage === "Approved" ? "" : nextStage,
      workflowStep: nextStep,
      approvalStatus: nextStatus === "Active" ? "Approved" : "Pending",
      currentApprover: nextStage === "Legal Review" ? "Legal Team" : 
                       nextStage === "Finance Review" ? "Finance Team" :
                       nextStage === "Final Approval" ? "Executive Board" : "",
      lastRemarks: remarks
    };

    if (!contract.auditTrail) contract.auditTrail = [];
    contract.auditTrail.push({
      action: `Approved at Stage ${workflow.currentStage}`,
      user: userName,
      dateTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      remarks
    });

    contracts[cIndex] = contract;
    await writeJsonFile(CONTRACTS_PATH, contracts);

    // Update approvals queue
    const approvals = await readJsonFile(CONTRACT_APPROVALS_PATH);
    const appIndex = approvals.findIndex(a => a.contractId === contractId);
    if (appIndex !== -1) {
      if (nextStatus === "Active") {
        approvals.splice(appIndex, 1);
      } else {
        approvals[appIndex].currentStage = nextStage;
        approvals[appIndex].assignedTo = contract.approvalWorkflow.currentApprover;
        approvals[appIndex].remarks = remarks;
        if (!approvals[appIndex].history) approvals[appIndex].history = [];
        approvals[appIndex].history.push({
          action: `Approved by ${workflow.currentStage}`,
          by: userName,
          dateTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          remarks
        });
      }
      await writeJsonFile(CONTRACT_APPROVALS_PATH, approvals);
    }

    // Log activity
    const activity = {
      id: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
      contractId,
      action: `Approved (${workflow.currentStage})`,
      user: userName,
      dateTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };
    await appendJsonData(CONTRACT_ACTIVITY_PATH, activity);

    // Audit Log
    const auditLog = {
      id: `AUD-CTR-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      contractId,
      action: `Stage Approval: ${workflow.currentStage}`,
      performedBy: userName,
      details: `Approved by ${userName} at ${workflow.currentStage}. Remarks: ${remarks || 'None'}`
    };
    await appendJsonData(CONTRACT_AUDIT_LOG_PATH, auditLog);

    await updateContractDashboardMetrics();
    res.json({ success: true, contract });
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

    const contract = contracts[cIndex];
    const previousStage = contract.approvalWorkflow?.currentStage || "Review";

    contract.status = mode === 'Send Back' ? 'Draft' : 'Terminated';
    contract.approvalWorkflow = {
      ...contract.approvalWorkflow,
      approvalStatus: mode === 'Send Back' ? 'Sent Back' : 'Rejected',
      currentStage: mode === 'Send Back' ? 'Procurement Review' : 'Rejected',
      workflowStep: mode === 'Send Back' ? 1 : 0,
      currentApprover: mode === 'Send Back' ? 'Procurement Team' : '',
      lastRemarks: remarks
    };

    if (!contract.auditTrail) contract.auditTrail = [];
    contract.auditTrail.push({
      action: `${mode}ed at Stage ${previousStage}`,
      user: userName,
      dateTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      remarks
    });

    contracts[cIndex] = contract;
    await writeJsonFile(CONTRACTS_PATH, contracts);

    const approvals = await readJsonFile(CONTRACT_APPROVALS_PATH);
    const appIndex = approvals.findIndex(a => a.contractId === contractId);
    if (appIndex !== -1) {
      if (mode === 'Send Back') {
        approvals[appIndex].currentStage = "Procurement Review";
        approvals[appIndex].assignedTo = "Procurement Team";
        approvals[appIndex].status = "Sent Back";
        approvals[appIndex].remarks = remarks;
        if (!approvals[appIndex].history) approvals[appIndex].history = [];
        approvals[appIndex].history.push({
          action: `Sent Back by ${previousStage}`,
          by: userName,
          dateTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          remarks
        });
      } else {
        approvals.splice(appIndex, 1);
      }
      await writeJsonFile(CONTRACT_APPROVALS_PATH, approvals);
    }

    const activity = {
      id: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
      contractId,
      action: `${mode}ed (${previousStage})`,
      user: userName,
      dateTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };
    await appendJsonData(CONTRACT_ACTIVITY_PATH, activity);

    const auditLog = {
      id: `AUD-CTR-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      contractId,
      action: `Contract ${mode}ed`,
      performedBy: userName,
      details: `${mode}ed at ${previousStage} by ${userName}. Remarks: ${remarks || 'None'}`
    };
    await appendJsonData(CONTRACT_AUDIT_LOG_PATH, auditLog);

    await updateContractDashboardMetrics();
    res.json({ success: true, contract });
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
    const vendors = await readJsonFile(PO_RFQ_VENDORS_PATH);
    res.json(vendors);
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

// Global error handler for uncaught multer/routing errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`VMS Backend server running on port ${PORT}`);
});
