import { Category } from "@/interface";
import { apiRequest } from "../base-api";
import type { PaginatedResponse } from "../types";

export const categoryApi = {
  getCategories: (page = 1, pageSize = 20): Promise<PaginatedResponse<Category>> =>
    apiRequest<PaginatedResponse<Category>>('/categories', 'GET', { query: { page, pageSize } }),

  getCategoryById: (id: string): Promise<Category> =>
    apiRequest<Category>(`/categories/${id}`, 'GET'),
};
