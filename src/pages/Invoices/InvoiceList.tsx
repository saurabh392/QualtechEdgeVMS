import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Eye, MoreVertical, Search, Filter, X } from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { DataTable } from '../../components/DataTable/DataTable';
import styles from './InvoiceList.module.css';

// Mock Data for Invoices List
const invoiceData = [
  { id: 'INV-2026-9908', vendor: 'ABC Infotech Pvt Ltd', poRef: 'PO-2026-000789', value: '₹14,75,000', status: 'Approved', due: '12 Jun 2026', risk: 'Low (12%)', date: '12 May 2026' },
  { id: 'INV-2026-9907', vendor: 'Secure Facilities Ltd', poRef: 'PO-2026-000788', value: '₹5,31,000', status: 'Pending Match', due: '10 Jun 2026', risk: 'Medium (45%)', date: '10 May 2026' },
  { id: 'INV-2026-9906', vendor: 'Global Security', poRef: 'PO-2026-000787', value: '₹10,32,500', status: 'Paid', due: 'Paid', risk: 'Low (8%)', date: '09 May 2026' },
  { id: 'INV-2026-9905', vendor: 'Fincons Consulting', poRef: 'PO-2026-000786', value: '₹25,96,000', status: 'Draft', due: '08 Jun 2026', risk: 'Low (10%)', date: '08 May 2026' },
  { id: 'INV-2026-9904', vendor: 'Tech Solutions', poRef: 'PO-2026-000785', value: '₹4,01,200', status: 'Exception', due: '01 Jun 2026', risk: 'High (78%)', date: '01 May 2026' },
  { id: 'INV-2026-9903', vendor: 'Data Soft', poRef: 'PO-2026-000784', value: '₹1,41,600', status: 'Rejected', due: 'Canceled', risk: 'High (82%)', date: '28 Apr 2026' },
];

export const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterVendor, setFilterVendor] = useState('');

  const activeFilterCount = [filterDateFrom, filterDateTo, filterVendor].filter(Boolean).length;
  const clearFilters = () => { setFilterDateFrom(''); setFilterDateTo(''); setFilterVendor(''); };

  const filteredData = invoiceData.filter(row => {
    const q = search.toLowerCase();
    if (q && !row.id.toLowerCase().includes(q) && !row.vendor.toLowerCase().includes(q) && !row.poRef.toLowerCase().includes(q)) return false;
    if (filterStatus && row.status !== filterStatus) return false;
    if (filterRisk === 'Low' && !row.risk.includes('Low')) return false;
    if (filterRisk === 'Medium' && !row.risk.includes('Medium')) return false;
    if (filterRisk === 'High' && !row.risk.includes('High')) return false;
    if (filterVendor && !row.vendor.toLowerCase().includes(filterVendor.toLowerCase())) return false;
    if (filterDateFrom && row.date < filterDateFrom) return false;
    if (filterDateTo   && row.date > filterDateTo)   return false;
    return true;
  });

  const columns = [
    { header: 'Invoice Number', accessor: 'id' as keyof typeof invoiceData[0] },
    { header: 'Vendor Name', accessor: 'vendor' as keyof typeof invoiceData[0] },
    { header: 'PO Ref', accessor: 'poRef' as keyof typeof invoiceData[0] },
    { header: 'Grand Total', accessor: 'value' as keyof typeof invoiceData[0] },
    { header: 'Created Date', accessor: 'date' as keyof typeof invoiceData[0] },
    { header: 'Due Date', accessor: 'due' as keyof typeof invoiceData[0] },
    { 
      header: 'Risk Score', 
      accessor: (row: any) => {
        let style = { color: '#16a34a', fontWeight: '600' };
        if (row.risk.includes('High')) style = { color: '#dc2626', fontWeight: '600' };
        if (row.risk.includes('Medium')) style = { color: '#d97706', fontWeight: '600' };
        return <span style={style}>{row.risk}</span>;
      } 
    },
    { 
      header: 'Status', 
      accessor: (row: any) => {
        let className = styles.statusBadge;
        if (row.status === 'Approved' || row.status === 'Paid') className = styles.statusSuccess;
        if (row.status === 'Pending Match') className = styles.statusWarning;
        if (row.status === 'Draft') className = styles.statusDraft;
        if (row.status === 'Rejected') className = styles.statusDanger;
        if (row.status === 'Exception') className = styles.statusPurple;
        return <span className={className}>{row.status}</span>;
      } 
    },
    { 
      header: 'Actions', 
      align: 'center' as const,
      accessor: () => (
        <div className={styles.actionsCell}>
          <button className={styles.actionBtn} onClick={() => navigate('/invoices/approvals')}><Eye size={16} /></button>
          <button className={styles.actionBtn}><MoreVertical size={16} /></button>
        </div>
      ) 
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Invoice Repository</h1>
          <p className={styles.breadcrumbs}>Home / Invoices / Invoice List</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => navigate('/invoices/upload')}>Upload Invoice</Button>
      </header>

      <Card className={styles.tableCard}>
        <div className={styles.tabs}>
          <div className={`${styles.tab} ${styles.activeTab}`}>All Invoices (1,092)</div>
          <div className={styles.tab}>Pending Match (184)</div>
          <div className={styles.tab}>Exceptions (38)</div>
          <div className={styles.tab}>Approved (245)</div>
          <div className={styles.tab}>Paid (488)</div>
        </div>

        <div className={styles.tableToolbar}>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input type="text" placeholder="Search invoice number, vendor, PO ref..." className={styles.searchInput} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className={styles.filterBtn} onClick={() => setShowFilters(f => !f)}>
              <Filter size={14} /> Filters
              {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
            </button>
            <Button variant="outline" size="sm" icon={<Download size={14} />}>Export</Button>
          </div>
        </div>

        {showFilters && (
          <div className={styles.filterPanel}>
            <div className={styles.filterPanelRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Status</label>
                <select className={styles.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">All Statuses</option>
                  {['Draft', 'Pending Match', 'Approved', 'Paid', 'Exception', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Risk Level</label>
                <select className={styles.filterSelect} value={filterRisk} onChange={e => setFilterRisk(e.target.value)}>
                  <option value="">All Risks</option>
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Vendor Name</label>
                <input type="text" className={styles.filterSelect} placeholder="Filter by vendor..." value={filterVendor} onChange={e => setFilterVendor(e.target.value)} />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Date From</label>
                <input type="date" className={styles.filterSelect} value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Date To</label>
                <input type="date" className={styles.filterSelect} value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
              </div>
              {activeFilterCount > 0 && <button className={styles.clearFiltersBtn} onClick={clearFilters}><X size={12} /> Clear Filters</button>}
            </div>
          </div>
        )}

        <DataTable
          columns={columns}
          data={filteredData}
          keyExtractor={(row) => row.id}
        />
        
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Showing 1 to {filteredData.length} of {invoiceData.length} entries</span>
          <div className={styles.pageControls}>
            <button className={styles.pageBtnActive}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <span>...</span>
            <button className={styles.pageBtn}>182</button>
            <button className={styles.pageBtnNext}>&gt;</button>
          </div>
        </div>
      </Card>
    </div>
  );
};
