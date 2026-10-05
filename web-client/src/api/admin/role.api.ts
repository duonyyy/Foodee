import { UserProfile } from "@/interface";
import { apiRequest } from "../base-api";
import type { GetRolesResponse, GetRoleUsersResponse, GetUsersResponse, RoleDetailResponse, RoleFormData } from "../types";

export const roleApi = {
  getRoles: async (
    token?: string,
    page = 1,
    pageSize = 10,
    search = ''
  ): Promise<GetRolesResponse> => {
    const query: Record<string, string | number> = { page, pageSize };
    if (search) query.search = search;
    const res = await apiRequest<RoleDetailResponse[]>('/role', 'GET', { token, query });
    return { data: res, total: res.length };
  },

  getRoleById: (token?: string, id?: string): Promise<RoleDetailResponse> =>
    apiRequest<RoleDetailResponse>(`/role/${id}`, 'GET', { token }),

  createRole: (token?: string, data?: RoleFormData): Promise<RoleDetailResponse> =>
    apiRequest<RoleDetailResponse>('/role', 'POST', { token, data }),

  updateRole: (token?: string, id?: string, data?: RoleFormData): Promise<RoleDetailResponse> =>
    apiRequest<RoleDetailResponse>(`/role/${id}`, 'PUT', { token, data }),

  deleteRole: (token?: string, id?: string): Promise<void> =>
    apiRequest<void>(`/role/${id}`, 'DELETE', { token }),

  getAllPermissions: (token?: string): Promise<string[]> =>
    apiRequest<string[]>('/role/permissions', 'GET', { token }),

  getGroupedPermissions: (token?: string): Promise<Record<string, string[]>> =>
    apiRequest<Record<string, string[]>>('/role/permissions/grouped', 'GET', { token }),

  getRoleUsers: async (
    token?: string,
    roleId?: string,
    page = 1,
    pageSize = 10,
    search = ''
  ): Promise<GetRoleUsersResponse> => {
    const query: Record<string, string | number> = { page, pageSize };
    if (search) query.search = search;
    const users = await apiRequest<UserProfile[]>(`/role/${roleId}/users`, 'GET', { token, query });
    const data = users.map((u) => ({
      id: u.id,
      username: u.name || '',
      email: u.email || '',
      name: u.name || u.email || '',
      avatar: u.avatar || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createdAt: (u as any).createdAt || new Date().toISOString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isActive: (u as any).isActive ?? true,
    }));
    return { data, total: users.length };
  },

  getAvailableUsers: async (
    token?: string,
    roleId?: string,
    limit = 50,
    search = ''
  ): Promise<GetUsersResponse> => {
    const query: Record<string, string | number> = { limit };
    if (search.trim()) query.search = search.trim();
    const users = await apiRequest<UserProfile[]>(`/role/${roleId}/users/available`, 'GET', { token, query });
    const data = users.map((u) => ({
      id: u.id,
      name: u.name || 'N/A',
      email: u.email || 'N/A',
      username: u.name || 'N/A',
      avatar: u.avatar || '/images/default-avatar.png',
    }));
    return { data, total: data.length };
  },

  assignRoleToUser: (token?: string, userId?: string, roleId?: string): Promise<void> =>
    apiRequest<void>('/role/assign', 'POST', { token, data: { userId, roleId } }),

  removeRoleFromUser: (token?: string, userId?: string, roleId?: string): Promise<void> =>
    apiRequest<void>('/role/remove', 'POST', { token, data: { userId, roleId } }),

  assignUsersToRole: (token?: string, userIds?: string[], roleId?: string): Promise<void> =>
    apiRequest<void>(`/role/${roleId}/assign-users`, 'POST', { token, data: { userIds, roleId } }),

  removeUsersFromRole: (token?: string, userIds?: string[], roleId?: string): Promise<void> =>
    apiRequest<void>(`/role/${roleId}/users/remove`, 'POST', { token, data: { userIds, roleId } }),

  updateRolePermissions: (token?: string, roleId?: string, permissions?: string[]): Promise<RoleDetailResponse> =>
    apiRequest<RoleDetailResponse>(`/role/${roleId}/permissions`, 'PUT', { token, data: { permissions } }),

  getRolePermissions: async (token?: string, roleId?: string): Promise<{ permissions: string[] }> => {
    const res = await apiRequest<{ permissions: string[] } | string[]>(`/role/${roleId}/permissions`, 'GET', { token });
    if (Array.isArray(res)) {
      return {
        permissions: res
          .map((p) => (typeof p === 'string' ? p : (p as { name?: string }).name || ''))
          .filter(Boolean),
      };
    }
    return res as { permissions: string[] };
  },

  checkUserPermission: (token?: string, permission?: string): Promise<{ hasPermission: boolean }> =>
    apiRequest<{ hasPermission: boolean }>('/role/check-permission', 'POST', { token, data: { permission } }),

  setDefaultRole: (token?: string, roleId?: string): Promise<RoleDetailResponse> =>
    apiRequest<RoleDetailResponse>(`/role/${roleId}/set-default`, 'PUT', { token }),

  getDefaultRole: (token?: string): Promise<RoleDetailResponse> =>
    apiRequest<RoleDetailResponse>('/role/default', 'GET', { token }),
};
