/**
 * @deprecated
 * File này chỉ giữ lại để tương thích ngược (backward compatibility).
 * Tất cả logic đã được chuyển vào thư mục `admin/`.
 *
 * Thay thế import cũ:
 *   import { adminService } from '@/api/admin'
 * Bằng import mới (nếu muốn):
 *   import { adminService } from '@/api/admin/index'
 */
export { adminService } from './admin/index';
export type { CategoryResponse, PromotionResponse, AdminOrderDetail, OrderResponse } from './admin/index';
export { PromotionType } from './admin/index';