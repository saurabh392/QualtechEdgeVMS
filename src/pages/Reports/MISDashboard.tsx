import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, DollarSign, Clock, ShieldCheck, Percent,
  Download, TrendingUp, PieChart as PieIcon, BarChart2, Calendar
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import styles from './MISDashboard.module.css';
import reportData from '../../../server/data/reports/reports-mis.json';

const PERIODS: { label: string; months: string[] }[] = [
  { label: 'All Months',  months: ['Dec','Jan','Feb','Mar','Apr','May'] },
  { label: 'Q4 FY 2025', months: ['Dec','Jan','Feb'] },
  { label: 'Q1 FY 2026', months: ['Mar','Apr','May'] },
];

export const MISDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'spend' | 'category' | 'risk'>('spend');
  const [periodIdx, setPeriodIdx] = useState(0);

  const filteredSpend = useMemo(() => {
    const allowed = new Set(PERIODS[periodIdx].months);
    return reportData.spendTrend.filter(d => allowed.has(d.name));
  }, [periodIdx]);

  const kpis = [
    { label: 'Total Vendors',      value: reportData.kpis.totalVendors,     trend: reportData.kpis.totalVendorsTrend,    icon: <Users size={18} />,      bg: '#eff6ff', color: '#1d4ed8', trendColor: 'green' },
    { label: 'Active Contracts',   value: reportData.kpis.activeContracts,  trend: reportData.kpis.activeContractsTrend, icon: <FileText size={18} />,   bg: '#f3e8ff', color: '#7c3aed', trendColor: 'green' },
    { label: 'Total Spend',        value: reportData.kpis.totalSpend,       trend: reportData.kpis.totalSpendTrend,      icon: <DollarSign size={18} />, bg: '#fef3c7', color: '#d97706', trendColor: 'red'   },
    { label: 'Compliance Score',   value: reportData.kpis.complianceScore,  trend: reportData.kpis.complianceTrend,      icon: <ShieldCheck size={18} />,bg: '#dcfce7', color: '#16a34a', trendColor: 'green' },
    { label: 'Savings Achieved',   value: reportData.kpis.savingsAchieved, trend: reportData.kpis.savingsTrend,         icon: <Percent size={18} />,    bg: '#fffbeb', color: '#f59e0b', trendColor: 'green' },
    { label: 'Payment Efficiency', value: reportData.kpis.paymentEfficiency,trend: reportData.kpis.efficiencyTrend,     icon: <Clock size={18} />,      bg: '#e0f2fe', color: '#0284c7', trendColor: 'green' },
  ];

  const handleExportPDF = () => {
    window.print();
  };

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
            >
              {PERIODS.map((p, i) => (
                <option key={p.label} value={i}>{p.label}</option>
              ))}
            </select>
          </div>
          {/* <Button variant="outline" icon={<Download size={16} />} onClick={handleExportPDF}>Export PDF</Button> */}
        </div>
      </header>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {kpis.map(k => (
          <Card key={k.label} className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>{k.label}</span>
              <div className={styles.kpiIcon} style={{ background: k.bg, color: k.color }}>{k.icon}</div>
            </div>
            <div className={styles.kpiValue}>{k.value}</div>
            <div className={k.trendColor === 'green' ? styles.trendGreen : styles.trendRed}>{k.trend}</div>
          </Card>
        ))}
      </div>

      {/* Chart Section with Tabs */}
      <Card className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.sectionTitle}>
            Spend &amp; Risk Analytics
            <span className={styles.periodBadge}>{PERIODS[periodIdx].label}</span>
          </h3>
          <div className={styles.chartTabs}>
            <button className={`${styles.chartTab} ${activeTab === 'spend' ? styles.activeChartTab : ''}`} onClick={() => setActiveTab('spend')}>
              <TrendingUp size={14} /> Spend Trend
            </button>
            <button className={`${styles.chartTab} ${activeTab === 'category' ? styles.activeChartTab : ''}`} onClick={() => setActiveTab('category')}>
              <PieIcon size={14} /> Category Split
            </button>
            <button className={`${styles.chartTab} ${activeTab === 'risk' ? styles.activeChartTab : ''}`} onClick={() => setActiveTab('risk')}>
              <BarChart2 size={14} /> Risk Profile
            </button>
          </div>
        </div>

        {activeTab === 'spend' && (
          <div className={styles.chartArea}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredSpend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip />
                <Legend iconSize={10} verticalAlign="top" height={32} />
                <Line type="monotone" dataKey="budget" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Budget (₹ Cr)" />
                <Line type="monotone" dataKey="actual" stroke="#1d4ed8" strokeWidth={3} dot={{ r: 4, fill: '#1d4ed8' }} name="Actual (₹ Cr)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'category' && (
          <div className={styles.chartAreaPie}>
            <ResponsiveContainer width="45%" height={220}>
              <PieChart>
                <Pie data={reportData.spendByCategory} innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
                  {reportData.spendByCategory.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.pieLegend}>
              {reportData.spendByCategory.map(item => (
                <div key={item.name} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: item.color }} />
                  <span className={styles.legendName}>{item.name}</span>
                  <span className={styles.legendVal}>₹{item.value} Cr</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'risk' && (
          <div className={styles.chartAreaPie}>
            <ResponsiveContainer width="45%" height={220}>
              <PieChart>
                <Pie data={reportData.riskDistribution} innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
                  {reportData.riskDistribution.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.pieLegend}>
              {reportData.riskDistribution.map(item => (
                <div key={item.name} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: item.color }} />
                  <span className={styles.legendName}>{item.name}</span>
                  <span className={styles.legendVal}>{item.value} vendors</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Spend Breakdown Table */}
      <Card className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.sectionTitle}>Spend Breakdown by Category</h3>
          <div className={styles.tableActions}>
            <Button variant="ghost" icon={<Download size={14} />} onClick={() => navigate('/reports/performance')}>View Performance</Button>
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Actual Spend</th>
                <th>Budget</th>
                <th>SLA Score</th>
                <th>Cost Savings</th>
              </tr>
            </thead>
            <tbody>
              {reportData.categoryMetrics.map(row => (
                <tr key={row.category}>
                  <td className={styles.categoryName}>{row.category}</td>
                  <td style={{ fontWeight: 600 }}>{row.spend}</td>
                  <td>{row.budget}</td>
                  <td>{row.slaScore}</td>
                  <td className={styles.savingsCell}>{row.savings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
