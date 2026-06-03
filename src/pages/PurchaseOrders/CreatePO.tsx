import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, CheckCircle2, Bot, ArrowRight, Upload, X } from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Badge } from '../../components/Badge/Badge';
import { 
  createRequisition, 
  uploadPOFile, 
  getRFQVendors
} from '../../services/purchaseOrderService';
import type { 
  RFQVendor, 
  UploadedDocument 
} from '../../services/purchaseOrderService';
import styles from './CreatePO.module.css';

const STEPS = [
  'Requisition Details',
  'Budget Validation',
  'RFQ & Vendor Selection',
  'Review & Generate PO'
];

const BUDGET_MAP: Record<string, { name: string; allocated: number; consumed: number }> = {
  'CC-IT-OPS': { name: 'IT Operations', allocated: 5000000, consumed: 2250000 },
  'CC-FAC-OPS': { name: 'Facilities Operations', allocated: 2000000, consumed: 800000 },
  'CC-SEC-OPS': { name: 'Security Operations', allocated: 3000000, consumed: 1200000 },
  'CC-MGT-CON': { name: 'Management Consulting', allocated: 8000000, consumed: 3500000 }
};

export const CreatePO: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdReqId, setCreatedReqId] = useState('');

  // Form State
  const [costCenterCode, setCostCenterCode] = useState('CC-IT-OPS');
  const [projectCode, setProjectCode] = useState('PROJ-MIGRATION-2026');
  const [category, setCategory] = useState('IT Services');
  const [itemDescription, setItemDescription] = useState('Cloud infrastructure support services');
  const [quantity, setQuantity] = useState(1);
  const [unitOfMeasure, setUnitOfMeasure] = useState('Service / Month');
  const [estimatedCost, setEstimatedCost] = useState(1250000);
  const [deliveryDate, setDeliveryDate] = useState('2026-06-30');

  // File Upload State
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);

  // RFQ Bids State
  const [vendors, setVendors] = useState<RFQVendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<RFQVendor | null>(null);
  const [vendorApprovalStatus, setVendorApprovalStatus] = useState<string>('');

  useEffect(() => {
    if (!selectedVendor?.vendorId) {
      setVendorApprovalStatus('');
      return;
    }
    axios.get(`/api/kyc/approvals/vendor/${selectedVendor.vendorId}`)
      .then(res => {
        if (res.data.success) {
          setVendorApprovalStatus(res.data.overallStatus);
        }
      })
      .catch(err => {
        console.error('Failed to fetch vendor approval status:', err);
        setVendorApprovalStatus('Vendor Approved');
      });
  }, [selectedVendor]);

  useEffect(() => {
    getRFQVendors()
      .then(res => {
        setVendors(res);
        if (res.length > 0) {
          // Default to the first one (Best Value)
          setSelectedVendor(res[0]);
        }
      })
      .catch(err => console.error('Failed to load RFQ vendors:', err));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const res = await uploadPOFile(file, {
        documentCategory: 'Technical Specification',
        uploadedBy: 'Saurabh Anand'
      });
      if (res.success) {
        setUploadedDocs(prev => [...prev, res.file]);
      }
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeDoc = (fileId: string) => {
    setUploadedDocs(prev => prev.filter(d => d.fileId !== fileId));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      submitRequisition();
    }
  };

  const submitRequisition = async () => {
    setLoading(true);
    const costCenter = BUDGET_MAP[costCenterCode];
    const requisitionPayload = {
      requester: {
        employeeId: "EMP-1001",
        requesterName: "Saurabh Anand",
        department: costCenterCode === 'CC-FAC-OPS' ? 'Facilities' : 'IT Services',
        designation: "Procurement Manager"
      },
      costCenter: {
        costCenterCode,
        costCenterName: costCenter.name
      },
      projectCode,
      category,
      itemDetails: {
        itemDescription,
        quantity: Number(quantity),
        unitOfMeasure
      },
      budgetDetails: {
        allocatedBudget: costCenter.allocated,
        consumedBudget: costCenter.consumed,
        currentRequisitionValue: estimatedCost,
        availableBudget: costCenter.allocated - (costCenter.consumed + estimatedCost)
      },
      vendorSelection: {
        selectedVendorId: selectedVendor?.vendorId || "VND-2025-00029",
        selectedVendorName: selectedVendor?.vendorName || "ABC Infotech Pvt Ltd",
        quotedPrice: selectedVendor?.quotedPrice || estimatedCost,
        leadTime: selectedVendor?.leadTime || "5 Days",
        kycCompliance: selectedVendor?.kycCompliance || "Clean",
        slaScore: selectedVendor?.slaScore || "98%",
        vendorRiskLevel: selectedVendor?.vendorRiskLevel || "Low"
      },
      linkedContract: {
        contractId: "CTR-2026-00045",
        contractType: "Master Service Agreement",
        contractExpiry: "2026-12-31"
      },
      uploadedDocuments: uploadedDocs,
      status: "Pending Approval"
    };

    try {
      const res = await createRequisition(requisitionPayload);
      if (res.success) {
        setCreatedReqId(res.requisition.requisitionId || 'REQ-2026-00082');
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Failed to create requisition:', error);
    } finally {
      setLoading(false);
    }
  };

  // Budget validation calculation
  const activeBudget = BUDGET_MAP[costCenterCode] || BUDGET_MAP['CC-IT-OPS'];
  const consumedPct = (activeBudget.consumed / activeBudget.allocated) * 100;
  const currentReqPct = (estimatedCost / activeBudget.allocated) * 100;
  const availableVal = activeBudget.allocated - (activeBudget.consumed + estimatedCost);

  if (isSubmitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>
            <CheckCircle2 size={64} color="#16a34a" />
          </div>
          <h2 className={styles.successTitle}>Requisition Submitted!</h2>
          <p className={styles.successDesc}>Requisition <strong>{createdReqId}</strong> has been submitted successfully and routed for Budget and Departmental Approval.</p>
          <div className={styles.successActions}>
            <Button onClick={() => navigate('/purchase-orders/dashboard')}>Go to Dashboard</Button>
            <Button variant="outline" onClick={() => { setIsSubmitted(false); setCurrentStep(1); setUploadedDocs([]); }}>Create Another</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <button className={styles.backBtn} onClick={() => navigate('/purchase-orders/dashboard')}>
            <ChevronLeft size={16} /> Back to Dashboard
          </button>
          <h1 className={styles.title}>Create Requisition</h1>
        </div>
        <div className={styles.stepperContainer}>
          {STEPS.map((step, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;

            return (
              <div key={step} className={styles.stepWrapper}>
                <div className={styles.stepIndicator}>
                  <div className={`${styles.stepCircle} ${isActive ? styles.activeCircle : ''} ${isCompleted ? styles.completedCircle : ''}`}>
                    {isCompleted ? <CheckCircle2 size={16} /> : stepNum}
                  </div>
                  <span className={`${styles.stepLabel} ${isActive || isCompleted ? styles.activeLabel : ''}`}>
                    {step}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`${styles.stepLine} ${isCompleted ? styles.completedLine : ''}`} />
                )}
              </div>
            );
          })}
        </div>
      </header>

      <div className={styles.contentArea}>
        {currentStep === 1 && (
          <Card className={styles.formCard}>
            <h3 className={styles.formTitle}>Requisition Information</h3>
            <div className={styles.formGrid}>
              <Input label="Requestor Name" value="Saurabh Anand" disabled />
              <Input label="Department" value={costCenterCode === 'CC-FAC-OPS' ? 'Facilities Operations' : 'IT Services'} disabled />
              
              <div className={styles.formGroup}>
                <label>Cost Center <span className={styles.required}>*</span></label>
                <select className={styles.select} value={costCenterCode} onChange={(e) => setCostCenterCode(e.target.value)}>
                  <option value="CC-IT-OPS">CC-IT-OPS - IT Operations</option>
                  <option value="CC-FAC-OPS">CC-FAC-OPS - Facilities Operations</option>
                  <option value="CC-SEC-OPS">CC-SEC-OPS - Security Operations</option>
                  <option value="CC-MGT-CON">CC-MGT-CON - Management Consulting</option>
                </select>
              </div>
              
              <Input label="Project Code" value={projectCode} onChange={(e) => setProjectCode(e.target.value)} />
              
              <div className={styles.formGroup}>
                <label>Category <span className={styles.required}>*</span></label>
                <select className={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="IT Services">IT Services</option>
                  <option value="Facilities">Facilities</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Security">Security</option>
                </select>
              </div>

              <Input label="Item Description" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} placeholder="Enter details of items/services required..." required />
              <Input label="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
              
              <div className={styles.formGroup}>
                <label>Unit of Measure (UOM) <span className={styles.required}>*</span></label>
                <select className={styles.select} value={unitOfMeasure} onChange={(e) => setUnitOfMeasure(e.target.value)}>
                  <option value="Service / Month">Service / Month</option>
                  <option value="Items">Items</option>
                  <option value="Hours">Hours</option>
                </select>
              </div>
              
              <Input label="Estimated Cost (₹)" type="number" value={estimatedCost} onChange={(e) => setEstimatedCost(Number(e.target.value))} required />
              <Input label="Required Delivery Date" type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} required />
              
              <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                <label>Technical Specifications / Attachments</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', border: '1px dashed var(--color-border)', padding: '16px', borderRadius: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#f1f5f9', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <Upload size={16} /> Choose File
                    <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    {uploading ? 'Uploading specification document...' : 'Upload technical drawings, RFQs, or price estimates'}
                  </span>
                </div>
                {uploadedDocs.length > 0 && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {uploadedDocs.map(doc => (
                      <div key={doc.fileId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '0.875rem' }}>
                        <span>📄 {doc.fileName} ({doc.fileSize})</span>
                        <X size={16} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => removeDoc(doc.fileId)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formActions}>
              <Button variant="ghost" onClick={() => navigate('/purchase-orders/dashboard')}>Cancel</Button>
              <Button onClick={handleNext}>Next: Budget Validation &rarr;</Button>
            </div>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className={styles.formCard}>
            <h3 className={styles.formTitle}>Budget Validation</h3>
            
            <div className={styles.budgetChecklist}>
              <div className={styles.budgetHeader}>
                <span className={styles.budgetLabel}>Budget Allocated ({costCenterCode})</span>
                <span className={styles.budgetValue}>₹{activeBudget.allocated.toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.budgetProgress}>
                <div className={styles.budgetFill} style={{ width: `${consumedPct}%` }}></div>
                <div className={styles.budgetPendingFill} style={{ width: `${currentReqPct}%`, left: `${consumedPct}%` }}></div>
              </div>
              <div className={styles.budgetLegend}>
                <span className={styles.legendDotConsumed}>Consumed (₹{(activeBudget.consumed/100000).toFixed(1)} L)</span>
                <span className={styles.legendDotCurrent}>Current Requisition (₹{(estimatedCost/100000).toFixed(1)} L)</span>
                <span className={styles.legendDotAvailable}>Available (₹{(availableVal/100000).toFixed(1)} L)</span>
              </div>
            </div>

            <div className={styles.aiRiskPanel}>
              <Bot size={20} className={styles.aiIcon} />
              <div>
                <h4>Budget Insights</h4>
                <p>
                  {availableVal >= 0 
                    ? `Allocated budget is sufficient. This transaction utilizes ${Math.round((estimatedCost / activeBudget.allocated) * 100)}% of the total cost center pool. No threshold alerts triggered.` 
                    : `WARNING: Budget threshold exceeded! This transaction requires an additional ₹${Math.abs(availableVal).toLocaleString('en-IN')} funding pool.`
                  }
                </p>
              </div>
            </div>

            <div className={styles.escalationBox}>
              <h4>Approval Escalation Matrix</h4>
              <div className={styles.approvalChain}>
                <div className={styles.chainNode}>
                  <span className={styles.nodeStatus}>✔</span>
                  <span className={styles.nodeRole}>Requestor</span>
                  <span className={styles.nodeUser}>Saurabh Anand</span>
                </div>
                <ArrowRight size={16} className={styles.chainArrow} />
                <div className={styles.chainNodeActive}>
                  <span className={styles.nodeStatusCircle}>2</span>
                  <span className={styles.nodeRole}>Dept Head</span>
                  <span className={styles.nodeUser}>Priya Sharma</span>
                </div>
                <ArrowRight size={16} className={styles.chainArrow} />
                <div className={styles.chainNode}>
                  <span className={styles.nodeStatusCircle}>3</span>
                  <span className={styles.nodeRole}>Finance</span>
                  <span className={styles.nodeUser}>Vikram Singh</span>
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
              <Button onClick={handleNext}>Next: RFQ & Vendor Selection &rarr;</Button>
            </div>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className={styles.formCard}>
            <h3 className={styles.formTitle}>RFQ & Vendor Selection</h3>

            <div className={styles.aiRecommendation}>
              <Bot size={20} className={styles.aiIcon} />
              <div>
                <strong>AI recommendation:</strong> <strong>{vendors.find(v => v.recommendationTag === 'Best Value')?.vendorName || 'ABC Infotech Pvt Ltd'}</strong> is suggested as the optimal vendor based on historic pricing (L1), 98% SLA score, and active KYC compliance.
              </div>
            </div>

            {selectedVendor && vendorApprovalStatus === 'Vendor Approved' && (
              <div style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                ✅ Vendor Approved for Business Transactions
              </div>
            )}
            {selectedVendor && vendorApprovalStatus === 'Rejected' && (
              <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecdd3', color: '#991b1b', padding: '12px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                ❌ Vendor Approval Rejected
              </div>
            )}
            {selectedVendor && vendorApprovalStatus && vendorApprovalStatus !== 'Vendor Approved' && vendorApprovalStatus !== 'Rejected' && (
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', color: '#b45309', padding: '12px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                ⚠ Vendor Onboarding/KYC Approval Pending (Current Status: {vendorApprovalStatus})
              </div>
            )}

            <div className={styles.compareGrid}>
              {vendors.map(v => (
                <div 
                  key={v.vendorId} 
                  className={`${styles.compareCard} ${selectedVendor?.vendorId === v.vendorId ? styles.compareCardSelected : ''}`}
                  onClick={() => setSelectedVendor(v)}
                >
                  <div className={styles.compareHeader}>
                    <h4>{v.vendorName}</h4>
                    <Badge variant={v.recommendationTag === 'Best Value' ? 'success' : 'default'}>
                      {v.recommendationTag || 'Vendor'}
                    </Badge>
                  </div>
                  <div className={styles.compareStats}>
                    <p>Quoted Price: <strong>₹{v.quotedPrice.toLocaleString('en-IN')}</strong></p>
                    <p>Lead Time: <strong>{v.leadTime}</strong></p>
                    <p>KYC/PEP Score: <strong style={{ color: v.kycCompliance === 'Clean' ? '#16a34a' : '#b45309' }}>{v.kycCompliance}</strong></p>
                    <p>SLA Adherence: <strong>{v.slaScore}</strong></p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.formActions}>
              <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
              <Button onClick={handleNext} disabled={selectedVendor ? vendorApprovalStatus !== 'Vendor Approved' : true}>Next: Review & Submit &rarr;</Button>
            </div>
          </Card>
        )}

        {currentStep === 4 && (
          <Card className={styles.formCard}>
            <h3 className={styles.formTitle}>Review & Submit Requisition</h3>

            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Requestor</span>
                <span className={styles.summaryValue}>Saurabh Anand</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Cost Center</span>
                <span className={styles.summaryValue}>{costCenterCode} - {BUDGET_MAP[costCenterCode]?.name}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Vendor Selected</span>
                <span className={styles.summaryValue}>{selectedVendor?.vendorName}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Estimated Value</span>
                <span className={styles.summaryValue}>₹{estimatedCost.toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Item Description</span>
                <span className={styles.summaryValue}>{itemDescription}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Attachments Linked</span>
                <span className={styles.summaryValue}>{uploadedDocs.length} Documents</span>
              </div>
            </div>

            <div className={styles.declaration}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" defaultChecked />
                I confirm that this requisition is aligned with the current departmental budget and cost center directives.
              </label>
            </div>

            <div className={styles.formActions}>
              <Button variant="outline" onClick={() => setCurrentStep(3)}>Back</Button>
              <Button onClick={handleNext} disabled={loading}>{loading ? 'Submitting...' : 'Submit for Approval'}</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
