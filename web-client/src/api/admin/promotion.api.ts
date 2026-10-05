import { apiRequest } from "../base-api";
import type { CreatePromotionDto, GetPromotionsResponse, PromotionResponse, UpdatePromotionDto } from "../types";

export const promotionApi = {
  getPromotions: async (token?: string, page = 1, pageSize = 10): Promise<PromotionResponse[]> => {
    const res = await apiRequest<PromotionResponse[] | GetPromotionsResponse>('/promotions', 'GET', {
      token,
      query: { page, pageSize },
    });
    return Array.isArray(res) ? res : res.items;
  },

  createPromotion: (token?: string, data?: CreatePromotionDto): Promise<PromotionResponse> =>
    apiRequest<PromotionResponse>('/promotions', 'POST', { token, data }),

  updatePromotion: (token?: string, id?: string, data?: UpdatePromotionDto): Promise<PromotionResponse> =>
    apiRequest<PromotionResponse>(`/promotions/${id}`, 'PUT', { token, data }),

  deletePromotion: (token?: string, id?: string): Promise<void> =>
    apiRequest<void>(`/promotions/${id}`, 'DELETE', { token }),
};
