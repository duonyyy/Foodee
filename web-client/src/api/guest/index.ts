/**
 * guest/index.ts — Facade barrel export
 *
 * Gom tất cả guest API modules thành object `guestService`.
 * Import từ '@/api/guest' vẫn hoạt động bình thường.
 */
import { foodApi } from './food.api';
import { restaurantApi } from './restaurant.api';
import { categoryApi } from './category.api';
import { promotionApi } from './promotion.api';

export const guestService = {
  food: foodApi,
  restaurant: restaurantApi,
  category: categoryApi,
  promotion: promotionApi,
};

export type { GuestPromotionResponse } from './promotion.api';
