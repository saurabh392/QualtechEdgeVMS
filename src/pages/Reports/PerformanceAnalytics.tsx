import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Award, ShieldAlert, Star, ChevronLeft, Loader2 } from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line
} from 'recharts';
import { Card } from '../../components/Card/Card';
import { Badge } from '../../components/Badge/Badge';
import styles from './PerformanceAnalytics.module.css';

interface VendorPerf {
  avgSlaScore: string;
  delayedDeliveries: number;
  qualityIndex: string;
  slaScoreTrend: string;
  radarData: { subject: string; score: number; fullMark: number }[];
  categorySLA: { category: string; sla: number }[];
  scorecards: { vendorId: string; name: string; category: string; sla: string; quality: string; delivery: string; risk: string }[];
}
interface MisData {
  vendorPerformance: VendorPerf;
  spendComparison: { month: string; budget: number; actual: number }[];
  savingsTrend: { month: string; savings: number }[];
}

export const PerformanceAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'scorecard' | 'radar' | 'spend'>('scorecard');
  const [data, setData] = useState<MisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    axios.get('/api/reports/mis')
      .then(r => setData(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '64px 24px', color: 'var(--color-text-secondary)' }}>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} /> Loading performance data…
        </div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--color-text-secondary)' }}>
          Unable to load performance data. Please try again later.
        </div>
      </div>
    );
  }

  const perf = data.vendorPerformance;

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <button className={styles.backBtn} onClick={() => navigate('/reports/dashboard')}>
            <ChevronLeft size={16} /> Back to MIS
          </button>
          <h1 className={styles.title}>Performance & Analytics</h1>
          <p className={styles.subtitle}>Vendor scorecards, SLA adherence, spend comparison, and category performance</p>
        </div>
        {/* <Button variant="outline" icon={<Download size={16} />}>Export Report</Button> */}
      </header>

      {/* KPI Row */}
      <div className={styles.kpiRow}>
        <Card className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Avg. SLA Score</span>
            <div className={styles.kpiIcon} style={{ background: '#eff6ff', color: '#1d4ed8' }}><Award size={18} /></div>
          </div>
          <div className={styles.kpiValue}>{perf.avgSlaScore}</div>
          <div className={styles.trendGreen}>{perf.slaScoreTrend}</div>
        </Card>
        <Card className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Delayed Deliveries</span>
            <div className={styles.kpiIcon} style={{ background: '#fee2e2', color: '#dc2626' }}><ShieldAlert size={18} /></div>
          </div>
          <div className={styles.kpiValue}>{perf.delayedDeliveries}</div>
          <div className={styles.trendRed}>SLA warning threshold</div>
        </Card>
        <Card className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Quality Index</span>
            <div className={styles.kpiIcon} style={{ background: '#dcfce7', color: '#16a34a' }}><Star size={18} /></div>
          </div>
          <div className={styles.kpiValue}>{perf.qualityIndex}</div>
          <div className={styles.trendGreen}>Excellent Grade</div>
        </Card>
      </div>

      {/* Tabbed Charts */}
      <Card className={styles.tabCard}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeTab === 'scorecard' ? styles.activeTab : ''}`} onClick={() => setActiveTab('scorecard')}>
            Vendor Scorecards
          </button>
          <button className={`${styles.tab} ${activeTab === 'radar' ? styles.activeTab : ''}`} onClick={() => setActiveTab('radar')}>
            Performance Radar
          </button>
          <button className={`${styles.tab} ${activeTab === 'spend' ? styles.activeTab : ''}`} onClick={() => setActiveTab('spend')}>
            Budget vs Actual
          </button>
        </div>

        {/* Scorecard Table */}
        {activeTab === 'scorecard' && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th>Category</th>
                  <th>SLA Adherence</th>
                  <th>Quality Rating</th>
                  <th>Delivery Time</th>
                  <th>Risk Profile</th>
                </tr>
              </thead>
              <tbody>
                {perf.scorecards.map(v => (
                  <tr key={v.vendorId}>
                    <td className={styles.vendorName}>{v.name}</td>
                    <td>{v.category}</td>
                    <td style={{ fontWeight: 600 }}>{v.sla}</td>
                    <td>{v.quality}</td>
                    <td>{v.delivery}</td>
                    <td>
                      <Badge variant={v.risk === 'Low' ? 'success' : 'warning'}>{v.risk}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Radar Chart */}
        {activeTab === 'radar' && (
          <div className={styles.chartArea}>
            <div className={styles.radarGrid}>
              <div>
                <h4 className={styles.chartSubTitle}>Overall Performance Indexes</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={perf.radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Radar name="Performance" dataKey="score" stroke="#1d4ed8" fill="#1d4ed8" fillOpacity={0.3} />
                    <RechartsTooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className={styles.chartSubTitle}>SLA by Category (%)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={perf.categorySLA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} />
                    <RechartsTooltip />
                    <Bar dataKey="sla" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={24} name="SLA %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Budget vs Actual */}
        {activeTab === 'spend' && (
          <div className={styles.chartArea}>
            <h4 className={styles.chartSubTitle}>Budget vs Actual Spend (₹ Cr)</h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.spendComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <RechartsTooltip />
                <Legend iconSize={10} verticalAlign="top" height={32} />
                <Bar dataKey="budget" fill="#94a3b8" name="Budget Cap" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="#1d4ed8" name="Actual Spend" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className={styles.savingsTrendWrap}>
              <h4 className={styles.chartSubTitle} style={{ marginTop: 24 }}>Monthly Cost Savings Trend (₹ L)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.savingsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="savings" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, fill: '#16a34a' }} name="Savings (₹ L)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
