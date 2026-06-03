import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { CatalogueHeader } from './CatalogueHeader';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import styles from './VendorMapping.module.css';
import { getAllItems } from '../../services/itemMasterService';

interface MappedVendor {
  id: string;
  name: string;
  category: string;
  riskScore: number;
  capacity: string;
  leadTime: string;
  priceRef: string;
  isPreferred: boolean;
  isAvl: boolean;
}

const mockMappingDatabase: Record<string, MappedVendor[]> = {
  'CAT-001': [
    { id: 'VND-001', name: 'ABC Infotech Pvt Ltd', category: 'IT Sourcing', riskScore: 84, capacity: '200 Units/Mo', leadTime: '5 Days', priceRef: '₹72,500', isPreferred: true, isAvl: true },
    { id: 'VND-004', name: 'Tech Solutions Pvt Ltd', category: 'IT Sourcing', riskScore: 78, capacity: '150 Units/Mo', leadTime: '7 Days', priceRef: '₹74,000', isPreferred: false, isAvl: true }
  ],
  'CAT-002': [
    { id: 'VND-004', name: 'Tech Solutions Pvt Ltd', category: 'Cyber Security Audits', riskScore: 78, capacity: '5 Audits/Yr', leadTime: '14 Days', priceRef: '₹4,50,000', isPreferred: true, isAvl: true }
  ],
  'CAT-003': [
    { id: 'VND-005', name: 'Office Supplies Co', category: 'Office Infrastructure', riskScore: 92, capacity: '500 Chairs/Mo', leadTime: '3 Days', priceRef: '₹8,400', isPreferred: true, isAvl: true }
  ],
  'CAT-004': [
    { id: 'VND-002', name: 'Secure Facilities Ltd', category: 'Housekeeping Services', riskScore: 88, capacity: '50 Branches', leadTime: '2 Days', priceRef: '₹1,20,000/Mo', isPreferred: true, isAvl: true }
  ]
};

