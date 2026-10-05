"use client";

import { ToppingSelectModal } from "@/app/(main)/_components/topping-selection";
import { guestService } from "@/api/guest";
import { useNotification } from "@/components/ui/notification";
import { FoodDetail, FoodPreview, Topping } from "@/interface";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// Cart item kèm id và thông tin nhà hàng
export interface CartItem {
  uuid: string;
  foodId: string;
  quantity: number;
  restaurantId: string;

  name: string;
  description: string;
  image: string;
  price: number;
  discountPercent?: number;

  restaurant?: {
    id: string;
    name: string;
    avatar?: string;
    deliveryTime?: number | string;
    distance?: number | string;
  };

  toppings: {
    id: string;
    name: string;
    price: number;
  }[];
}

export interface GroupedCartItem {
  restaurant: FoodPreview["restaurant"];
  items: CartItem[];
}

export type CartItemPreview = FoodPreview & {
  uuid: string;
  quantity: number;
  discountPercent?: number;
  toppings?: Topping[];
  price: number;
  total: number;
};

interface CartContextType {
  cartItems: CartItem[];
  groupedCartItems: GroupedCartItem[];
  addToCart: (
    itemId: string,
    quantity?: number,
    onComplete?: () => void,
  ) => Promise<void>;
  addToCartWithToppings: (
    food: FoodDetail,
    selectedToppingIds: string[],
    quantity?: number,
    onComplete?: () => void,
  ) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: (restaurantId?: string) => void;
  getCartItems: () => Promise<CartItemPreview[]>;
  getCartItemsGrouped: () => Promise<Record<string, (FoodPreview & { quantity: number })[]>>;
  getTotalItems: () => number;
  getTotalPrice: () => Promise<number>;
  removeInvalidCartItems: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [pendingFood, setPendingFood] = useState<FoodDetail | null>(null);
  const [toppingModalOpen, setToppingModalOpen] = useState(false);
  const [pendingQuantity, setPendingQuantity] = useState(1);
  const [pendingCartCompletion, setPendingCartCompletion] = useState<
    (() => void) | null
  >(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [groupedCartItems, setGroupedCartItems] = useState<GroupedCartItem[]>([]);
  const { showNotification } = useNotification();

  // Khởi tạo từ localStorage
  useEffect(() => {
    const stored = localStorage.getItem("multiCartItems");
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch {
        setCartItems([]);
      }
    }
  }, []);

  const generateCartItemUUID = (foodId: string, toppingIds: string[]) => {
    const sortedIds = [...toppingIds].sort();
    return `${foodId}__${sortedIds.join("-")}`;
  };

