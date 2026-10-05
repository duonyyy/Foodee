/**
 * @deprecated
 * File này chỉ giữ lại để tương thích ngược.
 * Tất cả types đã được chuyển vào `types/index.ts`.
 *
 * Thay thế import cũ:
 *   import { PaginatedResponse } from '@/api/response.interface'
 * Bằng import mới:
 *   import { PaginatedResponse } from '@/api/types'
 */
export type {
  PaginatedResponse,
  CategoryResponse,
  OrderResponse,
  CalculateOrderResponse,
  RoleDetailResponse,
  RoleFormData,
  GetRolesResponse,
  GetRoleUsersResponse,
  UserInRoleResponse,
  GetUsersResponse,
  PromotionResponse,
  CreatePromotionDto,
  UpdatePromotionDto,
  GetPromotionsResponse,
  AdminOrderDetail,
} from './types';
export { PromotionType } from './types';