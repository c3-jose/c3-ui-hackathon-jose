import { writable, derived, type Readable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import type {
  WindTurbine,
  WindTurbineCreate,
  WorkOrder,
  ApiSummary,
  WindTurbineFilters,
  WorkOrderFilters,
  PaginationOptions,
  UserPreferences,
  Theme,
  Notification,
  NotificationType
} from './types';
import { api } from './api';

// Wind Turbines Store
interface WindTurbinesState {
  turbines: WindTurbine[];
  currentTurbine: WindTurbine | null;
  loading: boolean;
  error: string | null;
  filters: WindTurbineFilters;
  pagination: PaginationOptions;
  totalCount: number;
}

// Create wind turbines store
function createWindTurbinesStore() {
  const initialState: WindTurbinesState = {
    turbines: [],
    currentTurbine: null,
    loading: false,
    error: null,
    filters: {},
    pagination: { page: 1, limit: 100 }, // Maximum limit allowed by backend
    totalCount: 0
  };

  const { subscribe, set, update } = writable(initialState);

  // Define fetchTurbines first so it can be used internally
  const fetchTurbines = async () => {
    if (!browser) return; // Skip on server
    
    update(state => ({ ...state, loading: true, error: null }));
    try {
      let currentState: WindTurbinesState;
      const unsubscribe = subscribe(state => { currentState = state; });
      unsubscribe();
      
      // Fetch first page to get total count
      const firstResponse = await api.windTurbines.getAll(currentState!.filters, { page: 1, limit: 100 });
      
      let allTurbines = [...firstResponse.data];
      const totalPages = firstResponse.pagination.totalPages;
      
      // If there are more pages, fetch them all
      if (totalPages > 1) {
        const remainingPages = [];
        for (let page = 2; page <= totalPages; page++) {
          remainingPages.push(
            api.windTurbines.getAll(currentState!.filters, { page, limit: 100 })
          );
        }
        
        // Wait for all remaining pages
        const remainingResponses = await Promise.all(remainingPages);
        
        // Combine all data
        remainingResponses.forEach(response => {
          allTurbines.push(...response.data);
        });
      }
      
      update(state => ({
        ...state,
        turbines: allTurbines,
        loading: false,
        totalCount: firstResponse.pagination.total // Use actual total from backend
      }));
    } catch (error) {
      update(state => ({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to fetch turbines',
        loading: false
      }));
    }
  };

  return {
    subscribe,
    setTurbines: (turbines: WindTurbine[]) => update(state => ({ ...state, turbines })),
    setCurrentTurbine: (turbine: WindTurbine | null) => update(state => ({ ...state, currentTurbine: turbine })),
    setLoading: (loading: boolean) => update(state => ({ ...state, loading })),
    setError: (error: string | null) => update(state => ({ ...state, error })),
    setFilters: (filters: WindTurbineFilters) => update(state => ({ ...state, filters })),
    setPagination: (pagination: PaginationOptions) => update(state => ({ ...state, pagination })),
    setTotalCount: (count: number) => update(state => ({ ...state, totalCount: count })),

    fetchTurbines,

    fetchTurbineById: async (id: string) => {
      if (!browser) return; // Skip on server
      
      update(state => ({ ...state, loading: true, error: null }));
      try {
        const turbine = await api.windTurbines.getById(id);
        update(state => ({ ...state, currentTurbine: turbine, loading: false }));
      } catch (error) {
        update(state => ({
          ...state,
          error: error instanceof Error ? error.message : 'Failed to fetch turbine',
          loading: false
        }));
      }
    },

    createTurbine: async (turbineData: WindTurbineCreate): Promise<WindTurbine> => {
      if (!browser) throw new Error('Browser required'); // Skip on server
      
      update(state => ({ ...state, loading: true, error: null }));
      try {
        const newTurbine = await api.windTurbines.create(turbineData);
        console.log('Create turbine response:', newTurbine);
        
        // Ensure we have valid response data
        if (!newTurbine || !newTurbine.id) {
          throw new Error('Invalid response from server');
        }
        
        // ONLY update local state if API call was successful
        // Instead of manually adding, refresh the list to ensure pagination consistency
        update(state => ({
          ...state,
          loading: false,
          error: null // Clear any previous errors
        }));
        
        // Refresh the turbines list to get the updated data with proper pagination
        // This ensures the new turbine appears in the correct position
        await fetchTurbines();
        
        return newTurbine;
      } catch (error) {
        // DO NOT add to local state if there was an error
        update(state => ({
          ...state,
          error: error instanceof Error ? error.message : 'Failed to create turbine',
          loading: false
          // Do NOT modify turbines array on error
        }));
        throw error; // Re-throw so the UI can handle the error
      }
    },

    updateTurbine: async (id: string, updates: any) => {
      if (!browser) return; // Skip on server
      
      update(state => ({ ...state, loading: true, error: null }));
      try {
        const response = await api.windTurbines.update(id, updates);
        update(state => ({
          ...state,
          currentTurbine: state.currentTurbine?.id === id ? response.data : state.currentTurbine,
          loading: false
        }));
        // Refresh the list
        windTurbinesActions.fetchTurbines();
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
      if (!browser) return; // Skip on server
      
      update(state => ({ ...state, loading: true, error: null }));
      try {
        await api.windTurbines.delete(id);
        update(state => ({
          ...state,
          currentTurbine: state.currentTurbine?.id === id ? null : state.currentTurbine,
          loading: false
        }));
        // Refresh the list
        windTurbinesActions.fetchTurbines();
      } catch (error) {
        update(state => ({
          ...state,
          error: error instanceof Error ? error.message : 'Failed to delete turbine',
          loading: false
        }));
        throw error;
      }
    },

    updateFilters: (newFilters: Partial<WindTurbineFilters>) => {
      update(state => ({
        ...state,
        filters: { ...state.filters, ...newFilters },
        pagination: { ...state.pagination, page: 1 }
      }));
      windTurbinesActions.fetchTurbines();
    },

    resetFilters: () => {
      update(state => ({
        ...state,
        filters: {},
        pagination: { ...state.pagination, page: 1 }
      }));
      windTurbinesActions.fetchTurbines();
    }
  };
}

const windTurbinesActions = createWindTurbinesStore();

// Work Orders Store
interface WorkOrdersState {
  workOrders: WorkOrder[];
  currentWorkOrder: WorkOrder | null;
  loading: boolean;
  error: string | null;
  filters: WorkOrderFilters;
  pagination: PaginationOptions;
  totalCount: number;
}

function createWorkOrdersStore() {
  const initialState: WorkOrdersState = {
    workOrders: [],
    currentWorkOrder: null,
    loading: false,
    error: null,
    filters: {},
    pagination: { page: 1, limit: 20 },
    totalCount: 0
  };

  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    setWorkOrders: (workOrders: WorkOrder[]) => update(state => ({ ...state, workOrders })),
    setCurrentWorkOrder: (order: WorkOrder | null) => update(state => ({ ...state, currentWorkOrder: order })),
    setLoading: (loading: boolean) => update(state => ({ ...state, loading })),
    setError: (error: string | null) => update(state => ({ ...state, error })),
    setFilters: (filters: WorkOrderFilters) => update(state => ({ ...state, filters })),
    setPagination: (pagination: PaginationOptions) => update(state => ({ ...state, pagination })),
    setTotalCount: (count: number) => update(state => ({ ...state, totalCount: count })),

    fetchWorkOrders: async () => {
      if (!browser) return;
      
      update(state => ({ ...state, loading: true, error: null }));
      try {
        let currentState: WorkOrdersState;
        const unsubscribe = subscribe(state => { currentState = state; });
        unsubscribe();
        
        const response = await api.workOrders.getAll(currentState!.filters, currentState!.pagination);
        update(state => ({
          ...state,
          workOrders: response.data,
          loading: false,
          totalCount: response.data.length
        }));
      } catch (error) {
        update(state => ({
          ...state,
          error: error instanceof Error ? error.message : 'Failed to fetch work orders',
          loading: false
        }));
      }
    },

    fetchWorkOrderById: async (id: string) => {
      if (!browser) return;
      
      update(state => ({ ...state, loading: true, error: null }));
      try {
        const response = await api.workOrders.getById(id);
        update(state => ({ ...state, currentWorkOrder: response.data, loading: false }));
      } catch (error) {
        update(state => ({
          ...state,
          error: error instanceof Error ? error.message : 'Failed to fetch work order',
          loading: false
        }));
      }
    },

    updateFilters: (newFilters: Partial<WorkOrderFilters>) => {
      update(state => ({
        ...state,
        filters: { ...state.filters, ...newFilters },
        pagination: { ...state.pagination, page: 1 }
      }));
      workOrdersActions.fetchWorkOrders();
    },

    resetFilters: () => {
      update(state => ({
        ...state,
        filters: {},
        pagination: { ...state.pagination, page: 1 }
      }));
      workOrdersActions.fetchWorkOrders();
    }
  };
}

const workOrdersActions = createWorkOrdersStore();

// Dashboard Store
interface DashboardState {
  summary: ApiSummary | null;
  loading: boolean;
  error: string | null;
}

function createDashboardStore() {
  const initialState: DashboardState = {
    summary: null,
    loading: false,
    error: null
  };

  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    setSummary: (summary: ApiSummary) => update(state => ({ ...state, summary })),
    setLoading: (loading: boolean) => update(state => ({ ...state, loading })),
    setError: (error: string | null) => update(state => ({ ...state, error })),

    fetchSummary: async () => {
      if (!browser) return;
      
      update(state => ({ ...state, loading: true, error: null }));
      try {
        const summary = await api.summary.getSummary();
        update(state => ({ ...state, summary, loading: false }));
      } catch (error) {
        update(state => ({
          ...state,
          error: error instanceof Error ? error.message : 'Failed to fetch summary',
          loading: false
        }));
      }
    }
  };
}

