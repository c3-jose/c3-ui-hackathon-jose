export interface Manufacturer {
  name: string;
  country: string;
}

export interface WindTurbine {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  manufacturer: Manufacturer;
  builtDate: string;
  installationDate: string;
  active: boolean;
  ratedCapacityKW: number;
  createdAt: string;
  updatedAt: string;
}

export interface PowerOutput {
  timestamp: string;
  powerKW: number;
  windSpeed: number;
  temperature: number;
}

export interface WorkOrder {
  id: string;
  turbineId: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  daysOpen: number;
}

export interface AlertPrediction {
  id: string;
  turbineId: string;
  alertType: string;
  probability: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  predictedDate: string;
  description: string;
}

export interface FilterParams {
  location?: string;
  manufacturer?: string[];
  powerCapacity?: [number, number];
  sort?: string[];
  page?: number;
  limit?: number;
  search?: string;
}

export interface ApiResponse<T> {
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
