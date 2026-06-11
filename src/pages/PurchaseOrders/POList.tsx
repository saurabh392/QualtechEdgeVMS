import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, MoreVertical, Eye, Search, Filter } from 'lucide-react';
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

      <Card className={styles.tableCard}>
        <div className={styles.tabs}>
          <div className={`${styles.tab} ${activeTab === 'All' ? styles.activeTab : ''}`} onClick={() => setActiveTab('All')}>
            All POs ({tabCounts.All})
          </div>
          <div className={`${styles.tab} ${activeTab === 'Pending Approval' ? styles.activeTab : ''}`} onClick={() => setActiveTab('Pending Approval')}>
            Pending Approval ({tabCounts['Pending Approval']})
          </div>
          <div className={`${styles.tab} ${activeTab === 'Sent to Vendor' ? styles.activeTab : ''}`} onClick={() => setActiveTab('Sent to Vendor')}>
            Sent to Vendor ({tabCounts['Sent to Vendor']})
          </div>
          <div className={`${styles.tab} ${activeTab === 'Partially Received' ? styles.activeTab : ''}`} onClick={() => setActiveTab('Partially Received')}>
            Partially Received ({tabCounts['Partially Received']})
          </div>
          <div className={`${styles.tab} ${activeTab === 'Closed' ? styles.activeTab : ''}`} onClick={() => setActiveTab('Closed')}>
            Closed ({tabCounts.Closed})
          </div>
        </div>

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

