import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface DocumentFilterState {
  selectedCard: string;
  documentType: string;
  status: string;
  search: string;
  expiryFilter: string;
}

interface DocumentFilterContextType {
  filters: DocumentFilterState;
  setFilters: React.Dispatch<React.SetStateAction<DocumentFilterState>>;
  setFilterValue: (key: keyof DocumentFilterState, value: string) => void;
  resetFilters: () => void;
}

const DocumentFilterContext = createContext<DocumentFilterContextType | undefined>(undefined);

export const DocumentFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Helper to parse URL params into context state
  const getInitialStateFromUrl = (): DocumentFilterState => {
    const filterParam = searchParams.get('filter') || '';
    const statusParam = searchParams.get('status') || '';
    
    let selectedCard = '';
    let status = 'All';

    if (filterParam === 'all') {
      selectedCard = 'all';
      status = 'All';
    } else if (statusParam === 'pending') {
      selectedCard = 'pending';
      status = 'Pending Verification';
    } else if (statusParam === 'rejected') {
      selectedCard = 'rejected';
      status = 'Rejected';
    } else if (statusParam === 'expiring30' || filterParam === 'expiring30') {
      selectedCard = 'expiring30';
      status = 'Expiring in 30 Days';
    } else if (statusParam === 'expired' || filterParam === 'expired') {
      selectedCard = 'expired';
      status = 'Expired Documents';
    } else if (statusParam) {
      status = statusParam;
    }

    return {
      selectedCard,
      status,
      documentType: searchParams.get('documentType') || 'All',
      search: searchParams.get('search') || '',
      expiryFilter: 'all'
    };
  };

  const [filters, setFilters] = useState<DocumentFilterState>(getInitialStateFromUrl);

  // Sync state changes to URL
  useEffect(() => {
    const params: Record<string, string> = {};

    if (filters.status === 'All') {
      params.filter = 'all';
    } else if (filters.status === 'Pending Verification') {
      params.status = 'pending';
    } else if (filters.status === 'Rejected') {
      params.status = 'rejected';
    } else if (filters.status === 'Expiring in 30 Days') {
      params.status = 'expiring30';
    } else if (filters.status === 'Expired Documents') {
      params.status = 'expired';
    } else {
      params.status = filters.status;
    }

    if (filters.documentType !== 'All') {
      params.documentType = filters.documentType;
    }

    if (filters.search) {
      params.search = filters.search;
    }

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Sync URL changes back to state (browser back/forward button support)
  useEffect(() => {
    const filterParam = searchParams.get('filter') || '';
    const statusParam = searchParams.get('status') || '';
    const documentTypeParam = searchParams.get('documentType') || 'All';
    const searchParam = searchParams.get('search') || '';

    let selectedCard = '';
    let status = 'All';

    if (filterParam === 'all') {
      selectedCard = 'all';
      status = 'All';
    } else if (statusParam === 'pending') {
      selectedCard = 'pending';
      status = 'Pending Verification';
    } else if (statusParam === 'rejected') {
      selectedCard = 'rejected';
      status = 'Rejected';
    } else if (statusParam === 'expiring30' || filterParam === 'expiring30') {
      selectedCard = 'expiring30';
      status = 'Expiring in 30 Days';
    } else if (statusParam === 'expired' || filterParam === 'expired') {
      selectedCard = 'expired';
      status = 'Expired Documents';
    } else {
      if (statusParam) status = statusParam;
    }

    setFilters(prev => {
      if (
        prev.selectedCard === selectedCard &&
        prev.status === status &&
        prev.documentType === documentTypeParam &&
        prev.search === searchParam
      ) {
        return prev;
      }
      return {
        ...prev,
        selectedCard,
        status,
        documentType: documentTypeParam,
        search: searchParam
      };
    });
  }, [searchParams]);

  const setFilterValue = (key: keyof DocumentFilterState, value: string) => {
    setFilters(prev => {
      const updated = { ...prev, [key]: value };

      if (key === 'status') {
        if (value === 'All') updated.selectedCard = 'all';
        else if (value === 'Pending Verification') updated.selectedCard = 'pending';
        else if (value === 'Rejected') updated.selectedCard = 'rejected';
        else if (value === 'Expiring in 30 Days') updated.selectedCard = 'expiring30';
        else if (value === 'Expired Documents') updated.selectedCard = 'expired';
        else updated.selectedCard = '';
      }

      return updated;
    });
  };

  const resetFilters = () => {
    setFilters({
      selectedCard: 'all',
      documentType: 'All',
      status: 'All',
      search: '',
      expiryFilter: 'all'
    });
  };

  return (
    <DocumentFilterContext.Provider value={{ filters, setFilters, setFilterValue, resetFilters }}>
      {children}
    </DocumentFilterContext.Provider>
  );
};

export const useDocumentFilters = () => {
  const context = useContext(DocumentFilterContext);
  if (!context) {
    throw new Error('useDocumentFilters must be used within a DocumentFilterProvider');
  }
  return context;
};
