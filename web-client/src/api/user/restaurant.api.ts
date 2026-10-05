import { Restaurant, FoodDetail } from "@/interface";
import { apiRequest } from "../base-api";

export const restaurantApi = {
  getMyRestaurant: (token?: string): Promise<Restaurant> =>
    apiRequest<Restaurant>('/restaurants/my', 'GET', { token }),

  createRestaurant: (token?: string, data?: object): Promise<unknown> =>
    apiRequest('/restaurants/request', 'POST', { token, data }),

  createRestaurantWithFiles: (token?: string, formData?: FormData): Promise<unknown> =>
    apiRequest('/restaurants/request', 'POST', { token, formData }),

  updateRestaurant: (token?: string, id?: string, formData?: FormData): Promise<unknown> =>
    apiRequest(`/restaurants/${id}/files`, 'PUT', { token, formData }),

  getOrderCountByMonth: (token?: string, month?: string): Promise<number> =>
    apiRequest<number>('/restaurants/my/order-count-by-month', 'GET', {
      token,
      query: month ? { month } : undefined,
    }),

  getRevenueByMonth: (token?: string, month?: string): Promise<number> =>
    apiRequest<number>('/restaurants/my/revenue-by-month', 'GET', {
      token,
      query: month ? { month } : undefined,
    }),

  getTopFoods: (restaurantId: string): Promise<FoodDetail[]> =>
    apiRequest<FoodDetail[]>('/foods/top', 'GET', { query: { restaurantId } }),

  getMyChartData: (token?: string): Promise<{ days: string[]; orderCounts: number[]; revenues: number[] }> =>
    apiRequest('/restaurants/my/chart-data', 'GET', { token }),
};
