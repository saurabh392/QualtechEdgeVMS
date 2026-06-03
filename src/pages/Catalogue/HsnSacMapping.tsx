import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  AlertTriangle, 
  RefreshCw,
  Sparkles,
  Calculator
} from 'lucide-react';
import { CatalogueHeader } from './CatalogueHeader';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import styles from './HsnSacMapping.module.css';
import { getAllItems } from '../../services/itemMasterService';

interface HsnCode {
  code: string;
  type: 'HSN' | 'SAC';
  description: string;
  category: string;
  cgst: number;
  sgst: number;
  igst: number;
  status: string;
}

export const HsnSacMapping: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [catItems, setCatItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tax simulator states
  const [simPrice, setSimPrice] = useState('50000');
  const [selectedHsn, setSelectedHsn] = useState('84713010');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const list = await getAllItems();
        setCatItems(list);
      } catch (err) {
        console.error("Error loading catalogue items in HsnSacMapping:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const hsnCodes: HsnCode[] = [
    { code: '84713010', type: 'HSN', description: 'Personal Laptops, notebooks and tablet computers', category: 'IT Hardware', cgst: 9, sgst: 9, igst: 18, status: 'Active' },
    { code: '998713', type: 'SAC', description: 'Cyber security consulting and auditing services', category: 'Professional Services', cgst: 9, sgst: 9, igst: 18, status: 'Active' },
    { code: '94033000', type: 'HSN', description: 'Wooden office furniture and partitions', category: 'Office Supplies', cgst: 9, sgst: 9, igst: 18, status: 'Active' },
    { code: '998533', type: 'SAC', description: 'Cleaning, sanitation and facility upkeep services', category: 'Facility Management', cgst: 9, sgst: 9, igst: 18, status: 'Active' },
    { code: '48025610', type: 'HSN', description: 'Standard printing office sheets (A4 size)', category: 'Office Supplies', cgst: 6, sgst: 6, igst: 12, status: 'Active' },
    { code: '998511', type: 'SAC', description: 'Road transport, logistics hauling and carriage', category: 'Logistics', cgst: 2.5, sgst: 2.5, igst: 5, status: 'Active' }
  ];

  const handleAddCodeSimulated = () => {
    alert("Triggering GSTN API mapping wizard...");
  };

  // Tax Calculations
  const activeHsnObj = hsnCodes.find(h => h.code === selectedHsn) || hsnCodes[0];
  const unitPrice = parseFloat(simPrice) || 0;
  const calculatedCgst = (unitPrice * activeHsnObj.cgst) / 100;
  const calculatedSgst = (unitPrice * activeHsnObj.sgst) / 100;
  const calculatedIgst = (unitPrice * activeHsnObj.igst) / 100;
  const totalBilling = unitPrice + calculatedIgst;

  const filteredCodes = hsnCodes.filter(c => 
    c.code.includes(searchTerm) || 
    c.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <CatalogueHeader 
        title="HSN & SAC CODE TAX MAPPING" 
        subtitle="Manage government GST tables, assign corporate tax slabs, and run interactive billing compliance tests"
        actions={
          <Button variant="outline" icon={<RefreshCw size={16} />} onClick={() => alert("Syncing with government GST portal database...")}>Sync GST Portal</Button>
        }
      />

      {/* Compliance Notice */}
      <div className={styles.alertBox}>
        <AlertTriangle size={20} style={{ color: '#b45309', flexShrink: 0 }} />
        <div className={styles.alertText}>
          <strong>GST Compliance Alert:</strong> The Central Board of Indirect Taxes and Customs (CBIC) has amended rates for SAC 9987IT services. Tax rates are auto-synced and locked at 18% IGST.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left pane: HSN Code list */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <span className={styles.title}>Corporate Tax Directory</span>
            <div style={{ display: 'flex', gap: '12px', flexGrow: 1, maxWidth: '360px' }}>
              <input 
                type="text" 
                placeholder="Search codes, categories..." 
                className={styles.selectInput}
                style={{ width: '100%' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button size="sm" icon={<Plus size={14} />} onClick={handleAddCodeSimulated}>Add Code</Button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Code</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Description</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'center' }}>CGST</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'center' }}>SGST</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'center' }}>IGST</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCodes.map(codeObj => (
                  <tr key={codeObj.code} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: '600', color: 'var(--color-primary)' }}>{codeObj.code}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: codeObj.type === 'HSN' ? '#f0fdf4' : '#eff6ff', color: codeObj.type === 'HSN' ? '#15803d' : '#1d4ed8' }}>
                        {codeObj.type}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{codeObj.description}</td>
                    <td style={{ padding: '10px 12px' }}>{codeObj.category}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '500' }}>{codeObj.cgst}%</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '500' }}>{codeObj.sgst}%</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: '#0b1f5f' }}>{codeObj.igst}%</td>
                    <td style={{ padding: '10px 12px', color: 'var(--color-success)', fontWeight: '600' }}>✓ {codeObj.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right pane: Interactive GST Tax Calculator Simulator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className={styles.taxCard}>
            <div className={styles.taxHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calculator size={18} style={{ color: 'var(--color-primary)' }} />
                <span>Interactive GST Simulator</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#0b1f5f' }}>Select HSN/SAC Code</label>
                <select 
                  className={styles.selectInput}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '6px' }}
                  value={selectedHsn}
                  onChange={(e) => setSelectedHsn(e.target.value)}
                >
                  {hsnCodes.map(h => (
                    <option key={h.code} value={h.code}>{h.code} - {h.category}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#0b1f5f' }}>Unit Base Price (INR)</label>
                <input 
                  type="number" 
                  className={styles.selectInput}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '6px' }}
                  value={simPrice}
                  onChange={(e) => setSimPrice(e.target.value)}
                />
              </div>

              <div style={{ borderTop: '1px dashed var(--color-border)', marginTop: '8px', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className={styles.taxRow}>
                  <span className={styles.taxLabel}>Base Price</span>
                  <span className={styles.taxVal}>₹{unitPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.taxRow}>
                  <span className={styles.taxLabel}>CGST ({activeHsnObj.cgst}%)</span>
                  <span className={styles.taxVal}>₹{calculatedCgst.toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.taxRow}>
                  <span className={styles.taxLabel}>SGST ({activeHsnObj.sgst}%)</span>
                  <span className={styles.taxVal}>₹{calculatedSgst.toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.taxRow}>
                  <span className={styles.taxLabel}>IGST ({activeHsnObj.igst}%)</span>
                  <span className={styles.taxVal}>₹{calculatedIgst.toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.taxRow} style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                  <span className={styles.taxLabel} style={{ fontWeight: '700', color: '#0b1f5f' }}>Total Invoice Price</span>
                  <span className={styles.taxVal} style={{ fontSize: '16px', fontWeight: '700', color: '#16a34a' }}>₹{totalBilling.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          <Card style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Sparkles size={16} /> AI Audit Compliance
            </h4>
            <p style={{ fontSize: '12px', color: '#1e3a8a', lineHeight: '1.4' }}>
              Tax mapping matches 100% of GSTN database files. HSN codes mapped to IT hardware pass statutory GST ledger checks.
            </p>
          </Card>
        </div>
      </div>

      {/* Catalogue Items Tax Mappings */}
      <div className={styles.tableCard} style={{ marginTop: '24px' }}>
        <div className={styles.tableHeader}>
          <span className={styles.title}>Catalogue Item Tax Mappings</span>
          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}>
            {catItems.length} Mapped
          </span>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Item ID</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Item Name</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>HSN/SAC Code</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Tax Slab</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    Loading tax mappings...
                  </td>
                </tr>
              ) : catItems.map(item => (
                <tr key={item.itemId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: '600', color: 'var(--color-primary)' }}>{item.itemId}</td>
                  <td style={{ padding: '10px 12px', fontWeight: '500' }}>{item.itemName}</td>
                  <td style={{ padding: '10px 12px' }}>{item.category}</td>
                  <td style={{ padding: '10px 12px', fontWeight: '600', color: '#0b1f5f' }}>{item.hsnCode || 'N/A'}</td>
                  <td style={{ padding: '10px 12px', fontWeight: '600', color: 'var(--color-success)' }}>{item.taxCode || item.taxCategory || 'GST 18%'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: item.status === 'Published' ? '#f0fdf4' : '#fff7ed', color: item.status === 'Published' ? '#15803d' : '#c2410c' }}>
                      {item.status || 'Pending Approval'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
