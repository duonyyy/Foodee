/**
 * @deprecated
 * File này chỉ giữ lại để tương thích ngược (backward compatibility).
 * Tất cả logic đã được chuyển vào thư mục `user/`.
 *
 * Thay thế import cũ:
 *   import { userApi } from '@/api/user'
 * Bằng import mới (nếu muốn):
 *   import { userApi } from '@/api/user/index'
 */
export { userApi } from './user/index';
export type { CreateShipperReviewDto } from './user/index';