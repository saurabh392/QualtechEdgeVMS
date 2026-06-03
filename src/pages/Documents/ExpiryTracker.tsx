import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Bell, UploadCloud, Download, Eye, Search, X } from 'lucide-react';
import clsx from 'clsx';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { DataTable } from '../../components/DataTable/DataTable';
import type { Column } from '../../components/DataTable/DataTable';
import styles from './ExpiryTracker.module.css';

interface Document {
  documentId: string;
  documentType: string;
  documentName: string;
  documentCategory: string;
  vendor: {
    vendorId: string;
    vendorName: string;
  };
  documentNumber: string;
  issueDate: string | null;
  expiryDate: string | null;
  issuedBy: string;
  remarks: string;
  verificationStatus: string;
  approvalStatus: string;
  uploadedAt: string;
  fileDetails: {
    originalFileName: string;
    storedFileName: string;
    filePath: string;
    fileType: string;
    fileSizeKB: number;
    fileExtension: string;
  };
  // Optional compatibility fields for legacy / API uploads
  id?: string;
  fileName?: string;
  filePath?: string;
  fileType?: string;
  status?: string;
}

export const ExpiryTracker: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sync state from URL on load and changes
  useEffect(() => {
    const statusParam = searchParams.get('status') || 'all';
    if (statusParam === 'expired') {
      setSelectedCard('expired');
      setStatusFilter('expired');
    } else if (statusParam === 'expiring30') {
      setSelectedCard('expiring30');
      setStatusFilter('expiring30');
    } else if (statusParam === 'active') {
      setSelectedCard('active');
      setStatusFilter('active');
    } else {
      setSelectedCard('all');
      setStatusFilter('all');
    }
  }, [searchParams]);

  const handleCardClick = (cardType: 'all' | 'expired' | 'expiring30' | 'active') => {
    setSelectedCard(cardType);
    setStatusFilter(cardType);
    
    const params: Record<string, string> = {};
    if (cardType !== 'all') {
      params.status = cardType;
    }
    setSearchParams(params, { replace: true });
  };
  
  // Reminder Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [reminderSubject, setReminderSubject] = useState('');
  const [reminderBody, setReminderBody] = useState('');
  const [sendingReminder, setSendingReminder] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/documents');
      // Only show documents with expiry dates
      const docsWithExpiry = res.data.filter((doc: Document) => doc.expiryDate !== null && doc.expiryDate !== '');
      setDocuments(docsWithExpiry);
    } catch (err) {
      console.error('Error fetching documents for expiry tracker:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const calculateDaysRemaining = (expiryDateStr: string | null) => {
    if (!expiryDateStr) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let expiry: Date;
    if (expiryDateStr.includes('-')) {
      const parts = expiryDateStr.split('-');
      expiry = new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10)
      );
    } else if (expiryDateStr.includes('/')) {
      const parts = expiryDateStr.split('/');
      if (parts[0].length === 4) {
        expiry = new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10)
        );
      } else {
        expiry = new Date(
          parseInt(parts[2], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[0], 10)
        );
      }
    } else {
      expiry = new Date(expiryDateStr);
      expiry.setHours(0, 0, 0, 0);
    }

    const diffTime = expiry.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatus = (daysRemaining: number) => {
    if (daysRemaining < 0) return 'Expired';
    if (daysRemaining <= 30) return 'Expiring Soon';
    return 'Active';
  };

  // KPIs
  const totalMonitored = documents.length;
  const expiredDocs = documents.filter(doc => calculateDaysRemaining(doc.expiryDate) < 0);
  const expiringSoonDocs = documents.filter(doc => {
    const days = calculateDaysRemaining(doc.expiryDate);
    return days >= 0 && days <= 30;
  });
  const activeDocs = documents.filter(doc => calculateDaysRemaining(doc.expiryDate) > 30);

  // Filters & Search
  const filteredDocuments = documents.filter(doc => {
    const days = calculateDaysRemaining(doc?.expiryDate);
    
    // Status matching
    let matchesStatus = false;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'expired') {
      matchesStatus = days !== null && days < 0;
    } else if (statusFilter === 'expiring30') {
      matchesStatus = days !== null && days >= 0 && days <= 30;
    } else if (statusFilter === 'active') {
      matchesStatus = days !== null && days > 30;
    }

    const docName = doc?.documentName || doc?.fileName || '';
    const vendorName = doc?.vendor?.vendorName || '';
    const docId = doc?.documentId || doc?.id || '';
    const docNum = doc?.documentNumber || '';

    const matchesSearch = 
      docName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      docId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      docNum.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleOpenReminder = (doc: Document) => {
    setSelectedDoc(doc);
    const days = calculateDaysRemaining(doc.expiryDate);
    const status = getExpiryStatus(days);
    
    setReminderSubject(`URGENT: Renewal required for ${doc.documentName} - Qualtech Edge VMS`);
    setReminderBody(
      `Dear Team,\n\nThis is a compliance reminder that your document "${doc.documentName}" (No: ${doc.documentNumber || 'N/A'}) registered with Qualtech Edge VMS is currently ${status === 'Expired' ? 'EXPIRED' : 'EXPIRING SOON'} (Expiry Date: ${doc.expiryDate}).\n\nPlease login to the Vendor Portal and upload the latest renewed copy to ensure compliance.\n\nRegards,\nProcurement Compliance Team\nQualtech Edge VMS`
    );
    setIsModalOpen(true);
  };

  const handleSendReminder = async () => {
    if (!selectedDoc) return;
    setSendingReminder(true);
    try {
      // Simulate API call to send notification
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Renewal reminder notification successfully dispatched to ${selectedDoc.vendor.vendorName}.`);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error sending reminder:', err);
    } finally {
      setSendingReminder(false);
    }
  };

  const columns: Column<Document>[] = [
    { header: 'Document ID', accessor: (row) => row?.documentId || row?.id || 'N/A' },
    { header: 'Document Name', accessor: (row) => row?.documentName || row?.fileName || 'N/A' },
    { header: 'Vendor Name', accessor: (row) => row?.vendor?.vendorName || 'N/A' },
    { header: 'Expiry Date', accessor: (row) => row?.expiryDate || 'N/A' },
    {
      header: 'Days Remaining',
      accessor: (row) => {
        const days = calculateDaysRemaining(row?.expiryDate);
        if (days < 0) {
          return <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>Expired ({Math.abs(days)} days ago)</span>;
        }
        if (days <= 30) {
          return <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>{days} days left</span>;
        }
        return <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>{days} days left</span>;
      }
    },
    {
      header: 'Status',
      accessor: (row) => {
        const days = calculateDaysRemaining(row?.expiryDate);
        const status = getExpiryStatus(days);
        if (status === 'Expired') return <span className={styles.statusExpired}>Expired</span>;
        if (status === 'Expiring Soon') return <span className={styles.statusExpiring}>Expiring Soon</span>;
        return <span className={styles.statusActive}>Active</span>;
      }
    },
    {
      header: 'Actions',
      align: 'center',
      accessor: (row) => (
        <div className={styles.actionsCell}>
          <button 
            className={styles.actionBtn} 
            title="Preview Document"
            onClick={() => window.open(row?.fileDetails?.filePath || row?.filePath || '#', '_blank')}
          >
            <Eye size={16} />
          </button>
          <a 
            href={row?.fileDetails?.filePath || row?.filePath || '#'} 
            download={row?.fileDetails?.originalFileName || row?.fileName || 'file'}
            className={styles.actionBtn}
            title="Download Document"
          >
            <Download size={16} />
          </a>
          <button 
            className={styles.actionBtn} 
            title="Send Renewal Reminder"
            onClick={() => handleOpenReminder(row)}
          >
            <Bell size={16} />
          </button>
          <button 
            className={styles.actionBtn} 
            title="Re-upload / Replace"
            onClick={() => navigate('/documents/upload')}
          >
            <UploadCloud size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Expiry Tracker</h1>
          <p className={styles.breadcrumbs}>Home / Documents / Expiry Tracker</p>
        </div>
      </header>

      <div className={styles.kpiGrid}>
        <Card 
          className={clsx(styles.kpiCard, selectedCard === 'all' && styles.kpiCardActive)}
          onClick={() => handleCardClick('all')}
          data-card="all"
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Monitored Documents</span>
            <div className={styles.kpiValue}>{totalMonitored}</div>
          </div>
        </Card>

        <Card 
          className={clsx(styles.kpiCard, selectedCard === 'expired' && styles.kpiCardActive)}
          onClick={() => handleCardClick('expired')}
          data-card="expired"
          style={{ borderLeft: '4px solid var(--color-danger)' }}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Expired Documents</span>
            <div className={styles.kpiValue} style={{ color: 'var(--color-danger)' }}>{expiredDocs.length}</div>
          </div>
        </Card>

        <Card 
          className={clsx(styles.kpiCard, selectedCard === 'expiring30' && styles.kpiCardActive)}
          onClick={() => handleCardClick('expiring30')}
          data-card="expiring30"
          style={{ borderLeft: '4px solid var(--color-warning)' }}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Expiring in 30 Days</span>
            <div className={styles.kpiValue} style={{ color: 'var(--color-warning)' }}>{expiringSoonDocs.length}</div>
          </div>
        </Card>

        <Card 
          className={clsx(styles.kpiCard, selectedCard === 'active' && styles.kpiCardActive)}
          onClick={() => handleCardClick('active')}
          data-card="active"
          style={{ borderLeft: '4px solid var(--color-success)' }}
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Active compliance documents</span>
            <div className={styles.kpiValue} style={{ color: 'var(--color-success)' }}>{activeDocs.length}</div>
          </div>
        </Card>
      </div>

      <Card className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <div className={styles.filters}>
            <div className={styles.searchWrap}>
              <Input 
                placeholder="Search by vendor name, document..." 
                fullWidth={false}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                leftIcon={<Search size={16} />}
              />
            </div>

            <select 
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => handleCardClick(e.target.value as any)}
            >
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="expiring30">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className={styles.toolbarActions}>
            <Button onClick={() => navigate('/documents/upload')} icon={<UploadCloud size={16} />}>
              Upload Document
            </Button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading Expiry Tracker matrix...
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredDocuments} 
            keyExtractor={(row) => row.documentId}
          />
        )}

        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            Showing {filteredDocuments.length} of {documents.length} tracked records
          </span>
        </div>
      </Card>

      {/* Reminder Modal */}
      {isModalOpen && selectedDoc && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Send Renewal Notification</h3>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.reminderDetails}>
                <div className={styles.reminderField}>
                  <label>Recipient Vendor</label>
                  <input type="text" value={selectedDoc.vendor.vendorName} readOnly style={{ background: '#f1f5f9' }} />
                </div>
                <div className={styles.reminderField}>
                  <label>Subject</label>
                  <input 
                    type="text" 
                    value={reminderSubject} 
                    onChange={(e) => setReminderSubject(e.target.value)} 
                  />
                </div>
                <div className={styles.reminderField}>
                  <label>Message Content</label>
                  <textarea 
                    rows={6} 
                    value={reminderBody} 
                    onChange={(e) => setReminderBody(e.target.value)} 
                  />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSendReminder} disabled={sendingReminder}>
                {sendingReminder ? 'Sending...' : 'Send Reminder'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
