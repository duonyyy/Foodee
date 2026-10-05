/**
 * admin/index.ts — Facade barrel export
 *
 * Gom tất cả các admin API modules thành một object `adminService` duy nhất.
 * Các UI Component import từ '@/api/admin' sẽ không bị ảnh hưởng.
 */
import { dashboardApi } from './dashboard.api';
import { roleApi } from './role.api';
import { userApi } from './user.api';
import { storeApi } from './store.api';
import { categoryApi } from './category.api';
import { orderApi } from './order.api';
import { promotionApi } from './promotion.api';
import { restaurantApi } from './restaurant.api';
import { foodApi } from './food.api';
import { getMyRole, uploadCoverImage } from './misc.api';

export const adminService = {
  // Top-level utilities
  getMyRole,
  uploadCoverImage,

  // Domain modules (camelCase — chuẩn mới)
  dashboard: dashboardApi,
  role: roleApi,
  user: userApi,
  store: storeApi,
  category: categoryApi,
  order: orderApi,
  promotion: promotionApi,
  restaurant: restaurantApi,
  food: foodApi,

  // PascalCase aliases — backward compatibility với UI components cũ
  Role: roleApi,
  User: userApi,
  Store: storeApi,
  Category: categoryApi,
  Order: orderApi,
  Promotion: promotionApi,
};

// Re-exports để các component vẫn import type từ '@/api/admin'
export type { CategoryResponse, PromotionResponse, AdminOrderDetail, OrderResponse } from '../types';
export { PromotionType } from '../types';