export const VendorMapping: React.FC = () => {
  const [selectedItemId, setSelectedItemId] = useState('CAT-001');
  const [mappings, setMappings] = useState<Record<string, MappedVendor[]>>({});
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchItem, setSearchItem] = useState('');

  useEffect(() => {
    async function loadItems() {
      try {
        setLoading(true);
        const list = await getAllItems();
        setItems(list);
        if (list.length > 0) {
          const firstId = list[0].itemId || '';
          setSelectedItemId(firstId);
        }
      } catch (err) {
        console.error("Error loading items in VendorMapping:", err);
      } finally {
        setLoading(false);
      }
    }
    loadItems();
  }, []);

  const currentItem = items.find(i => i.itemId === selectedItemId);
  
  // Resolve mapped vendors dynamically
  let currentVendors: MappedVendor[] = [];
  if (selectedItemId) {
    if (mappings[selectedItemId]) {
      currentVendors = mappings[selectedItemId];
    } else if (mockMappingDatabase[selectedItemId]) {
      currentVendors = mockMappingDatabase[selectedItemId];
    } else if (currentItem) {
      const pVendor = currentItem.preferredVendor;
      const altVendorsList = currentItem.alternateVendors || [];
      const dynamicList: MappedVendor[] = [];
      if (pVendor && pVendor.vendorId) {
        dynamicList.push({
          id: pVendor.vendorId,
          name: pVendor.vendorName,
          category: currentItem.category + ' Sourcing',
          riskScore: 85,
          capacity: '100 Units/Mo',
          leadTime: currentItem.expectedLeadTime || '7 Days',
          priceRef: '₹72,500',
          isPreferred: true,
          isAvl: true
        });
      }
      for (const alt of altVendorsList) {
        dynamicList.push({
          id: alt.vendorId || 'VND-ALT-01',
          name: alt.vendorName,
          category: currentItem.category + ' Sourcing',
          riskScore: 75,
          capacity: '50 Units/Mo',
          leadTime: currentItem.expectedLeadTime || '10 Days',
          priceRef: '₹74,000',
          isPreferred: false,
          isAvl: true
        });
      }
      currentVendors = dynamicList;
    }
  }

  const handleTogglePreferred = (vendorId: string) => {
    const updated = currentVendors.map(v => ({
      ...v,
      isPreferred: v.id === vendorId
    }));
    setMappings(prev => ({
      ...prev,
      [selectedItemId]: updated
    }));
  };

  const handleRemoveMapping = (vendorId: string) => {
    if (window.confirm("Are you sure you want to revoke this vendor's mapping from this item?")) {
      const updated = currentVendors.filter(v => v.id !== vendorId);
      setMappings(prev => ({
        ...prev,
        [selectedItemId]: updated
      }));
    }
  };

  const handleAddMappingSimulated = () => {
    const name = prompt("Enter vendor name to map to this item:\nOptions: 'Global Sourcing Corp', 'Apex Hardware Ltd'");
    if (!name) return;

    const newVendor: MappedVendor = {
      id: 'VND-' + Math.floor(Math.random() * 900 + 100),
      name: name,
      category: (currentItem?.category || 'General') + ' Supplies',
      riskScore: 70,
      capacity: '100 Units/Mo',
      leadTime: '10 Days',
      priceRef: '₹75,500',
      isPreferred: false,
      isAvl: true
    };

    setMappings(prev => ({
      ...prev,
      [selectedItemId]: [...currentVendors, newVendor]
    }));
  };

  const filteredItems = items.filter(item => 
    item.itemName.toLowerCase().includes(searchItem.toLowerCase()) || 
    (item.itemId && item.itemId.toLowerCase().includes(searchItem.toLowerCase()))
  );

  return (
    <div className={styles.container}>
      <CatalogueHeader 
        title="VENDOR TO ITEM/SERVICE MAPPING" 
        subtitle="Establish manufacturer relationships, verify approved vendor compliance logs, and set SLA defaults"
      />

      <div className={styles.mappingLayout}>
        {/* Left Side: Items & Services selection list */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>1. Select Catalogue Item / Service</h3>
          <input 
            type="text" 
            placeholder="Search catalog master..." 
            className={styles.searchBox}
            value={searchItem}
            onChange={(e) => setSearchItem(e.target.value)}
          />

          <div className={styles.itemList}>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                Loading catalogue items...
              </div>
            ) : filteredItems.map(item => {
              const itemType = (item.isService || item.category === 'Professional Services' || item.category === 'Logistics') ? 'Service' : 'Item';
              return (
                <div 
                  key={item.itemId} 
                  className={`${styles.itemRow} ${selectedItemId === item.itemId ? styles.itemRowActive : ''}`}
                  onClick={() => setSelectedItemId(item.itemId || '')}
                >
                  <div className={styles.itemDetails}>
                    <span className={styles.itemName}>{item.itemName}</span>
                    <span className={styles.itemMeta}>{item.itemId} • HSN/SAC: {item.hsnCode} • {item.category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: itemType === 'Item' ? '#eaf2ff' : '#f3e8ff', color: itemType === 'Item' ? '#1d4ed8' : '#7c3aed' }}>
                      {itemType}
                    </span>
                    <ArrowRight size={16} style={{ color: 'var(--color-primary)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Associated/Mapped Sourced Vendors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <span>2. Mapped Approved Vendors</span>
              <Button size="sm" icon={<Plus size={14} />} onClick={handleAddMappingSimulated}>
                Map Vendor
              </Button>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Showing mapped suppliers for <strong>{currentItem?.itemName || 'Selected Item'}</strong>
            </div>

            {currentVendors.length > 0 ? (
              <div className={styles.vendorList}>
                {currentVendors.map(vendor => (
                  <div 
                    key={vendor.id} 
                    className={`${styles.vendorCard} ${vendor.isPreferred ? styles.vendorCardPreferred : ''}`}
                  >
                    <div className={styles.vendorHeader}>
                      <div>
                        <span className={styles.vendorName}>{vendor.name}</span>
                        <div className={styles.vendorMeta}>{vendor.id} • {vendor.category}</div>
                      </div>
                      
                      <span className={`${styles.scoreBadge} ${vendor.riskScore >= 80 ? styles.badgeHigh : vendor.riskScore >= 60 ? styles.badgeMedium : styles.badgeLow}`}>
                        Score: {vendor.riskScore}/100
                      </span>
                    </div>

                    <div className={styles.vendorBody}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Capacity</span>
                        <span className={styles.statVal}>{vendor.capacity}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Lead Time</span>
                        <span className={styles.statVal}>{vendor.leadTime}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Ref Price</span>
                        <span className={styles.statVal}>{vendor.priceRef}</span>
                      </div>
                    </div>

                    <div className={styles.vendorActions}>
                      <span style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: 'auto', color: 'var(--color-success)', fontWeight: '600' }}>
                        <ShieldCheck size={14} /> Approved AVL
                      </span>

                      {!vendor.isPreferred ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          icon={<Check size={12} />}
                          onClick={() => handleTogglePreferred(vendor.id)}
                          style={{ borderColor: 'var(--color-success)', color: 'var(--color-success)' }}
                        >
                          Make Preferred
                        </Button>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ★ Preferred Vendor
                        </span>
                      )}

                      <Button 
                        size="sm" 
                        variant="ghost" 
                        icon={<Trash2 size={12} />} 
                        onClick={() => handleRemoveMapping(vendor.id)}
                        style={{ color: 'var(--color-danger)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-tertiary)', border: '1px dashed var(--color-border)', borderRadius: '8px' }}>
                <AlertTriangle size={24} style={{ margin: '0 auto 8px', color: 'var(--color-warning)' }} />
                <span>No approved vendors mapped to this item/service yet.</span>
              </div>
            )}
          </div>

          {/* Sourcing Insight Panel */}
          <Card style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Sparkles size={16} /> AI Multi-Sourcing Advice
            </h4>
            <p style={{ fontSize: '12px', color: '#1e3a8a', lineHeight: '1.4' }}>
              To align with RBI/NBFC outsourcing policy regulations, keep at least two approved suppliers mapped to business-critical IT hardware to prevent single-point dependency risks.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