  // Gom nhóm món theo quán đồng bộ trong bộ nhớ (0ms latency, không gây N+1 API storm)
  const updateGroupedItems = useCallback((items: CartItem[]) => {
    const groupedMap = new Map<string, GroupedCartItem>();
    const missingRestaurantItems: { foodId: string; restaurantId: string }[] = [];

    for (const item of items) {
      const restId = item.restaurantId || item.restaurant?.id || "unknown";
      if (!groupedMap.has(restId)) {
        const restObj = item.restaurant || {
          id: restId,
          name: "Nhà hàng",
        };
        groupedMap.set(restId, {
          restaurant: restObj as FoodPreview["restaurant"],
          items: [],
        });

        if (!item.restaurant?.name || item.restaurant.name === "Nhà hàng") {
          missingRestaurantItems.push({ foodId: item.foodId, restaurantId: restId });
        }
      }

      groupedMap.get(restId)!.items.push({
        ...item,
        uuid: item.uuid ?? crypto.randomUUID(),
        toppings: item.toppings || [],
      });
    }

    setGroupedCartItems(Array.from(groupedMap.values()));

    // Bổ sung thông tin quán nền nếu dữ liệu cũ trong localStorage thiếu metadata
    if (missingRestaurantItems.length > 0) {
      const uniqueFoodIds = Array.from(new Set(missingRestaurantItems.map((m) => m.foodId)));
      Promise.allSettled(
        uniqueFoodIds.map((fid) => guestService.food.getFoodById(fid))
      ).then((results) => {
        let hasUpdate = false;
        results.forEach((res) => {
          if (res.status === "fulfilled" && res.value?.restaurant) {
            const r = res.value.restaurant;
            if (groupedMap.has(r.id)) {
              groupedMap.get(r.id)!.restaurant = r;
              hasUpdate = true;
            }
          }
        });
        if (hasUpdate) {
          setGroupedCartItems(Array.from(groupedMap.values()));
        }
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("multiCartItems", JSON.stringify(cartItems));
    updateGroupedItems(cartItems);
  }, [cartItems, updateGroupedItems]);

  const addToCart = async (
    foodId: string,
    quantity = 1,
    onComplete?: () => void,
  ) => {
    try {
      const food = await guestService.food.getFoodById(foodId);
      const resolvedFoodId = food?.id;
      const resolvedRestaurant = food?.restaurant;
      const resolvedRestaurantId = resolvedRestaurant?.id;

      if (!food || !resolvedFoodId || !resolvedRestaurantId) {
        showNotification("Món ăn không hợp lệ.", "error");
        return;
      }

      const toppings = await guestService.food.getToppingsByFoodId(foodId);

      if (toppings.length === 0) {
        const uuid = generateCartItemUUID(resolvedFoodId, []);
        const amount = Math.max(1, quantity);

        setCartItems((prev) => {
          const existingItem = prev.find((item) => item.uuid === uuid);
          if (existingItem) {
            return prev.map((item) =>
              item.uuid === uuid
                ? { ...item, quantity: item.quantity + amount }
                : item,
            );
          }

          return [
            ...prev,
            {
              uuid,
              foodId: resolvedFoodId,
              name: food.name,
              description: food.description,
              image: food.image,
              price: Number(food.price),
              discountPercent: food.discountPercent || 0,
              quantity: amount,
              restaurantId: resolvedRestaurantId,
              restaurant: {
                id: resolvedRestaurant.id,
                name: resolvedRestaurant.name,
                avatar: resolvedRestaurant.avatar,
                deliveryTime: resolvedRestaurant.deliveryTime,
                distance: resolvedRestaurant.distance,
              },
              toppings: [],
            },
          ];
        });

        showNotification(`Đã thêm ${amount} món vào giỏ hàng.`, "success");
        onComplete?.();
      } else {
        setPendingFood({ ...food, toppings });
        setPendingQuantity(Math.max(1, quantity));
        setPendingCartCompletion(() => onComplete ?? null);
        setToppingModalOpen(true);
      }
    } catch {
      showNotification("Lỗi khi thêm món vào giỏ hàng.", "error");
    }
  };

  const addToCartWithToppings = (
    food: FoodDetail,
    selectedToppingIds: string[],
    quantity = 1,
    onComplete?: () => void,
  ) => {
    const selectedToppings = (food.toppings || [])
      .filter((t) => selectedToppingIds.includes(t.id!))
      .map((t) => ({
        id: t.id!,
        name: t.name,
        price: Number(t.price),
      }));

    const uuid = generateCartItemUUID(food.id!, selectedToppingIds);
    const amount = Math.max(1, quantity);

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.uuid === uuid);
      if (existingItem) {
        return prev.map((item) =>
          item.uuid === uuid
            ? { ...item, quantity: item.quantity + amount }
            : item,
        );
      }

      return [
        ...prev,
        {
          uuid,
          foodId: food.id!,
          name: food.name,
          description: food.description,
          image: food.image,
          price: Number(food.price),
          discountPercent: food.discountPercent || 0,
          quantity: amount,
          restaurantId: food.restaurant.id!,
          restaurant: {
            id: food.restaurant.id,
            name: food.restaurant.name,
            avatar: food.restaurant.avatar,
            deliveryTime: food.restaurant.deliveryTime,
            distance: food.restaurant.distance,
          },
          toppings: selectedToppings,
        },
      ];
    });

    setToppingModalOpen(false);
    setPendingFood(null);
    setPendingCartCompletion(null);
    showNotification(`Đã thêm ${amount} món vào giỏ hàng.`, "success");
    onComplete?.();
  };

