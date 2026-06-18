import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, UserCheck, Clock, XCircle, Eye, Edit2, Trash2, Loader2, Play, Shield, Filter, X } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'sonner';
import { useVendorFilters } from '../../context/VendorFilterContext';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { DataTable } from '../../components/DataTable/DataTable';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../context/VendorContext';
import styles from './VendorList.module.css';

export const VendorList: React.FC = () => {
  const navigate = useNavigate();
  const { vendors, loading, deleteVendor } = useVendors();
  const { hasActionPermission } = useAuth();

  // Search & Filter state from Context
  const { filters, setFilters, setFilterValue, resetFilters } = useVendorFilters();
  const searchQuery = filters.search;
  const filterCategory = filters.category;
  const filterStatus = filters.status;
  const filterDate = filters.date;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount = [filterCategory !== 'All', filterStatus !== 'All', filterDate !== ''].filter(Boolean).length;

  const handleCardClick = (cardType: 'all' | 'active' | 'pending' | 'rejected') => {
    if (cardType === 'all') {
      resetFilters();
    } else if (cardType === 'active') {
      setFilters({
        selectedCard: 'active',
        status: 'Active',
        category: 'All',
        search: '',
        date: ''
      });
    } else if (cardType === 'pending') {
      setFilters({
        selectedCard: 'pending',
        status: 'Pending Approval',
        category: 'All',
        search: '',
        date: ''
      });
    } else if (cardType === 'rejected') {
      setFilters({
        selectedCard: 'rejected',
        status: 'Rejected',
        category: 'All',
        search: '',
        date: ''
      });
    }
  };

  const handleDelete = async (vendorId: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete vendor record: ${vendorId}?`);
    if (confirmDelete) {
      try {
        await deleteVendor(vendorId);
        toast.success('Vendor record deleted successfully.');
      } catch (err) {
        console.error('Error deleting vendor:', err);
        toast.error('Failed to delete vendor record.');
      }
    }
  };

  // Dynamically compute KPI metrics
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.status === 'Active').length;
  const pendingApproval = vendors.filter(v => v.status === 'Pending Approval').length;
  const rejectedVendors = vendors.filter(v => v.status === 'Rejected').length;

  // Filter vendor list locally
  const filteredVendors = vendors.filter(vendor => {
    // 1. Search Query (name, id, PAN, GSTIN)
    const matchesSearch = 
      (vendor.vendorId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.basicDetails?.legalName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.basicDetails?.panNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.basicDetails?.gstin || '').toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Category Filter
    const matchesCategory = filterCategory === 'All' 
      ? true 
      : vendor.businessDetails?.vendorCategory === filterCategory;

    // 3. Status Filter
    const matchesStatus = filterStatus === 'All'
      ? true
      : vendor.status === filterStatus;

    // 4. Onboarding Date Filter (Created on/after input date)
    let matchesDate = true;
    if (filterDate && vendor.createdAt) {
      const vendorDate = new Date(vendor.createdAt).toISOString().split('T')[0];
      matchesDate = vendorDate >= filterDate;
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  const columns = [
    { 
      header: 'Vendor ID', 
      accessor: (row: any) => <span style={{ fontWeight: '600', color: '#0f172a' }}>{row.vendorId}</span> 
    },
    { 
      header: 'Vendor Name', 
      accessor: (row: any) => row.basicDetails?.legalName || '-' 
    },
    { 
      header: 'PAN', 
      accessor: (row: any) => <code style={{ fontSize: '12px' }}>{row.basicDetails?.panNumber || '-'}</code> 
    },
    { 
      header: 'GSTIN', 
      accessor: (row: any) => <code style={{ fontSize: '12px' }}>{row.basicDetails?.gstin || '-'}</code> 
    },
    { 
      header: 'Category', 
      accessor: (row: any) => row.businessDetails?.vendorCategory || '-' 
    },
    { 
      header: 'Status', 
      accessor: (row: any) => {
        const status = row.status || 'Draft';
        if (status === 'Active') return <span className={styles.statusActive}>{status}</span>;
        if (status === 'Pending Approval') return <span className={styles.statusPending}>{status}</span>;
        if (status === 'Rejected') return <span className={styles.statusRejected}>{status}</span>;
        return <span className={styles.statusPending}>{status}</span>;
      } 
    },
    { 
      header: 'Onboarding Date', 
      accessor: (row: any) => {
        if (!row.createdAt) return '-';
        return new Date(row.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      } 
    },
    { 
      header: 'Actions', 
      align: 'center' as const,
      accessor: (row: any) => (
        <div className={styles.actionsCell}>
          <button 
            className={styles.actionBtn} 
            onClick={() => navigate(`/vendors/add?id=${row.vendorId}&view=true`)} 
            title="View Details"
          >
            <Eye size={16} />
          </button>
          {row.kycStatus === 'Pending Screening' && (
            <button 
              className={styles.actionBtn} 
              onClick={() => navigate(`/kyc/screening?vendor=${row.vendorId}`)} 
              title="Screen Vendor"
              style={{ color: '#f59e0b' }}
            >
              <Play size={16} />
            </button>
          )}
          {row.kycStatus === 'Under Review' && (
            <button 
              className={styles.actionBtn} 
              onClick={() => navigate(`/kyc/reviews`)} 
              title="Review & Decide"
              style={{ color: '#10b981' }}
            >
              <Shield size={16} />
            </button>
          )}
          {hasActionPermission('EDIT_VENDOR') && (
            <button 
              className={styles.actionBtn} 
              onClick={() => navigate(`/vendors/add?id=${row.vendorId}`)} 
              title="Edit Details"
            >
              <Edit2 size={16} />
            </button>
          )}
          {hasActionPermission('DELETE_VENDOR') && (
            <button 
              className={styles.actionBtn} 
              onClick={() => handleDelete(row.vendorId)} 
              title="Delete Record" 
              style={{ color: 'var(--color-danger)' }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ) 
    },
  ];

  if (loading) {
    return (
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Vendor List</h1>
            <p className={styles.breadcrumbs}>Home / Vendor Onboarding & KYC / Vendor List</p>
          </div>
        </header>
        <div className={styles.kpiGrid}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: 96, borderRadius: 12, padding: 16, background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 12, width: '55%', marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 28, width: '35%' }} />
              </div>
              <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0 }} />
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
          <div className="skeleton" style={{ height: 40, marginBottom: 16 }} />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div className="skeleton" style={{ height: 14, flex: 2 }} />
              <div className="skeleton" style={{ height: 14, flex: 3 }} />
              <div className="skeleton" style={{ height: 22, width: 80, borderRadius: 20 }} />
              <div className="skeleton" style={{ height: 14, flex: 1 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Vendor List</h1>
          <p className={styles.breadcrumbs}>Home / Vendor Onboarding & KYC / Vendor List</p>
        </div>
      </header>

      {/* Dynamic KPI Cards */}
      <div className={styles.kpiGrid}>
        <Card 
          className={clsx(styles.kpiCard, filters.selectedCard === 'all' && styles.kpiCardActive)}
          onClick={() => handleCardClick('all')}
          data-card="all"
        >
          <div className={styles.kpiHeader}>
            <div>
              <span className={styles.kpiLabel}>Total Vendors</span>
              <div className={styles.kpiValue}>{totalVendors}</div>
            </div>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
              <Users size={24} />
            </div>
          </div>
        </Card>
 
        <Card 
          className={clsx(styles.kpiCard, filters.selectedCard === 'active' && styles.kpiCardActive)}
          onClick={() => handleCardClick('active')}
          data-card="active"
        >
          <div className={styles.kpiHeader}>
            <div>
              <span className={styles.kpiLabel}>Active Vendors</span>
              <div className={styles.kpiValue} style={{ color: '#16a34a' }}>{activeVendors}</div>
            </div>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
              <UserCheck size={24} />
            </div>
          </div>
        </Card>
 
        <Card 
          className={clsx(styles.kpiCard, filters.selectedCard === 'pending' && styles.kpiCardActive)}
          onClick={() => handleCardClick('pending')}
          data-card="pending"
        >
          <div className={styles.kpiHeader}>
            <div>
              <span className={styles.kpiLabel}>Pending Approval</span>
              <div className={styles.kpiValue} style={{ color: '#f59e0b' }}>{pendingApproval}</div>
            </div>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
              <Clock size={24} />
            </div>
          </div>
        </Card>
 
        <Card 
          className={clsx(styles.kpiCard, filters.selectedCard === 'rejected' && styles.kpiCardActive)}
          onClick={() => handleCardClick('rejected')}
          data-card="rejected"
        >
          <div className={styles.kpiHeader}>
            <div>
              <span className={styles.kpiLabel}>Rejected Vendors</span>
              <div className={styles.kpiValue} style={{ color: '#dc2626' }}>{rejectedVendors}</div>
            </div>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
              <XCircle size={24} />
            </div>
          </div>
        </Card>
      </div>

      <Card className={styles.tableCard}>
        {/* Table Toolbar Search & Filters */}
        <div className={styles.tableToolbar}>
          <div className={styles.searchWrap}>
            <Input
              placeholder="Search vendor name, ID, PAN, GSTIN..."
              fullWidth={false}
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setFilterValue('search', e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className={styles.filterBtn} onClick={() => setFiltersOpen(v => !v)}>
              <Filter size={14} /> Filters
              {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
            </button>
            {hasActionPermission('CREATE_VENDOR') && (
              <Button onClick={() => navigate('/vendors/add')} icon={<Plus size={16} />}>
                Register Vendor
              </Button>
            )}
          </div>
        </div>

        {filtersOpen && (
          <div className={styles.filterPanel}>
            <div className={styles.filterPanelRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Category</label>
                <select className={styles.filterSelect} value={filterCategory} onChange={(e) => setFilterValue('category', e.target.value)}>
                  <option value="All">All Categories</option>
                  <option value="IT Services">IT Services</option>
                  <option value="Facilities">Facilities</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Status</label>
                <select className={styles.filterSelect} value={filterStatus} onChange={(e) => setFilterValue('status', e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Pending Amendment">Pending Amendment</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Registered On/After</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterValue('date', e.target.value)}
                  className={styles.filterSelect}
                />
              </div>
              {activeFilterCount > 0 && (
                <button className={styles.clearFiltersBtn} onClick={resetFilters}>
                  <X size={12} /> Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '64px' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
            <span style={{ marginLeft: '12px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>Loading vendors...</span>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredVendors} 
            keyExtractor={(row) => row.vendorId} 
          />
        )}
        
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Showing 1 to {filteredVendors.length} of {filteredVendors.length} entries</span>
          <div className={styles.pageControls}>
            <button className={styles.pageBtnActive}>1</button>
            <button className={styles.pageBtnNext}>&gt;</button>
          </div>
        </div>
      </Card>
    </div>
  );
};
