/**
 * types/index.ts — Centralized shared types
 *
 * Tất cả interfaces và types dùng chung giữa các API modules được đặt ở đây.
 * Tránh duplicate type definitions trên nhiều file.
 */

import { Address, Order, Promotion, Review, ShippingDetail, UserProfile } from "@/interface";

// ─── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Category ──────────────────────────────────────────────────────────────────

export interface CategoryResponse {
  id: string;
  name: string;
  image: string;
  foodCount: number;
}

// ─── Order ─────────────────────────────────────────────────────────────────────

export interface OrderResponse {
  order: Order;
  paymentUrl?: string;
  checkoutId?: string;
}

export interface CalculateOrderResponse {
  foodTotal: number;
  shippingFee: number;
  distance: number;
  total: number;
}

// ─── Role ──────────────────────────────────────────────────────────────────────

export interface RoleDetailResponse {
  id: string;
  name: string;
  displayName: string;
  description: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  userCount: number;
}

export interface RoleFormData {
  displayName: string;
  description: string;
}

export interface GetRolesResponse {
  data: RoleDetailResponse[];
  total: number;
}

export interface GetRoleUsersResponse {
  data: UserInRoleResponse[];
  total: number;
}

export interface UserInRoleResponse {
  id: string;
  username: string;
  email: string;
  name: string | null;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface GetUsersResponse {
  data: UserProfile[];
  total: number;
}

// ─── Promotion ─────────────────────────────────────────────────────────────────

export enum PromotionType {
  FOOD_DISCOUNT = 'FOOD_DISCOUNT',
  SHIPPING_DISCOUNT = 'SHIPPING_DISCOUNT',
}

export interface PromotionResponse {
  id: string;
  code: string;
  description?: string;
  type: PromotionType;
  discountPercent?: number;
  discountAmount?: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  image?: string;
  startDate?: string;
  endDate?: string;
  numberOfUsed?: number;
  maxUsage?: number;
}

export interface CreatePromotionDto {
  code: string;
  description?: string;
  type: PromotionType;
  discountPercent?: number;
  discountAmount?: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  image?: string;
  startDate?: string;
  endDate?: string;
  maxUsage?: number;
}

export interface UpdatePromotionDto {
  code?: string;
  description?: string;
  type?: PromotionType;
  discountPercent?: number;
  discountAmount?: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  image?: string;
  startDate?: string;
  endDate?: string;
  maxUsage?: number;
}

export interface GetPromotionsResponse {
  items: PromotionResponse[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Admin Order Detail ────────────────────────────────────────────────────────

export interface OrderReviewInfo {
  hasReviewedFood: boolean;
  hasReviewedShipper: boolean;
  foodReviews: Review[];
  shipperReview: Review | null;
  canReviewFood: boolean;
  canReviewShipper: boolean;
}

export interface AdminOrderDetail {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  total: string;
  note: string;
  date: string;
  paymentMethod: string;
  paymentDate: string | null;
  isPaid: boolean;
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    phone: string;
    avatar: string;
    isActive: boolean;
    authProvider: string;
    role: { id: string; name: string; displayName: string };
    address: {
      id: string;
      street: string;
      ward: string;
      district: string;
      city: string;
      isDefault: boolean;
      label: string | null;
      latitude?: number;
      longitude?: number;
    }[];
  };
  restaurant: {
    id: string;
    name: string;
    phoneNumber: string;
    backgroundImage: string;
    avatar: string;
    description: string;
    rating: string;
    status: string;
    latitude: string;
    longitude: string;
    address: {
      id: string;
      street: string;
      ward: string;
      district: string;
      city: string;
      latitude: number;
      longitude: number;
      isDefault: boolean;
      label: string | null;
    };
  };
  orderDetails: {
    id: string;
    varity: string | null;
    quantity: number;
    price: string;
    note: string | null;
    food: {
      id: string;
      description: string;
      image: string;
      imageUrls: string[] | null;
      name: string;
      price: string;
      discountPercent: string;
      rating: string;
      status: string;
      tag: string | null;
      createdAt: string;
      updatedAt: string;
      preparationTime: number | null;
    };
  }[];
  shippingDetail: ShippingDetail | null;
  promotionCode: Promotion | null;
  address: Address | null;
  reviewInfo: OrderReviewInfo;
}