const dashboardActions = createDashboardStore();

// Notifications Store
interface NotificationsState {
  notifications: Notification[];
}

function createNotificationsStore() {
  const initialState: NotificationsState = {
    notifications: []
  };

  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    addNotification: (type: NotificationType, title: string, message: string, persistent = false) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type,
        title,
        message,
        timestamp: new Date(),
        read: false,
        persistent
      };
      
      update(state => ({ notifications: [notification, ...state.notifications] }));
      
      // Auto-remove non-persistent notifications after 5 seconds
      if (!persistent && browser) {
        setTimeout(() => {
          notificationsActions.removeNotification(notification.id);
        }, 5000);
      }
    },

    removeNotification: (id: string) => {
      update(state => ({ notifications: state.notifications.filter(n => n.id !== id) }));
    },

    markAsRead: (id: string) => {
      update(state => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      }));
    },

    clearAll: () => {
      update(() => ({ notifications: [] }));
    }
  };
}

const notificationsActions = createNotificationsStore();

// Export the stores for component use
export const windTurbines = windTurbinesActions;
export const workOrders = workOrdersActions;
export const dashboard = dashboardActions;
export const notifications = notificationsActions;

// Export actions for direct access (using different names to avoid conflicts)
export { windTurbinesActions, workOrdersActions, dashboardActions, notificationsActions };

// User preferences store (simple Svelte store for now)
export const userPreferences = writable<UserPreferences>({
  theme: 'system',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  tableColumns: {},
  tableColumnOrder: [],
  itemsPerPage: 20
});

// Theme store
export const theme = writable<Theme>('system');
