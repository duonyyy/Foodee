import { apiRequest } from "../base-api";

interface UserResponse {
  id: string;
  name: string;
  email: string;
  group: string;
  courses: number;
  createdAt: string;
  status: string;
}

interface GetUsersListResponse {
  data: UserResponse[];
  total: number;
}

export const userApi = {
  getUsers: async (token?: string, page = 1, pageSize = 10): Promise<GetUsersListResponse> => {
    const res = await apiRequest<UserResponse[]>('/users', 'GET', { token, query: { page, pageSize } });
    return {
      data: res.map((u) => ({
        id: u.id,
        name: u.name || 'N/A',
        email: u.email || 'N/A',
        group: u.group || '-',
        courses: u.courses || 0,
        createdAt: new Date(u.createdAt).toLocaleDateString('vi-VN'),
        status: u.status || 'Inactive',
      })),
      total: res.length,
    };
  },
};
