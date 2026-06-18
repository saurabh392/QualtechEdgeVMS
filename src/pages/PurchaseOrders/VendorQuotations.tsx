import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Eye, CheckCircle2, XCircle, Star, TrendingDown,
  Award, Search, Filter, ArrowLeft, RefreshCw,
  ShoppingBag, Clock, Users, Download, Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { DataTable } from '../../components/DataTable/DataTable';
import type { Column } from '../../components/DataTable/DataTable';
import styles from './VendorQuotations.module.css';

interface VendorQuote {
  quoteId: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  vendorCategory: string;
  quotedAmount: number;
  deliveryDays: number;
  warranty: string;
  technicalCompliance: string;
  submittedDate: string;
  validityDate: string;
  notes: string;
  status: 'Submitted' | 'Shortlisted' | 'Rejected' | 'Awarded';
  attachments: any[];
}

interface RFQ {
  rfqId: string;
  rfqNumber: string;
  title: string;
  department: string;
  category: string;
  budget: number;
  closingDate: string;
  status: string;
  quotesReceived: number;
}

export const VendorQuotations: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rfqIdFilter = searchParams.get('rfqId') || '';

  const [quotes, setQuotes] = useState<VendorQuote[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [rfqFilter, setRfqFilter] = useState(rfqIdFilter);
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(rfqIdFilter || null);
  const [comparingQuotes, setComparingQuotes] = useState<VendorQuote[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeKpi, setActiveKpi] = useState<string>('Total Quotes');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportBulk = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    toast.promise(
      axios.post('/api/vendor-quotes/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(() => {
        fetchData();
        return 'Vendor quotations imported successfully!';
      }),
      {
        loading: 'Importing vendor quotations in bulk...',
        success: (data) => data,
        error: 'Failed to import vendor quotations.'
      }
    );
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKpiClick = (filterName: string) => {
    setActiveKpi(filterName);
    axios.post('/api/vendor-quotation-ui-state', { activeFilter: filterName })
      .catch(err => console.error('Failed to save KPI card UI state:', err));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [quotesRes, rfqsRes] = await Promise.all([
        axios.get('/api/vendor-quotes'),
        axios.get('/api/rfq')
      ]);
      setQuotes(Array.isArray(quotesRes.data) ? quotesRes.data : []);
      setRfqs(Array.isArray(rfqsRes.data) ? rfqsRes.data : []);
    } catch (e) {
      console.error('Error fetching quotes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    axios.get('/api/vendor-quotation-ui-state')
      .then(res => {
        if (res.data && res.data.activeFilter) {
          setActiveKpi(res.data.activeFilter);
        }
      })
      .catch(err => console.error('Failed to load KPI card UI state:', err));
  }, []);

  useEffect(() => {
    if (rfqIdFilter) {
      setRfqFilter(rfqIdFilter);
      setSelectedRfqId(rfqIdFilter);
    }
  }, [rfqIdFilter]);

  const handleUpdateStatus = async (quoteId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      await axios.put(`/api/vendor-quotes/${quoteId}/status`, { status: newStatus });
      toast.success(`Quote ${quoteId} marked as ${newStatus}.`);
      fetchData();
    } catch (e) {
      toast.error('Failed to update quote status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitForApproval = async (rfqId: string) => {
    const rfq = rfqs.find(r => r.rfqId === rfqId);
    const rfqQuotes = quotes.filter(q => q.rfqId === rfqId);
    const shortlisted = rfqQuotes.find(q => q.status === 'Shortlisted');
    if (!shortlisted) {
      toast.error('Please shortlist a vendor before submitting for approval.');
      return;
    }
    try {
      await axios.post('/api/rfq-approvals', {
        rfqId,
        rfqTitle: rfq?.title || '',
        department: rfq?.department || '',
        category: rfq?.category || '',
        budget: rfq?.budget || 0,
        selectedVendorId: shortlisted.vendorId,
        selectedVendorName: shortlisted.vendorName,
        awardValue: shortlisted.quotedAmount,
        businessJustification: `${shortlisted.vendorName} selected as L1 vendor based on quote comparison and technical compliance.`,
        comparisonSummary: `${rfqQuotes.length} quotes received. Shortlisted: ${shortlisted.vendorName} @ ₹${shortlisted.quotedAmount.toLocaleString('en-IN')}.`,
        submittedBy: 'Saurabh Anand',
        attachments: rfq ? [] : []
      });
      // Close the RFQ
      await axios.post(`/api/rfq/${rfqId}/close`);
      toast.success('RFQ submitted for approval. Awaiting Procurement Manager review.');
      fetchData();
      navigate('/purchase-orders/rfq-approvals');
    } catch (e) {
      toast.error('Failed to submit for approval.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Quote ID', 'RFQ Number', 'Vendor', 'Quoted Amount', 'Delivery Days', 'Warranty', 'Technical Compliance', 'Submitted Date', 'Status'];
    const rows = filteredQuotes.map(q => [
      q.quoteId, q.rfqId, q.vendorName, q.quotedAmount, q.deliveryDays,
      q.warranty, q.technicalCompliance, q.submittedDate, q.status
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(row => row.map(v => `"${v}"`).join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `VMS_Quotes_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const filteredQuotes = quotes.filter(q => {
    if (rfqFilter && q.rfqId !== rfqFilter) return false;
    
    // KPI Card Filter logic
    if (activeKpi === 'Submitted' && q.status !== 'Submitted') return false;
    if (activeKpi === 'Shortlisted' && q.status !== 'Shortlisted') return false;
    if (activeKpi === 'Awarded' && q.status !== 'Awarded') return false;
    
    // Fallback or additional dropdown filter
    if (activeKpi === 'Total Quotes' && statusFilter !== 'All' && q.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      return q.vendorName.toLowerCase().includes(s) || q.rfqId.toLowerCase().includes(s) || q.quoteId.toLowerCase().includes(s);
    }
    return true;
  });

  // For comparison view: get quotes for selected RFQ
  const rfqQuotesForComparison = selectedRfqId ? quotes.filter(q => q.rfqId === selectedRfqId) : [];
  const minQuote = rfqQuotesForComparison.length > 0 ? Math.min(...rfqQuotesForComparison.map(q => q.quotedAmount)) : 0;

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
    if (status === 'Awarded') return 'success';
    if (status === 'Shortlisted') return 'info';
    if (status === 'Rejected') return 'danger';
    return 'default';
  };

  const selectedRfq = rfqs.find(r => r.rfqId === selectedRfqId);

  const columns: Column<VendorQuote>[] = [
    { header: 'Quote ID', accessor: (q) => <span style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.75rem' }}>{q.quoteId}</span> },
    { header: 'RFQ Number', accessor: (q) => <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{q.rfqId}</span> },
    {
      header: 'Vendor',
      accessor: (q) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{q.vendorName}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{q.vendorCategory}</div>
        </div>
      )
    },
    {
      header: 'Quoted Amount',
      accessor: (q) => {
        const isLowest = rfqQuotesForComparison.length > 0 && q.quotedAmount === minQuote && q.rfqId === selectedRfqId;
        return (
          <span style={{ fontWeight: 700, color: isLowest ? '#16a34a' : 'var(--color-text-primary)', fontSize: '0.8rem' }}>
            ₹{q.quotedAmount.toLocaleString('en-IN')}
            {isLowest && <span style={{ marginLeft: 4, fontSize: '0.65rem', background: '#dcfce7', color: '#16a34a', padding: '1px 5px', borderRadius: 8 }}>L1</span>}
          </span>
        );
      }
    },
    {
      header: 'Delivery Days',
      align: 'center',
      accessor: (q) => <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{q.deliveryDays} days</span>
    },
    { header: 'Warranty', accessor: 'warranty' as keyof VendorQuote },
    {
      header: 'Tech Compliance',
      accessor: (q) => (
        <Badge variant={q.technicalCompliance === 'Full Compliance' ? 'success' : 'warning'}>
          {q.technicalCompliance}
        </Badge>
      )
    },
    { header: 'Submitted', accessor: 'submittedDate' as keyof VendorQuote },
    {
      header: 'Status',
      accessor: (q) => <Badge variant={getStatusVariant(q.status)}>{q.status}</Badge>
    },
    {
      header: 'Actions',
      align: 'center',
      accessor: (q) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {q.status === 'Submitted' && (
            <button
              className={styles.actionBtn}
              style={{ background: '#f0fdf4', color: '#16a34a' }}
              title="Shortlist"
              onClick={() => handleUpdateStatus(q.quoteId, 'Shortlisted')}
              disabled={actionLoading}
            >
              <Star size={14} />
            </button>
          )}
          {q.status === 'Submitted' && (
            <button
              className={styles.actionBtn}
              style={{ background: '#fef2f2', color: '#dc2626' }}
              title="Reject"
              onClick={() => handleUpdateStatus(q.quoteId, 'Rejected')}
              disabled={actionLoading}
            >
              <XCircle size={14} />
            </button>
          )}
          {q.status === 'Shortlisted' && (
            <button
              className={styles.actionBtn}
              style={{ background: '#eff6ff', color: '#1d4ed8' }}
              title="Undo Shortlist"
              onClick={() => handleUpdateStatus(q.quoteId, 'Submitted')}
              disabled={actionLoading}
            >
              <CheckCircle2 size={14} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Vendor Quotations</h1>
          <p className={styles.subtitle}>Review, compare and shortlist vendor quotations received against open RFQs</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="ghost" icon={<ArrowLeft size={15} />} onClick={() => navigate('/purchase-orders/rfq')}>RFQ List</Button>
          <Button variant="outline" icon={<Download size={15} />} onClick={handleExportCSV}>Export</Button>
          <Button variant="outline" icon={<Upload size={15} />} onClick={() => fileInputRef.current?.click()}>Import</Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.xlsx,.csv,.docx"
            style={{ display: 'none' }}
            onChange={handleImportBulk}
          />
        </div>
      </header>

      {/* KPI Row */}
      <div className={styles.kpiGrid}>
        {[
          { label: 'Total Quotes', value: quotes.length, icon: <ShoppingBag size={15} />, bg: '#eff6ff', color: '#3b82f6' },
          { label: 'Submitted', value: quotes.filter(q => q.status === 'Submitted').length, icon: <Clock size={15} />, bg: '#fffbeb', color: '#f59e0b' },
          { label: 'Shortlisted', value: quotes.filter(q => q.status === 'Shortlisted').length, icon: <Star size={15} />, bg: '#f0fdf4', color: '#16a34a' },
          { label: 'Awarded', value: quotes.filter(q => q.status === 'Awarded').length, icon: <Award size={15} />, bg: '#f3e8ff', color: '#8b5cf6' },
        ].map(k => (
          <Card
            key={k.label}
            className={`${styles.kpiCard} ${activeKpi === k.label ? styles.kpiCardActive : ''}`}
            onClick={() => handleKpiClick(k.label)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.kpiIcon} style={{ background: k.bg, color: k.color }}>{k.icon}</div>
            <div>
              <div className={styles.kpiLabel}>{k.label}</div>
              <div className={styles.kpiValue}>{loading ? '…' : k.value}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter + Table */}
      <Card className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <div className={styles.filters}>
            <div className={styles.searchWrap}>
              <Search size={15} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Search vendor, RFQ number..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select className={styles.filterSelect} value={rfqFilter} onChange={e => { setRfqFilter(e.target.value); setSelectedRfqId(e.target.value || null); }}>
              <option value="">All RFQs</option>
              {rfqs.map(r => <option key={r.rfqId} value={r.rfqId}>{r.rfqNumber} — {r.title}</option>)}
            </select>
            <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
              <option value="Awarded">Awarded</option>
            </select>
            <Button variant="ghost" onClick={fetchData}><RefreshCw size={14} /></Button>
          </div>
          <div className={styles.toolbarRight}>
            {selectedRfqId && rfqQuotesForComparison.length >= 2 && (
              <Button variant="outline" icon={<TrendingDown size={15} />} onClick={() => setShowComparison(true)}>
                Compare {rfqQuotesForComparison.length} Quotes
              </Button>
            )}
            {selectedRfqId && rfqQuotesForComparison.some(q => q.status === 'Shortlisted') && (
              <Button icon={<Award size={15} />} onClick={() => handleSubmitForApproval(selectedRfqId)}>
                Submit for Approval
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingState}>Loading quotations...</div>
        ) : (
          <DataTable columns={columns} data={filteredQuotes} keyExtractor={q => q.quoteId} />
        )}

        <div className={styles.tablePagination}>
          <span>Showing 1 to {filteredQuotes.length} of {quotes.length} quotes</span>
        </div>
      </Card>

      {/* Comparison Modal */}
      {showComparison && selectedRfqId && (
        <div className={styles.modalBackdrop} onClick={() => setShowComparison(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Quote Comparison — {selectedRfqId}</h2>
                {selectedRfq && <p className={styles.modalSubtitle}>{selectedRfq.title} · Budget: ₹{Number(selectedRfq.budget).toLocaleString('en-IN')}</p>}
              </div>
              <button className={styles.modalClose} onClick={() => setShowComparison(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.comparisonTable}>
                {/* Headers */}
                <div className={styles.compRow} style={{ background: '#f8fafc', fontWeight: 700 }}>
                  <div className={styles.compCell} style={{ minWidth: 160 }}>Criteria</div>
                  {rfqQuotesForComparison.map(q => (
                    <div key={q.quoteId} className={styles.compCell}>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{q.vendorName}</div>
                      {q.quotedAmount === minQuote && <span className={styles.l1Tag}>★ L1 Lowest</span>}
                      {q.status === 'Shortlisted' && <span className={styles.shortlistedTag}>✔ Shortlisted</span>}
                    </div>
                  ))}
                </div>
                {/* Rows */}
                {[
                  { label: 'Quoted Amount', key: 'quotedAmount', render: (q: VendorQuote) => `₹${q.quotedAmount.toLocaleString('en-IN')}`, highlight: (q: VendorQuote) => q.quotedAmount === minQuote },
                  { label: 'Delivery Days', key: 'deliveryDays', render: (q: VendorQuote) => `${q.deliveryDays} days`, highlight: (q: VendorQuote) => q.deliveryDays === Math.min(...rfqQuotesForComparison.map(x => x.deliveryDays)) },
                  { label: 'Warranty', key: 'warranty', render: (q: VendorQuote) => q.warranty, highlight: () => false },
                  { label: 'Tech Compliance', key: 'technicalCompliance', render: (q: VendorQuote) => q.technicalCompliance, highlight: (q: VendorQuote) => q.technicalCompliance === 'Full Compliance' },
                  { label: 'Validity Date', key: 'validityDate', render: (q: VendorQuote) => q.validityDate, highlight: () => false },
                  { label: 'Status', key: 'status', render: (q: VendorQuote) => q.status, highlight: () => false },
                ].map(row => (
                  <div key={row.key} className={styles.compRow}>
                    <div className={styles.compCell} style={{ fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>{row.label}</div>
                    {rfqQuotesForComparison.map(q => (
                      <div
                        key={q.quoteId}
                        className={styles.compCell}
                        style={{
                          fontWeight: row.highlight(q) ? 700 : 400,
                          color: row.highlight(q) ? '#16a34a' : 'var(--color-text-primary)',
                          background: row.highlight(q) ? '#f0fdf4' : undefined
                        }}
                      >
                        {row.render(q)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className={styles.compActions}>
                {rfqQuotesForComparison.filter(q => q.status === 'Submitted').map(q => (
                  <Button
                    key={q.quoteId}
                    variant={q.quotedAmount === minQuote ? 'primary' : 'outline'}
                    icon={<Star size={14} />}
                    onClick={async () => {
                      await handleUpdateStatus(q.quoteId, 'Shortlisted');
                      setShowComparison(false);
                    }}
                  >
                    Shortlist {q.vendorName}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
