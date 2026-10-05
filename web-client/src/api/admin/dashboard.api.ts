import { apiRequest } from "../base-api";

interface DashboardStats {
  totalShippers: number;
  activeShippers: number;
  completedOrders: number;
  totalRevenue: number;
}

interface ChartData {
  labels: string[];
  values: number[];
}

interface ShipperStats {
  total: number;
  active: number;
  changePercentage: number;
  isPositive: boolean;
}

interface OrderStats {
  completed: number;
  total: number;
  changePercentage: number;
  isPositive: boolean;
}

export const dashboardApi = {
  getStats: (token?: string): Promise<DashboardStats> =>
    apiRequest<DashboardStats>('/dashboard/stats', 'GET', { token }),

  getChartData: (
    token?: string,
    period: 'year' | 'month' | 'week' = 'year',
    metric: 'overview' | 'orders' | 'revenue' = 'overview'
  ): Promise<ChartData> =>
    apiRequest<ChartData>('/dashboard/chart-data', 'GET', { token, query: { period, metric } }),

  getShipperStats: (
    token?: string,
    period: 'year' | 'month' | 'week' = 'year'
  ): Promise<ShipperStats> =>
    apiRequest<ShipperStats>('/dashboard/shipper-stats', 'GET', { token, query: { period } }),

  getOrderCompletionStats: (
    token?: string,
    period: 'year' | 'month' | 'week' = 'year'
  ): Promise<OrderStats> =>
    apiRequest<OrderStats>('/dashboard/order-completion-stats', 'GET', { token, query: { period } }),

  // Alias for backward compatibility
  getDashboardStats: (token?: string): Promise<DashboardStats> =>
    apiRequest<DashboardStats>('/dashboard/stats', 'GET', { token }),
};
