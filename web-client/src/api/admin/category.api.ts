import { apiRequest } from "../base-api";
import type { CategoryResponse } from "../types";

interface GetCategoriesResponse {
  items: CategoryResponse[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface CreateCategoryDto {
  name: string;
  image: string;
}

export const categoryApi = {
  getCategories: (token?: string, page = 1, pageSize = 10): Promise<GetCategoriesResponse> =>
    apiRequest<GetCategoriesResponse>('/categories', 'GET', { token, query: { page, pageSize } }),

  createCategory: (token?: string, data?: CreateCategoryDto): Promise<CategoryResponse> =>
    apiRequest<CategoryResponse>('/categories', 'POST', { token, data }),

  updateCategory: (token?: string, id?: string, data?: Partial<CreateCategoryDto>): Promise<CategoryResponse> =>
    apiRequest<CategoryResponse>(`/categories/${id}`, 'PUT', { token, data }),

  deleteCategory: (token?: string, id?: string): Promise<void> =>
    apiRequest<void>(`/categories/${id}`, 'DELETE', { token }),
};
