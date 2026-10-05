import { FoodDetail } from "@/interface";
import { apiRequest } from "../base-api";
import type { PaginatedResponse } from "../types";

export const foodApi = {
  getFoods: (
    token?: string,
    page = 1,
    limit = 10,
    search = '',
    restaurantId = 'all',
    categoryId = 'all',
    status = 'all'
  ): Promise<PaginatedResponse<FoodDetail>> =>
    apiRequest<PaginatedResponse<FoodDetail>>('/foods/all', 'GET', {
      token,
      query: { page, limit, search, restaurantId, categoryId, status },
    }),

  deleteFood: (token?: string, id?: string): Promise<void> =>
    apiRequest<void>(`/foods/${id}`, 'DELETE', { token }),
};
