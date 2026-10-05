import { Restaurant } from "@/interface";
import { apiRequest } from "../base-api";
import type { PaginatedResponse } from "../types";

export const restaurantApi = {
  getRestaurants: (token?: string, page = 1, pageSize = 10): Promise<PaginatedResponse<Restaurant>> =>
    apiRequest<PaginatedResponse<Restaurant>>('/restaurants', 'GET', { token, query: { page, pageSize } }),
};
