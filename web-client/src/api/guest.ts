/**
 * @deprecated
 * File này chỉ giữ lại để tương thích ngược (backward compatibility).
 * Tất cả logic đã được chuyển vào thư mục `guest/`.
 *
 * Thay thế import cũ:
 *   import { guestService } from '@/api/guest'
 * Bằng import mới (nếu muốn):
 *   import { guestService } from '@/api/guest/index'
 */
export { guestService } from './guest/index';
export type { GuestPromotionResponse } from './guest/index';