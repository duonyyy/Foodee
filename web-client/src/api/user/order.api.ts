import { Order } from "@/interface";
import { apiRequest } from "../base-api";
import type { CalculateOrderResponse, OrderResponse, PaginatedResponse } from "../types";

export const orderApi = {
  createOrder: (token?: string, data?: object): Promise<OrderResponse> =>
    apiRequest<OrderResponse>('/orders', 'POST', { token, data }),

  calculateOrder: (
    addressId: string,
    restaurantId: string,
    items: { foodId: string; quantity: number }[],
    promotionCode?: string
  ): Promise<CalculateOrderResponse> =>
    apiRequest<CalculateOrderResponse>('/orders/calculate', 'POST', {
      data: { addressId, restaurantId, items, promotionCode },
    }),

  calculateOrderWithCustomAddress: (
    address: {
      street: string; ward: string; district: string; city: string;
      latitude: number; longitude: number; label?: string;
    },
    restaurantId: string,
    items: { foodId: string; quantity: number }[],
    promotionCode?: string
  ): Promise<CalculateOrderResponse> =>
    apiRequest<CalculateOrderResponse>('/orders/calculate-custom', 'POST', {
      data: { address, restaurantId, items, promotionCode },
    }),

  getMyOrders: (token?: string, page = 1, pageSize = 10, status?: string): Promise<PaginatedResponse<Order>> =>
    apiRequest<PaginatedResponse<Order>>('/orders/my', 'GET', {
      token,
      query: { page, pageSize, ...(status ? { status } : {}) },
    }),

  getOrdersByMyRestaurant: (token?: string, page = 1, pageSize = 10, status?: string): Promise<PaginatedResponse<Order>> =>
    apiRequest<PaginatedResponse<Order>>('/orders/restaurant/my', 'GET', {
      token,
      query: { page, pageSize, ...(status ? { status } : {}) },
    }),

  updateOrderStatus: (token?: string, orderId?: string, status?: string): Promise<Order> =>
    apiRequest<Order>(`/orders/${orderId}/status`, 'PUT', { token, data: { status } }),
};
