import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  BrainCircuit, 
  Sparkles, 
  UploadCloud, 
  FileCheck, 
  Check, 
  FolderOpen,
  X,
  Eye,
  Download,
  AlertTriangle
} from 'lucide-react';
import { CatalogueHeader } from './CatalogueHeader';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import styles from './ServiceMaster.module.css';
import { getActiveVendors } from '../../services/itemMasterService';
import { createService, uploadServiceFile, getServiceAttachments } from '../../services/serviceMasterService';
import type { VendorSelection, UploadedFile } from '../../services/itemMasterService';

interface AttachmentDetail {
  attachmentId: string;
  serviceId: string;
  documentType: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  filePath: string;
  uploadedBy: string;
  uploadedDate: string;
}

export const ServiceMaster: React.FC = () => {
  const navigate = useNavigate();
  const [subStep, setSubStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Cache Approved Vendors
  const [vendors, setVendors] = useState<VendorSelection[]>([]);

  // SUCCESS STATUS
  const [successService, setSuccessService] = useState<{ serviceId: string; serviceName: string } | null>(null);

  // STEP 1 — BASIC SERVICE DETAILS
  const [serviceName, setServiceName] = useState('');
  const [serviceCode, setServiceCode] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [serviceSubCategory, setServiceSubCategory] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [businessFunction, setBusinessFunction] = useState('');
  const [serviceOwner, setServiceOwner] = useState('Admin');
  const [serviceType, setServiceType] = useState('Recurring SLA');

  // STEP 2 — SOURCING & SLA CONFIGURATION
  const [preferredVendor, setPreferredVendor] = useState('');
  const [alternateVendors, setAlternateVendors] = useState('');
  const [deliveryModel, setDeliveryModel] = useState('Onsite');
  const [serviceFrequency, setServiceFrequency] = useState('Monthly');
  const [serviceDuration, setServiceDuration] = useState('12 Months');
  const [serviceLocation, setServiceLocation] = useState('');
  const [slaCommitment, setSlaCommitment] = useState('');
  const [responseTime, setResponseTime] = useState('');
  const [resolutionTime, setResolutionTime] = useState('');
  const [escalationMatrix, setEscalationMatrix] = useState('');

  // STEP 3 — COMPLIANCE & QUALITY CHECKLISTS
  const [riskClassification, setRiskClassification] = useState('Low Risk');
  const [complianceRequirements, setComplianceRequirements] = useState('');
  const [applicableCertifications, setApplicableCertifications] = useState('');
  const [qualityStandards, setQualityStandards] = useState('ISO 9001');
  const [kpiMeasurement, setKpiMeasurement] = useState('');

  // Upload States
  const [uploadingSla, setUploadingSla] = useState(false);
  const [uploadedSlaMeta, setUploadedSlaMeta] = useState<UploadedFile | null>(null);

  const [uploadingSow, setUploadingSow] = useState(false);
  const [uploadedSowMeta, setUploadedSowMeta] = useState<UploadedFile | null>(null);

  const [uploadingSupp, setUploadingSupp] = useState(false);
  const [uploadedSuppMeta, setUploadedSuppMeta] = useState<UploadedFile | null>(null);

  // REUSE MODAL STATE
  const [showReuseModal, setShowReuseModal] = useState(false);
  const [activeUploadTarget, setActiveUploadTarget] = useState<'SLA' | 'SOW' | 'SUPP' | null>(null);
  const [allAttachments, setAllAttachments] = useState<AttachmentDetail[]>([]);
  const [filterDocType, setFilterDocType] = useState('All');
  const [filterUploadedBy, setFilterUploadedBy] = useState('');
  const [filterUploadDate, setFilterUploadDate] = useState('');
  const [filterFileName, setFilterFileName] = useState('');
  const [previewAttachment, setPreviewAttachment] = useState<AttachmentDetail | null>(null);

  // Load masters
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingInitial(true);
        const vList = await getActiveVendors();
        setVendors(vList);
      } catch (err) {
        console.error("Error loading approved vendors for Service Master:", err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, []);

  // Open Reuse Modal
  const handleOpenReuseModal = async (target: 'SLA' | 'SOW' | 'SUPP') => {
    try {
      setActiveUploadTarget(target);
      const attachments = await getServiceAttachments();
      setAllAttachments(attachments);
      setShowReuseModal(true);
    } catch (err) {
      console.error("Error loading service attachments for reuse modal:", err);
      alert("Failed to retrieve uploaded files list.");
    }
  };

  // Select File from Reuse Modal
  const handleSelectFileFromModal = (file: AttachmentDetail) => {
    const fileMeta: UploadedFile = {
      fileId: file.attachmentId,
      fileName: file.fileName,
      fileType: file.documentType === 'SLA' 
        ? 'Service SLA Document' 
        : file.documentType === 'SOW' 
        ? 'Scope of Work Document' 
        : 'Supporting Service Document',
      filePath: file.filePath,
      uploadedOn: file.uploadedDate,
      fileSize: file.fileSize
    };

    if (activeUploadTarget === 'SLA') setUploadedSlaMeta(fileMeta);
    if (activeUploadTarget === 'SOW') setUploadedSowMeta(fileMeta);
    if (activeUploadTarget === 'SUPP') setUploadedSuppMeta(fileMeta);

    setShowReuseModal(false);
    setActiveUploadTarget(null);
  };

  // SHOWCASE Popups
  const handleOcrSimulation = () => {
    alert("OCR Auto-Extract is available in Enterprise Edition.\n\nDemo Prototype Mode:\nPlease enter service information manually.");
  };

  const handleSlaArchitectSimulation = () => {
    alert("AI Service SLA Architect is available in Enterprise Edition.\n\nDemo Prototype Mode:\nPlease configure SLA details manually.");
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'SLA' | 'SOW' | 'SUPP'
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Allowed formats check
      const allowedExts = ['pdf', 'doc', 'docx', 'xlsx', 'pptx', 'png', 'jpg', 'jpeg'];
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      if (!allowedExts.includes(fileExt)) {
        alert("Invalid file format. Allowed formats: PDF, DOC, DOCX, XLSX, PPTX, PNG, JPG.");
        return;
      }

      // Max size check: 20MB
      const maxSize = 20 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("File size exceeds the 20 MB limit.");
        return;
      }

      try {
        if (type === 'SLA') setUploadingSla(true);
        if (type === 'SOW') setUploadingSow(true);
        if (type === 'SUPP') setUploadingSupp(true);

        const fileTypeLabel = type === 'SLA' 
          ? 'Service SLA Document' 
          : type === 'SOW' 
          ? 'Scope of Work Document' 
          : 'Supporting Service Document';

        const res = await uploadServiceFile(file, {
          fileType: fileTypeLabel,
          uploadedBy: 'Admin'
        });

        if (res.success) {
          if (type === 'SLA') setUploadedSlaMeta(res.file);
          if (type === 'SOW') setUploadedSowMeta(res.file);
          if (type === 'SUPP') setUploadedSuppMeta(res.file);
        }
      } catch (err) {
        console.error(`Error uploading ${type} document:`, err);
        alert(`Failed to upload ${type} document.`);
      } finally {
        if (type === 'SLA') setUploadingSla(false);
        if (type === 'SOW') setUploadingSow(false);
        if (type === 'SUPP') setUploadingSupp(false);
      }
    }
  };

  const handleSave = async (statusType: 'Draft' | 'Pending Approval') => {
    if (statusType === 'Pending Approval') {
      // Step 1 Validation
      if (!serviceName || !serviceCode || !serviceCategory || !serviceSubCategory || !description || !department || !businessFunction || !serviceOwner || !serviceType) {
        alert("Please fill in all required Step 1 details (marked with *).");
        setSubStep(1);
        return;
      }

      // Step 2 Validation
      if (!preferredVendor || !deliveryModel || !serviceFrequency || !serviceDuration || !serviceLocation || !slaCommitment || !responseTime || !resolutionTime) {
        alert("Please fill in all required Step 2 configuration fields (marked with *).");
        setSubStep(2);
        return;
      }

      // Step 3 Validation
      if (!riskClassification || !complianceRequirements || !applicableCertifications || !qualityStandards || !kpiMeasurement) {
        alert("Please fill in all required Step 3 compliance settings (marked with *).");
        setSubStep(3);
        return;
      }

      // SLA & SOW Docs Validation
      if (!uploadedSlaMeta) {
        alert("Please upload or select an SLA Document (Step 3).");
        setSubStep(3);
        return;
      }
      if (!uploadedSowMeta) {
        alert("Please upload or select a Scope of Work Document (Step 3).");
        setSubStep(3);
        return;
      }
    } else {
      if (!serviceName || !serviceCode) {
        alert("Please enter Service Name and Service Code to save a draft.");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const chosenVendor = vendors.find(v => v.vendorId === preferredVendor);

      const uploadedFilesList: UploadedFile[] = [];
      if (uploadedSlaMeta) {
        uploadedFilesList.push({
          ...uploadedSlaMeta,
          documentType: 'SLA'
        } as any);
      }
      if (uploadedSowMeta) {
        uploadedFilesList.push({
          ...uploadedSowMeta,
          documentType: 'SOW'
        } as any);
      }
      if (uploadedSuppMeta) {
        uploadedFilesList.push({
          ...uploadedSuppMeta,
          documentType: 'SUPP'
        } as any);
      }

      const payload = {
        serviceCode,
        serviceName,
        serviceCategory: serviceCategory || 'IT Services',
        serviceSubCategory: serviceSubCategory || 'General',
        description: description || 'Draft service',
        department: department || 'IT',
        businessFunction: businessFunction || 'General',
        serviceOwner,
        serviceType,
        preferredVendor: chosenVendor ? chosenVendor.vendorName : (preferredVendor || 'N/A'),
        alternateVendors: alternateVendors ? alternateVendors.split(',').map(v => v.trim()) : [],
        deliveryModel,
        serviceFrequency,
        serviceDuration,
        serviceLocation,
        slaCommitment,
        responseTime,
        resolutionTime,
        escalationMatrix,
        riskClassification,
        complianceRequirements,
        certifications: applicableCertifications ? applicableCertifications.split(',').map(c => c.trim()) : [],
        qualityStandards,
        kpiMeasurement,
        status: statusType,
        createdBy: 'Admin',
        uploadedFiles: uploadedFilesList
      };

      const res = await createService(payload);
      if (res.success) {
        setSuccessService({
          serviceId: res.service.serviceId || '',
          serviceName: res.service.serviceName
        });
      } else {
        alert(`Failed to ${statusType === 'Draft' ? 'save draft' : 'submit'} service master.`);
      }
    } catch (err: any) {
      console.error("Error creating service master:", err);
      alert(err.response?.data?.message || "An error occurred while saving the Service Master.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setServiceName('');
    setServiceCode('');
    setServiceCategory('');
    setServiceSubCategory('');
    setDescription('');
    setDepartment('');
    setBusinessFunction('');
    setServiceOwner('Admin');
    setServiceType('Recurring SLA');
    setPreferredVendor('');
    setAlternateVendors('');
    setDeliveryModel('Onsite');
    setServiceFrequency('Monthly');
    setServiceDuration('12 Months');
    setServiceLocation('');
    setSlaCommitment('');
    setResponseTime('');
    setResolutionTime('');
    setEscalationMatrix('');
    setRiskClassification('Low Risk');
    setComplianceRequirements('');
    setApplicableCertifications('');
    setQualityStandards('ISO 9001');
    setKpiMeasurement('');
    setUploadedSlaMeta(null);
    setUploadedSowMeta(null);
    setUploadedSuppMeta(null);
    setSubStep(1);
    setSuccessService(null);
  };

  // Reuse Modal Filtering
  const filteredAttachments = allAttachments.filter(file => {
    const matchType = filterDocType === 'All' || file.documentType === filterDocType;
    const matchUser = !filterUploadedBy || file.uploadedBy.toLowerCase().includes(filterUploadedBy.toLowerCase());
    const matchDate = !filterUploadDate || file.uploadedDate === filterUploadDate;
    const matchName = !filterFileName || file.fileName.toLowerCase().includes(filterFileName.toLowerCase());
    return matchType && matchUser && matchDate && matchName;
  });

  if (successService) {
    return (
      <div className={styles.container}>
        <CatalogueHeader 
          title="SERVICE MASTER CREATION" 
          subtitle="Register corporate services, establish SAC codes, pricing schemes, and governance SLAs"
        />
        <div className={styles.successCard}>
          <div className={styles.successIconWrapper}>
            <Check size={40} />
          </div>
          <h2 className={styles.successTitle}>✓ Service Master Created Successfully</h2>
          
          <div className={styles.successDetails}>
            <div className={styles.successDetailRow}>
              <span className={styles.successDetailLabel}>Service Name</span>
              <span className={styles.successDetailVal}>{successService.serviceName}</span>
            </div>
            <div className={styles.successDetailRow}>
              <span className={styles.successDetailLabel}>Service ID</span>
              <span className={styles.successDetailVal}>{successService.serviceId}</span>
            </div>
            <div className={styles.successDetailRow}>
              <span className={styles.successDetailLabel}>Workflow Status</span>
              <span className={styles.successDetailVal}>{successService.status || 'Pending Approval'}</span>
            </div>
          </div>
          
          <p className={styles.successRoutingMsg}>
            {successService.status === 'Draft' 
              ? 'The service has been successfully saved as a draft.' 
              : 'The service has been successfully submitted for maker-checker approval.'}
          </p>
          
          <div className={styles.successActions}>
            <Button variant="primary" onClick={() => navigate('/catalogue/dashboard')}>
              Go to Catalogue Dashboard
            </Button>
            <Button variant="outline" onClick={handleResetForm}>
              Create Another Service
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <CatalogueHeader 
        title="SERVICE MASTER CREATION" 
        subtitle="Register corporate services, establish SAC codes, pricing schemes, and governance SLAs"
        actions={
          <Button variant="outline" icon={<ArrowLeft size={16} />} onClick={() => navigate('/catalogue/dashboard')}>
            Back to Dashboard
          </Button>
        }
      />

      <Card className={styles.formCard}>
        {/* Wizard Header Status */}
        <div className={styles.wizardHeader}>
          <div className={styles.subSteps}>
            <div className={`${styles.subStep} ${subStep === 1 ? styles.subStepActive : ''}`} onClick={() => setSubStep(1)} style={{ cursor: 'pointer' }}>
              <span>1.</span> Basic Service Details
            </div>
            <ArrowRight size={14} className={styles.stepArrow} />
            <div className={`${styles.subStep} ${subStep === 2 ? styles.subStepActive : ''}`} onClick={() => setSubStep(2)} style={{ cursor: 'pointer' }}>
              <span>2.</span> Sourcing & SLA Configuration
            </div>
            <ArrowRight size={14} className={styles.stepArrow} />
            <div className={`${styles.subStep} ${subStep === 3 ? styles.subStepActive : ''}`} onClick={() => setSubStep(3)} style={{ cursor: 'pointer' }}>
              <span>3.</span> Compliance & Quality Checklists
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            icon={<BrainCircuit size={16} />} 
            onClick={handleOcrSimulation}
          >
            OCR Auto-Extract from Spec Sheet
          </Button>
        </div>

        {loadingInitial ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading catalogue parameters and vendor mappings...
          </div>
        ) : (
          <>
            {/* STEP 1: Basic Service Details */}
            {subStep === 1 && (
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Service Name *</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. IT Annual Maintenance Contract"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                  />
                  <span className={styles.aiSuggested}><Sparkles size={12} /> Suggestions: IT Annual Maintenance Contract, Cloud Hosting, Recruitment</span>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Service Code (SAC/Unique) *</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. AMC-IT-001"
                    value={serviceCode}
                    onChange={(e) => setServiceCode(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Service Category *</label>
                  <select 
                    className={styles.inputField} 
                    value={serviceCategory} 
                    onChange={(e) => setServiceCategory(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    <option value="IT Services">IT Services</option>
                    <option value="Facility Management">Facility Management</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Logistics Services">Logistics Services</option>
                    <option value="Marketing & Advisory">Marketing & Advisory</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Service Subcategory *</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. AMC"
                    value={serviceSubCategory}
                    onChange={(e) => setServiceSubCategory(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                  <label className={styles.formLabel}>Service Description *</label>
                  <textarea 
                    className={styles.textareaField} 
                    placeholder="Describe scope, deliverables, and service requirements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Department *</label>
                  <select 
                    className={styles.inputField} 
                    value={department} 
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="">Select Department</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Facility">Facility Management</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Business Function *</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. Infrastructure Support"
                    value={businessFunction}
                    onChange={(e) => setBusinessFunction(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Service Owner *</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    value={serviceOwner}
                    onChange={(e) => setServiceOwner(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Service Type *</label>
                  <select 
                    className={styles.inputField} 
                    value={serviceType} 
                    onChange={(e) => setServiceType(e.target.value)}
                  >
                    <option value="Recurring SLA">Recurring SLA</option>
                    <option value="One-Time Project">One-Time Project</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 2: Sourcing & SLA Configuration */}
            {subStep === 2 && (
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className={styles.formLabel}>Preferred Vendor *</label>
                    <span 
                      style={{ fontSize: '11px', color: '#7c3aed', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                      onClick={handleSlaArchitectSimulation}
                    >
                      <Sparkles size={11} /> AI SLA Architect
                    </span>
                  </div>
                  <select 
                    className={styles.inputField} 
                    value={preferredVendor} 
                    onChange={(e) => setPreferredVendor(e.target.value)}
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map(v => (
                      <option key={v.vendorId} value={v.vendorId}>
                        {v.vendorName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Alternate Vendors</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. Tech Solutions Pvt Ltd (comma separated)"
                    value={alternateVendors}
                    onChange={(e) => setAlternateVendors(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Service Delivery Model *</label>
                  <select 
                    className={styles.inputField} 
                    value={deliveryModel} 
                    onChange={(e) => setDeliveryModel(e.target.value)}
                  >
                    <option value="Onsite">Onsite</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Service Frequency *</label>
                  <select 
                    className={styles.inputField} 
                    value={serviceFrequency} 
                    onChange={(e) => setServiceFrequency(e.target.value)}
                  >
                    <option value="One Time">One Time</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Service Duration *</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. 12 Months"
                    value={serviceDuration}
                    onChange={(e) => setServiceDuration(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Service Location *</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. Delhi NCR"
                    value={serviceLocation}
                    onChange={(e) => setServiceLocation(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Expected SLA Commitments *</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. 99.5% Uptime"
                    value={slaCommitment}
                    onChange={(e) => setSlaCommitment(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Expected Response Time *</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. 4 Hours"
                    value={responseTime}
                    onChange={(e) => setResponseTime(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Expected Resolution Time *</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. 24 Hours"
                    value={resolutionTime}
                    onChange={(e) => setResolutionTime(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                  <label className={styles.formLabel}>Escalation Matrix Setup</label>
                  <textarea 
                    className={styles.textareaField} 
                    placeholder="Level 1: Support Desk -> Level 2: Project Manager -> Level 3: VP"
                    value={escalationMatrix}
                    onChange={(e) => setEscalationMatrix(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Compliance & Quality Checklists */}
            {subStep === 3 && (
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Service Risk Classification *</label>
                  <select 
                    className={styles.inputField} 
                    value={riskClassification} 
                    onChange={(e) => setRiskClassification(e.target.value)}
                  >
                    <option value="Low Risk">Low Risk</option>
                    <option value="Medium Risk">Medium Risk</option>
                    <option value="High Risk">High Risk (Requires due diligence)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Compliance Requirements *</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. RBI Outsourcing Guidelines"
                    value={complianceRequirements}
                    onChange={(e) => setComplianceRequirements(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Applicable Certifications *</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. ISO 27001, SOC 2 (comma separated)"
                    value={applicableCertifications}
                    onChange={(e) => setApplicableCertifications(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Quality Standards *</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. ISO 9001"
                    value={qualityStandards}
                    onChange={(e) => setQualityStandards(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                  <label className={styles.formLabel}>KPI Measurement Criteria *</label>
                  <textarea 
                    className={styles.textareaField} 
                    placeholder="Describe how performance milestones will be audited..."
                    value={kpiMeasurement}
                    onChange={(e) => setKpiMeasurement(e.target.value)}
                  />
                </div>

                {/* File Uploads & Reuse Panel */}
                <div className={styles.formGroup} style={{ gridColumn: 'span 2', marginTop: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0b1f5f', marginBottom: '12px' }}>Service Documents Upload</h4>
                  
                  {/* SLA Document */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={styles.formLabel}>SLA Document Upload *</span>
                      <button 
                        type="button"
                        style={{ fontSize: '11px', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => handleOpenReuseModal('SLA')}
                      >
                        <FolderOpen size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        Reuse Previously Uploaded File
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <label className={styles.aiSuggested} style={{ cursor: 'pointer', margin: 0, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px dashed var(--color-primary)' }}>
                        <UploadCloud size={16} />
                        <span>{uploadedSlaMeta ? "Change Document" : "Select Document"}</span>
                        <input 
                          type="file" 
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xlsx,.pptx"
                          onChange={(e) => handleFileUpload(e, 'SLA')}
                          style={{ display: 'none' }}
                          disabled={uploadingSla}
                        />
                      </label>
                      {uploadingSla && <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Uploading...</span>}
                      {uploadedSlaMeta && (
                        <span style={{ color: '#16a34a', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FileCheck size={14} /> {uploadedSlaMeta.fileName} ({uploadedSlaMeta.fileSize}) [Referenced]
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Scope of Work Document */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={styles.formLabel}>Scope Of Work Upload *</span>
                      <button 
                        type="button"
                        style={{ fontSize: '11px', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => handleOpenReuseModal('SOW')}
                      >
                        <FolderOpen size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        Reuse Previously Uploaded File
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <label className={styles.aiSuggested} style={{ cursor: 'pointer', margin: 0, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px dashed var(--color-primary)' }}>
                        <UploadCloud size={16} />
                        <span>{uploadedSowMeta ? "Change Document" : "Select Document"}</span>
                        <input 
                          type="file" 
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xlsx,.pptx"
                          onChange={(e) => handleFileUpload(e, 'SOW')}
                          style={{ display: 'none' }}
                          disabled={uploadingSow}
                        />
                      </label>
                      {uploadingSow && <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Uploading...</span>}
                      {uploadedSowMeta && (
                        <span style={{ color: '#16a34a', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FileCheck size={14} /> {uploadedSowMeta.fileName} ({uploadedSowMeta.fileSize}) [Referenced]
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Supporting Documents (Optional) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={styles.formLabel}>Supporting Documents Upload</span>
                      <button 
                        type="button"
                        style={{ fontSize: '11px', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => handleOpenReuseModal('SUPP')}
                      >
                        <FolderOpen size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        Reuse Previously Uploaded File
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <label className={styles.aiSuggested} style={{ cursor: 'pointer', margin: 0, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px dashed var(--color-primary)' }}>
                        <UploadCloud size={16} />
                        <span>{uploadedSuppMeta ? "Change Document" : "Select Document"}</span>
                        <input 
                          type="file" 
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xlsx,.pptx"
                          onChange={(e) => handleFileUpload(e, 'SUPP')}
                          style={{ display: 'none' }}
                          disabled={uploadingSupp}
                        />
                      </label>
                      {uploadingSupp && <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Uploading...</span>}
                      {uploadedSuppMeta && (
                        <span style={{ color: '#16a34a', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FileCheck size={14} /> {uploadedSuppMeta.fileName} ({uploadedSuppMeta.fileSize}) [Referenced]
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer Navigation Actions */}
        <div className={styles.footerActions}>
          <Button 
            variant="outline" 
            disabled={subStep === 1 || loadingInitial} 
            icon={<ArrowLeft size={16} />}
            onClick={() => setSubStep(prev => Math.max(1, prev - 1))}
          >
            Previous
          </Button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="ghost" onClick={() => navigate('/catalogue/dashboard')}>
              Cancel
            </Button>

            {subStep < 3 ? (
              <Button 
                icon={<ArrowRight size={16} />} 
                onClick={() => setSubStep(prev => Math.min(3, prev + 1))}
                disabled={loadingInitial}
              >
                Next Step
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  icon={<Save size={16} />} 
                  onClick={() => handleSave('Draft')}
                  disabled={isSubmitting || loadingInitial}
                >
                  Save Draft
                </Button>
                <Button 
                  variant="primary" 
                  icon={<Save size={16} />} 
                  onClick={() => handleSave('Pending Approval')}
                  disabled={isSubmitting || loadingInitial}
                >
                  {isSubmitting ? "Submitting..." : "Submit for Approval"}
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* REUSE DOCUMENT MODAL POPUP */}
      {showReuseModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', maxHeight: '90vh', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0b1f5f', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderOpen size={20} style={{ color: 'var(--color-primary)' }} />
                <span>Reuse Previously Uploaded Service File</span>
              </h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }} onClick={() => setShowReuseModal(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Filters Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '16px 24px', backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#0b1f5f' }}>Document Type</label>
                <select className={styles.inputField} style={{ padding: '6px 10px', fontSize: '12px' }} value={filterDocType} onChange={(e) => setFilterDocType(e.target.value)}>
                  <option value="All">All Types</option>
                  <option value="SLA">SLA</option>
                  <option value="SOW">SOW</option>
                  <option value="SUPP">Supporting Docs</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#0b1f5f' }}>Uploaded By</label>
                <input type="text" className={styles.inputField} style={{ padding: '6px 10px', fontSize: '12px' }} placeholder="e.g. Admin" value={filterUploadedBy} onChange={(e) => setFilterUploadedBy(e.target.value)} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#0b1f5f' }}>Upload Date</label>
                <input type="date" className={styles.inputField} style={{ padding: '6px 10px', fontSize: '12px' }} value={filterUploadDate} onChange={(e) => setFilterUploadDate(e.target.value)} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#0b1f5f' }}>File Name</label>
                <input type="text" className={styles.inputField} style={{ padding: '6px 10px', fontSize: '12px' }} placeholder="Search file name..." value={filterFileName} onChange={(e) => setFilterFileName(e.target.value)} />
              </div>
            </div>

            {/* Attachments List Table */}
            <div style={{ overflowX: 'auto', overflowY: 'auto', flexGrow: 1, padding: '16px 24px' }}>
              {filteredAttachments.length > 0 ? (
                <table style={{ width: 'max-content', minWidth: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', color: '#0b1f5f', fontWeight: 600 }}>
                      <th style={{ padding: '8px 12px' }}>File Name</th>
                      <th style={{ padding: '8px 12px' }}>Type</th>
                      <th style={{ padding: '8px 12px' }}>Size</th>
                      <th style={{ padding: '8px 12px' }}>Uploaded By</th>
                      <th style={{ padding: '8px 12px' }}>Upload Date</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttachments.map((file) => (
                      <tr key={file.attachmentId} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.2s' }} className={styles.tableRowHover}>
                        <td style={{ padding: '10px 12px', fontWeight: 500, color: 'var(--color-primary)' }}>{file.fileName}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: file.documentType === 'SLA' ? '#f3e8ff' : file.documentType === 'SOW' ? '#eaf2ff' : '#fef3c7', color: file.documentType === 'SLA' ? '#7c3aed' : file.documentType === 'SOW' ? '#1d4ed8' : '#d97706', fontWeight: 600 }}>
                            {file.documentType}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>{file.fileSize}</td>
                        <td style={{ padding: '10px 12px' }}>{file.uploadedBy}</td>
                        <td style={{ padding: '10px 12px' }}>{file.uploadedDate}</td>
                        <td style={{ padding: '10px 12px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            title="Preview File" 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
                            onClick={() => setPreviewAttachment(file)}
                          >
                            <Eye size={16} />
                          </button>
                          
                          <a 
                            title="Download File" 
                            href={file.filePath} 
                            download 
                            style={{ color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download size={16} />
                          </a>

                          <Button 
                            size="sm" 
                            variant="primary" 
                            style={{ padding: '2px 8px', fontSize: '11px' }}
                            onClick={() => handleSelectFileFromModal(file)}
                          >
                            Select
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>
                  <AlertTriangle size={32} style={{ margin: '0 auto 12px', color: 'var(--color-warning)' }} />
                  <div>No previously uploaded files found matching the filters.</div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'var(--color-surface-hover)' }}>
              <Button variant="outline" onClick={() => setShowReuseModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW DETAILS POPUP OVERLAY */}
      {previewAttachment && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0b1f5f', margin: 0 }}>Document Reference Preview</h4>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }} onClick={() => setPreviewAttachment(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>File Name:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{previewAttachment.fileName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Attachment ID:</span>
                <span style={{ fontWeight: 600 }}>{previewAttachment.attachmentId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Document Type:</span>
                <span style={{ fontWeight: 600 }}>{previewAttachment.documentType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>File Path:</span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', wordBreak: 'break-all' }}>{previewAttachment.filePath}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Size / Format:</span>
                <span>{previewAttachment.fileSize} ({previewAttachment.fileType})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Uploader:</span>
                <span>{previewAttachment.uploadedBy} on {previewAttachment.uploadedDate}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <a href={previewAttachment.filePath} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">Open in Browser</Button>
              </a>
              <Button variant="primary" size="sm" onClick={() => {
                handleSelectFileFromModal(previewAttachment);
                setPreviewAttachment(null);
              }}>
                Attach Reference
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
