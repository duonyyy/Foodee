"use client";

import { foodApi } from "@/api/guest/food.api";
import { useDebounce } from "@/hooks/use-debounce";
import type { FoodPreview } from "@/interface";
import { useEffect, useState } from "react";

type SuggestionStatus =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error";

const DEFAULT_LAT = 10.7769;
const DEFAULT_LNG = 106.6951;

export function useFoodSuggestions(
  query: string,
  lat?: number,
  lng?: number,
) {
  const debouncedQuery = useDebounce(query.trim(), 350);
  const [items, setItems] = useState<FoodPreview[]>([]);
  const [status, setStatus] = useState<SuggestionStatus>("idle");

  useEffect(() => {
    let cancelled = false;

    if (!debouncedQuery) {
      setItems([]);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    foodApi
      .searchFoods(
        debouncedQuery,
        1,
        5,
        lat ?? DEFAULT_LAT,
        lng ?? DEFAULT_LNG,
      )
      .then((response) => {
        if (cancelled) return;
        const nextItems = response.items ?? [];
        setItems(nextItems);
        setStatus(nextItems.length > 0 ? "success" : "empty");
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, lat, lng]);

  return {
    items,
    status,
    debouncedQuery,
    isDebouncing: query.trim() !== debouncedQuery,
  };
}
