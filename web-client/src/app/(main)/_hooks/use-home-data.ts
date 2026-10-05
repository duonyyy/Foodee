"use client";

import { categoryApi } from "@/api/guest/category.api";
import { foodApi } from "@/api/guest/food.api";
import {
  promotionApi,
  type GuestPromotionResponse,
} from "@/api/guest/promotion.api";
import { restaurantApi } from "@/api/guest/restaurant.api";
import type { Category, FoodPreview, Restaurant } from "@/interface";
import { getAvailableFoodSync } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

export type HomeSectionStatus =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error";

type HomeSectionKey =
  | "foods"
  | "topSelling"
  | "nearby"
  | "restaurants"
  | "categories"
  | "promotions";

type HomeStatuses = Record<HomeSectionKey, HomeSectionStatus>;

interface HomeData {
  foods: FoodPreview[];
  topSellingFoods: FoodPreview[];
  nearbyFoods: FoodPreview[];
  restaurants: Restaurant[];
  categories: Category[];
  promotions: GuestPromotionResponse[];
}

const DEFAULT_LAT = 10.7769;
const DEFAULT_LNG = 106.6951;

const emptyData: HomeData = {
  foods: [],
  topSellingFoods: [],
  nearbyFoods: [],
  restaurants: [],
  categories: [],
  promotions: [],
};

const idleStatuses: HomeStatuses = {
  foods: "idle",
  topSelling: "idle",
  nearby: "idle",
  restaurants: "idle",
  categories: "idle",
  promotions: "idle",
};

const loadingStatuses: HomeStatuses = {
  foods: "loading",
  topSelling: "loading",
  nearby: "loading",
  restaurants: "loading",
  categories: "loading",
  promotions: "loading",
};

const statusFor = (items: unknown[]): HomeSectionStatus =>
  items.length > 0 ? "success" : "empty";

export function useHomeData(lat?: number, lng?: number) {
  const [data, setData] = useState<HomeData>(emptyData);
  const [statuses, setStatuses] =
    useState<HomeStatuses>(idleStatuses);
  const requestId = useRef(0);

  const fetchHomeData = useCallback(async () => {
    const currentRequest = ++requestId.current;
    const resolvedLat = lat ?? DEFAULT_LAT;
    const resolvedLng = lng ?? DEFAULT_LNG;
    setStatuses(loadingStatuses);

    const results = await Promise.allSettled([
      foodApi.getFoodsWithQuerry(1, 20, resolvedLat, resolvedLng),
      foodApi.getTopSellingFoods(1, 8, resolvedLat, resolvedLng),
      foodApi.getFoodsWithQuerry(1, 20, resolvedLat, resolvedLng),
      restaurantApi.getPopularRestaurants(resolvedLat, resolvedLng),
      categoryApi.getCategories(1, 20),
      promotionApi.getActivePromotions(1, 10),
    ]);

    if (currentRequest !== requestId.current) return;

    const [
      foodsResult,
      topSellingResult,
      nearbyResult,
      restaurantsResult,
      categoriesResult,
      promotionsResult,
    ] = results;

    const foods =
      foodsResult.status === "fulfilled"
        ? getAvailableFoodSync(foodsResult.value.items ?? [])
        : [];
    const topSellingFoods =
      topSellingResult.status === "fulfilled"
        ? getAvailableFoodSync(topSellingResult.value.items ?? [])
        : [];
    const nearbyFoods =
      nearbyResult.status === "fulfilled"
        ? getAvailableFoodSync(nearbyResult.value.items ?? [])
        : [];
    const restaurants =
      restaurantsResult.status === "fulfilled"
        ? (restaurantsResult.value.items ?? [])
        : [];
    const categories =
      categoriesResult.status === "fulfilled"
        ? (categoriesResult.value.items ?? [])
        : [];
    const promotions =
      promotionsResult.status === "fulfilled"
        ? (promotionsResult.value.items ?? [])
        : [];

    setData({
      foods,
      topSellingFoods,
      nearbyFoods,
      restaurants,
      categories,
      promotions,
    });
    setStatuses({
      foods:
        foodsResult.status === "fulfilled"
          ? statusFor(foods)
          : "error",
      topSelling:
        topSellingResult.status === "fulfilled"
          ? statusFor(topSellingFoods)
          : "error",
      nearby:
        nearbyResult.status === "fulfilled"
          ? statusFor(nearbyFoods)
          : "error",
      restaurants:
        restaurantsResult.status === "fulfilled"
          ? statusFor(restaurants)
          : "error",
      categories:
        categoriesResult.status === "fulfilled"
          ? statusFor(categories)
          : "error",
      promotions:
        promotionsResult.status === "fulfilled"
          ? statusFor(promotions)
          : "error",
    });
  }, [lat, lng]);

  useEffect(() => {
    void fetchHomeData();
    return () => {
      requestId.current += 1;
    };
  }, [fetchHomeData]);

  return {
    ...data,
    statuses,
    retry: fetchHomeData,
  };
}
