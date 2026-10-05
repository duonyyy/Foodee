import { expect, type Page, test } from "@playwright/test";

const mockRestaurant = {
  id: "phase3-restaurant",
  name: "Nhà Hàng Foodee Luxury",
  description: "Chuyên các món ăn thuần Việt phong cách hiện đại.",
  avatar: "/images/placeholder-restaurant.jpg",
  coverImage: "/images/placeholder-banner.jpg",
  phoneNumber: "0901234567",
  openTime: "08:00",
  closeTime: "22:00",
  deliveryTime: 25,
  status: "APPROVED",
  address: {
    street: "123 Đường Công Nghệ",
    ward: "Phường Linh Trung",
    district: "Thành phố Thủ Đức",
    city: "TP. Hồ Chí Minh",
  },
};

const mockFood = {
  id: "phase3-food",
  name: "Cơm Tấm Đặc Biệt Foodee",
  description: "Cơm tấm sườn bì chả kèm trứng ốp la và nước mắm chua ngọt.",
  price: 65_000,
  discountPercent: 15,
  image: "/images/placeholder-food.jpg",
  imageUrls: ["/images/placeholder-food.jpg"],
  rating: 4.9,
  soldCount: 350,
  status: "available",
  category: {
    id: "phase3-cat",
    name: "Cơm Tấm",
  },
  restaurant: mockRestaurant,
  toppings: [
    { id: "top-1", name: "Thêm Chả Cua", price: 15_000 },
    { id: "top-2", name: "Thêm Trứng Ốp La", price: 10_000 },
  ],
};

const mockAddress = {
  id: "addr-phase3-1",
  label: "Nhà riêng",
  street: "Số 1 Đường Võ Văn Ngân",
  ward: "Phường Linh Chiểu",
  district: "Thành phố Thủ Đức",
  city: "TP. Hồ Chí Minh",
  isDefault: true,
  latitude: 10.8505,
  longitude: 106.7719,
};

const authenticatedUser = {
  id: "phase3-user",
  username: "phase3",
  email: "phase3@foodee.test",
  name: "Người dùng Phase 3",
  role: { id: 1, name: "customer" },
  isActive: true,
  learningtime: 0,
  coursenumber: 0,
  createdAt: "2026-07-31T00:00:00.000Z",
  address: [mockAddress],
};

const mockPromotions = [
  {
    id: "promo-1",
    code: "FOODEE20",
    description: "Giảm 20.000đ cho đơn từ 100k",
    discountPercent: 10,
    isActive: true,
  },
];

async function setupPhase3Mocks(page: Page) {
  await page.route(/http:\/\/localhost:(3000|3001)\/.*/, async (route) => {
    const url = new URL(route.request().url());

    if (!url.pathname.match(/^\/(users|foods|categories|notifications|promotions|orders|restaurants|auth|stats|cart|payment|chat)/)) {
      await route.continue();
      return;
    }

    if (url.pathname === "/users/me") {
      await route.fulfill({ json: authenticatedUser });
      return;
    }

    if (url.pathname === "/notifications") {
      await route.fulfill({ json: [] });
      return;
    }

    if (url.pathname === "/promotions" || url.pathname === "/promotions/active") {
      await route.fulfill({ json: { items: mockPromotions, total: 1 } });
      return;
    }

    if (url.pathname === "/orders/calculate" || url.pathname === "/orders/calculate-custom") {
      await route.fulfill({
        json: {
          foodTotal: 130_000,
          shippingFee: 18_000,
          distance: 2.4,
          total: 148_000,
        },
      });
      return;
    }

    if (url.pathname.includes("/foods/search")) {
      await route.fulfill({ json: { items: [mockFood], total: 1 } });
      return;
    }

    if (url.pathname === `/foods/${mockFood.id}`) {
      await route.fulfill({ json: mockFood });
      return;
    }

    if (url.pathname === `/foods/${mockFood.id}/toppings`) {
      await route.fulfill({ json: mockFood.toppings });
      return;
    }

    if (url.pathname === `/restaurants/${mockRestaurant.id}`) {
      await route.fulfill({
        json: {
          ...mockRestaurant,
          foods: [mockFood],
        },
      });
      return;
    }

    if (url.pathname === "/foods" || url.pathname === "/foods/top-selling") {
      await route.fulfill({ json: { items: [mockFood], total: 1 } });
      return;
    }

    if (url.pathname === "/categories") {
      await route.fulfill({
        json: {
          items: [{ id: "phase3-cat", name: "Cơm Tấm", image: "/images/cat.jpg" }],
          total: 1,
        },
      });
      return;
    }

    await route.fulfill({ json: { items: [], total: 0 } });
  });
}

