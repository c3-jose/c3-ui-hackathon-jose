import { writable } from 'svelte/store';
import { apiClient } from '../utils/api.js';

// Dashboard summary data interface
interface DashboardSummary {
  totalTurbines: number;
  activeTurbines: number;
  totalWorkOrders: number;
  openWorkOrders: number;
  inProgressWorkOrders: number;
  avgPowerOutput: number;
}

// Dashboard state interface
interface DashboardState {
  summary: DashboardSummary | null;
  turbines: any[]; // Will be filled with real turbine data for map
  loading: {
    summary: boolean;
    turbines: boolean;
  };
  error: string | null;
  lastUpdated: Date | null;
}

function createDashboardStore() {
  const defaultState: DashboardState = {
    summary: null,
    turbines: [],
    loading: {
      summary: false,
      turbines: false,
    },
    error: null,
    lastUpdated: null,
  };

  const { subscribe, set, update } = writable(defaultState);

  return {
    subscribe,
    
    // Fetch dashboard summary data
    fetchSummary: async () => {
      update(state => ({ ...state, loading: { ...state.loading, summary: true }, error: null }));
      
      try {
        const summary = await apiClient.getSummary();
        update(state => ({ 
          ...state, 
          summary,
          loading: { ...state.loading, summary: false },
          lastUpdated: new Date()
        }));
      } catch (error) {
        console.error('Failed to fetch dashboard summary:', error);
        update(state => ({ 
          ...state, 
          error: error instanceof Error ? error.message : 'Failed to fetch dashboard summary',
          loading: { ...state.loading, summary: false }
        }));
      }
    },

    // Fetch turbines for map display
    fetchTurbines: async () => {
      update(state => ({ ...state, loading: { ...state.loading, turbines: true }, error: null }));
      
      try {
        const response = await apiClient.getWindTurbines({ limit: 150 }); // Get all turbines
        update(state => ({ 
          ...state, 
          turbines: response.data,
          loading: { ...state.loading, turbines: false }
        }));
      } catch (error) {
        console.error('Failed to fetch turbines for map:', error);
        update(state => ({ 
          ...state, 
          error: error instanceof Error ? error.message : 'Failed to fetch turbines',
          loading: { ...state.loading, turbines: false }
        }));
      }
    },

    // Fetch all dashboard data
    fetchAll: async () => {
      const fetchSummaryPromise = apiClient.getSummary();
      const fetchTurbinesPromise = apiClient.getWindTurbines({ limit: 150 });

      update(state => ({ 
        ...state, 
        loading: { summary: true, turbines: true }, 
        error: null 
      }));

      try {
        const [summary, turbinesResponse] = await Promise.all([
          fetchSummaryPromise,
          fetchTurbinesPromise
        ]);

        update(state => ({ 
          ...state, 
          summary,
          turbines: turbinesResponse.data,
          loading: { summary: false, turbines: false },
          lastUpdated: new Date()
        }));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        update(state => ({ 
          ...state, 
          error: error instanceof Error ? error.message : 'Failed to fetch dashboard data',
          loading: { summary: false, turbines: false }
        }));
      }
    },

    // Clear error
    clearError: () => {
      update(state => ({ ...state, error: null }));
    },

    // Reset store
    reset: () => {
      set(defaultState);
    }
  };
}

export const dashboardStore = createDashboardStore();
export type { DashboardSummary, DashboardState };
