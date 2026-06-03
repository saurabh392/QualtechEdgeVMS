import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, CheckCircle2, Bot, UploadCloud, FileText } from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { 
  getVendorsList, 
  getClauses, 
  createContract, 
  uploadContractDocument
} from '../../services/contractService';
import type { 
  Vendor, 
  Clause, 
  UploadedDocument, 
  ContractRecord 
} from '../../services/contractService';
import styles from './CreateContract.module.css';

const STEPS = [
  'Basics',
  'Commercial Terms',
  'SLA & Legal',
  'Review & Submit'
];

export const CreateContract: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdContractId, setCreatedContractId] = useState('CTR-2026-00045');

  // Master lists
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [allClauses, setAllClauses] = useState<Clause[]>([]);

  // Step 1 Basics State
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [vendorApprovalStatus, setVendorApprovalStatus] = useState<string>('');
  const [contractType, setContractType] = useState('Master Service Agreement');
  const [contractName, setContractName] = useState('');
  const [department, setDepartment] = useState('IT Services');
  const [effectiveDate, setEffectiveDate] = useState('2026-06-01');
  const [expiryDate, setExpiryDate] = useState('2028-05-31');

  // Step 2 Commercials State
  const [contractValue, setContractValue] = useState('12000000');
  const [currency, setCurrency] = useState('INR');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [billingFrequency, setBillingFrequency] = useState('Monthly');

  // Step 3 SLA & Legal State
  const [selectedClauseNames, setSelectedClauseNames] = useState<string[]>([
    'RBI Outsourcing Guidelines Clause',
    'Standard NDA Clause',
    'Data Privacy & Security Clause'
  ]);
  const [uptime, setUptime] = useState('99.95%');
  const [responseTime, setResponseTime] = useState('2 Hours');
  const [resolutionTime, setResolutionTime] = useState('8 Hours');
  const [slaBreachPenalty, setSlaBreachPenalty] = useState('5%');
  const [maxPenaltyCap, setMaxPenaltyCap] = useState('10%');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);

  // Step 4 Review & Submit
  const [confirmed, setConfirmed] = useState(true);

  // Load baseline master lists
  useEffect(() => {
    async function initData() {
      try {
        const vendorList = await getVendorsList();
        setVendors(vendorList);
        // Default select first vendor
        if (vendorList.length > 0) {
          const first = vendorList[0];
          setSelectedVendorId(first.vendorId);
          setContractName(`${first.vendorName} - MSA 2026`);
        }
        
        const clauseList = await getClauses();
        setAllClauses(clauseList);
      } catch (err) {
        console.error('Failed to load Create Contract dropdown data:', err);
      }
    }
    initData();
  }, []);

  // Fetch selected vendor's approval status
  useEffect(() => {
    if (!selectedVendorId) {
      setVendorApprovalStatus('');
      return;
    }
    axios.get(`/api/kyc/approvals/vendor/${selectedVendorId}`)
      .then(res => {
        if (res.data.success) {
          setVendorApprovalStatus(res.data.overallStatus);
        }
      })
      .catch(err => {
        console.error('Failed to fetch vendor approval status:', err);
        setVendorApprovalStatus('Vendor Approved');
      });
  }, [selectedVendorId]);

  // Update contract name when vendor or contract type changes
  const handleVendorChange = (vendorId: string) => {
    setSelectedVendorId(vendorId);
    const vendorObj = vendors.find(v => v.vendorId === vendorId);
    if (vendorObj) {
      setContractName(`${vendorObj.vendorName} - ${contractType} 2026`);
    }
  };

  const handleContractTypeChange = (type: string) => {
    setContractType(type);
    const vendorObj = vendors.find(v => v.vendorId === selectedVendorId);
    if (vendorObj) {
      setContractName(`${vendorObj.vendorName} - ${type} 2026`);
    }
  };

  // AI Recommended Template helper
  const getAiRecommendedTemplate = () => {
    const vendorObj = vendors.find(v => v.vendorId === selectedVendorId);
    if (!vendorObj) return 'Master Service Agreement (Standard IT)';
    const name = vendorObj.vendorName;
    if (name.includes('Secure') || name.includes('Infotech') || name.includes('Tech')) {
      return 'Master Service Agreement (Standard IT)';
    } else if (name.includes('Supplies') || name.includes('Office')) {
      return 'Vendor Agreement (Goods Support)';
    } else if (name.includes('CloudNet') || name.includes('Systems')) {
      return 'SaaS Agreement (Standard SLA)';
    }
    return 'Standard Procurement Agreement';
  };

  // Handle file uploads
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(true);
    try {
      const res = await uploadContractDocument(file, {
        documentCategory: 'Contract Document',
        uploadedBy: 'Saurabh Anand'
      });
      if (res.success) {
        setUploadedFiles(prev => [...prev, res.file]);
      }
    } catch (err) {
      alert('Upload failed: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleClauseToggle = (name: string) => {
    setSelectedClauseNames(prev => 
      prev.includes(name) 
        ? prev.filter(c => c !== name) 
        : [...prev, name]
    );
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      submitForm();
    }
  };

  const submitForm = async () => {
    if (!confirmed) {
      alert('Please confirm that the contract details are correct.');
      return;
    }

    setLoading(true);
    try {
      const vendorObj = vendors.find(v => v.vendorId === selectedVendorId) || { vendorId: 'VND-UNKNOWN', vendorName: 'Unknown Vendor' };
      
      const payload: ContractRecord = {
        vendor: {
          vendorId: vendorObj.vendorId,
          vendorName: vendorObj.vendorName,
          vendorRiskLevel: vendorObj.vendorRiskLevel || 'Low',
          vendorComplianceScore: vendorObj.vendorComplianceScore || 90
        },
        contractName,
        contractType,
        department,
        effectiveDate,
        expiryDate,
        commercialTerms: {
          contractValue: parseFloat(contractValue.replace(/[^0-9.]/g, '')),
          currency,
          paymentTerms,
          billingFrequency
        },
        slaAndLegal: {
          selectedClauses: selectedClauseNames,
          slaMetrics: {
            uptime,
            responseTime,
            resolutionTime
          },
          penaltyTerms: {
            slaBreachPenalty,
            maxPenaltyCap
          }
        },
        uploadedDocuments: uploadedFiles
      };

      const res = await createContract(payload);
      if (res.success && res.contract) {
        setCreatedContractId(res.contract.contractId || 'CTR-2026-00045');
        setIsSubmitted(true);
      }
    } catch (err) {
      alert('Failed to submit contract: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getVendorNameById = (id: string) => {
    const v = vendors.find(item => item.vendorId === id);
    return v ? v.vendorName : 'None';
  };

  if (isSubmitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>
            <CheckCircle2 size={64} color="#16a34a" />
          </div>
          <h2 className={styles.successTitle}>Contract Created Successfully!</h2>
          <p className={styles.successDesc}>The contract {createdContractId} has been successfully saved to the database and routed to Procurement Review stage.</p>
          <div className={styles.successActions}>
            <Button onClick={() => navigate('/contracts/repository')}>Go to Repository</Button>
            <Button variant="outline" onClick={() => { setIsSubmitted(false); setCurrentStep(1); setUploadedFiles([]); }}>Create Another</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <button className={styles.backBtn} onClick={() => navigate('/contracts/dashboard')}>
            <ChevronLeft size={16} /> Back
          </button>
          <h1 className={styles.title}>Contract Creation Wizard</h1>
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
            <div className={styles.aiRecommendation}>
              <Bot size={20} className={styles.aiIcon} />
              <div>
                <strong>AI Copilot Recommendation:</strong> Based on the selected vendor "{getVendorNameById(selectedVendorId)}", the recommended contract template is <strong>{getAiRecommendedTemplate()}</strong>.
              </div>
            </div>

            {selectedVendorId && vendorApprovalStatus === 'Vendor Approved' && (
              <div style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                ✅ Vendor Approved for Business Transactions
              </div>
            )}
            {selectedVendorId && vendorApprovalStatus === 'Rejected' && (
              <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecdd3', color: '#991b1b', padding: '12px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                ❌ Vendor Approval Rejected
              </div>
            )}
            {selectedVendorId && vendorApprovalStatus && vendorApprovalStatus !== 'Vendor Approved' && vendorApprovalStatus !== 'Rejected' && (
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', color: '#b45309', padding: '12px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                ⚠ Vendor Onboarding/KYC Approval Pending (Current Status: {vendorApprovalStatus})
              </div>
            )}

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Vendor Name <span className={styles.required}>*</span></label>
                <select 
                  className={styles.select}
                  value={selectedVendorId}
                  onChange={(e) => handleVendorChange(e.target.value)}
                >
                  <option value="">Select Vendor</option>
                  {vendors.map(v => (
                    <option key={v.vendorId} value={v.vendorId}>{v.vendorName}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Contract Type <span className={styles.required}>*</span></label>
                <select 
                  className={styles.select}
                  value={contractType}
                  onChange={(e) => handleContractTypeChange(e.target.value)}
                >
                  <option value="Master Service Agreement">Master Service Agreement</option>
                  <option value="Vendor Agreement">Vendor Agreement</option>
                  <option value="Non-Disclosure Agreement">Non-Disclosure Agreement</option>
                  <option value="SaaS Agreement">SaaS Agreement</option>
                  <option value="Retainer">Retainer</option>
                  <option value="Facility Lease">Facility Lease</option>
                  <option value="SLA Agreement">SLA Agreement</option>
                </select>
              </div>
              <Input 
                label="Contract Name" 
                value={contractName} 
                onChange={(e) => setContractName(e.target.value)}
                required 
              />
              <Input 
                label="Department" 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)}
                required 
              />
              <Input 
                label="Effective Date" 
                type="date" 
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                required 
              />
              <Input 
                label="Expiry Date" 
                type="date" 
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required 
              />
            </div>

            <div className={styles.formActions}>
              <Button variant="ghost" onClick={() => navigate('/contracts/dashboard')}>Cancel</Button>
              <Button onClick={handleNext} disabled={selectedVendorId ? vendorApprovalStatus !== 'Vendor Approved' : true}>Next &rarr;</Button>
            </div>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className={styles.formCard}>
            <div className={styles.formGrid}>
              <Input 
                label="Contract Value" 
                type="text" 
                value={contractValue}
                onChange={(e) => setContractValue(e.target.value)}
                required 
              />
              <div className={styles.formGroup}>
                <label>Currency <span className={styles.required}>*</span></label>
                <select 
                  className={styles.select}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Payment Terms <span className={styles.required}>*</span></label>
                <select 
                  className={styles.select}
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                >
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Billing Frequency <span className={styles.required}>*</span></label>
                <select 
                  className={styles.select}
                  value={billingFrequency}
                  onChange={(e) => setBillingFrequency(e.target.value)}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annually">Annually</option>
                </select>
              </div>
            </div>

            <div className={styles.formActions}>
              <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
              <Button onClick={handleNext}>Next &rarr;</Button>
            </div>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className={styles.formCard}>
            <div className={styles.clauseSection}>
              <div className={styles.clauseHeader}>
                <h3>Clause Library Integration</h3>
                <Button variant="outline" size="sm" onClick={() => navigate('/contracts/clauses')}>Browse Library</Button>
              </div>
              
              <div className={styles.clauseList}>
                {allClauses.length > 0 ? (
                  allClauses.map(clause => (
                    <label key={clause.id} className={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={selectedClauseNames.includes(clause.name)}
                        onChange={() => handleClauseToggle(clause.name)}
                      /> 
                      {clause.name} {clause.mandatory && <span style={{ color: '#ef4444', fontSize: '10px' }}>(Mandatory)</span>}
                    </label>
                  ))
                ) : (
                  <>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" defaultChecked /> RBI Outsourcing Guidelines Clause
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" defaultChecked /> Standard NDA Clause
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" defaultChecked /> Data Privacy & Security Clause
                    </label>
                  </>
                )}
              </div>
            </div>

            <div className={styles.formGrid} style={{ marginTop: '20px', marginBottom: '20px' }}>
              <Input 
                label="Target Uptime SLA" 
                value={uptime}
                onChange={(e) => setUptime(e.target.value)}
              />
              <Input 
                label="Response SLA" 
                value={responseTime}
                onChange={(e) => setResponseTime(e.target.value)}
              />
              <Input 
                label="Resolution SLA" 
                value={resolutionTime}
                onChange={(e) => setResolutionTime(e.target.value)}
              />
              <div className={styles.formGroup}>
                <label>SLA Breach Penalty</label>
                <select className={styles.select} value={slaBreachPenalty} onChange={(e) => setSlaBreachPenalty(e.target.value)}>
                  <option value="2%">2%</option>
                  <option value="5%">5%</option>
                  <option value="10%">10%</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Max Penalty Cap</label>
                <select className={styles.select} value={maxPenaltyCap} onChange={(e) => setMaxPenaltyCap(e.target.value)}>
                  <option value="5%">5%</option>
                  <option value="10%">10%</option>
                  <option value="20%">20%</option>
                </select>
              </div>
            </div>

            <div className={styles.uploadSection}>
              <h3>Supporting Documents (Optional)</h3>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc"
              />
              <div className={styles.uploadBox} onClick={triggerFileSelect}>
                <UploadCloud size={32} color="#94a3b8" />
                <p>{uploading ? 'Uploading document...' : 'Drag & drop files here or click to browse'}</p>
                <span className={styles.uploadHint}>Supports PDF, DOCX (Max 20MB)</span>
              </div>

              {uploadedFiles.length > 0 && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {uploadedFiles.map(file => (
                    <div 
                      key={file.fileId} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '8px 12px', 
                        backgroundColor: '#f1f5f9', 
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    >
                      <FileText size={16} color="#64748b" />
                      <span style={{ fontWeight: '500', flex: 1 }}>{file.fileName}</span>
                      <span style={{ color: '#64748b' }}>({file.fileSize})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.formActions}>
              <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
              <Button onClick={handleNext}>Next &rarr;</Button>
            </div>
          </Card>
        )}

        {currentStep === 4 && (
          <Card className={styles.formCard}>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Vendor Name</span>
                <span className={styles.summaryValue}>{getVendorNameById(selectedVendorId)}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Contract Type</span>
                <span className={styles.summaryValue}>{contractType}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Contract Value</span>
                <span className={styles.summaryValue}>{currency} {parseFloat(contractValue).toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Payment Terms</span>
                <span className={styles.summaryValue}>{paymentTerms}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Billing Frequency</span>
                <span className={styles.summaryValue}>{billingFrequency}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>SLA Uptime Target</span>
                <span className={styles.summaryValue}>{uptime}</span>
              </div>
            </div>

            <div className={styles.declaration}>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={confirmed} 
                  onChange={(e) => setConfirmed(e.target.checked)} 
                /> 
                I confirm that the contract details are correct and comply with organizational policies.
              </label>
            </div>

            <div className={styles.formActions}>
              <Button variant="outline" onClick={() => setCurrentStep(3)}>Back</Button>
              <Button 
                onClick={handleNext} 
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