  const updateQuantity = (uuid: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(uuid);
      return;
    }

    const clamped = Math.min(99, Math.max(1, quantity));

    setCartItems((prev) =>
      prev.map((item) =>
        item.uuid === uuid ? { ...item, quantity: clamped } : item
      )
    );
  };

  const removeFromCart = (uuid: string) => {
    setCartItems((prev) => prev.filter((item) => item.uuid !== uuid));
    showNotification("Đã xoá món khỏi giỏ hàng.", "info");
  };

  const clearCart = (restaurantId?: string) => {
    if (restaurantId) {
      setCartItems((prev) => prev.filter((item) => item.restaurantId !== restaurantId));
    } else {
      setCartItems([]);
    }
  };

  // Trả về cart items nhanh chóng không cần gọi N+1 API
  const getCartItems = useCallback(async (): Promise<CartItemPreview[]> => {
    return cartItems.map((cartItem) => {
      const basePrice = Number(cartItem.price) || 0;
      const discountPercent = Number(cartItem.discountPercent) || 0;
      const discountedPrice =
        discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : basePrice;
      const toppingTotal =
        cartItem.toppings?.reduce((sum, topping) => sum + (Number(topping.price) || 0), 0) ??
        0;

      return {
        id: cartItem.foodId,
        uuid: cartItem.uuid,
        name: cartItem.name,
        description: cartItem.description || "",
        image: cartItem.image,
        imageUrls: [cartItem.image],
        price: basePrice,
        quantity: cartItem.quantity,
        discountPercent,
        toppings: cartItem.toppings as Topping[],
        total: (discountedPrice + toppingTotal) * cartItem.quantity,
        restaurant: (cartItem.restaurant || {
          id: cartItem.restaurantId,
          name: "Nhà hàng",
        }) as FoodPreview["restaurant"],
      };
    });
  }, [cartItems]);

  const getCartItemsGrouped = async (): Promise<Record<string, (FoodPreview & { quantity: number })[]>> => {
    const grouped: Record<string, (FoodPreview & { quantity: number })[]> = {};
    for (const item of cartItems) {
      if (!grouped[item.restaurantId]) {
        grouped[item.restaurantId] = [];
      }
      grouped[item.restaurantId].push({
        id: item.foodId,
        name: item.name,
        description: item.description,
        image: item.image,
        imageUrls: [item.image],
        price: item.price,
        quantity: item.quantity,
        discountPercent: item.discountPercent,
        restaurant: (item.restaurant || {
          id: item.restaurantId,
          name: "Nhà hàng",
        }) as FoodPreview["restaurant"],
      });
    }
    return grouped;
  };

  const getTotalItems = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  const getTotalPrice = async () => {
    const items = await getCartItems();
    return items.reduce((acc, item) => acc + (item.total || 0), 0);
  };

  const removeInvalidCartItems = async () => {
    setCartItems((prev) => prev.filter((item) => item.foodId && item.restaurantId));
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        groupedCartItems,
        addToCart,
        addToCartWithToppings,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartItems,
        getCartItemsGrouped,
        getTotalItems,
        getTotalPrice,
        removeInvalidCartItems,
      }}
    >
      {children}
      {pendingFood && (
        <ToppingSelectModal
          open={toppingModalOpen}
          food={pendingFood}
          initialQuantity={pendingQuantity}
          onConfirm={(selectedIds, customQty) =>
            addToCartWithToppings(
              pendingFood,
              selectedIds,
              customQty ?? pendingQuantity,
              pendingCartCompletion ?? undefined,
            )
          }
          onClose={() => {
            setToppingModalOpen(false);
            setPendingFood(null);
            setPendingCartCompletion(null);
          }}
        />
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
};

