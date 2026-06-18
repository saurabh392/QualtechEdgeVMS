import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  FileText,
  Clock,
  AlertCircle,
  UploadCloud,
  FileSignature,
  Plus,
  Download,
  Eye,
  Search,
  Filter,
  X,
  ShieldAlert
} from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { Input } from '../../components/Input/Input';
import { DataTable } from '../../components/DataTable/DataTable';
import { getAllContracts } from '../../services/contractService';
import type { ContractRecord } from '../../services/contractService';
import styles from './ContractsDashboard.module.css';

export const ContractsDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Repository & KPI Filters States
  const [activeTab, setActiveTab] = useState('All');
  const [searchVal, setSearchVal] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Core Data State
  const [allContracts, setAllContracts] = useState<ContractRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<ContractRecord | null>(null);

  useEffect(() => {
    async function loadContracts() {
      try {
        setLoading(true);
        const data = await getAllContracts();
        setAllContracts(data);
      } catch (err) {
        console.error('Failed to fetch contracts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadContracts();
  }, []);

  const handleDownload = (row: ContractRecord) => {
    if (row.uploadedDocuments && row.uploadedDocuments.length > 0) {
      const doc = row.uploadedDocuments[0];
      const link = document.createElement('a');
      link.href = doc.filePath;
      link.setAttribute('download', doc.fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.info(`No PDF linked to Contract ${row.contractId}. Upload one by editing the contract.`);
    }
  };

  const columns = [
    { header: 'Contract ID', accessor: 'contractId' as keyof ContractRecord },
    {
      header: 'Vendor Name',
      accessor: (row: ContractRecord) => row.vendor?.vendorName || 'N/A'
    },
    { header: 'Type', accessor: 'contractType' as keyof ContractRecord },
    {
      header: 'Value',
      accessor: (row: ContractRecord) => {
        const val = row.commercialTerms?.contractValue;
        if (!val) return '₹0';
        if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
        if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
        return `₹${val.toLocaleString()}`;
      }
    },
    { header: 'Effective', accessor: 'effectiveDate' as keyof ContractRecord },
    { header: 'Expiry', accessor: 'expiryDate' as keyof ContractRecord },
    {
      header: 'Risk',
      accessor: (row: ContractRecord) => {
        const risk = row.riskInsights?.portfolioRisk || 'Low';
        let variant: 'success' | 'warning' | 'danger' = 'success';
        if (risk === 'Medium') variant = 'warning';
        if (risk === 'High') variant = 'danger';
        return <Badge variant={variant}>{risk}</Badge>;
      }
    },
    {
      header: 'Status',
      accessor: (row: ContractRecord) => {
        let className = styles.statusBadge;
        const status = row.status || 'Draft';
        if (status === 'Active') className = styles.statusActive;
        if (status === 'In Review') className = styles.statusReview;
        if (status === 'Draft') className = styles.statusDraft;
        if (status === 'Expired') className = styles.statusExpired;
        return <span className={className}>{status}</span>;
      }
    },
    {
      header: 'Actions',
      align: 'center' as const,
      accessor: (row: ContractRecord) => (
        <div className={styles.actionsCell}>
          <button className={styles.actionBtn} title="View Details" onClick={() => setSelectedContract(row)}><Eye size={16} /></button>
          <button className={styles.actionBtn} title="Download Document" onClick={() => handleDownload(row)}><Download size={16} /></button>
        </div>
      )
    },
  ];

  // Dynamic KPI Calculations
  const activeCount = allContracts.filter(c => c.status === 'Active').length;

  const expiringSoonCount = allContracts.filter(c => {
    if (c.status !== 'Active') return false;
    if (!c.expiryDate) return false;
    const exp = new Date(c.expiryDate);
    const diffTime = exp.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  }).length;

  const pendingReviewCount = allContracts.filter(c => c.status === 'In Review').length;

  const highRiskCount = allContracts.filter(c => c.riskInsights?.portfolioRisk === 'High').length;

  // Client-Side Combined Filtering
  const filteredContracts = allContracts.filter(c => {
    // 1. Tab Status Filter
    if (activeTab !== 'All') {
      const targetStatus = activeTab === 'Under Review' ? 'In Review' : activeTab;
      if (c.status?.toLowerCase() !== targetStatus.toLowerCase()) return false;
    }

    // 2. Type Filter
    if (typeFilter !== 'All' && typeFilter !== 'Contract Type: All') {
      if (c.contractType?.toLowerCase() !== typeFilter.toLowerCase()) return false;
    }

    // 3. Risk Filter
    if (riskFilter !== 'All' && riskFilter !== 'Risk Level: All') {
      if (c.riskInsights?.portfolioRisk?.toLowerCase() !== riskFilter.toLowerCase()) return false;
    }

    // 4. Search Query Filter
    if (searchVal) {
      const q = searchVal.toLowerCase();
      const matchesSearch =
        c.contractId?.toLowerCase().includes(q) ||
        c.vendor?.vendorName?.toLowerCase().includes(q) ||
        c.contractType?.toLowerCase().includes(q) ||
        c.contractName?.toLowerCase().includes(q) ||
        c.department?.toLowerCase().includes(q) ||
        c.riskInsights?.portfolioRisk?.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // 5. KPI Filter
    if (kpiFilter === 'Total Active Contracts') {
      if (c.status !== 'Active') return false;
    } else if (kpiFilter === 'Expiring Soon (30d)') {
      if (c.status !== 'Active') return false;
      if (!c.expiryDate) return false;
      const exp = new Date(c.expiryDate);
      const diffTime = exp.getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (!(diffDays > 0 && diffDays <= 30)) return false;
    } else if (kpiFilter === 'Pending Legal Reviews') {
      if (c.status !== 'In Review') return false;
    } else if (kpiFilter === 'High Risk Contracts') {
      if (c.riskInsights?.portfolioRisk !== 'High') return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        Loading dashboard metrics...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Contracts Dashboard</h1>
          <p className={styles.breadcrumbs}>Home / Contracts / Dashboard</p>
        </div>
        <div className={styles.headerActions}>
          <Button icon={<Plus size={16} />} onClick={() => navigate('/contracts/create')}>Create Contract</Button>
        </div>
      </header>

      {/* KPI Row */}
      <div className={styles.kpiGrid}>
        {([
          { key: 'Total Active Contracts', label: 'Total Active', icon: <FileText size={16} />, bg: '#e0f2fe', color: '#0284c7', value: activeCount, sub: '+5.2% vs last quarter' },
          { key: 'Expiring Soon (30d)', label: 'Expiring Soon', icon: <Clock size={16} />, bg: '#fef3c7', color: '#d97706', value: expiringSoonCount, sub: 'Requires renewal action' },
          { key: 'Pending Legal Reviews', label: 'Pending Reviews', icon: <FileSignature size={16} />, bg: '#f3e8ff', color: '#7e22ce', value: pendingReviewCount, sub: 'Avg TAT: 3.2 Days' },
          { key: 'High Risk Contracts', label: 'High Risk', icon: <AlertCircle size={16} />, bg: '#fee2e2', color: '#b91c1c', value: highRiskCount, sub: 'Requires mitigation action' },
        ] as const).map(k => (
          <Card key={k.key} className={`${styles.kpiCard} ${kpiFilter === k.key ? styles.kpiCardActive : ''}`} onClick={() => setKpiFilter(kpiFilter === k.key ? null : k.key)}>
            <div className={styles.kpiIcon} style={{ backgroundColor: k.bg, color: k.color, flexShrink: 0 }}>{k.icon}</div>
            <div>
              <div className={styles.kpiLabel}>{k.label}</div>
              <div className={styles.kpiValue} style={{ color: k.color }}>{k.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', marginTop: 1 }}>{k.sub}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Contract Repository Embedded Section */}
      <Card className={styles.tableCard}>
        <div className={styles.pillTabs}>
          {([
            { key: 'All', label: 'All Contracts' },
            { key: 'Active', label: 'Active' },
            { key: 'Under Review', label: 'In Review' },
            { key: 'Draft', label: 'Drafts' },
            { key: 'Expired', label: 'Expired' },
          ] as const).map(t => (
            <button key={t.key} className={`${styles.pillTab} ${activeTab === t.key ? styles.pillTabActive : ''}`} onClick={() => { setActiveTab(t.key); setKpiFilter(null); }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.tableToolbar}>
          <div className={styles.filters}>
            <div className={styles.searchWrap}>
              <Input
                placeholder="Search contract ID, vendor..."
                fullWidth={false}
                className={styles.searchInput}
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
              />
              <Search size={16} className={styles.searchIcon} />
            </div>
            <button className={styles.filterBtn} onClick={() => setFiltersOpen(v => !v)}>
              <Filter size={14} />
              Filters
              {(typeFilter !== 'All' || riskFilter !== 'All' || kpiFilter) && (
                <span className={styles.filterBadge}>{[typeFilter !== 'All', riskFilter !== 'All', !!kpiFilter].filter(Boolean).length}</span>
              )}
            </button>
          </div>
        </div>

        {filtersOpen && (
          <div className={styles.filterPanel}>
            <div className={styles.filterPanelRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Contract Type</label>
                <select className={styles.filterSelect} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="All">All Types</option>
                  <option value="Master Service Agreement">Master Service Agreement</option>
                  <option value="Vendor Agreement">Vendor Agreement</option>
                  <option value="Non-Disclosure Agreement">Non-Disclosure Agreement</option>
                  <option value="SaaS Agreement">SaaS Agreement</option>
                  <option value="Retainer">Retainer</option>
                  <option value="Facility Lease">Facility Lease</option>
                  <option value="SLA Agreement">SLA Agreement</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Risk Level</label>
                <select className={styles.filterSelect} value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
                  <option value="All">All Risk Levels</option>
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>
              {(typeFilter !== 'All' || riskFilter !== 'All' || kpiFilter) && (
                <button className={styles.clearFiltersBtn} onClick={() => { setTypeFilter('All'); setRiskFilter('All'); setKpiFilter(null); }}>
                  <X size={13} /> Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        <DataTable
          columns={columns}
          data={filteredContracts}
          keyExtractor={(row) => row.contractId || ''}
        />
      </Card>

      {/* Contract Detail Summary Modal */}
      {selectedContract && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '650px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden'
          }}>
            <header style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Contract Summary</h3>
              <button
                onClick={() => setSelectedContract(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </header>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Contract ID</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedContract.contractId}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Status</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedContract.status}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Vendor Name</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedContract.vendor?.vendorName}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Contract Type</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedContract.contractType}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Effective Date</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedContract.effectiveDate}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Expiry Date</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedContract.expiryDate}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Contract Value</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>
                    {selectedContract.commercialTerms?.currency} {selectedContract.commercialTerms?.contractValue?.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Payment Terms</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedContract.commercialTerms?.paymentTerms}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>SLA Parameters</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Uptime SLA</span>
                    <span style={{ fontWeight: 500, fontSize: '13px' }}>{selectedContract.slaAndLegal?.slaMetrics?.uptime || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Response SLA</span>
                    <span style={{ fontWeight: 500, fontSize: '13px' }}>{selectedContract.slaAndLegal?.slaMetrics?.responseTime || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Resolution SLA</span>
                    <span style={{ fontWeight: 500, fontSize: '13px' }}>{selectedContract.slaAndLegal?.slaMetrics?.resolutionTime || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {selectedContract.riskInsights && (
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', padding: '12px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldAlert size={14} /> AI Risk Assessment ({selectedContract.riskInsights.portfolioRisk} Risk)
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#7f1d1d', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {selectedContract.riskInsights.aiAlerts && selectedContract.riskInsights.aiAlerts.length > 0 ? (
                      selectedContract.riskInsights.aiAlerts.map((alert, idx) => (
                        <li key={idx}>{alert}</li>
                      ))
                    ) : (
                      <li>No warnings detected by AI Engine.</li>
                    )}
                  </ul>
                </div>
              )}

              {selectedContract.uploadedDocuments && selectedContract.uploadedDocuments.length > 0 && (
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>Documents</h4>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <FileText size={16} color="#64748b" />
                      <span>{selectedContract.uploadedDocuments[0].fileName}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(selectedContract)}>Download</Button>
                  </div>
                </div>
              )}
            </div>

            <footer style={{
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              backgroundColor: '#f8fafc'
            }}>
              <Button variant="ghost" onClick={() => setSelectedContract(null)}>Close</Button>
              {selectedContract.status === 'Active' && (
                <Button onClick={() => handleDownload(selectedContract)}>Download PDF Contract</Button>
              )}
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
