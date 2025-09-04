import { writable, derived } from 'svelte/store';
import type { WindTurbine, FilterParams, WorkOrder, PowerOutput, AlertPrediction } from '../types/windturbine.js';
import { apiClient } from '../utils/api.js';

// Theme and user preferences store
interface PreferencesState {
  theme: 'light' | 'dark' | 'system';
  locale: string;
  timezone: string;
  tableColumns: string[];
  filtersExpanded: boolean;
}

function createPreferencesStore() {
  const defaultState: PreferencesState = {
    theme: 'system',
    locale: 'en-US',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    tableColumns: ['name', 'manufacturer', 'location', 'capacity', 'status'],
    filtersExpanded: true,
  };

  // Load from localStorage if available
  let initialState = defaultState;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('user-preferences');
    if (saved) {
      try {
        initialState = { ...defaultState, ...JSON.parse(saved) };
      } catch (e) {
        console.warn('Failed to parse saved preferences:', e);
      }
    }
  }

  const { subscribe, set, update } = writable(initialState);

  // Save to localStorage on changes
  if (typeof window !== 'undefined') {
    subscribe((value) => {
      localStorage.setItem('user-preferences', JSON.stringify(value));
    });
  }

  // Helper to apply theme to DOM
const applyThemeToDOM = (theme: 'light' | 'dark' | 'system') => {
  if (typeof document !== 'undefined') {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      // System theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = isDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', systemTheme);
    }
  }
};

  // Apply initial theme (resolve system theme immediately)
  if (typeof window !== 'undefined') {
    applyThemeToDOM(initialState.theme);
  }

  return {
    subscribe,
    setTheme: (theme: 'light' | 'dark' | 'system') => {
      update(state => {
        const newState = { ...state, theme };
        applyThemeToDOM(theme);
        return newState;
      });
    },
    toggleTheme: () => {
      update(state => {
        let newTheme: 'light' | 'dark' | 'system';
        if (state.theme === 'light') {
          newTheme = 'dark';
        } else if (state.theme === 'dark') {
          newTheme = 'system';
        } else {
          newTheme = 'light';
        }
        
        const newState = { ...state, theme: newTheme };
        applyThemeToDOM(newTheme);
        return newState;
      });
    },
    setLocale: (locale: string) => update(state => ({ ...state, locale })),
    setTimezone: (timezone: string) => update(state => ({ ...state, timezone })),
    setTableColumns: (tableColumns: string[]) => update(state => ({ ...state, tableColumns })),
    setFiltersExpanded: (filtersExpanded: boolean) => update(state => ({ ...state, filtersExpanded })),
  };
}

export const preferencesStore = createPreferencesStore();

// Wind turbines data store
interface WindTurbineState {
  turbines: WindTurbine[];
  selectedTurbine: WindTurbine | null;
  loading: boolean;
  error: string | null;
  filters: FilterParams;
  totalCount: number;
  currentPage: number;
}

function createWindTurbineStore() {
  const defaultState: WindTurbineState = {
    turbines: [],
    selectedTurbine: null,
    loading: false,
    error: null,
    filters: {
      page: 1,
      limit: 20,
    },
    totalCount: 0,
    currentPage: 1,
  };

  const { subscribe, set, update } = writable(defaultState);

  return {
    subscribe,
    setTurbines: (turbines: WindTurbine[]) => update(state => ({ ...state, turbines })),
    setSelectedTurbine: (selectedTurbine: WindTurbine | null) => update(state => ({ ...state, selectedTurbine })),
    setLoading: (loading: boolean) => update(state => ({ ...state, loading })),
    setError: (error: string | null) => update(state => ({ ...state, error })),
    setFilters: (filters: FilterParams) => update(state => ({ ...state, filters })),
    setTotalCount: (totalCount: number) => update(state => ({ ...state, totalCount })),
    setCurrentPage: (currentPage: number) => update(state => ({ ...state, currentPage })),
    
    fetchTurbines: async (page: number = 1, limit: number = 25, filters?: FilterParams) => {
      update(state => ({ ...state, loading: true, error: null }));
      try {
        const searchParams = { page, limit, ...filters };
        const response = await apiClient.getWindTurbines(searchParams);
        update(state => ({ 
          ...state,
          turbines: response.data, 
          totalCount: response.pagination?.total || 0,
          currentPage: page,
          loading: false 
        }));
        return response;
      } catch (error) {
        update(state => ({ 
          ...state,
          error: error instanceof Error ? error.message : 'Failed to fetch turbines',
          loading: false 
        }));
        throw error;
      }
    },
    
    fetchTurbine: async (id: string) => {
      update(state => ({ ...state, loading: true, error: null }));
      try {
        const turbine = await apiClient.getWindTurbine(id);
        update(state => ({ ...state, selectedTurbine: turbine, loading: false }));
      } catch (error) {
        update(state => ({ 
          ...state,
          error: error instanceof Error ? error.message : 'Failed to fetch turbine',
          loading: false 
        }));
      }
    },

    createTurbine: async (turbineData: Omit<WindTurbine, 'id' | 'createdAt' | 'updatedAt'>) => {
      update(state => ({ ...state, loading: true, error: null }));
      try {
        const newTurbine = await apiClient.createWindTurbine(turbineData);
        // Just clear loading, let the UI handle refreshing
        update(state => ({ 
          ...state,
          loading: false 
        }));
        return newTurbine;
      } catch (error) {
        update(state => ({ 
          ...state,
          error: error instanceof Error ? error.message : 'Failed to create turbine',
          loading: false 
        }));
        throw error;
      }
    },

    updateTurbine: async (id: string, turbineData: Omit<WindTurbine, 'id' | 'createdAt' | 'updatedAt'>) => {
      update(state => ({ ...state, loading: true, error: null }));
      try {
        const updatedTurbine = await apiClient.updateWindTurbine(id, turbineData);
        update(state => ({
          ...state,
          // Update the turbine in the list if it exists
          turbines: state.turbines.map(t => t.id === id ? updatedTurbine : t),
          loading: false
        }));
        return updatedTurbine;
      } catch (error) {
        update(state => ({
          ...state,
          error: error instanceof Error ? error.message : 'Failed to update turbine',
          loading: false
        }));
        throw error;
      }
    },

    deleteTurbine: async (id: string) => {
      update(state => ({ ...state, loading: true, error: null }));
      try {
        await apiClient.deleteWindTurbine(id);
        update(state => ({
          ...state,
          // Remove the turbine from the list if it exists
          turbines: state.turbines.filter(t => t.id !== id),
          totalCount: Math.max(0, state.totalCount - 1),
          loading: false
        }));
      } catch (error) {
        update(state => ({
          ...state,
          error: error instanceof Error ? error.message : 'Failed to delete turbine',
          loading: false
        }));
        throw error;
      }
    },
  };
}

