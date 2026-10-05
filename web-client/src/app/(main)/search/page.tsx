"use client";

import { guestService } from "@/api/guest";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { Category, FoodPreview, Restaurant } from "@/interface";
import {
  CameraIcon,
  ExternalLink,
  Filter,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation"; // Add useRouter import
import { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import FoodCard from "../_components/food-card";

const ImageSearchModal = dynamic(() => import("../_components/image-search"), {
  ssr: false,
});

type FoodSortType =
  | "newest"
  | "nearby"
  | "hot"
  | "most_review"
  | "most_buy"
  | "rating"
  | "price"
  | "name";

const priceRanges = [
  { label: "Dưới 50.000đ", value: "under50", min: 0, max: 50000 },
  {
    label: "50.000đ - 100.000đ",
    value: "50to100",
    min: 50000,
    max: 100000,
  },
  {
    label: "Trên 100.000đ",
    value: "over100",
    min: 100000,
    max: Infinity,
  },
];

const radiusOptions = [
  { label: "1 km", value: 1 },
  { label: "5 km", value: 5 },
  { label: "10 km", value: 10 },
  { label: "20 km", value: 20 },
  { label: "50 km", value: 50 },
  { label: "100 km", value: 100 },
  { label: "Tất cả", value: 999999 },
];

const sortOptions: { label: string; value: FoodSortType }[] = [
  { label: "Mới nhất", value: "newest" },
  { label: "Gần nhất", value: "nearby" },
  { label: "Phổ biến", value: "hot" },
  { label: "Nhiều đánh giá", value: "most_review" },
  { label: "Bán chạy", value: "most_buy" },
  { label: "Đánh giá cao", value: "rating" },
  { label: "Giá tăng dần", value: "price" },
  { label: "Tên A-Z", value: "name" },
];

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategories =
    searchParams.get("categories")?.split(",").filter(Boolean) ?? [];

  const [search, setSearch] = useState(
    () => searchParams.get("search") || "",
  );
  const debouncedSearch = useDebounce(search, 400);

  const [foods, setFoods] = useState<FoodPreview[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(initialCategories);
  const [selectedPrices, setSelectedPrices] = useState<string[]>(
    () =>
      searchParams.get("prices")?.split(",").filter(Boolean) ?? [],
  );
  const [radius, setRadius] = useState(() =>
    searchParams.get("radius")
      ? Number(searchParams.get("radius"))
      : 1000,
  );
  const [sortBy, setSortBy] = useState<FoodSortType>(
    () => (searchParams.get("sort") as FoodSortType) || "newest",
  );
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Price filter logic
  const minPrice = useMemo(() => {
    if (selectedPrices.length === 0) return undefined;
    return Math.min(
      ...selectedPrices.map(
        (val) => priceRanges.find((r) => r.value === val)?.min ?? 0,
      ),
    );
  }, [selectedPrices]);
  const maxPrice = useMemo(() => {
    if (selectedPrices.length === 0) return undefined;
    return Math.max(
      ...selectedPrices.map(
        (val) =>
          priceRanges.find((r) => r.value === val)?.max ?? Infinity,
      ),
    );
  }, [selectedPrices]);

  // Check if all categories are selected
  const isAllCategoriesSelected =
    selectedCategories.length === categories.length &&
    categories.length > 0;

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (
      selectedCategories.length > 0 &&
      selectedCategories.length < categories.length
    )
      count++;
    if (selectedPrices.length > 0) count++;
    if (radius !== 1000) count++;
    return count;
  }, [
    selectedCategories.length,
    categories.length,
    selectedPrices.length,
    radius,
  ]);

  // Fetch initial categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRes =
          await guestService.category.getCategories(1, 50);
        const fetchedCategories = categoriesRes.items ?? [];
        setCategories(fetchedCategories);
        setSelectedCategories((current) =>
          current.length > 0
            ? current
            : fetchedCategories.map((category) => category.id),
        );
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Update URL search parameters when filters change
  useEffect(() => {
    if (isInitialLoading) return;

    const params = new URLSearchParams();
    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch);
    }

    if (
      selectedCategories.length > 0 &&
      selectedCategories.length < categories.length
    ) {
      params.set("categories", selectedCategories.join(","));
    }

    if (selectedPrices.length > 0) {
      params.set("prices", selectedPrices.join(","));
    }

    if (radius !== 1000) {
      params.set("radius", radius.toString());
    }

    if (sortBy !== "newest") {
      params.set("sort", sortBy);
    }

    const queryString = params.toString();
    const newURL = queryString ? `/search?${queryString}` : "/search";

    window.history.replaceState(null, "", newURL);
  }, [
    debouncedSearch,
    selectedCategories,
    selectedPrices,
    radius,
    sortBy,
    categories.length,
    isInitialLoading,
  ]);

  // Handle popstate for back/forward navigation sync
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get("search") || "");

      const cats =
        params.get("categories")?.split(",").filter(Boolean) ||
        categories.map((c) => c.id);
      setSelectedCategories(cats);

      const prs =
        params.get("prices")?.split(",").filter(Boolean) || [];
      setSelectedPrices(prs);

      setRadius(
        params.get("radius") ? Number(params.get("radius")) : 1000,
      );
      setSortBy((params.get("sort") as FoodSortType) || "newest");
    };

    window.addEventListener("popstate", handlePopState);
    return () =>
      window.removeEventListener("popstate", handlePopState);
  }, [categories]);

  // Fetch foods by search and filters from backend API
  useEffect(() => {
    if (isInitialLoading) return;

    const fetchFilteredFoods = async () => {
      setLoading(true);
      try {
        const query = debouncedSearch.trim();
        const cats =
          selectedCategories.length > 0
            ? selectedCategories
            : undefined;

        const res = await guestService.food.searchFoodsByName(
          query,
          1,
          100,
          10.7769,
          106.7009,
          radius,
          cats,
          minPrice,
          maxPrice === Infinity ? undefined : maxPrice,
          sortBy,
        );

        setFoods(res.items ?? []);
      } catch (error) {
        console.error("Error searching foods:", error);
        setFoods([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredFoods();
  }, [
    debouncedSearch,
    selectedCategories,
    minPrice,
    maxPrice,
    radius,
    sortBy,
    isInitialLoading,
  ]);

  // Handle restaurant click - navigate to restaurant detail page
  const handleRestaurantClick = (restaurantId: string) => {
    if (restaurantId) {
      router.push(`/restaurant/${restaurantId}`);
    }
  };

  // Handle category checkbox
  const handleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id)
        ? prev.filter((c) => c !== id)
        : [...prev, id],
    );
  };

  // Handle "ALL" categories checkbox
  const handleAllCategories = () => {
    if (isAllCategoriesSelected) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map((cat) => cat.id));
    }
  };

  // Handle price checkbox
  const handlePrice = (value: string) => {
    setSelectedPrices((prev) =>
      prev.includes(value)
        ? prev.filter((p) => p !== value)
        : [...prev, value],
    );
  };

  // Handle sort change
  const handleSortChange = (value: FoodSortType) => {
    setSortBy(value);
  };

  // Handle show all button
  const handleShowAll = () => {
    setSearch("");
    clearAllFilters();
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategories(categories.map((cat) => cat.id));
    setSelectedPrices([]);
    setRadius(1000);
  };

  // Create properly sorted foods that respect the sortBy parameter
  const sortedFoods = useMemo(() => {
    if (foods.length === 0) return [];

    // Since the API doesn't seem to be sorting properly, let's sort client-side
    const sorted = [...foods].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          // Sort by creation date (assuming newer items have larger IDs or timestamps)
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );

        case "nearby":
          // Sort by distance (this should already be working from API)
          const aDistance = Number(a.restaurant?.distance) || 999;
          const bDistance = Number(b.restaurant?.distance) || 999;
          return aDistance - bDistance;

        case "hot":
        case "most_buy":
          // Sort by sold count
          return (b.soldCount || 0) - (a.soldCount || 0);

        case "rating":
          // Sort by rating (highest first)
          const aRating = a.rating || 0;
          const bRating = b.rating || 0;
          if (bRating !== aRating) return bRating - aRating;
          // If ratings are equal, sort by review count
          return (b.rating || 0) - (a.rating || 0);

        case "price":
          // Sort by price (lowest first)
          const aPrice =
            typeof a.price === "number"
              ? a.price
              : parseFloat(a.price) || 0;
          const bPrice =
            typeof b.price === "number"
              ? b.price
              : parseFloat(b.price) || 0;
          return aPrice - bPrice;

        case "name":
          // Sort alphabetically by name
          return a.name.localeCompare(b.name, "vi");

        default:
          return 0;
      }
    });

    return sorted;
  }, [foods, sortBy]);

  // Create a sorted display that respects the sort order
  const sortedGroupedFoods = useMemo(() => {
    if (sortedFoods.length === 0) return [];

    // Group foods by restaurant while maintaining the order of first appearance
    const restaurantOrder: string[] = [];
    const groupMap = new Map<
      string,
      {
        restaurant: Restaurant;
        foods: FoodPreview[];
        firstIndex: number;
      }
    >();

    sortedFoods.forEach((food, index) => {
      const rid = food.restaurant?.id;
      if (!rid) return;

      if (!groupMap.has(rid)) {
        restaurantOrder.push(rid);
        groupMap.set(rid, {
          restaurant: food.restaurant,
          foods: [food],
          firstIndex: index,
        });
      } else {
        groupMap.get(rid)!.foods.push(food);
      }
    });

    // Sort restaurants based on the position of their first food in the sorted list
    restaurantOrder.sort((a, b) => {
      const aFirstIndex = groupMap.get(a)?.firstIndex ?? Infinity;
      const bFirstIndex = groupMap.get(b)?.firstIndex ?? Infinity;
      return aFirstIndex - bFirstIndex;
    });

    return restaurantOrder.map((rid) => groupMap.get(rid)!);
  }, [sortedFoods]);

  const searchSummary = useMemo(() => {
    if (loading && foods.length === 0) return "Đang tìm kiếm...";

    const count = foods.length;
    const parts = [];

    if (debouncedSearch.trim()) {
      parts.push(`từ khóa "${debouncedSearch}"`);
    }

    if (
      selectedCategories.length > 0 &&
      selectedCategories.length < categories.length
    ) {
      const catNames = selectedCategories
        .map((id) => categories.find((c) => c.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      parts.push(`danh mục: ${catNames}`);
    }

    if (selectedPrices.length > 0) {
      const priceLabels = selectedPrices
        .map((val) => priceRanges.find((r) => r.value === val)?.label)
        .filter(Boolean)
        .join(", ");
      parts.push(`khoảng giá: ${priceLabels}`);
    }

    if (radius !== 1000) {
      const radLabel =
        radiusOptions.find((o) => o.value === radius)?.label ||
        `${radius} km`;
      parts.push(`bán kính: ${radLabel}`);
    }

    const sortLabel =
      sortOptions.find((o) => o.value === sortBy)?.label ||
      "Mới nhất";

    if (parts.length === 0) {
      return `Hiển thị tất cả ${count} món ăn (Sắp xếp: ${sortLabel})`;
    }

    return `Tìm thấy ${count} món ăn cho ${parts.join(" • ")} (Sắp xếp: ${sortLabel})`;
  }, [
    foods.length,
    debouncedSearch,
    selectedCategories,
    selectedPrices,
    radius,
    sortBy,
    categories,
    loading,
  ]);

  const activeChips = useMemo(() => {
    const chips: { type: string; id: string; label: string }[] = [];

    if (debouncedSearch.trim()) {
      chips.push({
        type: "search",
        id: "search",
        label: `Từ khóa: "${debouncedSearch}"`,
      });
    }

    if (selectedCategories.length < categories.length) {
      selectedCategories.forEach((catId) => {
        const cat = categories.find((c) => c.id === catId);
        if (cat) {
          chips.push({
            type: "category",
            id: catId,
            label: cat.name,
          });
        }
      });
    }

    selectedPrices.forEach((priceVal) => {
      const range = priceRanges.find((r) => r.value === priceVal);
      if (range) {
        chips.push({
          type: "price",
          id: priceVal,
          label: range.label,
        });
      }
    });

    if (radius !== 1000) {
      const radLabel =
        radiusOptions.find((o) => o.value === radius)?.label ||
        `${radius} km`;
      chips.push({
        type: "radius",
        id: "radius",
        label: `Bán kính: ${radLabel}`,
      });
    }

    return chips;
  }, [
    debouncedSearch,
    selectedCategories,
    selectedPrices,
    radius,
    categories,
  ]);

  const removeChip = (chip: { type: string; id: string }) => {
    if (chip.type === "search") {
      setSearch("");
    } else if (chip.type === "category") {
      setSelectedCategories((prev) =>
        prev.filter((c) => c !== chip.id),
      );
    } else if (chip.type === "price") {
      setSelectedPrices((prev) => prev.filter((p) => p !== chip.id));
    } else if (chip.type === "radius") {
      setRadius(1000);
    }
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Clear filters */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Bộ lọc đã chọn</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-orange-600 hover:text-orange-700"
          >
            Xóa tất cả
          </Button>
        </div>
      )}

      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3 text-gray-900">Danh mục</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
            <Checkbox
              checked={isAllCategoriesSelected}
              onCheckedChange={handleAllCategories}
            />
            <span className="font-medium text-gray-700">Tất cả</span>
          </label>
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <Checkbox
                checked={selectedCategories.includes(cat.id)}
                onCheckedChange={() => handleCategory(cat.id)}
              />
              <span className="text-gray-700">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price ranges */}
      <div>
        <h3 className="font-semibold mb-3 text-gray-900">
          Khoảng giá
        </h3>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <label
              key={range.value}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <Checkbox
                checked={selectedPrices.includes(range.value)}
                onCheckedChange={() => handlePrice(range.value)}
              />
              <span className="text-gray-700">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Radius */}
      <div>
        <h3 className="font-semibold mb-3 text-gray-900">
          Bán kính giao hàng
        </h3>
        <Select
          value={radius.toString()}
          onValueChange={(val) => setRadius(Number(val))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn bán kính" />
          </SelectTrigger>
          <SelectContent>
            {radiusOptions.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value.toString()}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // Other existing code...

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tìm kiếm món ăn
          </h1>
          <p className="text-gray-600">
            Khám phá hàng ngàn món ăn ngon từ các nhà hàng gần bạn
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4">
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[300px]">
                <Input
                  className="pl-4 pr-12 py-3 text-lg border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                  placeholder="Tìm kiếm món ăn, nhà hàng..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-orange-100 transition-colors"
                  title="Tìm kiếm bằng hình ảnh"
                  onClick={() => setOpenImageModal(true)}
                >
                  <CameraIcon className="h-5 w-5 text-orange-500" />
                </button>
              </div>
              <Button
                onClick={handleShowAll}
                variant="outline"
                className="whitespace-nowrap px-6 py-3"
              >
                Hiển thị tất cả
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-80 shrink-0">
            <Card className="sticky top-6 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <SlidersHorizontal className="h-5 w-5 text-gray-700" />
                  <h2 className="font-semibold text-lg text-gray-900">
                    Bộ lọc
                  </h2>
                  {activeFiltersCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-auto bg-orange-100 text-orange-700"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </div>
                <FiltersContent />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <section
            className="min-w-0 flex-1"
            aria-label="Kết quả tìm kiếm"
          >
            {/* Mobile Filter Button + Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-3">
                {/* Mobile Filters Button */}
                <Button
                  variant="outline"
                  className="lg:hidden flex items-center gap-2"
                  onClick={() => setShowMobileFilters(true)}
                >
                  <Filter className="h-4 w-4" />
                  Bộ lọc
                  {activeFiltersCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-700 text-xs"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>

                {/* Results count/summary */}
                <span className="text-sm font-medium text-gray-600">
                  {searchSummary}
                </span>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2 justify-end">
                <span className="text-sm text-gray-600 hidden sm:block">
                  Sắp xếp:
                </span>
                <Select
                  value={sortBy}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {activeChips.map((chip) => (
                  <Badge
                    key={`${chip.type}-${chip.id}`}
                    variant="secondary"
                    className="flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-200 py-1.5 px-3 rounded-full text-xs font-semibold"
                  >
                    {chip.label}
                    <button
                      onClick={() => removeChip(chip)}
                      className="hover:text-orange-950 hover:bg-orange-100 p-0.5 rounded-full transition-colors focus-visible:outline-none"
                      title={`Xóa ${chip.label}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-orange-600 hover:text-orange-700 text-xs h-7 py-0 px-2 font-bold"
                >
                  Xóa tất cả bộ lọc
                </Button>
              </div>
            )}

            {/* Content Display */}
            {isInitialLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="aspect-[4/3] w-full rounded-xl bg-gray-200" />
                    <div className="mt-4 space-y-3">
                      <div className="h-4 w-2/3 rounded bg-gray-200" />
                      <div className="h-4 w-1/2 rounded bg-gray-200" />
                      <div className="flex justify-between items-center pt-2">
                        <div className="h-5 w-1/3 rounded bg-gray-200" />
                        <div className="h-8 w-1/3 rounded-lg bg-gray-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : foods.length === 0 ? (
              /* No Results State */
              <Card className="shadow-sm">
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SlidersHorizontal className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Không tìm thấy món ăn nào
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Thử thay đổi từ khóa tìm kiếm, điều chỉnh các bộ
                    lọc hoặc bán kính giao hàng.
                  </p>
                  <div className="flex justify-center gap-3">
                    {activeFiltersCount > 0 && (
                      <Button
                        onClick={clearAllFilters}
                        variant="outline"
                        className="font-bold border-orange-200 text-orange-700 hover:bg-orange-50"
                      >
                        Xóa tất cả bộ lọc
                      </Button>
                    )}
                    <Button
                      onClick={handleShowAll}
                      className="font-bold bg-primary hover:bg-primary-600"
                    >
                      Xem món ăn phổ biến
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Results List */
              <div
                className={`space-y-8 relative transition-opacity duration-200 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}
              >
                {/* Subtle overlay loading spinner for filter changes */}
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/10 backdrop-blur-[1px]">
                    <div className="flex items-center gap-2.5 bg-white/90 border border-gray-100 px-4 py-2.5 rounded-full shadow-lg text-sm font-semibold text-gray-700">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Đang cập nhật...
                    </div>
                  </div>
                )}
                {sortedGroupedFoods.map((group, groupIndex) => (
                  <div
                    key={group.restaurant.id}
                    className="space-y-4"
                  >
                    {/* Restaurant Header with Click Functionality */}
                    <div className="border-b border-gray-200 pb-4">
                      <div
                        className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors group"
                        onClick={() =>
                          handleRestaurantClick(group.restaurant.id)
                        }
                      >
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {group.restaurant.avatar ? (
                            <Image
                              src={group.restaurant.avatar}
                              alt={group.restaurant.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                              <span className="text-orange-600 font-bold text-lg">
                                {group.restaurant.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                              {group.restaurant.name}
                            </h3>
                            {/* Show ranking based on sort */}
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                              #{groupIndex + 1}
                            </span>
                            {/* External link icon */}
                            <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-orange-600 transition-colors opacity-0 group-hover:opacity-100" />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {group.restaurant.rating && (
                              <span className="flex items-center gap-1">
                                <span className="text-yellow-500">
                                  ⭐
                                </span>
                                <span className="font-medium">
                                  {group.restaurant.rating}
                                </span>
                              </span>
                            )}
                            {group.restaurant.distance && (
                              <span className="flex items-center gap-1">
                                <span>📍</span>
                                {group.restaurant.distance} km
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <span>🍽️</span>
                              {group.foods.length} món
                            </span>
                            {group.restaurant.deliveryTime && (
                              <span className="flex items-center gap-1">
                                <span>⏱️</span>
                                {group.restaurant.deliveryTime} phút
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                            Nhấp để xem chi tiết nhà hàng
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Horizontal Scrollable Foods - Maintain sort order within restaurant */}
                    <div className="relative">
                      <div
                        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
                        style={{ scrollSnapType: "x mandatory" }}
                      >
                        {group.foods.map((food, foodIndex) => (
                          <div
                            key={food.id}
                            className="flex-shrink-0 w-72"
                            style={{ scrollSnapAlign: "start" }}
                          >
                            {/* Show food ranking within restaurant for certain sorts */}
                            <div className="relative">
                              {(sortBy === "rating" ||
                                sortBy === "most_buy" ||
                                sortBy === "hot") && (
                                <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                                  #{foodIndex + 1}
                                </div>
                              )}
                              <FoodCard
                                food={food}
                                formatPrice={formatPrice}
                              />
                            </div>
                          </div>
                        ))}

                        {/* Show more card - also clickable */}
                        {group.foods.length > 5 && (
                          <Card
                            className="flex-shrink-0 w-32 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-dashed border-2 border-gray-300"
                            onClick={() =>
                              handleRestaurantClick(
                                group.restaurant.id,
                              )
                            }
                          >
                            <CardContent className="p-4 h-full flex flex-col items-center justify-center text-center">
                              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                                <span className="text-orange-600 text-sm">
                                  →
                                </span>
                              </div>
                              <span className="text-sm text-gray-600 font-medium">
                                Xem thêm
                              </span>
                              <span className="text-xs text-gray-500 mt-1">
                                +{group.foods.length - 5} món
                              </span>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Alternative: Simple Sorted Food Grid with click functionality */}
            {/* Uncomment this section if you prefer individual food cards
            {!loading && foods.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedIndividualFoods.map((food, index) => (
                  <Card 
                    key={food.id} 
                    className="overflow-hidden hover:shadow-md transition-shadow relative cursor-pointer"
                    onClick={() => handleFoodClick(food.id)}
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <Image 
                        src={food.image || food.imageUrls?.[0] || '/placeholder-food.jpg'} 
                        alt={food.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                      />
                      {food.discountPercent && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          -{food.discountPercent}%
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        #{index + 1}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1 hover:text-orange-600 transition-colors">
                        {food.name}
                      </h4>
                      <p className="text-sm text-orange-600 mb-2 cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); handleRestaurantClick(food.restaurant?.id || ''); }}>
                        {food.restaurant?.name}
                      </p>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {food.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-orange-600">
                          {typeof food.price === 'number' 
                            ? food.price.toLocaleString('vi-VN') + 'đ'
                            : food.price
                          }
                        </span>
                        {food.rating && (
                          <span className="text-sm text-gray-600">
                            ⭐ {food.rating}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        {food.preparationTime && (
                          <span>⏱️ {food.preparationTime} phút</span>
                        )}
                        {food.restaurant?.distance && (
                          <span>📍 {food.restaurant.distance} km</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            */}
          </section>
        </div>

        {/* Mobile Filters Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[85vh] overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Bộ lọc</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileFilters(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(85vh-80px)]">
                <FiltersContent />
              </div>
              <div className="p-4 border-t bg-white">
                <Button
                  className="w-full"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Áp dụng bộ lọc
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image search modal */}
      <ImageSearchModal
        open={openImageModal}
        onClose={() => setOpenImageModal(false)}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchPageInner />
    </Suspense>
  );
}