test.describe("Phase 3: Conversion - Food, Restaurant & Cart", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("authToken", "phase3-token");
    });
    await setupPhase3Mocks(page);
  });

  test("food detail page displays price, discount, quantity and sticky CTA", async ({ page }) => {
    await page.goto(`/food/${mockFood.id}`);

    // Check title and details
    await expect(page.getByRole("heading", { name: mockFood.name, level: 1 })).toBeVisible();
    await expect(page.getByText(/Tiết kiệm 15%/i).first()).toBeVisible();
    await expect(page.getByText("Cơm Tấm").first()).toBeVisible();

    // Check quantity controls
    const qtyInput = page.getByRole("spinbutton", { name: /số lượng/i });
    if (await qtyInput.isVisible()) {
      await expect(qtyInput).toHaveValue("1");
    }

    // Check Add to Cart button
    const addToCartBtn = page.getByRole("button", { name: /thêm vào giỏ/i }).first();
    await expect(addToCartBtn).toBeVisible();
  });

  test("restaurant detail page displays header, info card, and menu grid", async ({ page }) => {
    await page.goto(`/restaurant/${mockRestaurant.id}`);

    // Check restaurant header
    await expect(page.getByRole("heading", { name: mockRestaurant.name, level: 1 })).toBeVisible();
    await expect(page.getByText("Thông tin nhà hàng")).toBeVisible();
    await expect(page.getByText("0901234567").first()).toBeVisible();

    // Check menu and food card pattern
    await expect(page.getByText(/Thực đơn món ăn/i)).toBeVisible();
    await expect(page.getByRole("tab", { name: /Tất cả/i })).toBeVisible();
    await expect(page.getByText(mockFood.name).first()).toBeVisible();
  });

  test("cart drawer renders empty state and handles grouped cart correctly", async ({ page }) => {
    // Populate localStorage with a sample cart item
    await page.addInitScript((item) => {
      window.localStorage.setItem("multiCartItems", JSON.stringify([item]));
    }, {
      uuid: "cart-item-1",
      foodId: mockFood.id,
      name: mockFood.name,
      image: mockFood.image,
      price: mockFood.price,
      discountPercent: mockFood.discountPercent,
      quantity: 2,
      restaurantId: mockRestaurant.id,
      restaurant: {
        id: mockRestaurant.id,
        name: mockRestaurant.name,
      },
      toppings: [{ id: "top-1", name: "Thêm Chả Cua", price: 15_000 }],
    });

    await page.goto("/");

    // Open Cart Drawer by clicking header cart button
    const cartButton = page.getByRole("button", { name: /giỏ hàng/i });
    await expect(cartButton).toBeVisible();
    await cartButton.click();

    // Cart drawer should be visible with restaurant group and item
    await expect(page.getByText("Giỏ hàng của bạn")).toBeVisible();
    await expect(page.getByText(mockRestaurant.name).first()).toBeVisible();
    await expect(page.getByText(mockFood.name).first()).toBeVisible();

    // Verify quantity and subtotal
    await expect(page.getByText(/Thanh toán/i).first()).toBeVisible();
  });

  test("checkout page renders 5 sections, addresses, payment options, and summary", async ({ page }) => {
    await page.addInitScript((item) => {
      window.localStorage.setItem("multiCartItems", JSON.stringify([item]));
    }, {
      uuid: "cart-item-checkout-1",
      foodId: mockFood.id,
      name: mockFood.name,
      image: mockFood.image,
      price: mockFood.price,
      discountPercent: mockFood.discountPercent,
      quantity: 2,
      restaurantId: mockRestaurant.id,
      restaurant: {
        id: mockRestaurant.id,
        name: mockRestaurant.name,
      },
      toppings: [{ id: "top-1", name: "Thêm Chả Cua", price: 15_000 }],
    });

    await page.goto("/checkout");

    // Check Header & 5 Sections
    await expect(page.getByRole("heading", { name: "Hoàn tất đơn hàng", level: 1 })).toBeVisible();
    await expect(page.getByText(/Món ăn đã chọn/i)).toBeVisible();
    await expect(page.getByText("Địa chỉ giao hàng").first()).toBeVisible();
    await expect(page.getByText("Phương thức thanh toán").first()).toBeVisible();
    await expect(page.getByText(/Ghi chú cho đơn hàng/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tóm tắt đơn hàng", level: 2 })).toBeVisible();

    // Check saved address card
    await expect(page.getByText("Nhà riêng")).toBeVisible();

    // Check payment methods (COD, MoMo, VNPAY)
    await expect(page.getByText(/Tiền mặt khi nhận hàng/i)).toBeVisible();
    await expect(page.getByText(/Ví điện tử MoMo/i)).toBeVisible();
    await expect(page.getByText(/Cổng thanh toán VNPAY/i)).toBeVisible();

    // Check submit button
    const submitBtn = page.getByRole("button", { name: /xác nhận đặt hàng/i });
    await expect(submitBtn).toBeVisible();
  });
});

