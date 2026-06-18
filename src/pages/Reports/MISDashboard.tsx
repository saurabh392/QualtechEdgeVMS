import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users, FileText, DollarSign, Clock, ShieldCheck, Percent,
  Download, Calendar, Search, Filter, X, ChevronRight, ArrowLeft, Loader2,
} from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import styles from './MISDashboard.module.css';

const PERIODS: { label: string; months: string[] }[] = [
  { label: 'All Months',  months: ['Dec','Jan','Feb','Mar','Apr','May'] },
  { label: 'Q4 FY 2025', months: ['Dec','Jan','Feb'] },
  { label: 'Q1 FY 2026', months: ['Mar','Apr','May'] },
];

/* ── Types matching server/data/reports/reports-mis.json ────────────────────── */
interface MisData {
  kpis: Record<string, string | number>;
  spendByCategory: { name: string; value: number; color: string }[];
  riskDistribution: { name: string; value: number; color: string }[];
  vendorStatus: { name: string; value: number; color: string }[];
  spendComparison: { month: string; budget: number; actual: number }[];
  categoryMetrics: { category: string; spend: string; budget: string; savings: string; slaScore: string }[];
  vendorPerformance: {
    categorySLA: { category: string; sla: number }[];
    scorecards: { vendorId: string; name: string; category: string; sla: string; quality: string; delivery: string; risk: string }[];
  };
}

interface Column { key: string; label: string; className?: string; render?: (row: Record<string, unknown>) => React.ReactNode; }
interface DrillTable { title: string; columns: Column[]; rows: Record<string, unknown>[]; }

type KpiKey = 'totalVendors' | 'activeContracts' | 'totalSpend' | 'complianceScore' | 'savingsAchieved' | 'paymentEfficiency';

