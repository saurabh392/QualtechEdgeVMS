import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  DollarSign
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { CatalogueHeader } from './CatalogueHeader';
import { Button } from '../../components/Button/Button';
import styles from './RatePriceReference.module.css';
import { getAllItems } from '../../services/itemMasterService';

// Mock Data
const priceHistoryData = [
  { date: '2025-11', price: 75000 },
  { date: '2025-12', price: 74200 },
  { date: '2026-01', price: 73800 },
  { date: '2026-02', price: 73500 },
  { date: '2026-03', price: 73000 },
  { date: '2026-04', price: 72500 },
  { date: '2026-05', price: 72500 }
];

const baselineRates = [
  { id: 'CAT-001', name: 'Dell Latitude 5420 Laptop', l1Vendor: 'ABC Infotech Private Limited', l1Rate: 72500, l2Vendor: 'Tech Solutions Pvt Ltd', l2Rate: 74000, l3Vendor: 'Apex Supplies', l3Rate: 75500 },
  { id: 'CAT-003', name: 'Ergonomic Office Chair', l1Vendor: 'Office Supplies Co', l1Rate: 8400, l2Vendor: 'Apex Supplies', l2Rate: 9100, l3Vendor: 'Global Traders', l3Rate: 9500 }
];

export const RatePriceReference: React.FC = () => {
  const [ratesList, setRatesList] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState('CAT-001');
  const [volume, setVolume] = useState('50');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const list = await getAllItems();
        const mappedList = list.map((item, idx) => {
          const match = baselineRates.find(r => r.id === item.itemId);
          if (match) return match;

          const l1Vendor = item.preferredVendor?.vendorName || 'ABC Infotech Private Limited';
          const l2Vendor = item.alternateVendors?.[0]?.vendorName || 'Tech Solutions Pvt Ltd';
          
          return {
            id: item.itemId || `ITM-${idx}`,
            name: item.itemName,
            l1Vendor,
            l1Rate: 75000,
            l2Vendor,
            l2Rate: 77000,
            l3Vendor: 'Apex Supplies',
            l3Rate: 79500
          };
        });
        setRatesList(mappedList);
        if (mappedList.length > 0) {
          setSelectedItemId(mappedList[0].id);
        }
      } catch (err) {
        console.error("Error loading rates list:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeRateObj = ratesList.find(r => r.id === selectedItemId);

  // Calculations
  const qty = parseInt(volume) || 0;
  const l1Total = activeRateObj ? activeRateObj.l1Rate * qty : 0;
  const l2Total = activeRateObj ? activeRateObj.l2Rate * qty : 0;
  const savings = l2Total - l1Total;
  const savingsPct = l2Total > 0 ? ((savings / l2Total) * 100).toFixed(1) : '0.0';

  if (loading || !activeRateObj) {
    return (
      <div className={styles.container}>
        <CatalogueHeader 
          title="RATE & PRICE REFERENCE INDEX" 
          subtitle="Compare approved L1/L2/L3 rates, audit historical pricing logs, and leverage AI negotiations"
        />
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading rate reference indexes...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <CatalogueHeader 
        title="RATE & PRICE REFERENCE INDEX" 
        subtitle="Compare approved L1/L2/L3 rates, audit historical pricing logs, and leverage AI negotiations"
      />

      <div className={styles.comparisonLayout}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Rate Directory Table */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>L1/L2/L3 Approved Rate Matrix</h3>
            
            <table className={styles.l1l2l3Table}>
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th>L1 Sourced Rate</th>
                  <th>L2 Sourced Rate</th>
                  <th>L3 Sourced Rate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ratesList.map(rate => (
                  <tr 
                    key={rate.id} 
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: selectedItemId === rate.id ? '#eaf2ff' : 'transparent',
                      borderLeft: selectedItemId === rate.id ? '4px solid var(--color-primary)' : 'none'
                    }}
                    onClick={() => setSelectedItemId(rate.id)}
                  >
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: '#0b1f5f' }}>{rate.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{rate.id}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--color-success)' }}>₹{rate.l1Rate.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{rate.l1Vendor} <span className={styles.badgeL1}>L1</span></div>
                    </td>
                    <td>
                      <div>₹{rate.l2Rate.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{rate.l2Vendor} <span className={styles.badgeL2}>L2</span></div>
                    </td>
                    <td>
                      <div>₹{rate.l3Rate.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{rate.l3Vendor} <span className={styles.badgeL3}>L3</span></div>
                    </td>
                    <td>
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); alert("Opening rate history audit logs..."); }}>
                        Logs
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Historical price trend chart */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Price History Trend Index (L1 Rate over 6 Months)</h3>
            <div style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceHistoryData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip formatter={(value: any) => value !== undefined && value !== null ? `₹${Number(value).toLocaleString('en-IN')}` : ''} />
                  <Area type="monotone" dataKey="price" stroke="#1D4ED8" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right pane: Interactive Sourcing Calculations & AI Negotiator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} style={{ color: 'var(--color-success)' }} />
                <span>Savings Calculator</span>
              </div>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Active Item</span>
                <div style={{ fontWeight: '700', color: '#0b1f5f', marginTop: '2px' }}>{activeRateObj.name}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#0b1f5f' }}>Estimated Order Quantity</label>
                <input 
                  type="number" 
                  className={styles.selectInput}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '6px' }}
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                />
              </div>

              <div style={{ borderTop: '1px dashed var(--color-border)', marginTop: '8px', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>L1 Total Billing</span>
                  <span style={{ fontWeight: '600', color: '#0b1f5f' }}>₹{l1Total.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>L2 Total Billing</span>
                  <span style={{ fontWeight: '600', color: '#0b1f5f' }}>₹{l2Total.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0b1f5f' }}>Procurement Savings</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-success)' }}>₹{savings.toLocaleString('en-IN')} ({savingsPct}%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.insightBox}>
            <div className={styles.insightHeader}>
              <BrainCircuit size={18} />
              <span>AI Sourcing Advisor</span>
            </div>
            <div className={styles.insightDesc}>
              <strong>ABC Infotech</strong> has historically accepted an extra 4% bulk discount for single volume orders exceeding 50 Laptops. 
              <br/><br/>
              <strong>Recommendation:</strong> Consolidate next month's requisition batch into a single order to trigger this rate discount scheme.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
