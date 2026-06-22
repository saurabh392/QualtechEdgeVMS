import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Hourglass,
  CheckCircle2,
  Truck,
  FileText,
  Plus,
  Download,
  Eye,
  Search,
  Filter,
  X,
  MoreVertical
} from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { DataTable } from '../../components/DataTable/DataTable';
import { getAllPOs } from '../../services/purchaseOrderService';
import type { PurchaseOrderRecord } from '../../services/purchaseOrderService';
import styles from './PODashboard.module.css';

export const PODashboard: React.FC = () => {
  const navigate = useNavigate();
  // PO List States
  const [poList, setPoList] = useState<PurchaseOrderRecord[]>([]);
  const [repoLoading, setRepoLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deliveryFilter, setDeliveryFilter] = useState('All');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let active = true;

    // Fetch POs
    getAllPOs()
      .then(res => {
        if (active) {
          setPoList(res);
          setRepoLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load POs:', err);
        if (active) setRepoLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const tabCounts = {
    All: poList.length,
    'Pending Approval': poList.filter(po => po.status === 'Pending Approval').length,
    'Sent to Vendor': poList.filter(po => po.status === 'Sent').length,
    'Partially Received': poList.filter(po => po.deliveryStatus === 'Partial').length,
    Closed: poList.filter(po => po.status === 'Closed').length
  };

  const filteredPOs = poList.filter(po => {
    // Tab Filter
    if (activeTab === 'Pending Approval' && po.status !== 'Pending Approval') return false;
    if (activeTab === 'Sent to Vendor' && po.status !== 'Sent') return false;
    if (activeTab === 'Partially Received' && po.deliveryStatus !== 'Partial') return false;
    if (activeTab === 'Closed' && po.status !== 'Closed') return false;

    // Status Dropdown Filter
    if (statusFilter !== 'All' && po.status !== statusFilter) return false;

    // Delivery Dropdown Filter
    if (deliveryFilter !== 'All' && po.deliveryStatus !== deliveryFilter) return false;

    // Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchId = po.poId.toLowerCase().includes(q);
      const matchVendor = po.vendorName.toLowerCase().includes(q);
      const matchCategory = po.category.toLowerCase().includes(q);
      return matchId || matchVendor || matchCategory;
    }

    return true;
  });

  const columns = [
    { header: 'PO Number', accessor: 'poId' as keyof PurchaseOrderRecord },
    { header: 'Vendor Name', accessor: 'vendorName' as keyof PurchaseOrderRecord },
    { header: 'Category', accessor: 'category' as keyof PurchaseOrderRecord },
    {
      header: 'PO Value',
      accessor: (row: PurchaseOrderRecord) => `₹${row.poValue.toLocaleString('en-IN')}`
    },
    { header: 'Created Date', accessor: 'createdDate' as keyof PurchaseOrderRecord },
    {
      header: 'Status',
      accessor: (row: PurchaseOrderRecord) => {
        let className = styles.statusBadge;
        if (row.status === 'Approved' || row.status === 'Sent' || row.status === 'Closed') className = styles.statusSuccess;
        if (row.status === 'Pending Approval') className = styles.statusWarning;
        if (row.status === 'Draft') className = styles.statusDraft;
        if (row.status === 'Canceled' || row.status === 'Rejected') className = styles.statusDanger;
        if (row.status === 'Sent Back') className = styles.statusWarning;
        return <span className={className}>{row.status}</span>;
      }
    },
    {
      header: 'Delivery',
      accessor: (row: PurchaseOrderRecord) => {
        let className = styles.statusBadge;
        if (row.deliveryStatus === 'Received') className = styles.statusSuccess;
        if (row.deliveryStatus === 'Partial') className = styles.statusPurple;
        if (row.deliveryStatus === 'Pending') className = styles.statusWarning;
        if (row.deliveryStatus === '-') return '-';
        return <span className={className}>{row.deliveryStatus}</span>;
      }
    },
    {
      header: 'Actions',
      align: 'center' as const,
      accessor: () => (
        <div className={styles.actionsCell}>
          <button className={styles.actionBtn} title="More Options"><MoreVertical size={16} /></button>
        </div>
      )
    },
  ];

  if (repoLoading) {
    return (
      <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>PO Dashboard</h1>
          <p className={styles.subtitle}>Manage requisitions, purchase orders and deliveries</p>
        </div>
        <div className={styles.headerActions}>

          <Button icon={<Plus size={16} />} onClick={() => navigate('/purchase-orders/create')}>Create Requisition</Button>
        </div>
      </header>

      {/* KPI Row */}
      <div className={styles.kpiGrid}>
        {([
          { tab: 'All', label: 'Total POs', icon: <ShoppingCart size={16} />, bg: '#eff6ff', color: '#3b82f6', sub: '+12.5% vs last month', onClick: () => setActiveTab('All') },
          { tab: 'Pending Approval', label: 'Pending Approval', icon: <Hourglass size={16} />, bg: '#fffbeb', color: '#f59e0b', sub: 'Requires action', onClick: () => setActiveTab('Pending Approval') },
          { tab: 'Sent to Vendor', label: 'Sent to Vendor', icon: <CheckCircle2 size={16} />, bg: '#f3e8ff', color: '#8b5cf6', sub: 'POs sent to suppliers', onClick: () => setActiveTab('Sent to Vendor') },
          { tab: 'Partially Received', label: 'Partially Received', icon: <Truck size={16} />, bg: '#dcfce7', color: '#10b981', sub: 'Partial delivery status', onClick: () => setActiveTab('Partially Received') },
          { tab: 'Closed', label: 'Closed POs', icon: <FileText size={16} />, bg: '#ffedd5', color: '#f97316', sub: 'Fully completed & closed', onClick: () => setActiveTab('Closed') },
        ] as const).map(k => (
          <Card key={k.tab} className={`${styles.kpiCard} ${activeTab === k.tab ? styles.kpiCardActive : ''}`} onClick={k.onClick}>
            <div className={styles.kpiIcon} style={{ backgroundColor: k.bg, color: k.color, flexShrink: 0 }}>{k.icon}</div>
            <div>
              <div className={styles.kpiLabel}>{k.label}</div>
              <div className={styles.kpiValue}>{tabCounts[k.tab].toLocaleString()}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', marginTop: 1 }}>{k.sub}</div>
            </div>
          </Card>
        ))}
      </div>



      {/* PO List Embedded Section */}
      <Card className={styles.tableCard} style={{ marginTop: '24px', marginBottom: '24px' }}>
        <div className={styles.tableToolbar}>
          <div className={styles.filters}>
            <div className={styles.searchWrap}>
              <Search size={14} className={styles.searchIcon} />
              <Input
                placeholder="Search PO number, vendor..."
                fullWidth={false}
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {(() => {
              const activeFilterCount = [statusFilter !== 'All', deliveryFilter !== 'All'].filter(Boolean).length;
              return (
                <button className={styles.filterBtn} onClick={() => setFiltersOpen(v => !v)}>
                  <Filter size={14} /> Filters
                  {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
                </button>
              );
            })()}
          </div>
          <Button variant="outline" icon={<Download size={16} />}>Export</Button>
        </div>

        {filtersOpen && (
          <div className={styles.filterPanel}>
            <div className={styles.filterPanelRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Status</label>
                <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Sent">Sent</option>
                  <option value="Closed">Closed</option>
                  <option value="Canceled">Canceled</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Delivery</label>
                <select className={styles.filterSelect} value={deliveryFilter} onChange={(e) => setDeliveryFilter(e.target.value)}>
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Received">Received</option>
                </select>
              </div>
              {[statusFilter !== 'All', deliveryFilter !== 'All'].some(Boolean) && (
                <button
                  className={styles.clearFiltersBtn}
                  onClick={() => { setStatusFilter('All'); setDeliveryFilter('All'); }}
                >
                  <X size={12} /> Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {repoLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
            Loading Purchase Orders Repository...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredPOs}
            keyExtractor={(row) => row.poId}
          />
        )}

        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Showing 1 to {filteredPOs.length} of {filteredPOs.length} entries</span>
          <div className={styles.pageControls}>
            <button className={styles.pageBtnActive}>1</button>
            <button className={styles.pageBtnNext}>&gt;</button>
          </div>
        </div>
      </Card>

    </div>
  );
};
