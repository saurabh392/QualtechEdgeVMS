import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package,
  TrendingUp,
  Users,
  Layers,
  CheckSquare,
  Plus,
  TrendingDown,
  Search,
  Filter,
  X,
  LayoutGrid,
  List
} from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { CatalogueHeader } from './CatalogueHeader';
import styles from './CatalogueDashboard.module.css';
import { 
  getAllItems, 
  getItemDashboardStats
} from '../../services/itemMasterService';
import type { 
  CatalogueItem
} from '../../services/itemMasterService';

export const CatalogueDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);
  const [isGrid, setIsGrid] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [itemsList] = await Promise.all([
        getAllItems(),
        getItemDashboardStats()
      ]);
      setItems(itemsList);
    } catch (err) {
      console.error('Error fetching catalogue dashboard details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate dynamic counts from items array
  const totalItemsCount = items.filter(item => !((item as any).isService || item.category === 'Professional Services' || item.category === 'Logistics')).length;
  const totalServicesCount = items.filter(item => (item as any).isService || item.category === 'Professional Services' || item.category === 'Logistics').length;
  const activeVendorsCount = new Set(items.map(item => item.preferredVendor?.vendorName).filter(name => name && name !== 'N/A')).size;
  const pendingApprovalsCount = items.filter(item => item.status === 'Pending Approval').length;
  const publishedCount = items.filter(item => item.status === 'Published').length;
  const draftCount = items.filter(item => item.status === 'Draft' || !item.status).length;

  const kpis = [
    { name: 'Total Items', val: totalItemsCount.toLocaleString('en-IN'), icon: Package, color: '#1D4ED8', bg: '#EAF2FF', trend: '+12.5%', isUp: true },
    { name: 'Total Services', val: totalServicesCount.toLocaleString('en-IN'), icon: Layers, color: '#7C3AED', bg: '#F3E8FF', trend: '+5.2%', isUp: true },
    { name: 'Active Sourced Vendors', val: activeVendorsCount.toString(), icon: Users, color: '#16A34A', bg: '#DCFCE7', trend: '+8.4%', isUp: true },
    { name: 'Pending Approvals', val: pendingApprovalsCount.toString(), icon: CheckSquare, color: '#F59E0B', bg: '#FEF3C7', trend: '-2.1%', isUp: false }
  ];

  const filteredItems = items.filter(item => {
    const isService = (item as any).isService || item.category === 'Professional Services' || item.category === 'Logistics';

    const matchesSearch = 
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.itemId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hsnCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.preferredVendor?.vendorName?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    
    let matchesKpi = true;
    if (kpiFilter === 'Total Items') {
      matchesKpi = !isService;
    } else if (kpiFilter === 'Total Services') {
      matchesKpi = isService;
    } else if (kpiFilter === 'Active Sourced Vendors') {
      matchesKpi = !!(item.preferredVendor?.vendorName && item.preferredVendor.vendorName !== 'N/A');
    } else if (kpiFilter === 'Pending Approvals') {
      matchesKpi = item.status === 'Pending Approval';
    } else if (kpiFilter === 'Published Catalogue') {
      matchesKpi = item.status === 'Published';
    } else if (kpiFilter === 'Draft Catalogue') {
      matchesKpi = item.status === 'Draft' || !item.status;
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesKpi;
  });

  return (
    <div className={styles.container}>
      <CatalogueHeader 
        title="ITEM & SERVICE CATALOGUE" 
        subtitle="End-to-End Procurement Catalogue Lifecycle Sourcing & Sizing Dashboard"
        actions={
          <Button icon={<Plus size={16} />} onClick={() => navigate('/catalogue/items')}>Add Item</Button>
        }
      />

      {/* KPI Cards Grid */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi, idx) => {
          const IconComponent = kpi.icon;
          const isActive = kpiFilter === kpi.name;
          return (
            <Card 
              key={idx} 
              className={`${styles.kpiCard} ${isActive ? styles.kpiCardActive : ''}`}
              onClick={() => setKpiFilter(kpiFilter === kpi.name ? null : kpi.name)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>{kpi.name}</span>
                <div className={styles.kpiIconWrapper} style={{ backgroundColor: kpi.bg, color: kpi.color }}>
                  <IconComponent size={18} />
                </div>
              </div>
              <div className={styles.kpiValue}>{kpi.val}</div>
              <div className={styles.kpiFooter}>
                <div>
                  <span className={kpi.isUp ? styles.trendUp : styles.trendDown}>
                    {kpi.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {kpi.trend}
                  </span>
                  <span style={{ marginLeft: '4px' }}>vs last month</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>



      {/* Catalogue Items List Section */}
      <Card className={styles.recentTableCard}>
        <div className={styles.tableFilters}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexGrow: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0b1f5f', whiteSpace: 'nowrap' }}>Item & Service Master View</h3>
            <div className={styles.searchBar} style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search items, services, codes, or vendors..."
                className={styles.selectInput}
                style={{ width: '100%', paddingLeft: '32px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-text-secondary)' }} />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {(() => {
              const activeFilterCount = [categoryFilter !== 'All', statusFilter !== 'All'].filter(Boolean).length;
              return (
                <button className={styles.filterBtn} onClick={() => setFiltersOpen(v => !v)}>
                  <Filter size={14} /> Filters
                  {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
                </button>
              );
            })()}
            <Button variant="outline" size="sm" onClick={() => setIsGrid(!isGrid)} icon={isGrid ? <List size={16} /> : <LayoutGrid size={16} />}>
              {isGrid ? "List View" : "Grid View"}
            </Button>
          </div>
        </div>

        {filtersOpen && (
          <div className={styles.filterPanel}>
            <div className={styles.filterPanelRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Category</label>
                <select className={styles.filterSelect} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="All">All Categories</option>
                  <option value="IT Hardware">IT Hardware</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Facility Management">Facility Management</option>
                  <option value="Professional Services">Professional Services</option>
                  <option value="Logistics">Logistics</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Status</label>
                <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Published">Published</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              {[categoryFilter !== 'All', statusFilter !== 'All'].some(Boolean) && (
                <button className={styles.clearFiltersBtn} onClick={() => { setCategoryFilter('All'); setStatusFilter('All'); setKpiFilter(null); }}>
                  <X size={12} /> Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Master Data Grid or Table */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading Catalogue Master Database...
          </div>
        ) : (
          !isGrid ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#0b1f5f' }}>Code</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#0b1f5f' }}>Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#0b1f5f' }}>Type</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#0b1f5f' }}>Category</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#0b1f5f' }}>Preferred Vendor</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#0b1f5f' }}>Ref Rate</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#0b1f5f' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                        No items or services found in the catalogue. Click "Add Item" to add new entries.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map(item => {
                      const isService = (item as any).isService || item.category === 'Professional Services' || item.category === 'Logistics';
                      return (
                        <tr key={item.itemId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: '500', color: 'var(--color-primary)' }}>{item.itemId || item.itemCode}</td>
                          <td style={{ padding: '12px 16px', fontWeight: '500' }}>{item.itemName}</td>
                          <td style={{ padding: '12px 16px' }}>{isService ? 'Service' : 'Item'}</td>
                          <td style={{ padding: '12px 16px' }}>{item.category}</td>
                          <td style={{ padding: '12px 16px' }}>{item.preferredVendor?.vendorName || 'N/A'}</td>
                          <td style={{ padding: '12px 16px', fontWeight: '600' }}>{(item as any).rate || '₹' + (item.minimumOrderQuantity * 1500).toLocaleString('en-IN')}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className={item.status === 'Published' ? styles.badgeSuccess : item.status === 'Draft' ? styles.badgeWarning : styles.badgeDanger}>
                              {item.status || 'Draft'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {filteredItems.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                  No items or services found in the catalogue. Click "Add Item" to add new entries.
                </div>
              ) : (
                filteredItems.map(item => {
                  const isService = (item as any).isService || item.category === 'Professional Services' || item.category === 'Logistics';
                  return (
                    <div key={item.itemId} style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'var(--color-surface)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{item.itemId || item.itemCode}</span>
                        <span className={item.status === 'Published' ? styles.badgeSuccess : item.status === 'Draft' ? styles.badgeWarning : styles.badgeDanger}>
                          {item.status || 'Draft'}
                        </span>
                      </div>
                      <h4 style={{ fontWeight: '600', color: '#0b1f5f' }}>{item.itemName}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{isService ? 'Service' : 'Item'} • {item.category}</p>
                      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '12px' }}>
                          <div style={{ color: 'var(--color-text-secondary)' }}>Vendor</div>
                          <div style={{ fontWeight: '500' }}>{item.preferredVendor?.vendorName || 'N/A'}</div>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0b1f5f' }}>{(item as any).rate || '₹' + (item.minimumOrderQuantity * 1500).toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )
        )}
      </Card>
    </div>
  );
};
