/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserProfile } from "@/interface";
import { apiRequest } from "../base-api";

interface UpdateUserDto {
  username?: string;
  password?: string;
  email?: string;
  name?: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  birthday?: Date;
}

export const profileApi = {
  getMe: async (token?: string): Promise<UserProfile> => {
    const res = await apiRequest<UserProfile>('/users/me', 'GET', { token });
    if (res && (res as any).data) return (res as any).data as UserProfile;
    return res;
  },

  updateMe: async (token?: string, data?: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await apiRequest<UserProfile>('/users/me', 'PUT', { token, data });
    if (res && (res as any).data) return (res as any).data as UserProfile;
    return res;
  },

  getAll: (token?: string): Promise<UserProfile[]> =>
    apiRequest<UserProfile[]>('/users', 'GET', { token }),

  getUserById: (token?: string, id?: string): Promise<UserProfile> =>
    apiRequest<UserProfile>(`/users/${id}`, 'GET', { token }),

  createUser: (token?: string, data?: UpdateUserDto): Promise<UserProfile> =>
    apiRequest<UserProfile>('/users', 'POST', { token, data }),

  updateUser: (token?: string, id?: string, data?: UpdateUserDto): Promise<UserProfile> =>
    apiRequest<UserProfile>(`/users/${id}`, 'PUT', { token, data }),

  deleteUser: (token?: string, id?: string): Promise<void> =>
    apiRequest<void>(`/users/${id}`, 'DELETE', { token }),
};
