/**
 * user/index.ts — Facade barrel export
 *
 * Gom tất cả user API modules thành object `userApi`.
 * Import từ '@/api/user' vẫn hoạt động bình thường.
 */
import { profileApi } from './profile.api';
import { foodApi } from './food.api';
import { orderApi } from './order.api';
import { reviewApi } from './review.api';
import { messengerApi } from './messenger.api';
import { restaurantApi } from './restaurant.api';

export const userApi = {
  // Top-level profile methods (backward compat: userApi.getMe, userApi.updateMe...)
  ...profileApi,

  // Domain namespaces
  food: foodApi,
  order: orderApi,
  review: reviewApi,
  messenger: messengerApi,
  restaurant: restaurantApi,
};

export type { CreateShipperReviewDto } from './review.api';
