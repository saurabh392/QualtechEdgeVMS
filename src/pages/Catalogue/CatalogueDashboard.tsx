import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  TrendingUp, 
  Users, 
  Layers, 
  CheckSquare, 
  AlertTriangle, 
  ShieldAlert, 
  Percent, 
  FileSignature, 
  RefreshCw, 
  Plus, 
  FileUp, 
  Link, 
  Hash, 
  BadgeIndianRupee, 
  BrainCircuit, 
  ArrowRight,
  TrendingDown,
  Search,
  LayoutGrid,
  List
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line 
} from 'recharts';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { CatalogueHeader } from './CatalogueHeader';
import styles from './CatalogueDashboard.module.css';
import { 
  getAllItems, 
  getItemDashboardStats
} from '../../services/itemMasterService';
import type { 
  CatalogueItem, 
  DashboardStats 
} from '../../services/itemMasterService';

const COLORS = ['#1D4ED8', '#16A34A', '#F59E0B', '#7C3AED', '#DC2626'];

const categorySpend = [
  { name: 'IT Hardware', value: 3400000, percentage: 35 },
  { name: 'Office Supplies', value: 1200000, percentage: 12 },
  { name: 'Facility Management', value: 2100000, percentage: 22 },
  { name: 'Professional Services', value: 1800000, percentage: 18 },
  { name: 'Logistics', value: 1300000, percentage: 13 },
];

const vendorUsage = [
  { name: 'ABC Infotech', items: 120, rate: 94 },
  { name: 'Secure Facilities', items: 85, rate: 88 },
  { name: 'Tech Solutions', items: 154, rate: 97 },
  { name: 'Global Logistics', items: 64, rate: 82 },
  { name: 'Office Supplies Co', items: 210, rate: 90 },
];

const demandForecast = [
  { month: 'Jan', actual: 420, forecasted: 410 },
  { month: 'Feb', actual: 480, forecasted: 460 },
  { month: 'Mar', actual: 510, forecasted: 500 },
  { month: 'Apr', actual: 580, forecasted: 560 },
  { month: 'May', actual: 640, forecasted: 620 },
  { month: 'Jun', actual: null, forecasted: 700 },
  { month: 'Jul', actual: null, forecasted: 740 },
];

