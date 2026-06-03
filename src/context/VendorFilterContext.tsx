import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface VendorFilterState {
  selectedCard: string;
  status: string;
  category: string;
  search: string;
  date: string;
}

interface VendorFilterContextType {
  filters: VendorFilterState;
  setFilters: React.Dispatch<React.SetStateAction<VendorFilterState>>;
  setFilterValue: (key: keyof VendorFilterState, value: string) => void;
  resetFilters: () => void;
}

const VendorFilterContext = createContext<VendorFilterContextType | undefined>(undefined);

export const VendorFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Helper to parse query parameters into filter state
  const getInitialStateFromUrl = (): VendorFilterState => {
    const statusParam = searchParams.get('status') || '';
    const filterParam = searchParams.get('filter') || '';
    
    let selectedCard = '';
    let status = 'All';

    if (filterParam === 'all') {
      selectedCard = 'all';
      status = 'All';
    } else if (statusParam === 'active') {
      selectedCard = 'active';
      status = 'Active';
    } else if (statusParam === 'pending') {
      selectedCard = 'pending';
      status = 'Pending Approval';
    } else if (statusParam === 'rejected') {
      selectedCard = 'rejected';
      status = 'Rejected';
    }

    return {
      selectedCard,
      status,
      category: searchParams.get('category') || 'All',
      search: searchParams.get('search') || '',
      date: searchParams.get('date') || ''
    };
  };

  const [filters, setFilters] = useState<VendorFilterState>(getInitialStateFromUrl);

  // Sync state changes to URL query parameters
  useEffect(() => {
    const params: Record<string, string> = {};
    
    if (filters.selectedCard === 'all') {
      params.filter = 'all';
    } else if (filters.selectedCard === 'active') {
      params.status = 'active';
    } else if (filters.selectedCard === 'pending') {
      params.status = 'pending';
    } else if (filters.selectedCard === 'rejected') {
      params.status = 'rejected';
    } else {
      if (filters.status !== 'All') {
        if (filters.status === 'Active') params.status = 'active';
        else if (filters.status === 'Pending Approval') params.status = 'pending';
        else if (filters.status === 'Rejected') params.status = 'rejected';
      }
    }

    if (filters.category !== 'All') {
      params.category = filters.category;
    }
    if (filters.search) {
      params.search = filters.search;
    }
    if (filters.date) {
      params.date = filters.date;
    }

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Handle URL change externally (e.g. browser back/forward buttons)
  useEffect(() => {
    const statusParam = searchParams.get('status') || '';
    const filterParam = searchParams.get('filter') || '';
    const categoryParam = searchParams.get('category') || 'All';
    const searchParam = searchParams.get('search') || '';
    const dateParam = searchParams.get('date') || '';
    
    let selectedCard = '';
    let status = 'All';

    if (filterParam === 'all') {
      selectedCard = 'all';
      status = 'All';
    } else if (statusParam === 'active') {
      selectedCard = 'active';
      status = 'Active';
    } else if (statusParam === 'pending') {
      selectedCard = 'pending';
      status = 'Pending Approval';
    } else if (statusParam === 'rejected') {
      selectedCard = 'rejected';
      status = 'Rejected';
    }

    setFilters(prev => {
      // Prevent infinite updating loops
      if (
        prev.selectedCard === selectedCard &&
        prev.status === status &&
        prev.category === categoryParam &&
        prev.search === searchParam &&
        prev.date === dateParam
      ) {
        return prev;
      }
      return {
        selectedCard,
        status,
        category: categoryParam,
        search: searchParam,
        date: dateParam
      };
    });
  }, [searchParams]);

  const setFilterValue = (key: keyof VendorFilterState, value: string) => {
    setFilters(prev => {
      const updated = { ...prev, [key]: value };
      
      // Keep selectedCard highlighted when status changes
      if (key === 'status') {
        if (value === 'All') updated.selectedCard = 'all';
        else if (value === 'Active') updated.selectedCard = 'active';
        else if (value === 'Pending Approval') updated.selectedCard = 'pending';
        else if (value === 'Rejected') updated.selectedCard = 'rejected';
        else updated.selectedCard = '';
      }
      
      return updated;
    });
  };

  const resetFilters = () => {
    setFilters({
      selectedCard: 'all',
      status: 'All',
      category: 'All',
      search: '',
      date: ''
    });
  };

  return (
    <VendorFilterContext.Provider value={{ filters, setFilters, setFilterValue, resetFilters }}>
      {children}
    </VendorFilterContext.Provider>
  );
};

export const useVendorFilters = () => {
  const context = useContext(VendorFilterContext);
  if (!context) {
    throw new Error('useVendorFilters must be used within a VendorFilterProvider');
  }
  return context;
};
