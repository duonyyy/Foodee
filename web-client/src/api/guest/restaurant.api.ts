import { Restaurant, FoodPreview } from "@/interface";
import { apiRequest } from "../base-api";
import type { PaginatedResponse } from "../types";

const DEFAULT_LAT = 10.7769;
const DEFAULT_LNG = 106.6951;

export const restaurantApi = {
  getRestaurants: (page = 1, pageSize = 10, lat = DEFAULT_LAT, lng = DEFAULT_LNG): Promise<PaginatedResponse<Restaurant>> =>
    apiRequest<PaginatedResponse<Restaurant>>('/restaurants', 'GET', { query: { page, pageSize, lat, lng } }),

  getPopularRestaurants: (lat = DEFAULT_LAT, lng = DEFAULT_LNG): Promise<{ items: (Restaurant & { foods: FoodPreview[] })[] }> =>
    apiRequest<{ items: (Restaurant & { foods: FoodPreview[] })[] }>('/restaurants/popular', 'GET', { query: { lat, lng } }),

  getAllRestaurants: (page = 1, pageSize = 100, lat = DEFAULT_LAT, lng = DEFAULT_LNG): Promise<PaginatedResponse<Restaurant>> =>
    apiRequest<PaginatedResponse<Restaurant>>('/restaurants/all', 'GET', { query: { page, pageSize, lat, lng } }),

  getPreviewRestaurants: (page = 1, pageSize = 10, lat = DEFAULT_LAT, lng = DEFAULT_LNG): Promise<PaginatedResponse<Restaurant>> =>
    apiRequest<PaginatedResponse<Restaurant>>('/restaurants/preview', 'GET', { query: { page, pageSize, lat, lng } }),

  getRestaurantById: (id: string, lat = DEFAULT_LAT, lng = DEFAULT_LNG): Promise<Restaurant> =>
    apiRequest<Restaurant>(`/restaurants/${id}`, 'GET', { query: { lat, lng } }),

  searchRestaurants: (name: string, page = 1, pageSize = 10, lat = DEFAULT_LAT, lng = DEFAULT_LNG, radius = 5): Promise<PaginatedResponse<Restaurant>> =>
    apiRequest<PaginatedResponse<Restaurant>>('/restaurants/search', 'GET', { query: { name, page, pageSize, lat, lng, radius } }),
};
