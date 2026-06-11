import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, Bot, Check, AlertTriangle, Calendar } from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { useAuth } from '../../context/AuthContext';
import styles from './PaymentProcessing.module.css';

const STEPS = [
  'Select Invoices',
  'Payment Validation',
  'Scheduling',
  'Review & Submit'
];

const mockPayables = [
  { id: 'INV-2026-9908', vendor: 'ABC Infotech Pvt Ltd', value: 1475000, due: '12 Jun 2026', type: 'MSME', selected: true },
  { id: 'INV-2026-9907', vendor: 'Secure Facilities Ltd', value: 531000, due: '10 Jun 2026', type: 'Non-MSME', selected: true },
  { id: 'INV-2026-9904', vendor: 'Tech Solutions', value: 401200, due: '01 Jun 2026', type: 'Non-MSME', selected: false },
];

export const PaymentProcessing: React.FC = () => {
  const navigate = useNavigate();
  const { hasActionPermission } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  React.useEffect(() => {
    if (!hasActionPermission('RELEASE_PAYMENT')) {
      navigate('/access-denied');
    }
  }, [hasActionPermission, navigate]);

  const handleNext = () => {
    if (currentStep === 1) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentStep(2);
      }, 1500);
    } else if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setIsSubmitted(true);
      }, 1500);
    }
  };

  if (isSubmitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>
            <CheckCircle2 size={64} color="#16a34a" />
          </div>
          <h2 className={styles.successTitle}>Payment Batch Created Successfully!</h2>
          <p className={styles.successDesc}>
            Batch **PAY-2026-0091** containing **2 invoices (total ₹20,06,000)** has been scheduled and forwarded to Checker approval.
          </p>
          <div className={styles.successActions}>
            <Button onClick={() => navigate('/payments/dashboard')}>Go to Dashboard</Button>
            <Button variant="outline" onClick={() => { setIsSubmitted(false); setCurrentStep(1); }}>Process More Payouts</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <button className={styles.backBtn} onClick={() => navigate('/payments/dashboard')}>
            <ChevronLeft size={16} /> Back to Dashboard
          </button>
          <h1 className={styles.title}>Payment Execution Wizard</h1>
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
            <h3 className={styles.formTitle}>Select Approved Invoices for Disbursement</h3>
            <div className={styles.payableList}>
              <div className={styles.listHeaderRow}>
                <span>Select</span>
                <span>Invoice ID</span>
                <span>Vendor</span>
                <span>Amount</span>
                <span>Due Date</span>
                <span>Type</span>
              </div>
              {mockPayables.map(payable => (
                <div key={payable.id} className={styles.payableRow}>
                  <input type="checkbox" defaultChecked={payable.selected} className={styles.checkbox} />
                  <span className={styles.payableId}>{payable.id}</span>
                  <span className={styles.payableVendor}>{payable.vendor}</span>
                  <span className={styles.payableAmount}>₹{payable.value.toLocaleString('en-IN')}</span>
                  <span>{payable.due}</span>
                  <span className={payable.type === 'MSME' ? styles.msmeBadge : styles.normalBadge}>{payable.type}</span>
                </div>
              ))}
            </div>

            <div className={styles.formActions}>
              <Button variant="ghost" onClick={() => navigate('/payments/dashboard')}>Cancel</Button>
              <Button onClick={handleNext} disabled={isProcessing}>
                {isProcessing ? 'Validating Bank Nodes...' : 'Next: Payment Validation \u2192'}
              </Button>
            </div>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className={styles.formCard}>
            <div className={styles.aiExtractionBadge}>
              <Bot size={18} />
              <span>AI Payment Auditor: <strong>Bank validation successful</strong></span>
            </div>

            <h3 className={styles.formTitle} style={{ marginTop: '24px' }}>Automated Payout Audit</h3>

            <div className={styles.verificationList}>
              <div className={styles.verifyItem}>
                <div className={styles.verifyIconSuccess}><Check size={16} /></div>
                <div>
                  <h5>Beneficiary Bank Accounts Validated</h5>
                  <p>API verified active status for HDFC Bank and ICICI Bank nodes.</p>
                </div>
              </div>

              <div className={styles.verifyItem}>
                <div className={styles.verifyIconSuccess}><Check size={16} /></div>
                <div>
                  <h5>Duplicate Payout Check Passed</h5>
                  <p>No similar pending transaction reference found in this ledger batch.</p>
                </div>
              </div>

              <div className={styles.verifyItem}>
                <div className={styles.verifyIconWarning}><AlertTriangle size={16} /></div>
                <div>
                  <h5>MSME Payout Priority</h5>
                  <p>ABC Infotech Pvt Ltd is registered under MSME Act. Payment due in 24 days (Compliant).</p>
                </div>
              </div>
            </div>

            <div className={styles.formActions} style={{ marginTop: '32px' }}>
              <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
              <Button onClick={handleNext}>Next: Scheduling & Payout Mode &rarr;</Button>
            </div>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className={styles.formCard}>
            <h3 className={styles.formTitle}>Schedule Treasury Payout</h3>
            
            <div className={styles.schedulingGrid}>
              <div className={styles.formGroup}>
                <label>Disbursement Payout Mode</label>
                <select className={styles.select}>
                  <option>RTGS (Real Time Gross Settlement)</option>
                  <option>NEFT (National Electronic Funds Transfer)</option>
                  <option>IMPS (Immediate Payment Service)</option>
                </select>
              </div>

              <Input label="Scheduled Execution Date" type="date" defaultValue="2026-05-20" />
            </div>

            <div className={styles.cutOffNotice}>
              <Calendar size={18} className={styles.noticeIcon} />
              <div>
                <h5>HDFC Bank Cut-off Times</h5>
                <p>RTGS payouts scheduled after 16:30 PM will execute on the next business day.</p>
              </div>
            </div>

            <div className={styles.formActions}>
              <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
              <Button onClick={handleNext}>Next: Final Payout Review &rarr;</Button>
            </div>
          </Card>
        )}

        {currentStep === 4 && (
          <Card className={styles.formCard}>
            <h3 className={styles.formTitle}>Review and Confirm Payout Batch</h3>

            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Total Batch Value</span>
                <span className={styles.summaryValue}>₹20,06,000</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Total Invoices</span>
                <span className={styles.summaryValue}>2 Invoices Selected</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Disbursement Mode</span>
                <span className={styles.summaryValue}>RTGS (HDFC Corporate Node)</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>TDS Component (Withheld)</span>
                <span className={styles.summaryValue}>₹1,47,500 (10% on professional fees)</span>
              </div>
            </div>

            <div className={styles.declaration}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" defaultChecked />
                I confirm that bank accounts have been verified, and the treasury batch conforms to board-authorized payment thresholds.
              </label>
            </div>

            <div className={styles.formActions}>
              <Button variant="outline" onClick={() => setCurrentStep(3)}>Back</Button>
              <Button onClick={handleNext} disabled={isProcessing}>
                {isProcessing ? 'Submitting Batch Payout...' : 'Forward to Checker Approval'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
