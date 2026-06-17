import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, MoreVertical, Eye, Search, Filter, ShoppingCart, Hourglass, CheckCircle2, Truck, FileText } from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { DataTable } from '../../components/DataTable/DataTable';
import { getAllPOs } from '../../services/purchaseOrderService';
import type { PurchaseOrderRecord } from '../../services/purchaseOrderService';
import { useAuth } from '../../context/AuthContext';
import styles from './POList.module.css';

export const POList: React.FC = () => {
  const navigate = useNavigate();
  const { hasActionPermission } = useAuth();
  const [poList, setPoList] = useState<PurchaseOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deliveryFilter, setDeliveryFilter] = useState('All');

  useEffect(() => {
    let active = true;
    getAllPOs()
      .then(res => {
        if (active) {
          setPoList(res);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load POs:', err);
        if (active) setLoading(false);
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
          <button className={styles.actionBtn} onClick={() => navigate('/purchase-orders/dashboard')} title="View details"><Eye size={16} /></button>
          <button className={styles.actionBtn} title="More Options"><MoreVertical size={16} /></button>
        </div>
      ) 
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Purchase Orders</h1>
          <p className={styles.breadcrumbs}>Home / Purchase Orders / PO List</p>
        </div>
        {hasActionPermission('CREATE_PO') && (
          <Button icon={<Plus size={16} />} onClick={() => navigate('/purchase-orders/create')}>Create Requisition</Button>
        )}
      </header>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {([
          { tab: 'All',                label: 'Total POs',          icon: <ShoppingCart size={16} />, bg: '#eff6ff', color: '#3b82f6', sub: 'All purchase orders' },
          { tab: 'Pending Approval',   label: 'Pending Approval',   icon: <Hourglass size={16} />,    bg: '#fffbeb', color: '#f59e0b', sub: 'Requires action' },
          { tab: 'Sent to Vendor',     label: 'Sent to Vendor',     icon: <CheckCircle2 size={16} />, bg: '#f3e8ff', color: '#8b5cf6', sub: 'POs sent to suppliers' },
          { tab: 'Partially Received', label: 'Partially Received', icon: <Truck size={16} />,        bg: '#dcfce7', color: '#10b981', sub: 'Partial delivery status' },
          { tab: 'Closed',             label: 'Closed POs',         icon: <FileText size={16} />,     bg: '#ffedd5', color: '#f97316', sub: 'Fully completed & closed' },
        ] as const).map(k => (
          <Card
            key={k.tab}
            className={`${styles.kpiCard} ${activeTab === k.tab ? styles.kpiCardActive : ''}`}
            onClick={() => setActiveTab(k.tab)}
          >
            <div className={styles.kpiIcon} style={{ backgroundColor: k.bg, color: k.color }}>{k.icon}</div>
            <div>
              <div className={styles.kpiLabel}>{k.label}</div>
              <div className={styles.kpiValue}>{tabCounts[k.tab].toLocaleString()}</div>
              <div className={styles.kpiSub}>{k.sub}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <div className={styles.filters}>
            <div className={styles.searchWrap}>
              <Input 
                placeholder="Search PO number, vendor..." 
                fullWidth={false} 
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={16} className={styles.searchIcon} />
            </div>
            
            <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">Status: All</option>
              <option value="Draft">Draft</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Sent">Sent</option>
              <option value="Closed">Closed</option>
              <option value="Canceled">Canceled</option>
            </select>

            <select className={styles.filterSelect} value={deliveryFilter} onChange={(e) => setDeliveryFilter(e.target.value)}>
              <option value="All">Delivery: All</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Received">Received</option>
            </select>
            
            <Button variant="ghost" icon={<Filter size={16} />}>More Filters</Button>
          </div>
          
          <Button variant="outline" icon={<Download size={16} />}>Export</Button>
        </div>

        {loading ? (
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

