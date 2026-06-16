import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, Download, Trash2, Plus, Upload, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Badge } from '../../components/Badge/Badge';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../context/VendorContext';
import styles from './AddVendor.module.css';

const STEPS = ['Basic Details', 'Business Details', 'Bank Details', 'Documents', 'Review'];

interface Document {
  documentType: string;
  fileName: string;
  savedFileName?: string;
  filePath?: string;
  status: 'Verified' | 'Pending' | 'Uploaded' | 'Missing';
  expiryDate: string | null;
}

export const AddVendor: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editVendorId = searchParams.get('id');
  const { hasActionPermission } = useAuth();
  const { vendors, registerVendor, updateVendor } = useVendors();

  const isEdit = !!editVendorId;
  const hasEditPermission = hasActionPermission('EDIT_VENDOR');
  const hasCreatePermission = hasActionPermission('CREATE_VENDOR');

  const isViewMode = searchParams.get('view') === 'true' ||
                     (isEdit && !hasEditPermission) ||
                     (!isEdit && !hasCreatePermission);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState('VND-2025-00029');
  const [submittedDate, setSubmittedDate] = useState('07 May 2025, 11:45 AM');

  // Verification states
  const [verifyingPan, setVerifyingPan] = useState(false);
  const [verifyingGstin, setVerifyingGstin] = useState(false);
  const [verifyingIfsc, setVerifyingIfsc] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  const [gstinVerified, setGstinVerified] = useState(false);
  const [ifscVerified, setIfscVerified] = useState(false);
  const [bankVerificationDate, setBankVerificationDate] = useState<string | null>(null);

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [form, setForm] = useState({
    // Basic Details
    legalName: '',
    tradeName: '',
    dateOfIncorporation: '',
    cinNumber: '',
    panNumber: '',
    gstin: '',
    msmeClassification: 'Small',
    companyWebsite: '',
    businessType: 'Private Limited Company',

    // Business Details
    vendorCategory: 'IT Services',
    subCategory: 'Software Development',
    serviceAreas: 'Mumbai, Pune, Bengaluru',
    productsServicesOffered: 'Custom Software Development, Support & Maintenance',
    annualTurnover: '50000000',
    employeeCount: '120',
    majorClients: 'TCS, HDFC Bank',
    criticalVendor: true,

    // Bank Details
    bankName: '',
    accountNumber: '',
    accountType: 'Current Account',
    ifscCode: '',
    branchName: '',
    cancelledChequeFile: '',

    // Documents
    documents: [] as Document[]
  });

  const [declaration, setDeclaration] = useState(true);

  // Load existing vendor for EDIT or VIEW mode
  useEffect(() => {
    const fetchVendor = async () => {
      if (editVendorId) {
        setLoading(true);
        try {
          let vendor = vendors.find((v: any) => v.vendorId === editVendorId);
          if (!vendor) {
            const res = await axios.get(`/api/vendors/${editVendorId}`);
            vendor = res.data;
          }
          if (!vendor) {
            throw new Error('Vendor not found');
          }
          setForm({
            legalName: vendor.basicDetails?.legalName || '',
            tradeName: vendor.basicDetails?.tradeName || '',
            dateOfIncorporation: vendor.basicDetails?.dateOfIncorporation || '',
            cinNumber: vendor.basicDetails?.cinNumber || '',
            panNumber: vendor.basicDetails?.panNumber || '',
            gstin: vendor.basicDetails?.gstin || '',
            msmeClassification: vendor.basicDetails?.msmeClassification || 'Small',
            companyWebsite: vendor.basicDetails?.companyWebsite || '',
            businessType: vendor.basicDetails?.businessType || 'Private Limited Company',

            vendorCategory: vendor.businessDetails?.vendorCategory || 'IT Services',
            subCategory: vendor.businessDetails?.subCategory || 'Software Development',
            serviceAreas: Array.isArray(vendor.businessDetails?.serviceAreas) 
              ? vendor.businessDetails.serviceAreas.join(', ') 
              : vendor.businessDetails?.serviceAreas || '',
            productsServicesOffered: vendor.businessDetails?.productsServicesOffered || '',
            annualTurnover: vendor.businessDetails?.annualTurnover?.toString() || '',
            employeeCount: vendor.businessDetails?.employeeCount?.toString() || '',
            majorClients: Array.isArray(vendor.businessDetails?.majorClients)
              ? vendor.businessDetails.majorClients.join(', ')
              : vendor.businessDetails?.majorClients || '',
            criticalVendor: vendor.businessDetails?.criticalVendor ?? true,

            bankName: vendor.bankDetails?.bankName || '',
            accountNumber: vendor.bankDetails?.accountNumber || '',
            accountType: vendor.bankDetails?.accountType || 'Current Account',
            ifscCode: vendor.bankDetails?.ifscCode || '',
            branchName: vendor.bankDetails?.branchName || '',
            cancelledChequeFile: vendor.bankDetails?.cancelledChequeFile || '',

            documents: vendor.documents || []
          });

          if (vendor.basicDetails?.panNumber) setPanVerified(true);
          if (vendor.basicDetails?.gstin) setGstinVerified(true);
          if (vendor.bankDetails?.ifscCode) {
            setIfscVerified(true);
            setBankVerificationDate(new Date(vendor.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
          }
        } catch (err) {
          console.error('Error fetching vendor details:', err);
          alert('Failed to load vendor details.');
        } finally {
          setLoading(false);
        }
      } else {
        // Load Draft from local storage if available
        const savedDraft = localStorage.getItem('vms_vendor_draft');
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            setForm(parsed);
            if (parsed.panNumber) setPanVerified(true);
            if (parsed.gstin) setGstinVerified(true);
            if (parsed.ifscCode) {
              setIfscVerified(true);
              setBankVerificationDate(new Date().toLocaleString('en-IN'));
            }
          } catch (e) {
            console.error('Failed to parse draft from localStorage', e);
          }
        } else {
          // Initialize documents slots
          setForm(prev => ({
            ...prev,
            documents: [
              { documentType: 'PAN Card', fileName: '', status: 'Missing', expiryDate: null },
              { documentType: 'GST Certificate', fileName: '', status: 'Missing', expiryDate: null },
              { documentType: 'Certificate of Incorporation', fileName: '', status: 'Missing', expiryDate: null },
              { documentType: 'MSME Certificate', fileName: '', status: 'Missing', expiryDate: '2026-03-15' }
            ]
          }));
        }
      }
    };
    fetchVendor();
  }, [editVendorId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (isViewMode) return;
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
      // Clear validation error on change
      if (errors[name]) {
        setErrors(prev => {
          const copy = { ...prev };
          delete copy[name];
          return copy;
        });
      }
    }
  };

  const saveDraft = () => {
    localStorage.setItem('vms_vendor_draft', JSON.stringify(form));
    alert('Progress saved as draft successfully!');
  };

  // Form validations for each wizard step
  const validateStep = (step: number): boolean => {
    if (isViewMode) return true; // Skip validation in read-only mode
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      if (!form.legalName.trim()) stepErrors.legalName = 'Legal Name is required';
      if (!form.dateOfIncorporation) stepErrors.dateOfIncorporation = 'Date of Incorporation is required';
      
      // CIN validation (21 alphanumeric characters)
      const cinRegex = /^[LU]?[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
      if (!form.cinNumber) {
        stepErrors.cinNumber = 'CIN Number is required';
      } else if (!cinRegex.test(form.cinNumber.toUpperCase())) {
        stepErrors.cinNumber = 'Invalid CIN Number format (e.g. U72900MH2015PTC123456)';
      }

      // PAN validation (10 alphanumeric characters)
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!form.panNumber) {
        stepErrors.panNumber = 'PAN Number is required';
      } else if (!panRegex.test(form.panNumber.toUpperCase())) {
        stepErrors.panNumber = 'Invalid PAN format (e.g. AAACA1234A)';
      } else if (!panVerified) {
        stepErrors.panNumber = 'Please verify the PAN Number first';
      }

      // GSTIN validation (15 alphanumeric characters)
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!form.gstin) {
        stepErrors.gstin = 'GSTIN is required';
      } else if (!gstinRegex.test(form.gstin.toUpperCase())) {
        stepErrors.gstin = 'Invalid GSTIN format (e.g. 27AAACA1234A1Z5)';
      } else if (!gstinVerified) {
        stepErrors.gstin = 'Please verify the GSTIN first';
      }

      if (form.companyWebsite) {
        const urlRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+.*$/;
        if (!urlRegex.test(form.companyWebsite)) {
          stepErrors.companyWebsite = 'Invalid website URL format';
        }
      }
    }

    if (step === 2) {
      if (!form.serviceAreas.trim()) stepErrors.serviceAreas = 'Service Areas are required';
      if (!form.productsServicesOffered.trim()) stepErrors.productsServicesOffered = 'Products/Services Offered is required';
      if (!form.annualTurnover || isNaN(Number(form.annualTurnover)) || Number(form.annualTurnover) <= 0) {
        stepErrors.annualTurnover = 'Please enter a valid positive Annual Turnover';
      }
      if (!form.employeeCount || isNaN(Number(form.employeeCount)) || Number(form.employeeCount) < 0) {
        stepErrors.employeeCount = 'Please enter a valid Employee Count';
      }
    }

    if (step === 3) {
      if (!form.bankName.trim()) stepErrors.bankName = 'Bank Name is required';
      if (!form.accountNumber.trim()) {
        stepErrors.accountNumber = 'Account Number is required';
      } else if (form.accountNumber.length < 9 || form.accountNumber.length > 18) {
        stepErrors.accountNumber = 'Account Number must be between 9 and 18 digits';
      }
      
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!form.ifscCode) {
        stepErrors.ifscCode = 'IFSC Code is required';
      } else if (!ifscRegex.test(form.ifscCode.toUpperCase())) {
        stepErrors.ifscCode = 'Invalid IFSC Code (e.g. HDFC0001234)';
      } else if (!ifscVerified) {
        stepErrors.ifscCode = 'Please verify the IFSC Code first';
      }

      if (!form.branchName.trim()) stepErrors.branchName = 'Branch Name is required';
      if (!form.cancelledChequeFile) stepErrors.cancelledChequeFile = 'Please upload a cancelled cheque file';
    }

    if (step === 4) {
      // Validate mandatory documents are uploaded
      const missingMandatory = form.documents
        .filter(doc => doc.documentType !== 'MSME Certificate' && doc.status === 'Missing');
      if (missingMandatory.length > 0) {
        alert(`Please upload all mandatory documents: ${missingMandatory.map(d => d.documentType).join(', ')}`);
        return false;
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // API/Verify triggers
  const handleVerifyPan = () => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!form.panNumber || !panRegex.test(form.panNumber.toUpperCase())) {
      setErrors(prev => ({ ...prev, panNumber: 'Enter a valid 10-character PAN first' }));
      return;
    }
    setVerifyingPan(true);
    setTimeout(() => {
      setVerifyingPan(false);
      setPanVerified(true);
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.panNumber;
        return copy;
      });
    }, 1000);
  };

  const handleVerifyGstin = () => {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!form.gstin || !gstinRegex.test(form.gstin.toUpperCase())) {
      setErrors(prev => ({ ...prev, gstin: 'Enter a valid 15-character GSTIN first' }));
      return;
    }
    setVerifyingGstin(true);
    setTimeout(() => {
      setVerifyingGstin(false);
      setGstinVerified(true);
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.gstin;
        return copy;
      });
    }, 1000);
  };

  const handleVerifyIfsc = () => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!form.ifscCode || !ifscRegex.test(form.ifscCode.toUpperCase())) {
      setErrors(prev => ({ ...prev, ifscCode: 'Enter a valid 11-character IFSC Code first' }));
      return;
    }
    setVerifyingIfsc(true);
    setTimeout(() => {
      setVerifyingIfsc(false);
      setIfscVerified(true);
      setBankVerificationDate(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
      setForm(prev => ({
        ...prev,
        branchName: prev.branchName ? prev.branchName : 'Mumbai - Andheri East',
        bankName: prev.bankName ? prev.bankName : 'HDFC Bank Limited'
      }));
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.ifscCode;
        return copy;
      });
    }, 1000);
  };

  // Multer Document Uploader
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, docType: string, isCancelledCheque = false) => {
    if (isViewMode) return;
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', docType);

    try {
      if (isCancelledCheque) {
        setForm(prev => ({ ...prev, cancelledChequeFile: file.name }));
        setErrors(prev => {
          const copy = { ...prev };
          delete copy.cancelledChequeFile;
          return copy;
        });
      } else {
        // Upload certificate
        const res = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        const uploaded = res.data.fileInfo;
        setForm(prev => {
          const docsCopy = [...prev.documents];
          const index = docsCopy.findIndex(d => d.documentType === docType);
          if (index !== -1) {
            docsCopy[index] = {
              documentType: docType,
              fileName: uploaded.fileName,
              savedFileName: uploaded.savedFileName,
              filePath: uploaded.filePath,
              status: 'Verified', // Auto verified in this prototype
              expiryDate: docsCopy[index].expiryDate
            };
          } else {
            docsCopy.push({
              documentType: docType,
              fileName: uploaded.fileName,
              savedFileName: uploaded.savedFileName,
              filePath: uploaded.filePath,
              status: 'Verified',
              expiryDate: null
            });
          }
          return { ...prev, documents: docsCopy };
        });
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('File upload failed. Check server log.');
    }
  };

  const handleDeleteDocument = (docType: string, isCancelledCheque = false) => {
    if (isViewMode) return;
    if (isCancelledCheque) {
      setForm(prev => ({ ...prev, cancelledChequeFile: '' }));
    } else {
      setForm(prev => {
        const docsCopy = [...prev.documents];
        const index = docsCopy.findIndex(d => d.documentType === docType);
        if (index !== -1) {
          docsCopy[index] = {
            ...docsCopy[index],
            fileName: '',
            savedFileName: '',
            filePath: '',
            status: 'Missing'
          };
        }
        return { ...prev, documents: docsCopy };
      });
    }
  };

  const handleAddAdditionalDocument = () => {
    if (isViewMode) return;
    const docName = prompt('Enter additional document name:');
    if (!docName) return;
    setForm(prev => ({
      ...prev,
      documents: [
        ...prev.documents,
        { documentType: docName, fileName: '', status: 'Missing', expiryDate: null }
      ]
    }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate('/vendors');
    }
  };

  const handleSubmit = async () => {
    if (isViewMode) {
      navigate('/vendors');
      return;
    }
    if (!declaration) {
      alert('You must accept the declaration to submit.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        vendorId: editVendorId || undefined,
        status: 'Pending Approval',
        basicDetails: {
          legalName: form.legalName,
          tradeName: form.tradeName,
          dateOfIncorporation: form.dateOfIncorporation,
          cinNumber: form.cinNumber,
          panNumber: form.panNumber,
          gstin: form.gstin,
          msmeClassification: form.msmeClassification,
          companyWebsite: form.companyWebsite,
          businessType: form.businessType
        },
        businessDetails: {
          vendorCategory: form.vendorCategory,
          subCategory: form.subCategory,
          serviceAreas: form.serviceAreas.split(',').map(s => s.trim()),
          productsServicesOffered: form.productsServicesOffered,
          annualTurnover: Number(form.annualTurnover),
          employeeCount: Number(form.employeeCount),
          majorClients: form.majorClients.split(',').map(s => s.trim()),
          criticalVendor: form.criticalVendor
        },
        bankDetails: {
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          accountType: form.accountType,
          ifscCode: form.ifscCode,
          branchName: form.branchName,
          cancelledChequeFile: form.cancelledChequeFile,
          bankVerificationStatus: 'Verified'
        },
        documents: form.documents,
        approvalWorkflow: {
          submittedBy: 'Saurabh Anand',
          submittedDate: new Date().toISOString(),
          currentStage: 'Procurement Approval',
          approvalStatus: 'Pending'
        },
        auditTrail: [
          {
            action: editVendorId ? 'Vendor Updated' : 'Vendor Onboarding Created',
            performedBy: 'Saurabh Anand',
            timestamp: new Date().toISOString()
          }
        ]
      };

      let res;
      if (editVendorId) {
        res = await updateVendor(editVendorId, payload);
      } else {
        res = await registerVendor(payload);
      }

      setSubmittedRef(res.vendorId);
      setSubmittedDate(new Date(res.createdAt || new Date()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
      
      // Clean draft from localStorage
      localStorage.removeItem('vms_vendor_draft');

      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting vendor form:', err);
      alert('Failed to submit vendor form. Please check backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: string) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  if (loading) {
    return (
      <div className={styles.container} style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
        <span style={{ marginLeft: '12px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>Loading vendor details...</span>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>
            <CheckCircle2 size={64} color="#16a34a" />
          </div>
          <h2 className={styles.successTitle}>Vendor {editVendorId ? 'Updated' : 'Submitted'} Successfully!</h2>
          <p className={styles.successDesc}>Your vendor registration details have been uploaded and routed for verification.</p>
          
          <div className={styles.refBox}>
            <div className={styles.refItem}>
              <span>Vendor Reference No.</span>
              <strong>{submittedRef}</strong>
            </div>
            <div className={styles.refItem}>
              <span>Submitted On</span>
              <strong>{submittedDate}</strong>
            </div>
          </div>
          
          <div className={styles.successActions}>
            <Button onClick={() => navigate('/vendors')}>Go to Vendor List</Button>
            <Button variant="outline" onClick={() => navigate('/vendors/approvals')}>View My Requests</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>
            {isViewMode ? 'View Vendor Details' : editVendorId ? 'Edit Vendor' : 'Register Vendor'}
          </h1>
          <p className={styles.breadcrumbs}>
            Home / Vendor Onboarding & KYC / {isViewMode ? 'View Vendor' : editVendorId ? 'Edit Vendor' : 'Register Vendor'}
          </p>
        </div>
      </header>

      <Card className={styles.wizardCard}>
        {/* Stepper Header */}
        <div className={styles.stepperContainer}>
          {STEPS.map((step, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === currentStep;
            const isPassed = stepNum < currentStep;
            
            return (
              <div key={step} className={styles.stepWrapper}>
                <div className={styles.stepIndicator}>
                  <div className={`${styles.stepCircle} ${isActive ? styles.activeCircle : ''} ${isPassed ? styles.passedCircle : ''}`}>
                    {isPassed ? <CheckCircle2 size={16} /> : stepNum}
                  </div>
                  <span className={`${styles.stepLabel} ${isActive ? styles.activeLabel : ''}`}>{step}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`${styles.stepLine} ${isPassed ? styles.passedLine : ''}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Wizard Form Panels */}
        <div className={styles.formContainer}>
          {currentStep === 1 && (
            <div className={styles.formGrid}>
              <Input 
                label="Legal Name *" 
                name="legalName" 
                placeholder="ABC Infotech Private Limited" 
                value={form.legalName}
                onChange={handleChange}
                error={errors.legalName}
                disabled={isViewMode}
              />
              <Input 
                label="Date of Incorporation *" 
                name="dateOfIncorporation" 
                type="date" 
                value={form.dateOfIncorporation}
                onChange={handleChange}
                error={errors.dateOfIncorporation}
                disabled={isViewMode}
              />
              <Input 
                label="Trade Name" 
                name="tradeName" 
                placeholder="ABC Infotech" 
                value={form.tradeName}
                onChange={handleChange}
                disabled={isViewMode}
              />
              <Input 
                label="CIN Number *" 
                name="cinNumber" 
                placeholder="U72900MH2015PTC123456" 
                value={form.cinNumber}
                onChange={handleChange}
                error={errors.cinNumber}
                disabled={isViewMode}
              />
              
              <div className={styles.inputWithAction}>
                <Input 
                  label="PAN Number *" 
                  name="panNumber" 
                  placeholder="AAACA1234A" 
                  value={form.panNumber}
                  onChange={handleChange}
                  error={errors.panNumber}
                  style={{ textTransform: 'uppercase' }}
                  disabled={panVerified || isViewMode}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={styles.verifyBtn} 
                  onClick={handleVerifyPan}
                  disabled={verifyingPan || panVerified || isViewMode}
                >
                  {verifyingPan ? <Loader2 size={12} className="animate-spin" /> : panVerified ? 'Verified' : 'Verify PAN'}
                </Button>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>MSME Classification</label>
                <select 
                  name="msmeClassification" 
                  className={styles.selectInput} 
                  value={form.msmeClassification}
                  onChange={handleChange}
                  disabled={isViewMode}
                >
                  <option value="Small">Small</option>
                  <option value="Micro">Micro</option>
                  <option value="Medium">Medium</option>
                  <option value="Not Applicable">Not Applicable</option>
                </select>
              </div>

              <div className={styles.inputWithAction}>
                <Input 
                  label="GSTIN *" 
                  name="gstin" 
                  placeholder="27AAACA1234A1Z5" 
                  value={form.gstin}
                  onChange={handleChange}
                  error={errors.gstin}
                  style={{ textTransform: 'uppercase' }}
                  disabled={gstinVerified || isViewMode}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={styles.verifyBtn} 
                  onClick={handleVerifyGstin}
                  disabled={verifyingGstin || gstinVerified || isViewMode}
                >
                  {verifyingGstin ? <Loader2 size={12} className="animate-spin" /> : gstinVerified ? 'Verified' : 'Verify GSTIN'}
                </Button>
              </div>

              <Input 
                label="Company Website" 
                name="companyWebsite" 
                placeholder="www.abcinfotech.com" 
                value={form.companyWebsite}
                onChange={handleChange}
                error={errors.companyWebsite}
                disabled={isViewMode}
              />
              
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Business Type *</label>
                <select 
                  name="businessType" 
                  className={styles.selectInput} 
                  value={form.businessType}
                  onChange={handleChange}
                  disabled={isViewMode}
                >
                  <option value="Private Limited Company">Private Limited Company</option>
                  <option value="Public Limited Company">Public Limited Company</option>
                  <option value="LLP">LLP</option>
                  <option value="Partnership">Partnership</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Vendor Category *</label>
                <select 
                  name="vendorCategory" 
                  className={styles.selectInput}
                  value={form.vendorCategory}
                  onChange={handleChange}
                  disabled={isViewMode}
                >
                  <option value="IT Services">IT Services</option>
                  <option value="Facilities">Facilities</option>
                  <option value="Consulting">Consulting</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Sub Category *</label>
                <select 
                  name="subCategory" 
                  className={styles.selectInput}
                  value={form.subCategory}
                  onChange={handleChange}
                  disabled={isViewMode}
                >
                  <option value="Software Development">Software Development</option>
                  <option value="Hardware Supply">Hardware Supply</option>
                  <option value="Cloud Hosting">Cloud Hosting</option>
                </select>
              </div>
              
              <Input 
                label="Service Areas *" 
                name="serviceAreas" 
                placeholder="Mumbai, Pune, Bengaluru" 
                value={form.serviceAreas}
                onChange={handleChange}
                error={errors.serviceAreas}
                disabled={isViewMode}
              />
              <Input 
                label="Products/Services Offered *" 
                name="productsServicesOffered" 
                placeholder="Custom Software Development, Support & Maintenance" 
                value={form.productsServicesOffered}
                onChange={handleChange}
                error={errors.productsServicesOffered}
                disabled={isViewMode}
              />
              
              <Input 
                label="Annual Turnover (₹)" 
                name="annualTurnover" 
                placeholder="50000000" 
                value={form.annualTurnover}
                onChange={handleChange}
                error={errors.annualTurnover}
                type="number"
                disabled={isViewMode}
              />
              <Input 
                label="No. of Employees" 
                name="employeeCount" 
                placeholder="120" 
                value={form.employeeCount}
                onChange={handleChange}
                error={errors.employeeCount}
                type="number"
                disabled={isViewMode}
              />
              
              <Input 
                label="Major Clients" 
                name="majorClients" 
                placeholder="TCS, HDFC Bank" 
                value={form.majorClients}
                onChange={handleChange}
                disabled={isViewMode}
              />
              
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Critical Vendor</label>
                <div className={styles.toggleGroup}>
                  <label className={styles.toggle}>
                    <input 
                      type="checkbox" 
                      name="criticalVendor" 
                      checked={form.criticalVendor} 
                      onChange={handleChange}
                      disabled={isViewMode}
                    />
                    <span className={styles.slider}></span>
                  </label>
                  <span>{form.criticalVendor ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className={styles.formGrid}>
              <Input 
                label="Bank Name *" 
                name="bankName" 
                placeholder="HDFC Bank Limited" 
                value={form.bankName}
                onChange={handleChange}
                error={errors.bankName}
                disabled={isViewMode}
              />
              <Input 
                label="Account Number *" 
                name="accountNumber" 
                placeholder="50100234567890" 
                value={form.accountNumber}
                onChange={handleChange}
                error={errors.accountNumber}
                type="password"
                disabled={isViewMode}
              />
               
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Account Type</label>
                <select 
                  name="accountType" 
                  className={styles.selectInput}
                  value={form.accountType}
                  onChange={handleChange}
                  disabled={isViewMode}
                >
                  <option value="Current Account">Current Account</option>
                  <option value="Savings Account">Savings Account</option>
                </select>
              </div>
              
              <div className={styles.inputWithAction}>
                <Input 
                  label="IFSC Code *" 
                  name="ifscCode" 
                  placeholder="HDFC0001234" 
                  value={form.ifscCode}
                  onChange={handleChange}
                  error={errors.ifscCode}
                  style={{ textTransform: 'uppercase' }}
                  disabled={ifscVerified || isViewMode}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={styles.verifyBtn}
                  onClick={handleVerifyIfsc}
                  disabled={verifyingIfsc || ifscVerified || isViewMode}
                >
                  {verifyingIfsc ? <Loader2 size={12} className="animate-spin" /> : ifscVerified ? 'Verified' : 'Verify IFSC'}
                </Button>
              </div>
              
              <Input 
                label="Branch Name" 
                name="branchName" 
                placeholder="Mumbai - Andheri East" 
                value={form.branchName}
                onChange={handleChange}
                error={errors.branchName}
                disabled={isViewMode}
              />
              
              <div className={styles.uploadBox}>
                <label className={styles.inputLabel}>Upload Cancelled Cheque *</label>
                {form.cancelledChequeFile ? (
                  <div className={styles.uploadArea}>
                    <div className={styles.uploadDetails}>
                      <div className={styles.fileIcon}>📄</div>
                      <div>
                        <p className={styles.fileName}>{form.cancelledChequeFile}</p>
                        <p className={styles.fileSize}>245 KB</p>
                      </div>
                    </div>
                    {!isViewMode && (
                      <button className={styles.deleteBtn} onClick={() => handleDeleteDocument('', true)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className={styles.uploadArea} style={{ borderStyle: 'dashed', cursor: isViewMode ? 'default' : 'pointer', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    {isViewMode ? (
                      <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>No Cancelled Cheque Uploaded</span>
                    ) : (
                      <>
                        <Upload size={18} style={{ color: 'var(--color-text-secondary)' }} />
                        <input 
                          type="file" 
                          accept=".jpg,.jpeg,.png,.pdf" 
                          style={{ display: 'none' }} 
                          id="cheque-file-input"
                          onChange={(e) => handleFileUpload(e, 'Cancelled Cheque', true)}
                        />
                        <label htmlFor="cheque-file-input" style={{ cursor: 'pointer', fontSize: '13px', color: 'var(--color-primary)', fontWeight: '500' }}>
                          Click to upload Cancelled Cheque
                        </label>
                      </>
                    )}
                  </div>
                )}
                {errors.cancelledChequeFile && <span style={{ color: 'var(--color-danger)', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.cancelledChequeFile}</span>}
              </div>

              {ifscVerified && (
                <div className={styles.verificationBox}>
                  <div className={styles.verifyStatus}>
                    <CheckCircle2 size={16} color="#16a34a" /> Bank Verification Successful
                  </div>
                  <div className={styles.verifyMeta}>Verified on: {bankVerificationDate || '07 May 2025, 11:30 AM'}</div>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className={styles.documentsStep}>
              <h3 className={styles.sectionTitle}>Mandatory Documents</h3>
              <div className={styles.docTableWrapper}>
              <table className={styles.docTable}>
                <thead>
                  <tr>
                    <th>Document Name</th>
                    <th>File</th>
                    <th>Status</th>
                    <th>Expiry Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {form.documents.map((doc, idx) => (
                    <tr key={idx}>
                      <td>{doc.documentType} *</td>
                      <td>
                        {doc.fileName ? (
                          <span className={styles.docLink} onClick={() => doc.filePath && window.open(doc.filePath, '_blank')}>
                            {doc.fileName}
                          </span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {!isViewMode ? (
                              <>
                                <input 
                                  type="file" 
                                  accept=".pdf,.png,.jpg,.jpeg" 
                                  id={`doc-input-${idx}`}
                                  style={{ display: 'none' }}
                                  onChange={(e) => handleFileUpload(e, doc.documentType)}
                                />
                                <label htmlFor={`doc-input-${idx}`} style={{ cursor: 'pointer', fontSize: '12px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Upload size={12} /> Upload
                                </label>
                              </>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>Missing File</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        <Badge variant={doc.status === 'Verified' || doc.status === 'Uploaded' ? 'success' : 'danger'}>
                          {doc.status}
                        </Badge>
                      </td>
                      <td>{doc.expiryDate ? doc.expiryDate.split('-').reverse().join('/') : '-'}</td>
                      <td>
                        <div className={styles.docActions}>
                          {doc.fileName && (
                            <>
                              <button onClick={() => doc.filePath && window.open(doc.filePath, '_blank')} title="Download">
                                <Download size={16}/>
                              </button>
                              {!isViewMode && (
                                <button onClick={() => handleDeleteDocument(doc.documentType)} title="Delete">
                                  <Trash2 size={16}/>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              {!isViewMode && (
                <Button 
                  variant="ghost" 
                  icon={<Plus size={16}/>} 
                  className={styles.addDocBtn}
                  onClick={handleAddAdditionalDocument}
                >
                  Upload Additional Document
                </Button>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className={styles.reviewStep}>
              <div className={styles.reviewGrid}>
                <div className={styles.reviewSection}>
                  <h3>Basic Details</h3>
                  <div className={styles.reviewData}>
                    <div><span>Legal Name</span><strong>{form.legalName}</strong></div>
                    <div><span>Date of Incorporation</span><strong>{form.dateOfIncorporation ? form.dateOfIncorporation.split('-').reverse().join('/') : '-'}</strong></div>
                    <div><span>Trade Name</span><strong>{form.tradeName || '-'}</strong></div>
                    <div><span>CIN</span><strong>{form.cinNumber}</strong></div>
                    <div><span>PAN</span><strong>{form.panNumber}</strong></div>
                    <div><span>GSTIN</span><strong>{form.gstin}</strong></div>
                    <div><span>MSME Classification</span><strong>{form.msmeClassification}</strong></div>
                    <div><span>Company Website</span><strong>{form.companyWebsite || '-'}</strong></div>
                    <div><span>Business Type</span><strong>{form.businessType}</strong></div>
                  </div>
                </div>
                
                <div className={styles.reviewSection}>
                  <h3>Business Details</h3>
                  <div className={styles.reviewData}>
                    <div><span>Category</span><strong>{form.vendorCategory}</strong></div>
                    <div><span>Sub Category</span><strong>{form.subCategory}</strong></div>
                    <div><span>Service Areas</span><strong>{form.serviceAreas}</strong></div>
                    <div><span>Products/Services Offered</span><strong>{form.productsServicesOffered}</strong></div>
                    <div><span>Annual Turnover</span><strong>{formatCurrency(form.annualTurnover)}</strong></div>
                    <div><span>No. of Employees</span><strong>{form.employeeCount}</strong></div>
                    <div><span>Major Clients</span><strong>{form.majorClients || '-'}</strong></div>
                    <div><span>Critical Vendor</span><strong>{form.criticalVendor ? 'Yes' : 'No'}</strong></div>
                  </div>
                </div>

                <div className={styles.reviewSection}>
                  <h3>Bank Details</h3>
                  <div className={styles.reviewData}>
                    <div><span>Bank Name</span><strong>{form.bankName}</strong></div>
                    <div><span>Account Number</span><strong>{'*'.repeat(form.accountNumber.length - 4) + form.accountNumber.slice(-4)}</strong></div>
                    <div><span>Account Type</span><strong>{form.accountType}</strong></div>
                    <div><span>IFSC Code</span><strong>{form.ifscCode}</strong></div>
                    <div><span>Branch Name</span><strong>{form.branchName}</strong></div>
                    <div><span>Cancelled Cheque</span><strong>{form.cancelledChequeFile}</strong></div>
                  </div>
                </div>

                <div className={styles.reviewSection}>
                  <h3>Uploaded Documents</h3>
                  <div className={styles.reviewData}>
                    {form.documents.map((d, idx) => (
                      <div key={idx}>
                        <span>{d.documentType}</span>
                        <strong>{d.fileName ? `${d.fileName} (${d.status})` : 'Not uploaded'}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className={styles.declaration}>
                <label className={styles.checkbox}>
                  <input 
                    type="checkbox" 
                    checked={declaration} 
                    onChange={(e) => setDeclaration(e.target.checked)} 
                    disabled={isViewMode}
                  /> 
                  I hereby declare that the information provided is true and correct to the best of my knowledge. I agree to the terms and conditions of the organization.
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className={styles.formFooter}>
          <Button variant="outline" onClick={handleBack} icon={<ChevronLeft size={16}/>}>Back</Button>
          <div className={styles.footerRight}>
            {!editVendorId && !isViewMode && <Button variant="ghost" onClick={saveDraft}>Save as Draft</Button>}
            <Button onClick={handleNext} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" style={{ marginRight: '8px' }} />
                  Submitting...
                </>
              ) : currentStep === 5 ? (
                isViewMode ? 'Return to Vendor List' : editVendorId ? 'Submit Vendor Changes' : 'Submit for Approval'
              ) : (
                'Next'
              )}
              {currentStep < 5 && !submitting && <ChevronRight size={16}/>}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
