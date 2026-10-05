import { apiRequest } from "../base-api";

interface StoreResponse {
  id: string;
  name: string;
  phoneNumber: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  location: string;
  createdAt: string;
  owner: string;
}

interface GetStoresResponse {
  items: StoreResponse[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const storeApi = {
  getStores: (token?: string, page = 1, pageSize = 10, status?: string): Promise<GetStoresResponse> =>
    apiRequest<GetStoresResponse>('/restaurants', 'GET', {
      token,
      query: { page, pageSize, ...(status ? { status } : {}) },
    }),
};
