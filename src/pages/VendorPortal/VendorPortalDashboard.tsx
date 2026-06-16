import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Send, 
  HelpCircle, 
  Download, 
  Eye, 
  Lock, 
  ArrowRight,
  Bell
} from 'lucide-react';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import {
  getVendorDashboard,
  getVendorProfile,
  updateVendorProfile,
  getVendorKyc,
  updateVendorKyc,
  getVendorDocuments,
  uploadVendorDocument,
  getVendorPOs,
  acknowledgePO,
  getVendorInvoices,
  submitVendorInvoice,
  getVendorPayments,
  getVendorContracts,
  getVendorTickets,
  submitVendorTicket,
  getVendorNotifications,
  markNotificationsRead
} from '../../services/vendorPortalService';
import type {
  VendorProfile,
  VendorKyc,
  VendorDocument,
  VendorPO,
  VendorInvoice,
  VendorPayment,
  VendorContract,
  VendorTicket,
  VendorNotification,
  VendorDashboardStats
} from '../../services/vendorPortalService';
import styles from './VendorPortalDashboard.module.css';

export const VendorPortalDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading and active states
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'pos' | 'invoices' | 'queries' | 'kyc' | 'contracts' | 'profile'>('overview');
  const [loading, setLoading] = useState(false);

  // Backend state arrays
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [kyc, setKyc] = useState<VendorKyc | null>(null);
  const [documents, setDocuments] = useState<VendorDocument[]>([]);
  const [pos, setPos] = useState<VendorPO[]>([]);
  const [invoices, setInvoices] = useState<VendorInvoice[]>([]);
  const [payments, setPayments] = useState<VendorPayment[]>([]);
  const [contracts, setContracts] = useState<VendorContract[]>([]);
  const [queries, setQueries] = useState<VendorTicket[]>([]);
  const [notifications, setNotifications] = useState<VendorNotification[]>([]);
  const [dashboardStats, setDashboardStats] = useState<VendorDashboardStats | null>(null);

  // Forms state
  const [profileForm, setProfileForm] = useState({ vendorName: '', email: '', phone: '', address: '', contactPerson: '' });
  const [kycForm, setKycForm] = useState({ gstNumber: '', panNumber: '', msmeNumber: '' });
  const [newDocForm, setNewDocForm] = useState({ documentType: 'Tax Registration', documentName: '', expiryDate: '' });
  const [queryForm, setQueryForm] = useState({ subject: '', category: 'Finance & Tax', message: '' });
  const [invoiceForm, setInvoiceForm] = useState({ invoiceNo: '', poId: '', amount: '', file: '' });

  // Modal display states
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFileDoc, setSelectedFileDoc] = useState<VendorDocument | null>(null);

  // Central Load Data function
  const loadData = async () => {
    try {
      const statsData = await getVendorDashboard();
      setDashboardStats(statsData);

      const profileData = await getVendorProfile();
      setProfile(profileData);
      setProfileForm({
        vendorName: profileData.vendorName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        contactPerson: profileData.contactPerson || ''
      });

      const kycData = await getVendorKyc();
      setKyc(kycData);
      setKycForm({
        gstNumber: kycData.gstNumber || '',
        panNumber: kycData.panNumber || '',
        msmeNumber: kycData.msmeNumber || ''
      });

      const docsData = await getVendorDocuments();
      setDocuments(docsData);

      const posData = await getVendorPOs();
      setPos(posData);

      const invoicesData = await getVendorInvoices();
      setInvoices(invoicesData);

      const paymentsData = await getVendorPayments();
      setPayments(paymentsData);

      const contractsData = await getVendorContracts();
      setContracts(contractsData);

      const ticketsData = await getVendorTickets();
      setQueries(ticketsData);

      const notifsData = await getVendorNotifications();
      setNotifications(notifsData);
    } catch (err) {
      console.error("Failed to load vendor portal data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (tabParam && ['overview', 'documents', 'pos', 'invoices', 'queries', 'kyc', 'contracts', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  // Operations Handlers
  const handleAcknowledgePO = async (poId: string) => {
    try {
      const res = await acknowledgePO(poId);
      if (res.success) {
        alert(`Purchase Order ${poId} acknowledged successfully. Sourcing manager notified.`);
        await loadData();
      }
    } catch (err) {
      alert("Failed to acknowledge Purchase Order: " + (err as Error).message);
    }
  };

  const handleDocUploadTrigger = (doc: VendorDocument) => {
    setSelectedFileDoc(doc);
    setShowUploadModal(true);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.[0]) {
      alert("Please select a file to upload.");
      return;
    }
    const file = fileInputRef.current.files[0];
    const type = selectedFileDoc ? selectedFileDoc.documentType : newDocForm.documentType;
    const name = selectedFileDoc ? selectedFileDoc.documentName : newDocForm.documentName || file.name;
    const expiry = selectedFileDoc ? selectedFileDoc.expiryDate : newDocForm.expiryDate || null;
    const docId = selectedFileDoc ? selectedFileDoc.documentId : undefined;

    setLoading(true);
    try {
      const res = await uploadVendorDocument(file, type, name, expiry, docId);
      if (res.success) {
        alert("Document uploaded and verified successfully.");
        setShowUploadModal(false);
        setSelectedFileDoc(null);
        setNewDocForm({ documentType: 'Tax Registration', documentName: '', expiryDate: '' });
        await loadData();
      }
    } catch (err) {
      alert("Failed to upload document: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.invoiceNo || !invoiceForm.poId || !invoiceForm.amount) {
      alert("Please fill in all details.");
      return;
    }
    setLoading(true);
    try {
      const res = await submitVendorInvoice(invoiceForm.invoiceNo, invoiceForm.poId, parseFloat(invoiceForm.amount));
      if (res.success) {
        alert("Invoice submitted successfully! Extracted through automated AI OCR pipeline. Status: Paid.");
        setShowInvoiceModal(false);
        setInvoiceForm({ invoiceNo: '', poId: '', amount: '', file: '' });
        await loadData();
      }
    } catch (err) {
      alert("Failed to submit invoice: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryForm.subject || !queryForm.message) {
      alert("Please fill out the ticket form.");
      return;
    }
    try {
      const res = await submitVendorTicket(queryForm.category, queryForm.subject, queryForm.message);
      if (res.success) {
        alert(`Support ticket ${res.ticket.ticketId} registered. Assigned to Procurement Helpdesk agent.`);
        setQueryForm({ subject: '', category: 'Finance & Tax', message: '' });
        await loadData();
      }
    } catch (err) {
      alert("Failed to raise ticket: " + (err as Error).message);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await updateVendorProfile(profileForm);
      if (res) {
        alert("Company Profile contact information updated successfully.");
        await loadData();
      }
    } catch (err) {
      alert("Failed to update profile: " + (err as Error).message);
    }
  };

  const handleKycUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await updateVendorKyc(kycForm);
      if (res) {
        alert("KYC registration numbers updated and verified.");
        await loadData();
      }
    } catch (err) {
      alert("Failed to update KYC: " + (err as Error).message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead();
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadFile = (fileName: string) => {
    alert(`Downloading original file copy: ${fileName}`);
  };

  const handleShowDemoAlert = () => {
    alert("Demo Feature – External API Integration Pending");
  };

  return (
    <div className={styles.container}>
      {/* Header alert */}
      <div className={styles.portalBanner}>
        <div className={styles.bannerContent}>
          <div className={styles.bannerTitle}>
            <span>Vendor Self-Service Portal</span>
            <Badge variant="success">{profile?.status || "Verified Partner"}</Badge>
          </div>
          <p className={styles.bannerSubtitle}>Logged in as: <strong>{profile?.vendorName || "Acme Cloud Solutions Pvt Ltd"} ({profile?.vendorId || "VND-001"})</strong></p>
        </div>
        <div className={styles.orgBadge}>
          <Lock size={16} /> Qualtech Edge Bank Security Node
        </div>
      </div>

      {/* Tabs list */}
      <div className={styles.tabBar}>
        <button className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`${styles.tabBtn} ${activeTab === 'documents' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('documents')}>Documents & Verification</button>
        <button className={`${styles.tabBtn} ${activeTab === 'kyc' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('kyc')}>KYC Registration</button>
        <button className={`${styles.tabBtn} ${activeTab === 'contracts' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('contracts')}>Contracts & SLAs</button>
        <button className={`${styles.tabBtn} ${activeTab === 'pos' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('pos')}>Purchase Orders ({pos.filter(po => po.status === 'Pending Acknowledgement' || po.status === 'Pending Acknowledgment').length})</button>
        <button className={`${styles.tabBtn} ${activeTab === 'invoices' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('invoices')}>Invoices & Payments</button>
        <button className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('profile')}>Profile Details</button>
        <button className={`${styles.tabBtn} ${activeTab === 'queries' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('queries')}>Helpdesk Queries</button>
      </div>

      {/* TAB CONTENTS: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className={styles.tabContent}>
          <div className={styles.kpiGrid}>
            <Card className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <div>
                  <span className={styles.kpiLabel}>Pending POs Radhe</span>
                  <div className={styles.kpiValue} style={{ color: '#F59E0B' }}>
                    {dashboardStats?.pendingPOs || 0} Orders
                  </div>
                </div>
                <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
                  <Clock size={24} />
                </div>
              </div>
              <span className={styles.kpiTrend}>Requires acknowledgement</span>
            </Card>

            <Card className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <div>
                  <span className={styles.kpiLabel}>Paid Invoices</span>
                  <div className={styles.kpiValue} style={{ color: '#16A34A' }}>
                    {dashboardStats?.paidInvoices || 0} Paid
                  </div>
                </div>
                <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                  <CheckCircle size={24} />
                </div>
              </div>
              <span className={styles.kpiTrend}>Cleared via automated pipeline</span>
            </Card>

            <Card className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <div>
                  <span className={styles.kpiLabel}>Compliance Health</span>
                  <div className={styles.kpiValue} style={{ color: dashboardStats?.expiredDocuments && dashboardStats.expiredDocuments > 0 ? '#dc2626' : '#16a34a' }}>
                    {dashboardStats?.expiredDocuments || 0} Expired
                  </div>
                </div>
                <div className={styles.kpiIconWrapper} style={{ backgroundColor: dashboardStats?.expiredDocuments && dashboardStats.expiredDocuments > 0 ? '#fee2e2' : '#dcfce7', color: dashboardStats?.expiredDocuments && dashboardStats.expiredDocuments > 0 ? '#dc2626' : '#16a34a' }}>
                  <AlertTriangle size={24} />
                </div>
              </div>
              <span className={styles.kpiTrend}>Renewals required immediately</span>
            </Card>

            <Card className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <div>
                  <span className={styles.kpiLabel}>Active Tickets</span>
                  <div className={styles.kpiValue} style={{ color: '#1d4ed8' }}>
                    {dashboardStats?.activeTickets || 0} Open
                  </div>
                </div>
                <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                  <HelpCircle size={24} />
                </div>
              </div>
              <span className={styles.kpiTrend}>Procurement response pending</span>
            </Card>
          </div>

          <div className={styles.overviewGrid}>
            <Card className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Latest Purchase Orders</span>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('pos')}>View All <ArrowRight size={14} /></Button>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>PO Ref</th>
                      <th>Issue Date</th>
                      <th>Order Value</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pos.slice(0, 3).map(po => (
                      <tr key={po.poId}>
                        <td style={{ fontWeight: 'bold' }}>{po.poId}</td>
                        <td>{po.issueDate}</td>
                        <td>₹{po.value.toLocaleString('en-IN')}.00</td>
                        <td>
                          <Badge variant={po.status === 'Pending Acknowledgement' || po.status === 'Pending Acknowledgment' ? 'warning' : po.status === 'Acknowledged' ? 'info' : 'success'}>
                            {po.status}
                          </Badge>
                        </td>
                        <td>
                          {po.status === 'Pending Acknowledgement' || po.status === 'Pending Acknowledgment' ? (
                            <Button size="sm" variant="primary" onClick={() => handleAcknowledgePO(po.poId)}>Acknowledge</Button>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#64748b' }}>No Action</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Self-Service Document Health</span>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('documents')}>Verify <ArrowRight size={14} /></Button>
              </div>
              <div className={styles.docMiniList}>
                {documents.map(doc => (
                  <div key={doc.documentId} className={styles.docMiniRow}>
                    <div>
                      <div className={styles.docMiniName}>{doc.documentName}</div>
                      <div className={styles.docMiniMeta}>{doc.documentType} • Expiry: {doc.expiryDate || 'N/A'}</div>
                    </div>
                    <div>
                      <Badge variant={doc.status === 'Verified' ? 'success' : doc.status === 'Expired' ? 'danger' : 'warning'}>
                        {doc.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Notifications widget */}
            <Card className={styles.card} style={{ gridColumn: 'span 2' }}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>
                  <Bell size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Notifications & Alerts Center
                </span>
                {notifications.some(n => !n.read) && (
                  <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                    Mark All As Read
                  </Button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', marginTop: '12px' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '16px', color: '#64748b', textAlign: 'center' }}>No new notifications.</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.notificationId} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: n.read ? '#f8fafc' : '#eff6ff', borderRadius: '6px', borderLeft: n.read ? '3px solid #cbd5e1' : '3px solid #3b82f6', fontSize: '13px' }}>
                      <span>{n.message}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{n.createdDate}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENTS: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className={styles.tabContent}>
          <Card className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Corporate KYC & Compliance Documents</span>
              <Button variant="primary" icon={<Upload size={16} />} onClick={() => { setSelectedFileDoc(null); setShowUploadModal(true); }}>
                Upload Document
              </Button>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Doc Ref</th>
                    <th>Document Name</th>
                    <th>Category</th>
                    <th>Validity Expiry</th>
                    <th>Verification Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc.documentId}>
                      <td style={{ fontWeight: 'bold' }}>{doc.documentId}</td>
                      <td>{doc.documentName}</td>
                      <td>{doc.documentType}</td>
                      <td>{doc.expiryDate || 'N/A'}</td>
                      <td>
                        <Badge variant={doc.status === 'Verified' ? 'success' : doc.status === 'Expired' ? 'danger' : 'warning'}>
                          {doc.status}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button size="sm" variant="outline" onClick={() => handleDocUploadTrigger(doc)}>
                            {doc.status === 'Expired' ? 'Renew' : 'Re-upload'}
                          </Button>
                          <Button size="sm" variant="ghost" icon={<Download size={14} />} onClick={() => handleDownloadFile(doc.documentName)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENTS: KYC */}
      {activeTab === 'kyc' && kyc && (
        <div className={styles.tabContent}>
          <Card className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>KYC Numbers & Verification Status</span>
              <Badge variant={kyc.status === 'Verified' ? 'success' : 'warning'}>{kyc.status}</Badge>
            </div>
            <form onSubmit={handleKycUpdate} style={{ marginTop: '20px', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className={styles.label}>GSTIN (GST Number)</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={kycForm.gstNumber} 
                  onChange={(e) => setKycForm(prev => ({ ...prev, gstNumber: e.target.value }))} 
                />
              </div>
              <div>
                <label className={styles.label}>PAN (Permanent Account Number)</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={kycForm.panNumber} 
                  onChange={(e) => setKycForm(prev => ({ ...prev, panNumber: e.target.value }))} 
                />
              </div>
              <div>
                <label className={styles.label}>MSME Registration Number</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={kycForm.msmeNumber} 
                  onChange={(e) => setKycForm(prev => ({ ...prev, msmeNumber: e.target.value }))} 
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <Button type="submit" variant="primary">Update KYC Registration</Button>
                <Button type="button" variant="outline" onClick={handleShowDemoAlert}>Trigger Compliance Scan</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* TAB CONTENTS: CONTRACTS */}
      {activeTab === 'contracts' && (
        <div className={styles.tabContent}>
          <Card className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Auto-Synchronized Contracts & SLAs</span>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Contract ID</th>
                    <th>Contract Name</th>
                    <th>Contract Type</th>
                    <th>Department</th>
                    <th>Effective Date</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        No active contracts synchronized.
                      </td>
                    </tr>
                  ) : (
                    contracts.map(c => (
                      <tr key={c.contractId}>
                        <td style={{ fontWeight: 'bold' }}>{c.contractId}</td>
                        <td>{c.contractName}</td>
                        <td>{c.contractType}</td>
                        <td>{c.department}</td>
                        <td>{c.effectiveDate}</td>
                        <td>{c.expiryDate}</td>
                        <td>
                          <Badge variant={c.status === 'Active' ? 'success' : 'warning'}>
                            {c.status}
                          </Badge>
                        </td>
                        <td>
                          <Button size="sm" variant="ghost" icon={<Download size={14} />} onClick={() => handleDownloadFile(c.contractName + '_executed.pdf')}>
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENTS: POS */}
      {activeTab === 'pos' && (
        <div className={styles.tabContent}>
          <Card className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Received Purchase Orders</span>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>PO ID</th>
                    <th>Date Issued</th>
                    <th>Total Items</th>
                    <th>Value Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pos.map(po => (
                    <tr key={po.poId}>
                      <td style={{ fontWeight: 'bold' }}>{po.poId}</td>
                      <td>{po.issueDate}</td>
                      <td>{po.items} Items</td>
                      <td>₹{po.value.toLocaleString('en-IN')}.00</td>
                      <td>
                        <Badge variant={po.status === 'Pending Acknowledgement' || po.status === 'Pending Acknowledgment' ? 'warning' : po.status === 'Acknowledged' ? 'info' : 'success'}>
                          {po.status}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {(po.status === 'Pending Acknowledgement' || po.status === 'Pending Acknowledgment') && (
                            <Button size="sm" variant="primary" onClick={() => handleAcknowledgePO(po.poId)}>
                              Acknowledge
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => alert(`Opening PO details for ${po.poId}...`)}>
                            View PO
                          </Button>
                          {po.status === 'Acknowledged' && (
                            <Button size="sm" variant="primary" onClick={() => {
                              setInvoiceForm(prev => ({ ...prev, poId: po.poId, amount: String(po.value) }));
                              setShowInvoiceModal(true);
                            }}>
                              Submit Invoice
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENTS: INVOICES */}
      {activeTab === 'invoices' && (
        <div className={styles.tabContent}>
          <Card className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Submitted Invoices & Payments Timeline</span>
              <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowInvoiceModal(true)}>
                New Invoice Submission
              </Button>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>PO Reference</th>
                    <th>Bill Amount</th>
                    <th>Submit Date</th>
                    <th>Verification Stage</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.invoiceId}>
                      <td style={{ fontWeight: 'bold' }}>{inv.invoiceId}</td>
                      <td>{inv.poId}</td>
                      <td>₹{inv.amount.toLocaleString('en-IN')}.00</td>
                      <td>{inv.submitDate}</td>
                      <td>
                        <Badge variant={inv.verificationStage === 'Paid' ? 'success' : inv.verificationStage === '3-Way Match' ? 'warning' : 'info'}>
                          {inv.verificationStage}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={inv.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                          {inv.paymentStatus}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button size="sm" variant="ghost" icon={<Eye size={14} />} onClick={() => alert(`Showing invoice verification timeline for ${inv.invoiceId}`)}>
                            Track
                          </Button>
                          {inv.paymentStatus === 'Paid' && (
                            <Button size="sm" variant="outline" onClick={() => {
                              const pay = payments.find(p => p.invoiceId === inv.invoiceId);
                              alert(`Payment Advice Receipt:\nID: ${pay?.paymentId || 'PAY-771'}\nDate: ${pay?.paymentDate || inv.submitDate}\nAmount: ₹${inv.amount.toLocaleString('en-IN')}\nStatus: Settled`);
                            }}>
                              Receipt
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENTS: PROFILE */}
      {activeTab === 'profile' && profile && (
        <div className={styles.tabContent}>
          <Card className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Vendor Company Profile Information</span>
            </div>
            <form onSubmit={handleProfileUpdate} style={{ marginTop: '20px', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className={styles.label}>Company Legal Name</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={profileForm.vendorName} 
                  onChange={(e) => setProfileForm(prev => ({ ...prev, vendorName: e.target.value }))} 
                />
              </div>
              <div>
                <label className={styles.label}>Primary Contact Person</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={profileForm.contactPerson} 
                  onChange={(e) => setProfileForm(prev => ({ ...prev, contactPerson: e.target.value }))} 
                />
              </div>
              <div>
                <label className={styles.label}>Email Address</label>
                <input 
                  type="email" 
                  className={styles.input} 
                  value={profileForm.email} 
                  onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))} 
                />
              </div>
              <div>
                <label className={styles.label}>Phone Number</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={profileForm.phone} 
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))} 
                />
              </div>
              <div>
                <label className={styles.label}>Registered Corporate Address</label>
                <textarea 
                  className={styles.textarea} 
                  rows={3}
                  value={profileForm.address} 
                  onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))} 
                />
              </div>
              <Button type="submit" variant="primary" style={{ alignSelf: 'flex-start' }}>Save Profile Changes</Button>
            </form>
          </Card>
        </div>
      )}

      {/* TAB CONTENTS: QUERIES */}
      {activeTab === 'queries' && (
        <div className={styles.tabContent}>
          <div className={styles.queryLayout}>
            {/* Left: Raise Query Form */}
            <Card className={styles.card}>
              <span className={styles.cardTitle}>Raise Support Ticket</span>
              <form onSubmit={handleCreateQuery} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <div>
                  <label className={styles.label}>Category</label>
                  <select 
                    className={styles.select}
                    value={queryForm.category}
                    onChange={(e) => setQueryForm(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="Finance & Tax">Finance & Tax Support</option>
                    <option value="Technical Support">Portal Technical Bug / Credential</option>
                    <option value="Compliance Audit">KYC Verification & Compliance</option>
                    <option value="Sourcing / Contracts">Item pricing & RFP bidding</option>
                  </select>
                </div>
                <div>
                  <label className={styles.label}>Subject</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="Short description of your issue"
                    value={queryForm.subject}
                    onChange={(e) => setQueryForm(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={styles.label}>Detailed Description</label>
                  <textarea 
                    className={styles.textarea} 
                    placeholder="Provide details of your transaction/problem"
                    rows={4}
                    value={queryForm.message}
                    onChange={(e) => setQueryForm(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>
                <Button variant="primary" type="submit" icon={<Send size={16} />}>Submit Ticket</Button>
              </form>
            </Card>

            {/* Right: Existing Tickets list */}
            <Card className={styles.card}>
              <span className={styles.cardTitle}>Existing Support Tickets</span>
              <div className={styles.ticketList}>
                {queries.map(q => (
                  <div key={q.ticketId} className={styles.ticketRow}>
                    <div className={styles.ticketInfo}>
                      <span className={styles.ticketSubject}>{q.subject}</span>
                      <span className={styles.ticketMeta}>{q.ticketId} • {q.category} • Updated: {q.createdDate}</span>
                    </div>
                    <div>
                      <Badge variant={q.status === 'Resolved' ? 'success' : 'danger'}>
                        {q.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Invoice Submission Modal */}
      {showInvoiceModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>OCR Invoice Extraction Pipeline</h3>
              <button className={styles.closeBtn} onClick={() => setShowInvoiceModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateInvoice} className={styles.modalBody}>
              <div>
                <label className={styles.label}>Invoice Number</label>
                <input 
                  type="text" 
                  className={styles.input}
                  placeholder="e.g. 89105"
                  value={invoiceForm.invoiceNo}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceNo: e.target.value }))}
                />
              </div>
              <div>
                <label className={styles.label}>PO Reference</label>
                <select 
                  className={styles.select}
                  value={invoiceForm.poId}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, poId: e.target.value }))}
                >
                  <option value="">Select PO Reference</option>
                  {pos.filter(po => po.status === 'Acknowledged').map(po => (
                    <option key={po.poId} value={po.poId}>{po.poId} (₹{po.value.toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={styles.label}>Total Invoiced Amount (₹)</label>
                <input 
                  type="number" 
                  className={styles.input}
                  placeholder="e.g. 450000"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div>
                <label className={styles.label}>Upload PDF Invoice Copy</label>
                <div className={styles.fileDropZone} onClick={handleShowDemoAlert}>
                  <Upload size={24} style={{ color: '#1D4ED8', marginBottom: '8px' }} />
                  <span>Drag & drop or Click to browse</span>
                  <small>Accepts PDF, JPG, PNG (Max 5MB)</small>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <Button variant="outline" type="button" onClick={() => setShowInvoiceModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit" icon={<Send size={14} />} disabled={loading}>
                  {loading ? "Extracting..." : "Submit for Extraction"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {showUploadModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{selectedFileDoc ? `Renew Document: ${selectedFileDoc.documentName}` : "Upload Supplementary Document"}</h3>
              <button className={styles.closeBtn} onClick={() => { setShowUploadModal(false); setSelectedFileDoc(null); }}>×</button>
            </div>
            <form onSubmit={handleUploadSubmit} className={styles.modalBody}>
              {!selectedFileDoc && (
                <>
                  <div>
                    <label className={styles.label}>Document Type</label>
                    <select
                      className={styles.select}
                      value={newDocForm.documentType}
                      onChange={(e) => setNewDocForm(prev => ({ ...prev, documentType: e.target.value }))}
                    >
                      <option value="Tax Registration">Tax Registration / GST</option>
                      <option value="Identity Proof">Identity Proof / PAN</option>
                      <option value="MSME Proof">MSME Registration</option>
                      <option value="Compliance">Compliance & InfoSec</option>
                      <option value="Other">Other Certificate</option>
                    </select>
                  </div>
                  <div>
                    <label className={styles.label}>Document Name (Optional)</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g. ISO 27001 Certificate.pdf"
                      value={newDocForm.documentName}
                      onChange={(e) => setNewDocForm(prev => ({ ...prev, documentName: e.target.value }))}
                    />
                  </div>
                </>
              )}
              <div>
                <label className={styles.label}>Expiration Date (Optional)</label>
                <input
                  type="date"
                  className={styles.input}
                  value={selectedFileDoc ? (selectedFileDoc.expiryDate || '') : newDocForm.expiryDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (selectedFileDoc) {
                      setSelectedFileDoc(prev => prev ? ({ ...prev, expiryDate: val } as any) : null);
                    } else {
                      setNewDocForm(prev => ({ ...prev, expiryDate: val }));
                    }
                  }}
                />
              </div>
              <div>
                <label className={styles.label}>Select File</label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'block', fontSize: '13px', marginTop: '4px' }} 
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }} className={styles.modalFooter}>
                <Button variant="outline" type="button" onClick={() => { setShowUploadModal(false); setSelectedFileDoc(null); }}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? "Uploading..." : "Upload & Verify"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
