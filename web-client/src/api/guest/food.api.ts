import { FoodPreview, FoodDetail, Review, Topping } from "@/interface";
import { apiRequest } from "../base-api";
import type { PaginatedResponse } from "../types";

/** Tọa độ mặc định: TP.HCM */
const DEFAULT_LAT = 10.7769;
const DEFAULT_LNG = 106.6951;

export const foodApi = {
  getFoods: (page = 1, pageSize = 10, lat = DEFAULT_LAT, lng = DEFAULT_LNG): Promise<PaginatedResponse<FoodPreview>> =>
    apiRequest<PaginatedResponse<FoodPreview>>('/foods', 'GET', { query: { page, pageSize, lat, lng } }),

  getFoodsWithDiscount: (page = 1, pageSize = 10, lat = DEFAULT_LAT, lng = DEFAULT_LNG): Promise<PaginatedResponse<FoodPreview>> =>
    apiRequest<PaginatedResponse<FoodPreview>>('/foods/with-discount', 'GET', { query: { page, pageSize, lat, lng } }),

  getTopSellingFoods: (page = 1, pageSize = 10, lat = DEFAULT_LAT, lng = DEFAULT_LNG): Promise<PaginatedResponse<FoodPreview>> =>
    apiRequest<PaginatedResponse<FoodPreview>>('/foods/top-selling', 'GET', { query: { page, pageSize, lat, lng } }),

  getNewestFoods: (page = 1, pageSize = 10, lat = DEFAULT_LAT, lng = DEFAULT_LNG): Promise<PaginatedResponse<FoodPreview>> =>
    apiRequest<PaginatedResponse<FoodPreview>>('/foods/newest', 'GET', { query: { page, pageSize, lat, lng } }),

  getFoodsByCategory: (categoryId: string, page = 1, pageSize = 10, lat = DEFAULT_LAT, lng = DEFAULT_LNG): Promise<PaginatedResponse<FoodPreview>> =>
    apiRequest<PaginatedResponse<FoodPreview>>(`/foods/category/${categoryId}`, 'GET', { query: { page, pageSize, lat, lng } }),

  getFoodsByRestaurant: (restaurantId: string, page = 1, pageSize = 10, lat = DEFAULT_LAT, lng = DEFAULT_LNG): Promise<PaginatedResponse<FoodPreview>> =>
    apiRequest<PaginatedResponse<FoodPreview>>(`/foods/restaurant/${restaurantId}`, 'GET', { query: { page, pageSize, lat, lng } }),

  getFoodsByCategoryAndRestaurant: (categoryId: string, restaurantId: string, page = 1, pageSize = 10, lat = DEFAULT_LAT, lng = DEFAULT_LNG): Promise<PaginatedResponse<FoodPreview>> =>
    apiRequest<PaginatedResponse<FoodPreview>>(`/foods/category/${categoryId}/restaurant/${restaurantId}`, 'GET', { query: { page, pageSize, lat, lng } }),

  getFoodsWithDiscountByRestaurant: (restaurantId: string, page = 1, pageSize = 10, lat = DEFAULT_LAT, lng = DEFAULT_LNG): Promise<PaginatedResponse<FoodPreview>> =>
    apiRequest<PaginatedResponse<FoodPreview>>(`/foods/restaurant/${restaurantId}/with-discount`, 'GET', { query: { page, pageSize, lat, lng } }),

  getTopSellingFoodsByRestaurant: (restaurantId: string, page = 1, pageSize = 10, lat = DEFAULT_LAT, lng = DEFAULT_LNG): Promise<PaginatedResponse<FoodPreview>> =>
    apiRequest<PaginatedResponse<FoodPreview>>(`/foods/restaurant/${restaurantId}/top-selling`, 'GET', { query: { page, pageSize, lat, lng } }),

  getFoodById: (id: string, lat = DEFAULT_LAT, lng = DEFAULT_LNG): Promise<FoodDetail> =>
    apiRequest<FoodDetail>(`/foods/${id}`, 'GET', { query: { lat, lng } }),

  searchFoods: (query: string, page = 1, pageSize = 10, lat = DEFAULT_LAT, lng = DEFAULT_LNG, radius = 5): Promise<PaginatedResponse<FoodPreview>> =>
    apiRequest<PaginatedResponse<FoodPreview>>('/foods/search', 'GET', { query: { query, page, pageSize, lat, lng, radius } }),

  searchFoodsByName: (
    name: string,
    page = 1,
    pageSize = 10,
    lat = DEFAULT_LAT,
    lng = 106.7009,
    radius = 5,
    categoryIds?: string[],
    minPrice?: number,
    maxPrice?: number,
    sortBy?: string
  ): Promise<PaginatedResponse<FoodPreview>> =>
    apiRequest<PaginatedResponse<FoodPreview>>('/foods/by-name', 'GET', {
      query: {
        name, page, pageSize, lat, lng, radius,
        ...(categoryIds?.length ? { categoryIds: categoryIds.join(',') } : {}),
        ...(minPrice !== undefined ? { minPrice } : {}),
        ...(maxPrice !== undefined ? { maxPrice } : {}),
        ...(sortBy ? { sortBy } : {}),
      },
    }),

  getFoodReviews: (foodId: string, page = 1, pageSize = 10): Promise<PaginatedResponse<Review>> =>
    apiRequest<PaginatedResponse<Review>>(`/foods/${foodId}/reviews`, 'GET', { query: { page, pageSize } }),

  getToppingsByFoodId: (foodId: string): Promise<Topping[]> =>
    apiRequest<Topping[]>(`/foods/${foodId}/toppings`, 'GET'),

  // Alias for backward compatibility (typo preserved intentionally)
  getFoodsWithQuerry: (page = 1, pageSize = 10, lat = DEFAULT_LAT, lng = DEFAULT_LNG): Promise<PaginatedResponse<FoodPreview>> =>
    apiRequest<PaginatedResponse<FoodPreview>>('/foods', 'GET', { query: { page, pageSize, lat, lng } }),
};
