import { PromotionType } from "@/interface";
import { apiRequest } from "../base-api";
import type { PaginatedResponse } from "../types";

export interface GuestPromotionResponse {
  id: string;
  code: string;
  description?: string;
  type: PromotionType;
  discountPercent?: number;
  discountAmount?: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  image?: string;
  startDate?: string;
  endDate?: string;
  numberOfUsed?: number;
  maxUsage?: number;
}

export const promotionApi = {
  getActivePromotions: (page = 1, pageSize = 10, name?: string): Promise<PaginatedResponse<GuestPromotionResponse>> =>
    apiRequest<PaginatedResponse<GuestPromotionResponse>>('/promotions/all', 'GET', {
      query: { page, pageSize, ...(name ? { name } : {}) },
    }),

  getPromotionById: (id: string): Promise<GuestPromotionResponse> =>
    apiRequest<GuestPromotionResponse>(`/promotions/${id}`, 'GET'),

  validatePromotionCode: (
    code: string,
    orderTotal?: number
  ): Promise<{ valid: boolean; promotion?: GuestPromotionResponse; discountAmount?: number; error?: string }> =>
    apiRequest('/promotions/validate', 'POST', { data: { code, orderTotal } }),
};
