import type {
  WindTurbine,
  WindTurbineCreate,
  WindTurbineUpdate,
  WorkOrder,
  WorkOrderCreate,
  WorkOrderUpdate,
  ApiResponse,
  ApiSummary,
  WindTurbineFilters,
  WorkOrderFilters,
  PaginationOptions,
  PaginatedResponse
} from './types';

const API_BASE_URL = 'http://localhost:3000/api/1';

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    // Try to get error details from response body
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // If can't parse JSON, use default message
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
}

// Helper function to build query string from filters and pagination
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });
  
  return searchParams.toString();
}

// Wind Turbines API
export const windTurbinesAPI = {
  // Get all wind turbines with optional filtering and pagination
  async getAll(
    filters: WindTurbineFilters = {}, 
    pagination: PaginationOptions = { page: 1, limit: 50 }
  ): Promise<PaginatedResponse<WindTurbine>> {
    const queryParams = {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
      ...(pagination.sort && {
        sort: pagination.sort.map(s => `${s.direction === 'desc' ? '-' : ''}${s.field}`).join(',')
      })
    };
    
    const queryString = buildQueryString(queryParams);
    const endpoint = `/windturbines${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<PaginatedResponse<WindTurbine>>(endpoint);
  },

  // Get a single wind turbine by ID
  async getById(id: string): Promise<WindTurbine> {
    return apiRequest<WindTurbine>(`/windturbines/${id}`);
  },

  // Create a new wind turbine
  async create(turbine: WindTurbineCreate): Promise<WindTurbine> {
    return apiRequest<WindTurbine>('/windturbines', {
      method: 'POST',
      body: JSON.stringify(turbine)
    });
  },

  // Update an existing wind turbine
  async update(id: string, updates: WindTurbineUpdate): Promise<ApiResponse<WindTurbine>> {
    return apiRequest<ApiResponse<WindTurbine>>(`/windturbines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // Delete a wind turbine
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiRequest<ApiResponse<null>>(`/windturbines/${id}`, {
      method: 'DELETE'
    });
  },

  // Get work orders for a specific turbine
  async getWorkOrders(id: string): Promise<ApiResponse<WorkOrder[]>> {
    return apiRequest<ApiResponse<WorkOrder[]>>(`/windturbines/${id}/workorders`);
  },

  // Get power output data for a specific turbine
  async getPowerOutput(id: string, startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    
    const queryString = params.toString();
    const endpoint = `/windturbines/${id}/power-output${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  }
};

// Work Orders API
export const workOrdersAPI = {
  // Get all work orders with optional filtering and pagination
  async getAll(
    filters: WorkOrderFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 50 }
  ): Promise<ApiResponse<WorkOrder[]>> {
    const queryParams = {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
      ...(pagination.sort && {
        sort: pagination.sort.map(s => `${s.direction === 'desc' ? '-' : ''}${s.field}`).join(',')
      })
    };
    
    const queryString = buildQueryString(queryParams);
    const endpoint = `/workorders${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<ApiResponse<WorkOrder[]>>(endpoint);
  },

  // Get a single work order by ID
  async getById(id: string): Promise<ApiResponse<WorkOrder>> {
    return apiRequest<ApiResponse<WorkOrder>>(`/workorders/${id}`);
  },

  // Create a new work order
  async create(workOrder: WorkOrderCreate): Promise<ApiResponse<WorkOrder>> {
    return apiRequest<ApiResponse<WorkOrder>>('/workorders', {
      method: 'POST',
      body: JSON.stringify(workOrder)
    });
  },

  // Update an existing work order
  async update(id: string, updates: WorkOrderUpdate): Promise<ApiResponse<WorkOrder>> {
    return apiRequest<ApiResponse<WorkOrder>>(`/workorders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // Delete a work order
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiRequest<ApiResponse<null>>(`/workorders/${id}`, {
      method: 'DELETE'
    });
  }
};

// Summary/Dashboard API
export const summaryAPI = {
  // Get dashboard summary statistics
  async getSummary(): Promise<ApiSummary> {
    return apiRequest<ApiSummary>('/summary');
  }
};

// Export a combined API object
export const api = {
  windTurbines: windTurbinesAPI,
  workOrders: workOrdersAPI,
  summary: summaryAPI
};

export default api;
