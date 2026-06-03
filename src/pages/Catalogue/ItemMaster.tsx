import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  BrainCircuit, 
  Sparkles, 
  AlertTriangle,
  UploadCloud,
  FileCheck,
  Check
} from 'lucide-react';
import { CatalogueHeader } from './CatalogueHeader';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import styles from './ItemMaster.module.css';
import { 
  createItem, 
  uploadItemFile, 
  getHsnMappings, 
  getUoms, 
  getActiveVendors
} from '../../services/itemMasterService';
import type { 
  HsnMapping,
  VendorSelection,
  UploadedFile
} from '../../services/itemMasterService';

export const ItemMaster: React.FC = () => {
  const navigate = useNavigate();
  const [subStep, setSubStep] = useState(1);
  
  // Master Cache
  const [vendors, setVendors] = useState<VendorSelection[]>([]);
  const [hsnMappings, setHsnMappings] = useState<HsnMapping[]>([]);
  const [uoms, setUoms] = useState<string[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form State
  const [itemName, setItemName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [make, setMake] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [uom, setUom] = useState('Nos');
  const [moq, setMoq] = useState('');
  const [maxOrder, setMaxOrder] = useState('');
  const [leadTime, setLeadTime] = useState('');
  const [preferredVendor, setPreferredVendor] = useState('');
  const [altVendors, setAltVendors] = useState('');
  const [warranty, setWarranty] = useState('');
  const [qualityStandard, setQualityStandard] = useState('ISO 9001');
  const [riskClass, setRiskClass] = useState('Low');
  const [taxCategory, setTaxCategory] = useState('GST 18%');
  const [testingCriteria, setTestingCriteria] = useState('');

  // Upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileMeta, setUploadedFileMeta] = useState<UploadedFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successItem, setSuccessItem] = useState<{ itemId: string; itemName: string } | null>(null);

  // Load masters
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingInitial(true);
        const [vList, mList, uList] = await Promise.all([
          getActiveVendors(),
          getHsnMappings(),
          getUoms()
        ]);
        setVendors(vList);
        setHsnMappings(mList);
        setUoms(uList);
      } catch (err) {
        console.error("Error loading master data in ItemMaster:", err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, []);

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    const match = hsnMappings.find(m => m.category === val);
    if (match) {
      setHsnCode(match.hsnCode);
      setTaxCategory(match.gstSlab);
      setUom(match.uom);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setUploadingFile(true);
        const res = await uploadItemFile(file, {
          fileType: 'Specification Sheet',
          uploadedBy: 'Saurabh Anand'
        });
        if (res.success) {
          setUploadedFileMeta(res.file);
        }
      } catch (err) {
        console.error("Error uploading spec sheet:", err);
        alert("Failed to upload specification sheet brochure.");
      } finally {
        setUploadingFile(false);
      }
    }
  };

  // Trigger OCR Simulation
  const handleOcrSimulation = () => {
    alert("OCR Auto-Extract is available in Production Edition.\n\nDemo Prototype Mode:\nPlease enter item details manually.");
  };

  const showDuplicateWarning = itemName.toLowerCase().includes('dell latitude 5420');

  const handleSave = async () => {
    if (!itemName || !itemCode || !category || !subcategory || !description || !moq || !leadTime || !preferredVendor || !hsnCode || !uom || !taxCategory) {
      alert("Please fill in all required fields (marked with *).");
      return;
    }

    if (!uploadedFileMeta) {
      alert("Please upload a Specification Sheet / Brochure.");
      return;
    }

    try {
      setIsSubmitting(true);
      const chosenVendor = vendors.find(v => v.vendorId === preferredVendor);
      
      const payload = {
        itemCode,
        itemName,
        category,
        subCategory: subcategory,
        description,
        brand,
        countryOfOrigin: make,
        minimumOrderQuantity: Number(moq) || 1,
        maximumOrderLimit: maxOrder ? Number(maxOrder) : undefined,
        expectedLeadTime: leadTime,
        warrantySupport: warranty,
        preferredVendor: {
          vendorId: preferredVendor,
          vendorName: chosenVendor ? chosenVendor.vendorName : 'ABC Infotech Private Limited'
        },
        alternateVendors: altVendors ? [{ vendorId: 'VND-ALT-01', vendorName: altVendors }] : [],
        hsnCode,
        unitOfMeasurement: uom,
        taxCode: taxCategory,
        qualityComplianceStandards: qualityStandard,
        qualityTestingCriteria: testingCriteria,
        riskClassification: riskClass + ' Risk',
        submittedBy: 'Saurabh Anand',
        uploadedFiles: uploadedFileMeta ? [uploadedFileMeta] : []
      };

      const res = await createItem(payload);
      if (res.success) {
        setSuccessItem({
          itemId: res.item.itemId || '',
          itemName: res.item.itemName
        });
      } else {
        alert("Failed to submit item master.");
      }
    } catch (err: any) {
      console.error("Error creating item master:", err);
      alert(err.response?.data?.message || "An error occurred while saving the item master.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setItemName('');
    setItemCode('');
    setCategory('');
    setSubcategory('');
    setDescription('');
    setBrand('');
    setMake('');
    setHsnCode('');
    setUom('Nos');
    setMoq('');
    setMaxOrder('');
    setLeadTime('');
    setPreferredVendor('');
    setAltVendors('');
    setWarranty('');
    setQualityStandard('ISO 9001');
    setRiskClass('Low');
    setTaxCategory('GST 18%');
    setTestingCriteria('');
    setUploadedFileMeta(null);
    setSubStep(1);
    setSuccessItem(null);
  };

  if (successItem) {
    return (
      <div className={styles.container}>
        <CatalogueHeader 
          title="ITEM MASTER CREATION" 
          subtitle="Configure item attributes, preferred vendors, alternate manufacturers, lead times, and MOQ thresholds"
        />
        <div className={styles.successCard}>
          <div className={styles.successIconWrapper}>
            <Check size={40} />
          </div>
          <h2 className={styles.successTitle}>✓ Item Master Created Successfully</h2>
          
          <div className={styles.successDetails}>
            <div className={styles.successDetailRow}>
              <span className={styles.successDetailLabel}>Item Name</span>
              <span className={styles.successDetailVal}>{successItem.itemName}</span>
            </div>
            <div className={styles.successDetailRow}>
              <span className={styles.successDetailLabel}>Item ID</span>
              <span className={styles.successDetailVal}>{successItem.itemId}</span>
            </div>
            <div className={styles.successDetailRow}>
              <span className={styles.successDetailLabel}>Sourcing Status</span>
              <span className={styles.successDetailVal}>Awaiting Vendor Mapping</span>
            </div>
            <div className={styles.successDetailRow}>
              <span className={styles.successDetailLabel}>Workflow Status</span>
              <span className={styles.successDetailVal}>Pending Approval</span>
            </div>
          </div>
          
          <p className={styles.successRoutingMsg}>
            The item has been routed to Vendor Mapping and Approval Workflow.
          </p>
          
          <div className={styles.successActions}>
            <Button variant="primary" onClick={() => navigate('/catalogue/vendor-mapping')}>
              Go To Vendor Mapping
            </Button>
            <Button variant="outline" onClick={handleResetForm}>
              Create Another Item
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <CatalogueHeader 
        title="ITEM MASTER CREATION" 
        subtitle="Configure item attributes, preferred vendors, alternate manufacturers, lead times, and MOQ thresholds"
        actions={
          <Button variant="outline" icon={<ArrowLeft size={16} />} onClick={() => navigate('/catalogue/dashboard')}>
            Back to Dashboard
          </Button>
        }
      />

      <Card className={styles.formCard}>
        {/* Wizard Header Status */}
        <div className={styles.wizardHeader}>
          <div className={styles.subSteps}>
            <div className={`${styles.subStep} ${subStep === 1 ? styles.subStepActive : ''}`} onClick={() => setSubStep(1)} style={{ cursor: 'pointer' }}>
              <span>1.</span> Basic Details
            </div>
            <ArrowRight size={14} className={styles.stepArrow} />
            <div className={`${styles.subStep} ${subStep === 2 ? styles.subStepActive : ''}`} onClick={() => setSubStep(2)} style={{ cursor: 'pointer' }}>
              <span>2.</span> Sourcing & Sizing
            </div>
            <ArrowRight size={14} className={styles.stepArrow} />
            <div className={`${styles.subStep} ${subStep === 3 ? styles.subStepActive : ''}`} onClick={() => setSubStep(3)} style={{ cursor: 'pointer' }}>
              <span>3.</span> Compliance & Quality
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            icon={<BrainCircuit size={16} />} 
            onClick={handleOcrSimulation}
          >
            OCR Auto-Extract from Spec sheet
          </Button>
        </div>

        {/* Duplicate Warning */}
        {showDuplicateWarning && (
          <div className={styles.duplicateAlert}>
            <AlertTriangle size={24} className={styles.duplicateIcon} />
            <div>
              <div className={styles.duplicateTitle}>Duplicate Item Warning (92% Match)</div>
              <div className={styles.duplicateDesc}>
                An item with name <strong>"Dell Latitude 5420 Laptop"</strong> already exists in your catalogue under HSN code 84713010. Please review to avoid duplicates.
              </div>
            </div>
          </div>
        )}

        {loadingInitial ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading catalogue parameters and vendor mappings...
          </div>
        ) : (
          <>
            {/* STEP 1: Basic Details */}
            {subStep === 1 && (
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Item Name *</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. Dell Latitude 5420 Laptop"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                  <span className={styles.aiSuggested}><Sparkles size={12} /> AI Note: Auto-matching suggestions active.</span>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Item Code / Part No. *</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. IT-LAP-0012"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Category *</label>
                  <select 
                    className={styles.inputField} 
                    value={category} 
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    <option value="IT Hardware">IT Hardware</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Facility Management">Facility Management</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Subcategory *</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. Laptops / Desktops"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                  <label className={styles.formLabel}>Description *</label>
                  <textarea 
                    className={styles.textareaField} 
                    placeholder="Describe specifications, product attributes, and dimensions..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Brand / Manufacturer</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. Dell / HP"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Make / Country of Origin</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. India"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Sourcing & Sizing */}
            {subStep === 2 && (
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Minimum Order Quantity (MOQ) *</label>
                  <input 
                    type="number" 
                    className={styles.inputField} 
                    placeholder="e.g. 5"
                    value={moq}
                    onChange={(e) => setMoq(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Maximum Order Limit</label>
                  <input 
                    type="number" 
                    className={styles.inputField} 
                    placeholder="e.g. 200"
                    value={maxOrder}
                    onChange={(e) => setMaxOrder(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Expected Delivery Lead Time *</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. 7-10 Days"
                    value={leadTime}
                    onChange={(e) => setLeadTime(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Warranty & Support (Months)</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. 36 Months On-site Support"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Preferred Vendor *</label>
                  <select 
                    className={styles.inputField} 
                    value={preferredVendor} 
                    onChange={(e) => setPreferredVendor(e.target.value)}
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map(v => (
                      <option key={v.vendorId} value={v.vendorId}>
                        {v.vendorName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Alternate Vendor(s)</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. Tech Solutions Pvt Ltd"
                    value={altVendors}
                    onChange={(e) => setAltVendors(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Compliance & Quality */}
            {subStep === 3 && (
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>HSN Code *</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. 84713010"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                  />
                  {category && <span className={styles.aiSuggested}><Sparkles size={12} /> AI Auto-derived from category: {hsnCode}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Unit of Measurement (UOM) *</label>
                  <select 
                    className={styles.inputField} 
                    value={uom} 
                    onChange={(e) => setUom(e.target.value)}
                  >
                    {uoms.map(unit => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tax Code / GST Slab *</label>
                  <select 
                    className={styles.inputField} 
                    value={taxCategory} 
                    onChange={(e) => setTaxCategory(e.target.value)}
                  >
                    <option value="GST 18%">GST 18% (Standard IT/Services)</option>
                    <option value="GST 12%">GST 12% (Supplies)</option>
                    <option value="GST 5%">GST 5% (Logistics)</option>
                    <option value="GST 28%">GST 28% (Luxury items)</option>
                    <option value="GST Exempt">GST Exempt</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Quality Compliance Standards</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. ISO 9001 / BIS / RoHS Certified"
                    value={qualityStandard}
                    onChange={(e) => setQualityStandard(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Risk Classification</label>
                  <select 
                    className={styles.inputField} 
                    value={riskClass} 
                    onChange={(e) => setRiskClass(e.target.value)}
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk (Requires due diligence)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Quality Testing Criteria / Inspection</label>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="e.g. Power-on self test, Scratch verification"
                    value={testingCriteria}
                    onChange={(e) => setTestingCriteria(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup} style={{ gridColumn: 'span 2', marginTop: '12px' }}>
                  <label className={styles.formLabel}>Upload Specification Sheet / Brochure *</label>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <label className={styles.aiSuggested} style={{ cursor: 'pointer', margin: 0, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px dashed var(--color-primary)' }}>
                      <UploadCloud size={16} />
                      <span>{uploadedFileMeta ? "Change File" : "Select File"}</span>
                      <input 
                        type="file" 
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        disabled={uploadingFile}
                      />
                    </label>
                    {uploadingFile && <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Uploading...</span>}
                    {uploadedFileMeta && (
                      <span style={{ color: '#16a34a', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileCheck size={14} /> {uploadedFileMeta.fileName} ({uploadedFileMeta.fileSize})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer Navigation Actions */}
        <div className={styles.footerActions}>
          <Button 
            variant="outline" 
            disabled={subStep === 1 || loadingInitial} 
            icon={<ArrowLeft size={16} />}
            onClick={() => setSubStep(prev => Math.max(1, prev - 1))}
          >
            Previous
          </Button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="ghost" onClick={() => navigate('/catalogue/dashboard')}>
              Cancel
            </Button>

            {subStep < 3 ? (
              <Button 
                icon={<ArrowRight size={16} />} 
                onClick={() => setSubStep(prev => Math.min(3, prev + 1))}
                disabled={loadingInitial}
              >
                Next Step
              </Button>
            ) : (
              <Button 
                variant="primary" 
                icon={<Save size={16} />} 
                onClick={handleSave}
                disabled={isSubmitting || loadingInitial}
              >
                {isSubmitting ? "Submitting..." : "Submit Item"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
