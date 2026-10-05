import { apiRequest } from "../base-api";
import type { AdminOrderDetail, OrderReviewInfo } from "../types";

export const orderApi = {
  getOrdersByUser: (token?: string, userId?: string): Promise<AdminOrderDetail[]> =>
    apiRequest<AdminOrderDetail[]>(`/orders/user/${userId}`, 'GET', { token }),

  getOrderById: async (token?: string, id?: string): Promise<AdminOrderDetail> => {
    const [order, reviewInfo] = await Promise.all([
      apiRequest<AdminOrderDetail>(`/orders/${id}`, 'GET', { token }),
      apiRequest<OrderReviewInfo>(`/reviews/orders/${id}/summary`, 'GET', { token }),
    ]);

    return { ...order, reviewInfo };
  },

  getMyOrders: (token?: string): Promise<AdminOrderDetail[]> =>
    apiRequest<AdminOrderDetail[]>('/orders/my', 'GET', { token }),
};
