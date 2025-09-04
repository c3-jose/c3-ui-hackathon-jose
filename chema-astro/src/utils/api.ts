import type { WindTurbine, WorkOrder, PowerOutput, AlertPrediction, ApiResponse, FilterParams } from '../types/windturbine.js';

const API_BASE_URL = 'http://localhost:3000/api/1';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Build query string from filter parameters
  private buildQueryString(params: FilterParams): string {
    const searchParams = new URLSearchParams();

    if (params.location) searchParams.append('location', params.location);
    if (params.manufacturer?.length) searchParams.append('manufacturer', params.manufacturer.join(','));
    if (params.powerCapacity) searchParams.append('power_capacity', `${params.powerCapacity[0]}..${params.powerCapacity[1]}`);
    if (params.sort?.length) searchParams.append('sort', params.sort.join(','));
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('name', params.search);

    return searchParams.toString();
  }

  // Wind Turbines API
  async getWindTurbines(filters?: FilterParams): Promise<ApiResponse<WindTurbine[]>> {
    const queryString = filters ? this.buildQueryString(filters) : '';
    const endpoint = `/windturbines${queryString ? `?${queryString}` : ''}`;
    return this.request<ApiResponse<WindTurbine[]>>(endpoint);
  }

  async getWindTurbine(id: string): Promise<WindTurbine> {
    return this.request<WindTurbine>(`/windturbines/${id}`);
  }

  async createWindTurbine(turbine: Omit<WindTurbine, 'id' | 'createdAt' | 'updatedAt'>): Promise<WindTurbine> {
    return this.request<WindTurbine>('/windturbines', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(turbine),
    });
  }

  async updateWindTurbine(id: string, data: Partial<WindTurbine>): Promise<WindTurbine> {
    return this.request<WindTurbine>(`/windturbines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWindTurbine(id: string): Promise<void> {
    return this.request<void>(`/windturbines/${id}`, {
      method: 'DELETE',
    });
  }

  // Work Orders API
  async getWorkOrders(turbineId: string): Promise<WorkOrder[]> {
    return this.request<WorkOrder[]>(`/windturbines/${turbineId}/work-orders`);
  }

  // Power Output API (timeseries data)
  async getPowerOutput(turbineId: string, startDate?: string, endDate?: string): Promise<PowerOutput[]> {
    let endpoint = `/windturbines/${turbineId}/power-output`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return this.request<PowerOutput[]>(endpoint);
  }

  // Alert Predictions API
  async getAlertPredictions(turbineId: string): Promise<AlertPrediction[]> {
    return this.request<AlertPrediction[]>(`/windturbines/${turbineId}/alert-predictions`);
  }

  // Summary/Dashboard API
  async getSummary(): Promise<{
    totalTurbines: number;
    activeTurbines: number;
    totalWorkOrders: number;
    openWorkOrders: number;
    inProgressWorkOrders: number;
    avgPowerOutput: number;
  }> {
    return this.request('/summary');
  }

  // Health check
  async getHealth(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