export const CatalogueDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isGrid, setIsGrid] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [itemsList, dashboardStats] = await Promise.all([
        getAllItems(),
        getItemDashboardStats()
      ]);
      setItems(itemsList);
      setStats(dashboardStats);
    } catch (err) {
      console.error('Error fetching catalogue dashboard details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const kpis = [
    { name: 'Total Items', val: stats ? stats.totalItems.toLocaleString('en-IN') : '8,420', icon: Package, color: '#1D4ED8', bg: '#EAF2FF', trend: '+12.5%', isUp: true, ai: 'AI: 24 new recommended items' },
    { name: 'Total Services', val: stats ? stats.totalServices.toLocaleString('en-IN') : '1,248', icon: Layers, color: '#7C3AED', bg: '#F3E8FF', trend: '+5.2%', isUp: true, ai: 'AI: 12 obsolete codes' },
    { name: 'Active Sourced Vendors', val: stats ? stats.activeVendors.toString() : '103', icon: Users, color: '#16A34A', bg: '#DCFCE7', trend: '+8.4%', isUp: true, ai: 'AI: 3 vendors near capacity' },
    { name: 'Pending Approvals', val: stats ? stats.pendingApprovals.toString() : '14', icon: CheckSquare, color: '#F59E0B', bg: '#FEF3C7', trend: '-2.1%', isUp: false, ai: 'AI: SLA warning on 3 items' },
    { name: 'Critical Categories', val: stats ? stats.criticalCategories.toString() : '4', icon: ShieldAlert, color: '#DC2626', bg: '#FEE2E2', trend: 'Stable', isUp: true, ai: 'AI: Sourcing gap in Facility' },
    { name: 'Rate Revisions Due', val: stats ? stats.rateRevisionsDue.toString() : '8', icon: BadgeIndianRupee, color: '#0B1F5F', bg: '#E0E7FF', trend: '+3', isUp: true, ai: 'AI: Savings potential: ₹24L' },
    { name: 'Catalogue Utilization', val: stats ? stats.catalogueUtilization.toString() + '%' : '87.5%', icon: Percent, color: '#16A34A', bg: '#DCFCE7', trend: '+1.2%', isUp: true, ai: 'AI: Contract coverage high' },
    { name: 'Contract Linked Items', val: '6,840', icon: FileSignature, color: '#1D4ED8', bg: '#EAF2FF', trend: '+15.4%', isUp: true, ai: 'AI: Leakage warning on unlinked' },
    { name: 'AI Risk Alerts', val: '3', icon: AlertTriangle, color: '#DC2626', bg: '#FEE2E2', trend: '-50%', isUp: false, ai: 'AI: Duplicate items in Supplies' },
    { name: 'Duplicate Catalogue Alerts', val: '2', icon: BrainCircuit, color: '#7C3AED', bg: '#F3E8FF', trend: '-10%', isUp: false, ai: 'AI: Resolve duplicate tags' }
  ];

  const handleDuplicateDetection = () => {
    alert("Running AI Duplicate Catalogue Scan...\nFound 2 potential duplicates in 'Office Supplies' & 'IT Hardware'.");
  };

  const handleExport = () => {
    alert("Exporting entire item & service catalog to Excel (CSV)...");
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.itemId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hsnCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.preferredVendor?.vendorName?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className={styles.container}>
      <CatalogueHeader 
        title="ITEM & SERVICE CATALOGUE" 
        subtitle="End-to-End Procurement Catalogue Lifecycle Sourcing & Sizing Dashboard"
        actions={
          <>
            <Button variant="outline" icon={<RefreshCw size={16} />} onClick={fetchDashboardData}>Sync ERP</Button>
            <Button icon={<Plus size={16} />} onClick={() => navigate('/catalogue/items')}>Add Item</Button>
          </>
        }
      />

      {/* KPI 10 Cards Grid */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi, idx) => {
          const IconComponent = kpi.icon;
          return (
            <div key={idx} className={styles.kpiCard}>
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
                <span className={styles.aiNote}>{kpi.ai}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts & Quick Actions Sidebar */}
      <div className={styles.dashboardLayout}>
        <div className={styles.chartsContainer}>
          {/* Charts Row 1 */}
          <div className={styles.chartsGrid}>
            <Card className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Category-wise Spend Distribution (INR)</h3>
              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySpend}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categorySpend.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `₹${(Number(value)/100000).toFixed(1)} L`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Vendor Catalogue Compliance Rate (%)</h3>
              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vendorUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rate" name="Compliance %" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <Card className={styles.chartCard}>
            <h3 className={styles.chartTitle}>
              AI Sourcing Demand Forecast (Item Units Ordered)
              <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--color-text-secondary)' }}>Predictive ML Sourcing Analysis</span>
            </h3>
            <div className={styles.chartWrapper} style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={demandForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="actual" name="Actual Orders" stroke="#16A34A" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="forecasted" name="AI Forecasted Orders" stroke="#1D4ED8" strokeDasharray="5 5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Sidebar Actions & Real-time Alerts */}
        <div className={styles.sidebarPanel}>
          <Card className={styles.panelCard}>
            <h3 className={styles.panelTitle}>Quick Actions</h3>
            <div className={styles.actionsGrid}>
              <button className={styles.actionButton} onClick={() => navigate('/catalogue/items')}>
                <Plus size={16} className={styles.actionIcon} />
                <span>Add New Item</span>
              </button>
              <button className={styles.actionButton} onClick={() => navigate('/catalogue/services')}>
                <Plus size={16} className={styles.actionIcon} />
                <span>Add New Service</span>
              </button>
              <button className={styles.actionButton} onClick={() => alert("Open File Upload Wizard...")}>
                <FileUp size={16} className={styles.actionIcon} />
                <span>Bulk Upload Catalogue</span>
              </button>
              <button className={styles.actionButton} onClick={() => navigate('/catalogue/vendor-mapping')}>
                <Link size={16} className={styles.actionIcon} />
                <span>Map Vendor to Item</span>
              </button>
              <button className={styles.actionButton} onClick={() => navigate('/catalogue/hsn-sac')}>
                <Hash size={16} className={styles.actionIcon} />
                <span>Import HSN/SAC Codes</span>
              </button>
              <button className={styles.actionButton} onClick={() => navigate('/catalogue/rates')}>
                <BadgeIndianRupee size={16} className={styles.actionIcon} />
                <span>Configure Rates</span>
              </button>
              <button className={styles.actionButton} onClick={handleDuplicateDetection}>
                <BrainCircuit size={16} className={styles.actionIcon} />
                <span>Run AI Duplicate Finder</span>
              </button>
              <button className={styles.actionButton} onClick={handleExport}>
                <ArrowRight size={16} className={styles.actionIcon} />
                <span>Export CSV/Excel</span>
              </button>
            </div>
          </Card>

          <Card className={styles.panelCard}>
            <h3 className={styles.panelTitle}>AI Sourcing Insights</h3>
            <div className={styles.alertList}>
              <div className={`${styles.alertCard} ${styles.alertCardWarning}`}>
                <div className={styles.alertText}>Potential Duplicate in Office Supplies</div>
                <div className={styles.alertMeta}>"Ergonomic Chair" looks 92% identical to "Standard Mesh Chair".</div>
              </div>
              <div className={`${styles.alertCard} ${styles.alertCardDanger}`}>
                <div className={styles.alertText}>Unmapped HSN Codes Detected</div>
                <div className={styles.alertMeta}>4 items in 'IT Hardware' category are missing GST tax rates.</div>
              </div>
              <div className={styles.alertCard}>
                <div className={styles.alertText}>Better Vendor Pricing Found</div>
                <div className={styles.alertMeta}>AI recommends ABC Infotech for Laptop purchases (potential savings: ₹1.2L).</div>
              </div>
            </div>
          </Card>
        </div>
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
          
          <div className={styles.filterControls}>
            <select 
              className={styles.selectInput}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="IT Hardware">IT Hardware</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Facility Management">Facility Management</option>
              <option value="Professional Services">Professional Services</option>
              <option value="Logistics">Logistics</option>
            </select>

            <select
              className={styles.selectInput}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Draft">Draft</option>
            </select>

            <Button variant="outline" size="sm" onClick={() => setIsGrid(!isGrid)} icon={isGrid ? <List size={16} /> : <LayoutGrid size={16} />}>
              {isGrid ? "List View" : "Grid View"}
            </Button>
          </div>
        </div>

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
                  {filteredItems.map(item => {
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
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {filteredItems.map(item => {
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
              })}
            </div>
          )
        )}
      </Card>
    </div>
  );
};
