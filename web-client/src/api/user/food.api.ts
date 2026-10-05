import { FoodDetail, Topping } from "@/interface";
import { apiRequest } from "../base-api";
import type { PaginatedResponse } from "../types";

export const foodApi = {
  getFoodsByRestaurant: async (restaurantId: string): Promise<FoodDetail[]> => {
    const data = await apiRequest<PaginatedResponse<FoodDetail>>(
      `/foods/restaurant/${restaurantId}`, 'GET', { query: { page: 1, pageSize: 50 } }
    );
    return data.items;
  },

  createFood: (token?: string, data?: object): Promise<FoodDetail> =>
    apiRequest<FoodDetail>('/foods', 'POST', { token, data }),

  updateFood: (token?: string, id?: string, data?: object): Promise<FoodDetail> =>
    apiRequest<FoodDetail>(`/foods/${id}`, 'PUT', { token, data }),

  getFoodById: (token?: string, foodId?: string): Promise<FoodDetail> =>
    apiRequest<FoodDetail>(`/foods/${foodId}`, 'GET', { token }),

  deleteFood: (token?: string, id?: string): Promise<void> =>
    apiRequest<void>(`/foods/${id}`, 'DELETE', { token }),

  updateFoodStatus: (token?: string, id?: string, status?: string): Promise<FoodDetail> =>
    apiRequest<FoodDetail>(`/foods/${id}/status`, 'PUT', { token, data: { status } }),

  addTopping: (token?: string, foodId?: string, data?: Topping): Promise<Topping> =>
    apiRequest<Topping>(`/foods/${foodId}/toppings`, 'POST', { token, data }),

  updateTopping: (token?: string, toppingId?: string, data?: Topping): Promise<Topping> =>
    apiRequest<Topping>(`/foods/toppings/${toppingId}`, 'PUT', { token, data }),

  removeTopping: (token?: string, toppingId?: string): Promise<{ success: boolean }> =>
    apiRequest<{ success: boolean }>(`/foods/toppings/${toppingId}`, 'DELETE', { token }),

  getToppings: (foodId: string): Promise<Topping[]> =>
    apiRequest<Topping[]>(`/foods/${foodId}/toppings`, 'GET'),
};