export const windTurbineStore = createWindTurbineStore();

// Detail data store for turbine-specific information
interface TurbineDetailState {
  workOrders: WorkOrder[];
  powerOutput: PowerOutput[];
  alertPredictions: AlertPrediction[];
  activeTab: string;
  loading: {
    workOrders: boolean;
    powerOutput: boolean;
    alertPredictions: boolean;
  };
}

function createTurbineDetailStore() {
  const defaultState: TurbineDetailState = {
    workOrders: [],
    powerOutput: [],
    alertPredictions: [],
    activeTab: 'overview',
    loading: {
      workOrders: false,
      powerOutput: false,
      alertPredictions: false,
    },
  };

  const { subscribe, set, update } = writable(defaultState);

  return {
    subscribe,
    setWorkOrders: (workOrders: WorkOrder[]) => update(state => ({ ...state, workOrders })),
    setPowerOutput: (powerOutput: PowerOutput[]) => update(state => ({ ...state, powerOutput })),
    setAlertPredictions: (alertPredictions: AlertPrediction[]) => update(state => ({ ...state, alertPredictions })),
    setActiveTab: (activeTab: string) => update(state => ({ ...state, activeTab })),
    setLoading: (type: keyof TurbineDetailState['loading'], loading: boolean) => 
      update(state => ({ 
        ...state, 
        loading: { ...state.loading, [type]: loading } 
      })),
    
    fetchWorkOrders: async (turbineId: string) => {
      update(state => ({ ...state, loading: { ...state.loading, workOrders: true } }));
      try {
        const workOrders = await apiClient.getWorkOrders(turbineId);
        update(state => ({ ...state, workOrders }));
      } catch (error) {
        console.error('Failed to fetch work orders:', error);
      } finally {
        update(state => ({ ...state, loading: { ...state.loading, workOrders: false } }));
      }
    },
    
    fetchPowerOutput: async (turbineId: string, startDate?: string, endDate?: string) => {
      update(state => ({ ...state, loading: { ...state.loading, powerOutput: true } }));
      try {
        const powerOutput = await apiClient.getPowerOutput(turbineId, startDate, endDate);
        update(state => ({ ...state, powerOutput }));
      } catch (error) {
        console.error('Failed to fetch power output:', error);
      } finally {
        update(state => ({ ...state, loading: { ...state.loading, powerOutput: false } }));
      }
    },
    
    fetchAlertPredictions: async (turbineId: string) => {
      update(state => ({ ...state, loading: { ...state.loading, alertPredictions: true } }));
      try {
        const alertPredictions = await apiClient.getAlertPredictions(turbineId);
        update(state => ({ ...state, alertPredictions }));
      } catch (error) {
        console.error('Failed to fetch alert predictions:', error);
      } finally {
        update(state => ({ ...state, loading: { ...state.loading, alertPredictions: false } }));
      }
    },
  };
}

export const turbineDetailStore = createTurbineDetailStore();
