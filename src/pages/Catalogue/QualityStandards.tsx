import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  Plus, 
  FileText, 
  Activity, 
  Check, 
  ShieldAlert,
  Save
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { CatalogueHeader } from './CatalogueHeader';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { Badge } from '../../components/Badge/Badge';
import styles from './QualityStandards.module.css';
import { getAllItems } from '../../services/itemMasterService';

interface QAItem {
  id: string;
  name: string;
  category: string;
  score: number;
  rejectRate: number;
  inspectionFreq: string;
  complianceCert: string[];
  testProtocol: string;
  riskClass: 'High' | 'Medium' | 'Low';
  vendorPerformance: { month: string; rate: number }[];
}

const QA_ITEMS_MOCK: QAItem[] = [
  {
    id: 'CAT-001',
    name: 'Dell Latitude 5420 Laptop',
    category: 'IT Hardware',
    score: 96,
    rejectRate: 0.8,
    inspectionFreq: 'Per Batch (Random 5%)',
    complianceCert: ['ISO 9001', 'RoHS Certified', 'BIS Standard'],
    testProtocol: 'Power-on self test, BIOS initialization, battery charging cycle & physical chassis inspection.',
    riskClass: 'Low',
    vendorPerformance: [
      { month: 'Dec', rate: 1.2 },
      { month: 'Jan', rate: 1.0 },
      { month: 'Feb', rate: 0.8 },
      { month: 'Mar', rate: 0.7 },
      { month: 'Apr', rate: 0.8 },
      { month: 'May', rate: 0.8 }
    ]
  },
  {
    id: 'CAT-002',
    name: 'Annual Security Audit Service',
    category: 'Professional Services',
    score: 98,
    rejectRate: 0.0,
    inspectionFreq: 'Post-Delivery Milestone',
    complianceCert: ['ISO 27001', 'SOC 2 Type II'],
    testProtocol: 'Vulnerability assessment review, penetration testing audit validation, compliance guidelines checklist matching.',
    riskClass: 'High',
    vendorPerformance: [
      { month: 'Dec', rate: 0.0 },
      { month: 'Jan', rate: 0.0 },
      { month: 'Feb', rate: 0.0 },
      { month: 'Mar', rate: 0.0 },
      { month: 'Apr', rate: 0.0 },
      { month: 'May', rate: 0.0 }
    ]
  },
  {
    id: 'CAT-003',
    name: 'Ergonomic Office Chair',
    category: 'Office Supplies',
    score: 84,
    rejectRate: 4.2,
    inspectionFreq: '100% Inbound Inspection',
    complianceCert: ['BIFMA Standard'],
    testProtocol: 'Pneumatic cylinder stress test, wheel caster rotation inspection, tilt lock verification.',
    riskClass: 'Medium',
    vendorPerformance: [
      { month: 'Dec', rate: 3.5 },
      { month: 'Jan', rate: 4.0 },
      { month: 'Feb', rate: 4.5 },
      { month: 'Mar', rate: 5.0 },
      { month: 'Apr', rate: 4.2 },
      { month: 'May', rate: 4.2 }
    ]
  },
  {
    id: 'CAT-004',
    name: 'Facility Deep Cleaning',
    category: 'Facility Management',
    score: 92,
    rejectRate: 1.5,
    inspectionFreq: 'Weekly Checklist Inspection',
    complianceCert: ['OSHA Compliance', 'ISO 14001'],
    testProtocol: 'Air purity particulate check, sanitization swabbing test, checklist verification by site lead.',
    riskClass: 'Medium',
    vendorPerformance: [
      { month: 'Dec', rate: 2.0 },
      { month: 'Jan', rate: 1.8 },
      { month: 'Feb', rate: 1.5 },
      { month: 'Mar', rate: 1.6 },
      { month: 'Apr', rate: 1.4 },
      { month: 'May', rate: 1.5 }
    ]
  }
];

