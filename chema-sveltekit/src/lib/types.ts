// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp?: string;
}

export interface ApiSummary {
  totalTurbines: number;
  activeTurbines: number;
  totalWorkOrders: number;
  openWorkOrders: number;
  inProgressWorkOrders: number;
  avgPowerOutput: number;
}

// Wind Turbine Types
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

export interface WindTurbineCreate {
  name: string;
  latitude: number;
  longitude: number;
  manufacturer: Manufacturer;
  builtDate: string;
  installationDate: string;
  active: boolean;
  ratedCapacityKW: number;
}

export interface WindTurbineUpdate {
  name?: string;
  latitude?: number;
  longitude?: number;
  manufacturer?: Manufacturer;
  builtDate?: string;
  installationDate?: string;
  active?: boolean;
  ratedCapacityKW?: number;
}

// Work Order Types
export type WorkOrderStatus = 'open' | 'in_progress' | 'completed';

export interface WorkOrder {
  id: string;
  windTurbineId: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  creationDate: string;
  resolutionDate: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  windTurbine: {
    id: string;
    name: string;
    active: boolean;
  };
}

export interface WorkOrderCreate {
  windTurbineId: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  creationDate: string;
  resolutionDate?: string | null;
}

export interface WorkOrderUpdate {
  title?: string;
  description?: string;
  status?: WorkOrderStatus;
  resolutionDate?: string | null;
}

// Power Output Types (for future streaming data)
export interface PowerOutput {
  id: string;
  windTurbineId: string;
  timestamp: string;
  powerKW: number;
  windSpeed: number;
  efficiency: number;
}

// Filter and Sort Types
export interface WindTurbineFilters {
  active?: boolean;
  manufacturer?: string;
  country?: string;
  ratedCapacityMin?: number;
  ratedCapacityMax?: number;
  location?: string;
  search?: string;
}

export interface WorkOrderFilters {
  status?: WorkOrderStatus[];
  windTurbineId?: string;
  createdAfter?: string;
  createdBefore?: string;
  search?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: string;
  direction: SortDirection;
}

// Pagination Types
export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: SortOption[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Chart Data Types
export interface ChartDataPoint {
  label: string;
  value: number;
  timestamp?: string;
}

export interface TimeSeriesData {
  turbineId: string;
  turbineName: string;
  data: ChartDataPoint[];
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  colors: {
    primary: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    accentHover: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    bgPrimary: string;
    bgSecondary: string;
    bgTertiary: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    borderColor: string;
    borderColorLight: string;
  };
  fontFamily?: string;
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
  shadows?: boolean;
}

// User Preferences
export interface UserPreferences {
  theme: Theme;
  language: string;
  timezone: string;
  tableColumns: {
    [key: string]: boolean;
  };
  tableColumnOrder: string[];
  itemsPerPage: number;
}

// Notification Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  persistent?: boolean;
}