export const MISDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [periodIdx, setPeriodIdx] = useState(0);
  const [data, setData] = useState<MisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Drill-down + filter state
  const [selectedKpi, setSelectedKpi] = useState<KpiKey | null>(null);
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [colFilter, setColFilter] = useState('');

  useEffect(() => {
    axios.get('/api/reports/mis')
      .then(r => setData(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Reset filters whenever the active view changes
  useEffect(() => { setSearch(''); setColFilter(''); setFiltersOpen(false); }, [selectedKpi]);

  const kpis = useMemo(() => {
    if (!data) return [];
    const k = data.kpis;
    return [
      { key: 'totalVendors' as KpiKey,      label: 'Total Vendors',      value: k.totalVendors,      trend: k.totalVendorsTrend,    icon: <Users size={18} />,       bg: '#eff6ff', color: '#1d4ed8', trendColor: 'green' },
      { key: 'activeContracts' as KpiKey,   label: 'Active Contracts',   value: k.activeContracts,   trend: k.activeContractsTrend, icon: <FileText size={18} />,    bg: '#f3e8ff', color: '#7c3aed', trendColor: 'green' },
      { key: 'totalSpend' as KpiKey,        label: 'Total Spend',        value: k.totalSpend,        trend: k.totalSpendTrend,      icon: <DollarSign size={18} />,  bg: '#fef3c7', color: '#d97706', trendColor: 'red'   },
      { key: 'complianceScore' as KpiKey,   label: 'Compliance Score',   value: k.complianceScore,   trend: k.complianceTrend,      icon: <ShieldCheck size={18} />, bg: '#dcfce7', color: '#16a34a', trendColor: 'green' },
      { key: 'savingsAchieved' as KpiKey,   label: 'Savings Achieved',   value: k.savingsAchieved,   trend: k.savingsTrend,         icon: <Percent size={18} />,     bg: '#fffbeb', color: '#f59e0b', trendColor: 'green' },
      { key: 'paymentEfficiency' as KpiKey, label: 'Payment Efficiency', value: k.paymentEfficiency, trend: k.efficiencyTrend,      icon: <Clock size={18} />,       bg: '#e0f2fe', color: '#0284c7', trendColor: 'green' },
    ];
  }, [data]);

  /* ── Build the active table (default = spend breakdown; else KPI drill-down) ── */
  const activeTable: DrillTable = useMemo(() => {
    if (!data) return { title: '', columns: [], rows: [] };

    const totalSpendCr = Number(data.kpis.totalSpendCr) || data.spendByCategory.reduce((s, c) => s + c.value, 0);
    const totalVendors = Number(data.kpis.totalVendors) || data.vendorStatus.reduce((s, r) => s + r.value, 0);

    switch (selectedKpi) {
      case 'totalVendors':
        return {
          title: 'Vendors by Status',
          columns: [
            { key: 'name', label: 'Status', className: styles.categoryName },
            { key: 'value', label: 'Vendor Count' },
            { key: 'share', label: 'Share %' },
          ],
          rows: data.vendorStatus.map(r => ({
            name: r.name, value: r.value,
            share: `${((r.value / totalVendors) * 100).toFixed(1)}%`,
          })),
        };
      case 'activeContracts':
        return {
          title: 'Contract Portfolio by Category',
          columns: [
            { key: 'category', label: 'Category', className: styles.categoryName },
            { key: 'spend', label: 'Actual Spend' },
            { key: 'budget', label: 'Budget' },
            { key: 'slaScore', label: 'SLA Score' },
          ],
          rows: data.categoryMetrics.map(c => ({ ...c })),
        };
      case 'totalSpend':
        return {
          title: 'Spend by Category',
          columns: [
            { key: 'name', label: 'Category', className: styles.categoryName },
            { key: 'value', label: 'Spend (₹ Cr)', render: r => `₹${Number(r.value).toFixed(1)} Cr` },
            { key: 'share', label: 'Share %' },
          ],
          rows: data.spendByCategory.map(c => ({
            name: c.name, value: c.value,
            share: `${((c.value / totalSpendCr) * 100).toFixed(1)}%`,
          })),
        };
      case 'complianceScore':
        return {
          title: 'SLA Adherence by Category',
          columns: [
            { key: 'category', label: 'Category', className: styles.categoryName },
            { key: 'sla', label: 'SLA Adherence', render: r => `${r.sla}%`, },
          ],
          rows: data.vendorPerformance.categorySLA.map(c => ({ ...c })),
        };
      case 'savingsAchieved':
        return {
          title: 'Cost Savings by Category',
          columns: [
            { key: 'category', label: 'Category', className: styles.categoryName },
            { key: 'savings', label: 'Cost Savings', className: styles.savingsCell },
            { key: 'spend', label: 'Actual Spend' },
            { key: 'budget', label: 'Budget' },
          ],
          rows: data.categoryMetrics.map(c => ({ ...c })),
        };
      case 'paymentEfficiency':
        return {
          title: 'Budget vs Actual Spend by Period',
          columns: [
            { key: 'month', label: 'Period', className: styles.categoryName },
            { key: 'budget', label: 'Budget (₹ Cr)', render: r => `₹${Number(r.budget).toFixed(1)} Cr` },
            { key: 'actual', label: 'Actual (₹ Cr)', render: r => `₹${Number(r.actual).toFixed(1)} Cr` },
            { key: 'variance', label: 'Variance', render: r => {
                const v = Number(r.actual) - Number(r.budget);
                return <span style={{ color: v > 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>{v > 0 ? '+' : ''}{v.toFixed(1)} Cr</span>;
              } },
          ],
          rows: data.spendComparison.map(c => ({ ...c })),
        };
      default:
        return {
          title: 'Spend Breakdown by Category',
          columns: [
            { key: 'category', label: 'Category', className: styles.categoryName },
            { key: 'spend', label: 'Actual Spend' },
            { key: 'budget', label: 'Budget' },
            { key: 'slaScore', label: 'SLA Score' },
            { key: 'savings', label: 'Cost Savings', className: styles.savingsCell },
          ],
          rows: data.categoryMetrics.map(c => ({ ...c })),
        };
    }
  }, [data, selectedKpi]);

  // Distinct values of the first column → dynamic filter options
  const firstCol = activeTable.columns[0];
  const filterOptions = useMemo(() => {
    if (!firstCol) return [];
    return [...new Set(activeTable.rows.map(r => String(r[firstCol.key])))];
  }, [activeTable, firstCol]);

  // Keyword search + column filter applied to the active table
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activeTable.rows.filter(row => {
      if (colFilter && firstCol && String(row[firstCol.key]) !== colFilter) return false;
      if (q && !Object.values(row).some(v => String(v).toLowerCase().includes(q))) return false;
      return true;
    });
  }, [activeTable, search, colFilter, firstCol]);

  const activeFilterCount = colFilter ? 1 : 0;
  const selectedKpiLabel = kpis.find(k => k.key === selectedKpi)?.label;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.stateBox}><Loader2 size={28} className={styles.spin} /> Loading MIS data…</div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className={styles.container}>
        <div className={styles.stateBox}>Unable to load MIS data. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className={styles.container} id="mis-print-area">
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>MIS Dashboard</h1>
          <p className={styles.subtitle}>Executive overview: vendor analytics, spend intelligence, and compliance monitoring</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.dateFilterWrap}>
            <Calendar size={14} className={styles.dateIcon} />
            <select
              className={styles.dateSelect}
              value={periodIdx}
              onChange={e => setPeriodIdx(Number(e.target.value))}
              aria-label="Reporting period"
            >
              {PERIODS.map((p, i) => (
                <option key={p.label} value={i}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* KPI Grid — clickable drill-down tiles */}
      <div className={styles.kpiGrid} role="group" aria-label="Key performance indicators">
        {kpis.map(k => {
          const isSelected = selectedKpi === k.key;
          return (
            <Card
              key={k.key}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`${k.label}: ${k.value}. View breakdown.`}
              className={`${styles.kpiCard} ${styles.kpiClickable} ${isSelected ? styles.kpiSelected : ''}`}
              onClick={() => setSelectedKpi(isSelected ? null : k.key)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedKpi(isSelected ? null : k.key); }
              }}
            >
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>{k.label}</span>
                <div className={styles.kpiIcon} style={{ background: k.bg, color: k.color }}>{k.icon}</div>
              </div>
              <div className={styles.kpiValue}>{k.value}</div>
              <div className={k.trendColor === 'green' ? styles.trendGreen : styles.trendRed}>{k.trend}</div>
              <span className={styles.kpiDrillHint}>View breakdown <ChevronRight size={12} /></span>
            </Card>
          );
        })}
      </div>

      {/* Table card — breadcrumb (drill-down) + Option B toolbar + dynamic table */}
      <Card className={styles.tableCard}>
        <div className={styles.tableHeader}>
          {selectedKpi ? (
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <button className={styles.crumbLink} onClick={() => setSelectedKpi(null)}>MIS Dashboard</button>
              <ChevronRight size={13} className={styles.crumbSep} />
              <span className={styles.crumbCurrent}>{selectedKpiLabel}</span>
            </nav>
          ) : (
            <h3 className={styles.sectionTitle}>{activeTable.title}</h3>
          )}
          <div className={styles.tableActions}>
            {selectedKpi && (
              <Button variant="ghost" icon={<ArrowLeft size={14} />} onClick={() => setSelectedKpi(null)}>Back to overview</Button>
            )}
            <Button variant="ghost" icon={<Download size={14} />} onClick={() => navigate('/reports/performance')}>View Performance</Button>
          </div>
        </div>

        {/* Collapsible filter toolbar (Option B) */}
        <div className={styles.tableToolbar}>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder={`Search ${activeTable.title.toLowerCase()}…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search table"
            />
          </div>
          <button
            className={styles.filterBtn}
            onClick={() => setFiltersOpen(v => !v)}
            aria-expanded={filtersOpen}
            aria-controls="mis-filter-panel"
          >
            <Filter size={14} /> Filters
            {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
          </button>
        </div>

        {filtersOpen && firstCol && (
          <div className={styles.filterPanel} id="mis-filter-panel">
            <div className={styles.filterPanelRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel} htmlFor="mis-col-filter">{firstCol.label}</label>
                <select
                  id="mis-col-filter"
                  className={styles.filterSelect}
                  value={colFilter}
                  onChange={e => setColFilter(e.target.value)}
                >
                  <option value="">All {firstCol.label}</option>
                  {filterOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              {activeFilterCount > 0 && (
                <button className={styles.clearFiltersBtn} onClick={() => setColFilter('')}>
                  <X size={12} /> Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>{activeTable.columns.map(c => <th key={c.key}>{c.label}</th>)}</tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={activeTable.columns.length} className={styles.emptyRow}>
                    No records match your search/filter.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, i) => (
                  <tr key={i}>
                    {activeTable.columns.map(c => (
                      <td key={c.key} className={c.className}>
                        {c.render ? c.render(row) : String(row[c.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
