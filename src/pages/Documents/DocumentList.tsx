import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UploadCloud, Eye, Download, Trash2, Search, X } from 'lucide-react';
import clsx from 'clsx';
import { useDocumentFilters } from '../../context/DocumentFilterContext';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { DataTable } from '../../components/DataTable/DataTable';
import type { Column } from '../../components/DataTable/DataTable';
import styles from './DocumentList.module.css';

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
  uploadedBy: {
    userId: string;
    userName: string;
  };
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

export const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States from Context
  const { filters, setFilters, setFilterValue, resetFilters } = useDocumentFilters();
  const searchQuery = filters.search;
  const typeFilter = filters.documentType;
  const statusFilter = filters.status;

  const handleCardClick = (cardType: 'all' | 'expiring30' | 'expired' | 'pending' | 'rejected') => {
    if (cardType === 'all') {
      resetFilters();
    } else if (cardType === 'expiring30') {
      setFilters({
        selectedCard: 'expiring30',
        expiryFilter: 'all',
        status: 'Expiring in 30 Days',
        documentType: 'All',
        search: ''
      });
    } else if (cardType === 'expired') {
      setFilters({
        selectedCard: 'expired',
        expiryFilter: 'all',
        status: 'Expired Documents',
        documentType: 'All',
        search: ''
      });
    } else if (cardType === 'pending') {
      setFilters({
        selectedCard: 'pending',
        expiryFilter: 'all',
        status: 'Pending Verification',
        documentType: 'All',
        search: ''
      });
    } else if (cardType === 'rejected') {
      setFilters({
        selectedCard: 'rejected',
        expiryFilter: 'all',
        status: 'Rejected',
        documentType: 'All',
        search: ''
      });
    }
  };

  // Preview Modal State
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error('Error fetching VMS documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const calculateDaysRemaining = (expiryDateStr: string | null) => {
    if (!expiryDateStr) return null;
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

  const handleDeleteDoc = async (id: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete document ${id}?`)) {
      return;
    }
    try {
      await axios.delete(`/api/documents/${id}`);
      alert('Document deleted successfully.');
      fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document. Access restricted or file not found.');
    }
  };

  const handleOpenPreview = (doc: Document) => {
    setSelectedDoc(doc);
    setIsPreviewOpen(true);
  };

  // KPI calculations
  const totalDocsCount = documents.length;
  


  const pendingCount = documents.filter(doc => 
    (doc?.verificationStatus || doc?.status) === 'Pending Verification'
  ).length;

  const rejectedCount = documents.filter(doc => 
    (doc?.verificationStatus || doc?.status) === 'Rejected'
  ).length;

  // Filtered documents list
  const filteredDocs = documents.filter(doc => {
    const docName = doc?.documentName || doc?.fileName || '';
    const vendorName = doc?.vendor?.vendorName || '';
    const docId = doc?.documentId || doc?.id || '';
    const docNum = doc?.documentNumber || '';

    const matchesSearch = 
      docName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      docId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      docNum.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'All' || typeFilter === 'Document Type: All' || doc?.documentType === typeFilter;
    
    // Status filter matches
    let matchesStatus = false;

    // Expiry conditions
    const days = calculateDaysRemaining(doc?.expiryDate);
    const hasExpiredStatus = (doc?.verificationStatus || doc?.status) === 'Expired';
    const isExpiring30 = (days !== null && days >= 0 && days <= 30) && !hasExpiredStatus;
    const isExpired = (days !== null && days < 0) || hasExpiredStatus;

    if (statusFilter === 'All' || statusFilter === 'Status: All') {
      matchesStatus = true;
    } else if (statusFilter === 'Expiring in 30 Days') {
      matchesStatus = isExpiring30;
    } else if (statusFilter === 'Expired Documents') {
      matchesStatus = isExpired;
    } else {
      matchesStatus = (doc?.verificationStatus || doc?.status) === statusFilter;
    }

    return matchesSearch && matchesType && matchesStatus;
  });

  const columns: Column<Document>[] = [
    { header: 'Document ID', accessor: (row) => row?.documentId || row?.id || 'N/A' },
    { header: 'Document Name', accessor: (row) => row?.documentName || row?.fileName || 'N/A' },
    { header: 'Document Type', accessor: (row) => row?.documentType || 'Other' },
    { header: 'Vendor Name', accessor: (row) => row?.vendor?.vendorName || 'N/A' },
    { 
      header: 'Uploaded On', 
      accessor: (row) => row?.uploadedAt ? new Date(row.uploadedAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      }) : '-'
    },
    { header: 'Expiry Date', accessor: (row) => row?.expiryDate ? row.expiryDate : '-' },
    {
      header: 'Status',
      accessor: (row) => {
        const status = row?.verificationStatus || row?.status || 'Pending';
        if (status === 'Verified') return <span className={styles.statusVerified}>{status}</span>;
        if (status === 'Pending Verification') return <span className={styles.statusPending}>{status}</span>;
        if (status === 'Rejected') return <span className={styles.statusRejected}>{status}</span>;
        return <span className={styles.statusPending}>{status}</span>;
      }
    },
    {
      header: 'Actions',
      align: 'center',
      accessor: (row) => (
        <div className={styles.actionsCell}>
          <button 
            className={styles.actionBtn} 
            title="View Details & Preview" 
            onClick={() => handleOpenPreview(row)}
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
            className={styles.actionBtnTrash} 
            title="Delete Document" 
            onClick={() => handleDeleteDoc(row?.documentId || row?.id || '')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Document List</h1>
          <p className={styles.breadcrumbs}>Home / Documents / Document List</p>
        </div>
      </header>

      <div className={styles.kpiGrid}>
        <Card 
          className={clsx(styles.kpiCard, filters.selectedCard === 'all' && styles.kpiCardActive)}
          onClick={() => handleCardClick('all')}
          data-card="all"
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Documents</span>
            <div className={styles.kpiValue}>{totalDocsCount}</div>
          </div>
        </Card>



        <Card 
          className={clsx(styles.kpiCard, filters.selectedCard === 'pending' && styles.kpiCardActive)}
          onClick={() => handleCardClick('pending')}
          data-card="pending"
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Pending Verification</span>
            <div className={styles.kpiValue} style={{ color: '#0ea5e9' }}>{pendingCount}</div>
          </div>
        </Card>

        <Card 
          className={clsx(styles.kpiCard, filters.selectedCard === 'rejected' && styles.kpiCardActive)}
          onClick={() => handleCardClick('rejected')}
          data-card="rejected"
        >
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Rejected Documents</span>
            <div className={styles.kpiValue} style={{ color: '#dc2626' }}>{rejectedCount}</div>
          </div>
        </Card>
      </div>

      <Card className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <div className={styles.filters}>
            <div className={styles.searchWrap}>
              <Input 
                placeholder="Search by name, vendor, number..." 
                fullWidth={false} 
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setFilterValue('search', e.target.value)}
                leftIcon={<Search size={16} />}
              />
            </div>
            
            <select 
              className={styles.filterSelect}
              value={typeFilter}
              onChange={(e) => setFilterValue('documentType', e.target.value)}
            >
              <option value="All">Document Type: All</option>
              <option value="KYC Documents">KYC Documents</option>
              <option value="Tax Documents">Tax Documents</option>
              <option value="Legal Documents">Legal Documents</option>
              <option value="Financial Documents">Financial Documents</option>
              <option value="Compliance Documents">Compliance Documents</option>
              <option value="Others">Others</option>
              <option value="Other">Other</option>
            </select>

            <select 
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setFilterValue('status', e.target.value)}
            >
              <option value="All">Status: All</option>
              <option value="Verified">Verified</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Rejected">Rejected</option>
              <option value="Sent Back">Sent Back</option>
              <option value="Expiring in 30 Days">Expiring in 30 Days</option>
              <option value="Expired Documents">Expired Documents</option>
            </select>
          </div>
          
          <div className={styles.toolbarActions}>
            <Button onClick={() => navigate('/documents/upload')} icon={<UploadCloud size={16} />}>
              Upload Document
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading documents registry...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredDocs} 
            keyExtractor={(row) => row.documentId} 
          />
        )}
        
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            Showing {filteredDocs.length} of {documents.length} documents
          </span>
        </div>
      </Card>

      {/* Preview Modal */}
      {isPreviewOpen && selectedDoc && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Document Details - {selectedDoc.documentId}</h3>
              <button className={styles.closeBtn} onClick={() => setIsPreviewOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.detailCol}>
                <div className={styles.infoRow}>
                  <span>Document Name</span>
                  <strong>{selectedDoc.documentName}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Document Type / Category</span>
                  <strong>{selectedDoc.documentType} - {selectedDoc.documentCategory}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Vendor Mapping</span>
                  <strong>{selectedDoc.vendor.vendorName} ({selectedDoc.vendor.vendorId})</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Document Number</span>
                  <strong>{selectedDoc.documentNumber || 'N/A'}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Issued By</span>
                  <strong>{selectedDoc.issuedBy || 'N/A'}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Issue & Expiry Dates</span>
                  <strong>
                    Issue: {selectedDoc.issueDate || 'N/A'} | Expiry: {selectedDoc.expiryDate || 'N/A'}
                  </strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Verification Status</span>
                  <strong>{selectedDoc.verificationStatus}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Uploaded By</span>
                  <strong>{selectedDoc.uploadedBy?.userName} on {new Date(selectedDoc.uploadedAt).toLocaleString('en-IN')}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Remarks</span>
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded border">{selectedDoc.remarks || 'No remarks provided.'}</p>
                </div>
              </div>

              <div className={styles.previewCol}>
                {selectedDoc.fileDetails.fileType === 'application/pdf' ? (
                  <iframe 
                    src={`${selectedDoc.fileDetails.filePath}#toolbar=0`} 
                    title="Document PDF Preview" 
                    width="100%" 
                    height="100%" 
                    className="border-none"
                  />
                ) : (
                  <img 
                    src={selectedDoc.fileDetails.filePath} 
                    alt="Document Preview" 
                    className={styles.mockPanImg}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