export const QualityStandards: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<QAItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<QAItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Editable Fields State
  const [inspectionFreq, setInspectionFreq] = useState('');
  const [testProtocol, setTestProtocol] = useState('');
  const [rejectThreshold, setRejectThreshold] = useState(0);
  const [riskClass, setRiskClass] = useState<'High' | 'Medium' | 'Low'>('Low');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const list = await getAllItems();
        const mappedList: QAItem[] = list.map((item, idx) => {
          const mockMatch = QA_ITEMS_MOCK.find(m => m.id === item.itemId);
          if (mockMatch) return mockMatch;

          const rClass = item.riskClassification 
            ? item.riskClassification.replace(' Risk', '') as 'High' | 'Medium' | 'Low'
            : 'Low';

          return {
            id: item.itemId || `ITM-${idx}`,
            name: item.itemName,
            category: item.category,
            score: 95,
            rejectRate: 0.0,
            inspectionFreq: 'Per Batch (Random 5%)',
            complianceCert: item.qualityComplianceStandards 
              ? [item.qualityComplianceStandards] 
              : ['ISO 9001'],
            testProtocol: item.qualityTestingCriteria || 'Power-on self test.',
            riskClass: rClass,
            vendorPerformance: [
              { month: 'Dec', rate: 1.0 },
              { month: 'Jan', rate: 0.8 },
              { month: 'Feb', rate: 0.5 },
              { month: 'Mar', rate: 0.2 },
              { month: 'Apr', rate: 0.0 },
              { month: 'May', rate: 0.0 }
            ]
          };
        });

        setItems(mappedList);
        if (mappedList.length > 0) {
          setSelectedItem(mappedList[0]);
        }
      } catch (err) {
        console.error("Error loading quality items:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      setInspectionFreq(selectedItem.inspectionFreq);
      setTestProtocol(selectedItem.testProtocol);
      setRejectThreshold(selectedItem.rejectRate);
      setRiskClass(selectedItem.riskClass);
    }
  }, [selectedItem]);

  const handleItemSelect = (item: QAItem) => {
    setSelectedItem(item);
  };

  const handleSave = () => {
    if (!selectedItem) return;
    const updatedItems = items.map(it => {
      if (it.id === selectedItem.id) {
        return {
          ...it,
          inspectionFreq,
          testProtocol,
          rejectRate: rejectThreshold,
          riskClass
        };
      }
      return it;
    });
    setItems(updatedItems);
    alert(`Quality standards for ${selectedItem.name} have been updated successfully!`);
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || !selectedItem) {
    return (
      <div className={styles.container}>
        <CatalogueHeader 
          title="QUALITY COMPLIANCE & PARAMETERS" 
          subtitle="Manage inspection rules, ISO/BIS standard requirements, SLA thresholds, and item rejection parameters"
          actions={
            <Button variant="outline" icon={<ArrowLeft size={16} />} onClick={() => navigate('/catalogue/dashboard')}>
              Back to Dashboard
            </Button>
          }
        />
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading quality standards parameters...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <CatalogueHeader 
        title="QUALITY COMPLIANCE & PARAMETERS" 
        subtitle="Manage inspection rules, ISO/BIS standard requirements, SLA thresholds, and item rejection parameters"
        actions={
          <Button variant="outline" icon={<ArrowLeft size={16} />} onClick={() => navigate('/catalogue/dashboard')}>
            Back to Dashboard
          </Button>
        }
      />

      <div className={styles.layout}>
        {/* Left Side: Item Selector */}
        <div className={styles.leftPanel}>
          <Card className={styles.card}>
            <div className={styles.cardTitle}>
              <span>Item & Service List</span>
              <Badge variant="info">{filteredItems.length} Loaded</Badge>
            </div>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className={styles.searchBox} 
                placeholder="Search catalog items..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className={styles.itemList}>
              {filteredItems.map(item => {
                const isActive = item.id === selectedItem.id;
                let riskBadge = <Badge variant="success">Low Risk</Badge>;
                if (item.riskClass === 'High') riskBadge = <Badge variant="danger">High Risk</Badge>;
                else if (item.riskClass === 'Medium') riskBadge = <Badge variant="warning">Med Risk</Badge>;

                return (
                  <div 
                    key={item.id} 
                    className={`${styles.itemRow} ${isActive ? styles.itemRowActive : ''}`}
                    onClick={() => handleItemSelect(item)}
                  >
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemMeta}>{item.id} • {item.category}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: item.score >= 90 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        Score: {item.score}%
                      </span>
                      {riskBadge}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Side: QA Settings & Chart */}
        <div className={styles.mainPanel}>
          <Card className={styles.card}>
            <div className={styles.cardTitle}>
              <span>Standards Configuration: {selectedItem.name} ({selectedItem.id})</span>
              <Badge variant={selectedItem.riskClass === 'High' ? 'danger' : 'info'}>
                {selectedItem.riskClass} Risk Category
              </Badge>
            </div>

            {/* High Risk Alert warning banner */}
            {selectedItem.riskClass === 'High' && (
              <div className={styles.alertBox}>
                <ShieldAlert size={20} className={styles.alertIcon} />
                <div>
                  <div className={styles.alertText}>Enhanced Due Diligence & QA Monitoring Required</div>
                  <div className={styles.alertDesc}>
                    Since this is classified as high risk, procurement compliance mandates ISO 27001 / SOC 2 checking and 100% milestone audits before payout is approved.
                  </div>
                </div>
              </div>
            )}

            <div className={styles.grid2Col}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Inspection / Checkpoint Frequency *</label>
                <select 
                  className={styles.selectField} 
                  value={inspectionFreq}
                  onChange={(e) => setInspectionFreq(e.target.value)}
                >
                  <option value="Per Batch (Random 5%)">Per Batch (Random 5%)</option>
                  <option value="100% Inbound Inspection">100% Inbound Inspection</option>
                  <option value="Weekly Checklist Inspection">Weekly Checklist Inspection</option>
                  <option value="Monthly SLA Review">Monthly SLA Review</option>
                  <option value="Post-Delivery Milestone">Post-Delivery Milestone</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Maximum Allowable Rejection Rate Threshold (%) *</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className={styles.inputField} 
                  value={rejectThreshold}
                  onChange={(e) => setRejectThreshold(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Testing Protocol & QA Checklists *</label>
              <textarea 
                className={styles.textareaField} 
                value={testProtocol}
                onChange={(e) => setTestProtocol(e.target.value)}
              />
            </div>

            <div className={styles.grid2Col}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Risk Classification</label>
                <select 
                  className={styles.selectField} 
                  value={riskClass}
                  onChange={(e: any) => setRiskClass(e.target.value)}
                >
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Auto-Maker Checker SLA Flow</label>
                <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '8px', color: 'var(--color-success)', fontSize: '13px', fontWeight: 500 }}>
                  <CheckCircle size={16} /> 
                  <span>Active (Auto-notifies QA team)</span>
                </div>
              </div>
            </div>

            {/* Compliance Certificates Required */}
            <div style={{ marginTop: '8px' }}>
              <div className={styles.sectionTitle}>Mandated Vendor Compliance Certificates</div>
              <div className={styles.certList}>
                {selectedItem.complianceCert.map((cert, index) => (
                  <div key={index} className={styles.certItem}>
                    <div className={styles.certInfo}>
                      <FileText size={16} className={styles.certIcon} />
                      <div>
                        <div className={styles.certName}>{cert}</div>
                        <div className={styles.certValidity}>Active validation linked to KYC expiry tracker</div>
                      </div>
                    </div>
                    <span className={styles.certVerified}><Check size={12} /> Verified</span>
                  </div>
                ))}
                <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => alert("Configure custom certificate requirement rules...")}>
                  Add Mandated Certificate
                </Button>
              </div>
            </div>

            {/* Historical Rejection Rate Chart */}
            <div style={{ marginTop: '16px' }}>
              <div className={styles.sectionTitle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={16} style={{ color: 'var(--color-primary)' }} />
                  <span>Historical Defect / Rejection Trend (%)</span>
                </div>
              </div>
              <div style={{ height: '150px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedItem.vendorPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(val) => [`${val}%`, 'Rejection Rate']} />
                    <Area type="monotone" dataKey="rate" stroke="#DC2626" fill="#FEE2E2" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.actionRow}>
              <Button variant="ghost" onClick={() => navigate('/catalogue/dashboard')}>
                Cancel
              </Button>
              <Button variant="primary" icon={<Save size={16} />} onClick={handleSave}>
                Save Quality Settings
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
