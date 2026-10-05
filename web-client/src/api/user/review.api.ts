import { apiRequest } from "../base-api";
import type { PaginatedResponse } from "../types";

interface CreateFoodReviewDto {
  foodId: string;
  comment: string;
  image: string;
  rating: number;
}

export interface CreateShipperReviewDto {
  shipperId: string;
  rating: number;
  comment: string;
}

export const reviewApi = {
  createFoodReview: (token?: string, data?: CreateFoodReviewDto): Promise<unknown> =>
    apiRequest('/reviews/food', 'POST', { token, data }),

  createShipperReview: (token?: string, data?: CreateShipperReviewDto): Promise<unknown> =>
    apiRequest('/reviews/shipper', 'POST', { token, data }),

  getFoodReviews: (foodId: string, page = 1, pageSize = 10): Promise<PaginatedResponse<unknown>> =>
    apiRequest<PaginatedResponse<unknown>>(`/reviews/food/${foodId}`, 'GET', { query: { page, pageSize } }),

  checkFoodReviewStatus: (token?: string, foodId?: string): Promise<{ hasReviewed: boolean }> =>
    apiRequest<{ hasReviewed: boolean }>(`/reviews/food/${foodId}/status`, 'GET', { token }),
};
