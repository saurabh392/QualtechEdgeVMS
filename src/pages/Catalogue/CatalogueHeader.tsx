import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import styles from './CatalogueHeader.module.css';

interface Step {
  number: number;
  label: string;
  path: string;
}

const STEPS: Step[] = [
  { number: 1, label: 'Catalogue Dashboard', path: '/catalogue/dashboard' },
  { number: 2, label: 'Item/Service Creation', path: '/catalogue/items' }, // maps items & services
  { number: 3, label: 'Vendor Mapping', path: '/catalogue/vendor-mapping' },
  { number: 4, label: 'HSN/SAC Classification', path: '/catalogue/hsn-sac' },
  { number: 5, label: 'Quality Standards', path: '/catalogue/quality' },
  { number: 6, label: 'Rate Configuration', path: '/catalogue/rates' },
  { number: 7, label: 'Approval Workflow', path: '/catalogue/approvals' },
  { number: 8, label: 'Publish Catalogue', path: '/catalogue/publish' },
  { number: 9, label: 'Analytics & Insights', path: '/catalogue/analytics' }
];

interface CatalogueHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const CatalogueHeader: React.FC<CatalogueHeaderProps> = ({ 
  title = "ITEM & SERVICE CATALOGUE", 
  subtitle = "End-to-End Procurement Catalogue Lifecycle Sourcing & Sizing Dashboard",
  actions
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Find the active step index based on location.pathname
  const getActiveStepIndex = () => {
    let currentPath = location.pathname;
    if (currentPath === '/catalogue/quality-standards') currentPath = '/catalogue/quality';
    if (currentPath === '/catalogue/pricing') currentPath = '/catalogue/rates';
    if (currentPath === '/catalogue/approval-workflow') currentPath = '/catalogue/approvals';
    if (currentPath === '/catalogue/published') currentPath = '/catalogue/publish';

    if (currentPath.includes('/catalogue/items') || currentPath.includes('/catalogue/services')) {
      return 1; // Step 2 (0-indexed 1)
    }
    const idx = STEPS.findIndex(s => s.path === currentPath);
    return idx !== -1 ? idx : 0;
  };

  const activeIndex = getActiveStepIndex();

  const handleStepClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className={styles.headerContainer}>
      <div className={styles.topRow}>
        <div className={styles.titleContainer}>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.dateSelector}>
            <Calendar size={16} />
            <span>12 May 2026 - 18 May 2026</span>
          </div>
          {actions}
        </div>
      </div>

      <div className={styles.stepperCard}>
        <div className={styles.stepperScroll}>
          <div className={styles.stepperContainer}>
            {STEPS.map((step, idx) => {
              const isActive = idx === activeIndex;
              const isCompleted = idx < activeIndex;
              
              let circleClass = styles.stepCircle;
              let labelClass = styles.stepLabel;

              if (isActive) {
                circleClass += ` ${styles.stepCircleActive}`;
                labelClass += ` ${styles.stepLabelActive}`;
              } else if (isCompleted) {
                circleClass += ` ${styles.stepCircleCompleted}`;
                labelClass += ` ${styles.stepLabelCompleted}`;
              }

              return (
                <React.Fragment key={step.number}>
                  <div 
                    onClick={() => handleStepClick(step.path)}
                    className={styles.stepItem}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={circleClass}>
                      {isCompleted ? '✓' : step.number}
                    </div>
                    <span className={labelClass}>{step.label}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <ArrowRight size={14} className={styles.stepArrow} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
