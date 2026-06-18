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

interface SelectionVendor {
  vendorId: string;
  vendorName: string;
  status: string;
  kycStatus: string;
  riskScore: number;
  riskTier: string;
}

const STEPS = [
  'Requisition Details',
  'Budget Validation',
  'RFQ & Vendor Selection',
  'Review & Submit'
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
  const [vendors, setVendors] = useState<SelectionVendor[]>([]);
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);

  useEffect(() => {
    // Fetch active & approved selection vendors
    axios.get('/api/vendor-selection')
      .then(res => {
        setVendors(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => console.error('Failed to load selection vendors:', err));

    // Fetch previously saved selections for RFQ-2026-0001
    axios.get('/api/rfq-vendor-selection', { params: { rfqId: 'RFQ-2026-0001' } })
      .then(res => {
        setSelectedVendorIds(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => console.error('Failed to load RFQ vendor selections:', err));
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
        try {
          await axios.post('/api/rfq-attachments', {
            rfqId: 'RFQ-2026-0001',
            attachmentId: res.file.fileId,
            fileName: res.file.fileName,
            filePath: res.file.filePath
          });
        } catch (err) {
          console.error('Failed to log attachment to backend:', err);
        }
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

  const handleVendorToggle = (vendorId: string) => {
    setSelectedVendorIds(prev =>
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleNext = () => {
    if (currentStep === 3) {
      const selectedNames = vendors
        .filter(v => selectedVendorIds.includes(v.vendorId))
        .map(v => v.vendorName);

      axios.post('/api/rfq-vendor-selection', {
        rfqId: 'RFQ-2026-0001',
        selectedVendors: selectedVendorIds,
        selectedVendorNames: selectedNames,
        timestamp: new Date().toISOString()
      })
        .then(() => {
          setCurrentStep(prev => prev + 1);
        })
        .catch(err => {
          console.error('Failed to save selections:', err);
          setCurrentStep(prev => prev + 1);
        });
    } else if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      submitRequisition();
    }
  };

  const submitRequisition = async () => {
    setLoading(true);
    const costCenter = BUDGET_MAP[costCenterCode];
    const selectedVendors = vendors.filter(v => selectedVendorIds.includes(v.vendorId));
    const avgRiskScore = selectedVendors.length > 0
      ? Math.round(selectedVendors.reduce((sum, v) => sum + v.riskScore, 0) / selectedVendors.length)
      : 0;

    let overallRiskTier = 'LOW';
    if (avgRiskScore > 30 && avgRiskScore <= 60) overallRiskTier = 'MEDIUM';
    else if (avgRiskScore > 60) overallRiskTier = 'HIGH';

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
        selectedVendorId: selectedVendorIds.join(', ') || "VND-001",
        selectedVendorName: selectedVendors.map(v => v.vendorName).join(', ') || "ABC Infotech Pvt Ltd",
        quotedPrice: estimatedCost,
        leadTime: "N/A",
        kycCompliance: "Clean",
        slaScore: "N/A",
        vendorRiskLevel: overallRiskTier
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
                <span className={styles.legendDotConsumed}>Consumed (₹{(activeBudget.consumed / 100000).toFixed(1)} L)</span>
                <span className={styles.legendDotCurrent}>Current Requisition (₹{(estimatedCost / 100000).toFixed(1)} L)</span>
                <span className={styles.legendDotAvailable}>Available (₹{(availableVal / 100000).toFixed(1)} L)</span>
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



            <div className={styles.formActions}>
              <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
              <Button onClick={handleNext}>Next: RFQ & Vendor Selection &rarr;</Button>
            </div>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className={styles.formCard}>
            <h3 className={styles.formTitle}>RFQ & Vendor Selection</h3>

            <div className={styles.compareGrid}>
              {vendors.map(v => {
                const isSelected = selectedVendorIds.includes(v.vendorId);

                // Compute Risk Tier styling/colors
                let riskColor = '#16a34a'; // green
                let riskBg = '#dcfce7';
                if (v.riskTier === 'MEDIUM') {
                  riskColor = '#d97706'; // orange
                  riskBg = '#fef3c7';
                } else if (v.riskTier === 'HIGH') {
                  riskColor = '#dc2626'; // red
                  riskBg = '#fee2e2';
                }

                return (
                  <div
                    key={v.vendorId}
                    className={`${styles.compareCard} ${isSelected ? styles.compareCardSelected : ''}`}
                    onClick={() => handleVendorToggle(v.vendorId)}
                    style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => { }} // handled by card onClick
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {v.vendorName}
                      </h4>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div>Risk Score: <strong style={{ color: 'var(--color-text-primary)' }}>{v.riskScore}/100</strong></div>
                      <div>
                        Risk Tier:
                        <span style={{
                          marginLeft: '8px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          color: riskColor,
                          backgroundColor: riskBg,
                          display: 'inline-block'
                        }}>
                          {v.riskTier} RISK
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.formActions}>
              <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
              <Button onClick={handleNext} disabled={selectedVendorIds.length === 0}>
                Submit &rarr;
              </Button>
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
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>RFQ Number</span>
                <span className={styles.summaryValue}>RFQ-2026-0001</span>
              </div>
            </div>

            <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Selected Vendors</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {vendors.filter(v => selectedVendorIds.includes(v.vendorId)).map(v => (
                    <div key={v.vendorId} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-text-primary)' }}>
                      <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span> {v.vendorName}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Risk Summary</h4>
                {(() => {
                  const selectedVendors = vendors.filter(v => selectedVendorIds.includes(v.vendorId));
                  const avgRiskScore = selectedVendors.length > 0
                    ? Math.round(selectedVendors.reduce((sum, v) => sum + v.riskScore, 0) / selectedVendors.length)
                    : 0;

                  let overallRiskTier = 'LOW';
                  if (avgRiskScore > 30 && avgRiskScore <= 60) overallRiskTier = 'MEDIUM';
                  else if (avgRiskScore > 60) overallRiskTier = 'HIGH';

                  return (
                    <div style={{ fontSize: '0.8125rem', display: 'flex', gap: '24px' }}>
                      <div>Average Risk Score: <strong style={{ color: 'var(--color-text-primary)' }}>{avgRiskScore}</strong></div>
                      <div>
                        Overall Risk Tier:
                        <span style={{
                          marginLeft: '8px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          color: avgRiskScore <= 30 ? '#16a34a' : avgRiskScore <= 60 ? '#d97706' : '#dc2626',
                          backgroundColor: avgRiskScore <= 30 ? '#dcfce7' : avgRiskScore <= 60 ? '#fef3c7' : '#fee2e2',
                          display: 'inline-block'
                        }}>
                          {overallRiskTier}
                        </span>
                      </div>
                    </div>
                  );
                })()}
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
              <Button onClick={handleNext} disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
