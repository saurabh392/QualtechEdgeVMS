import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { DataTable } from '../../components/DataTable/DataTable';
import { getRenewalContracts, renewContract } from '../../services/contractService';
import type { RenewalRecord } from '../../services/contractService';
import styles from './Renewals.module.css';

export const Renewals: React.FC = () => {
  const navigate = useNavigate();
  const [renewals, setRenewals] = useState<RenewalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedRenewal, setSelectedRenewal] = useState<RenewalRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newExpiryDate, setNewExpiryDate] = useState('2029-05-31');
  const [renewLoading, setRenewLoading] = useState(false);

  const loadRenewals = async () => {
    try {
      setLoading(true);
      const list = await getRenewalContracts();
      setRenewals(list);
    } catch (err) {
      console.error('Failed to load renewals data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRenewals();
  }, []);

  const handleNotifyOwner = (row: RenewalRecord) => {
    toast.success(`Renewal notification email successfully sent to ${row.owner} for Contract ${row.contractId}.`);
  };

  const handleInitiateRenewal = (row: RenewalRecord) => {
    setSelectedRenewal(row);
    try {
      const currentExp = new Date(row.expiryDate);
      const nextYear = new Date(currentExp.setFullYear(currentExp.getFullYear() + 1));
      setNewExpiryDate(nextYear.toISOString().split('T')[0]);
    } catch {
      setNewExpiryDate('2029-05-31');
    }
    setShowModal(true);
  };

  const executeRenewal = async () => {
    if (!selectedRenewal) return;
    setRenewLoading(true);
    try {
      const res = await renewContract(selectedRenewal.contractId, newExpiryDate);
      if (res.success) {
        toast.success(`Contract ${selectedRenewal.contractId} successfully renewed to ${newExpiryDate}.`);
        setShowModal(false);
        await loadRenewals();
      } else {
        toast.error(res.message || 'Failed to renew contract.');
      }
    } catch (err) {
      toast.error('Failed to renew contract: ' + (err as Error).message);
    } finally {
      setRenewLoading(false);
    }
  };

  const columns = [
    { header: 'Contract ID', accessor: 'contractId' as keyof RenewalRecord },
    { header: 'Vendor Name', accessor: 'vendorName' as keyof RenewalRecord },
    { header: 'Contract Type', accessor: 'contractType' as keyof RenewalRecord },
    { header: 'Expiry Date', accessor: 'expiryDate' as keyof RenewalRecord },
    { header: 'Owner', accessor: 'owner' as keyof RenewalRecord },
    { 
      header: 'Action / Status', 
      accessor: (row: any) => {
        let variant: 'success' | 'warning' | 'info' | 'default' = 'default';
        if (row.status === 'Auto-Renew') variant = 'success';
        if (row.status === 'In Review') variant = 'warning';
        if (row.status === 'Pending') variant = 'info';
        if (row.status === 'Renewed') variant = 'success';
        return <Badge variant={variant}>{row.status}</Badge>;
      }
    },
    {
      header: 'Operations',
      align: 'center' as const,
      accessor: (row: RenewalRecord) => (
        <div className={styles.actionsCell}>
          <Button 
            variant="outline" 
            size="sm" 
            icon={<Send size={12} />} 
            onClick={() => handleNotifyOwner(row)}
            title="Notify Owner"
          >
            Notify
          </Button>
          <Button 
            size="sm" 
            icon={<RefreshCw size={12} />} 
            onClick={() => handleInitiateRenewal(row)}
            title="Initiate Renewal"
            disabled={row.status === 'Renewed'}
          >
            Initiate
          </Button>
        </div>
      )
    }
  ];

  const expiringCount = renewals.filter(r => r.status === 'Pending').length;

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Renewals Tracker</h1>
          <p className={styles.breadcrumbs}>Home / Contracts / Renewals</p>
        </div>
      </header>

      {expiringCount > 0 && (
        <Card className={styles.alertCard}>
          <AlertTriangle size={24} className={styles.alertIcon} />
          <div className={styles.alertContent}>
            <h3>Attention Needed: {expiringCount} Expiries Pending Action</h3>
            <p>There are {expiringCount} active contracts expiring in the next 30 days. Please trigger renewal alerts or execute amendments to avoid compliance gap issues.</p>
          </div>
        </Card>
      )}

      <Card className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3>Contract Renewal Pipeline</h3>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Loading expiring contracts list...
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={renewals} 
            keyExtractor={(row) => row.contractId} 
          />
        )}
      </Card>

      {showModal && selectedRenewal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden'
          }}>
            <header style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Initiate Contract Renewal</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '24px', padding: 0, lineHeight: 1 }}
              >
                &times;
              </button>
            </header>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Contract ID</span>
                <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>{selectedRenewal.contractId}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Vendor</span>
                <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>{selectedRenewal.vendorName}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Current Expiry Date</span>
                <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>{selectedRenewal.expiryDate}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>New Expiry Date <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="date"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    width: '100%'
                  }}
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <footer style={{
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              backgroundColor: '#f8fafc'
            }}>
              <Button variant="ghost" onClick={() => setShowModal(false)} disabled={renewLoading}>Cancel</Button>
              <Button onClick={executeRenewal} disabled={renewLoading}>
                {renewLoading ? 'Renewing...' : 'Confirm Renewal'}
              </Button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
