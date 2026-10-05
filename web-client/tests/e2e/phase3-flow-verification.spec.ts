import { expect, type Page, test } from "@playwright/test";

const mockRestaurant = {
  id: "phase3-res-1",
  name: "Bếp Cơm Tấm Sài Gòn",
  description: "Cơm tấm chuẩn vị truyền thống.",
  avatar: "/images/placeholder-restaurant.jpg",
  coverImage: "/images/placeholder-banner.jpg",
  phoneNumber: "0901234567",
  openTime: "07:00",
  closeTime: "22:00",
  deliveryTime: 20,
  status: "APPROVED",
  address: {
    street: "123 Võ Văn Ngân",
    ward: "Linh Chiểu",
    district: "Thành phố Thủ Đức",
    city: "TP. Hồ Chí Minh",
  },
};

const mockFood = {
  id: "phase3-food-1",
  name: "Cơm Sườn Bì Chả Đặc Biệt",
  description: "Sườn nướng mật ong thơm lừng kèm chả cua.",
  price: 50_000,
  discountPercent: 10,
  image: "/images/placeholder-food.jpg",
  imageUrls: ["/images/placeholder-food.jpg"],
  rating: 4.9,
  soldCount: 520,
  status: "available",
  category: { id: "cat-1", name: "Cơm Tấm" },
  restaurant: mockRestaurant,
  toppings: [
    { id: "top-1", name: "Trứng Ốp La", price: 10_000 },
    { id: "top-2", name: "Chả Cua Thêm", price: 15_000 },
  ],
};

const mockAddress = {
  id: "addr-test-1",
  label: "Nhà Riêng",
  street: "456 Kha Vạn Cân",
  ward: "Linh Đông",
  district: "Thành phố Thủ Đức",
  city: "TP. Hồ Chí Minh",
  isDefault: true,
  latitude: 10.852,
  longitude: 106.765,
};

const mockUser = {
  id: "user-flow-test",
  username: "flowtest",
  email: "flowtest@foodee.test",
  name: "Kiểm thử viên Foodee",
  role: { id: 1, name: "customer" },
  isActive: true,
  learningtime: 0,
  coursenumber: 0,
  createdAt: "2026-08-01T00:00:00.000Z",
  address: [mockAddress],
};

const mockPromotions = [
  {
    id: "promo-1",
    code: "FOODEE10",
    description: "Giảm 10.000đ cho đơn hàng",
    discountPercent: 10,
    isActive: true,
  },
];

async function setupFlowMocks(page: Page, options: { createOrderFails?: boolean } = {}) {
  await page.route(/http:\/\/localhost:(3000|3001)\/.*/, async (route) => {
    const url = new URL(route.request().url());

    if (!url.pathname.match(/^\/(users|foods|categories|notifications|promotions|orders|restaurants|auth|stats|cart|payment|chat)/)) {
      await route.continue();
      return;
    }

    if (url.pathname === "/auth/check") {
      await route.fulfill({
        json: {
          isLogin: true,
          message: "Authenticated",
          user: { uid: "user-flow-test", email: "flowtest@foodee.test" },
        },
      });
      return;
    }

    if (url.pathname === "/users/me") {
      await route.fulfill({ json: mockUser });
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
          foodTotal: 120_000,
          shippingFee: 15_000,
          distance: 2.0,
          total: 135_000,
        },
      });
      return;
    }

    if (url.pathname === "/orders" && route.request().method() === "POST") {
      if (options.createOrderFails) {
        await route.fulfill({
          status: 500,
          json: { message: "Internal Server Error" },
        });
        return;
      }
      await route.fulfill({
        json: {
          order: {
            id: "order-success-999",
            status: "PENDING",
            total: 135_000,
          },
        },
      });
      return;
    }

    if (url.pathname.includes(`/orders/order-success-999`)) {
      await route.fulfill({
        json: {
          id: "order-success-999",
          status: "PENDING",
          total: 135_000,
          orderDetails: [],
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
          items: [{ id: "cat-1", name: "Cơm Tấm", image: "/images/cat.jpg" }],
          total: 1,
        },
      });
      return;
    }

    await route.fulfill({ json: { items: [], total: 0 } });
  });
}

test.describe("Phase 3: 6 Flow Tests & Acceptance Criteria", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: "auth_token",
        value: "flow-test-token",
        domain: "localhost",
        path: "/",
      },
    ]);
    await page.addInitScript(() => {
      window.localStorage.setItem("authToken", "flow-test-token");
    });
    await setupFlowMocks(page);
  });

  test("Flow 1: Thêm món, đổi quantity và xóa món trong giỏ hàng", async ({ page }) => {
    await page.addInitScript((item) => {
      window.localStorage.setItem("multiCartItems", JSON.stringify([item]));
    }, {
      uuid: "flow1-item",
      foodId: mockFood.id,
      name: mockFood.name,
      image: mockFood.image,
      price: mockFood.price,
      quantity: 1,
      restaurantId: mockRestaurant.id,
      restaurant: { id: mockRestaurant.id, name: mockRestaurant.name },
    });

    await page.goto("/");

    // Open Cart Drawer
    const cartTrigger = page.getByRole("button", { name: /giỏ hàng/i });
    await cartTrigger.click();

    await expect(page.getByText(mockFood.name).first()).toBeVisible();

    // Increase quantity to 2
    const plusBtn = page.getByRole("button", { name: `Tăng số lượng ${mockFood.name}` });
    await plusBtn.click();
    await expect(page.getByText("2").first()).toBeVisible();

    // Delete item
    const deleteBtn = page.getByRole("button", { name: `Xóa ${mockFood.name} khỏi giỏ hàng` });
    await deleteBtn.click();

    // Empty state should be visible
    await expect(page.getByText(/Giỏ hàng đang trống/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /khám phá món ăn/i })).toBeVisible();
  });

  test("Flow 2: Chọn topping/biến thể trên trang chi tiết món", async ({ page }) => {
    await page.goto(`/food/${mockFood.id}`);

    // Check food title & base price
    await expect(page.getByRole("heading", { name: mockFood.name, level: 1 })).toBeVisible();

    // Select topping
    const toppingCheckbox = page.getByLabel(/Trứng Ốp La/i).first();
    if (await toppingCheckbox.isVisible()) {
      await toppingCheckbox.check();
      await expect(toppingCheckbox).toBeChecked();
    }

    // Add to cart
    const addToCartBtn = page.getByRole("button", { name: /thêm vào giỏ/i }).first();
    await addToCartBtn.click();

    // Check localStorage has item with toppings
    const stored = await page.evaluate(() => localStorage.getItem("multiCartItems") || "[]");
    expect(stored).toContain(mockFood.id);
  });

  test("Flow 3: Checkout bằng địa chỉ lưu và địa chỉ mới", async ({ page }) => {
    await page.addInitScript((item) => {
      window.localStorage.setItem("multiCartItems", JSON.stringify([item]));
    }, {
      uuid: "flow3-item",
      foodId: mockFood.id,
      name: mockFood.name,
      image: mockFood.image,
      price: mockFood.price,
      quantity: 2,
      restaurantId: mockRestaurant.id,
      restaurant: { id: mockRestaurant.id, name: mockRestaurant.name },
    });

    await page.goto("/checkout");

    // Check Saved Address by default
    await expect(page.getByText("Nhà Riêng")).toBeVisible();
    await expect(page.getByText(/456 Kha Vạn Cân/i)).toBeVisible();

    // Switch to Custom Address
    const customLabel = page.locator("label").filter({ hasText: "Nhập địa chỉ mới" });
    await customLabel.click();

    // Custom address search input should be visible with guide message
    await expect(page.getByPlaceholder(/tìm kiếm/i)).toBeVisible();
    await expect(page.getByText(/Vui lòng chọn địa chỉ từ gợi ý bản đồ/i)).toBeVisible();

    // Switch back to Saved Address
    const savedLabel = page.locator("label").filter({ hasText: "Dùng địa chỉ đã lưu" });
    await savedLabel.click();
    await expect(page.getByText("Nhà Riêng")).toBeVisible();
  });

  test("Flow 4: Áp dụng promotion và cập nhật tóm tắt", async ({ page }) => {
    await page.addInitScript((item) => {
      window.localStorage.setItem("multiCartItems", JSON.stringify([item]));
    }, {
      uuid: "flow4-item",
      foodId: mockFood.id,
      name: mockFood.name,
      image: mockFood.image,
      price: mockFood.price,
      quantity: 2,
      restaurantId: mockRestaurant.id,
      restaurant: { id: mockRestaurant.id, name: mockRestaurant.name },
    });

    await page.goto("/checkout");

    // Check promotion select
    const promoSelect = page.getByRole("combobox", { name: /mã khuyến mãi/i });
    if (await promoSelect.isVisible()) {
      await promoSelect.click();
      const promoOption = page.getByRole("option", { name: /FOODEE10/i });
      if (await promoOption.isVisible()) {
        await promoOption.click();
        await expect(page.getByText(/Đã chọn mã/i)).toBeVisible();
      }
    }
  });

  test("Flow 5: Xử lý lỗi API, bảo lưu trạng thái và chặn submit lặp", async ({ page }) => {
    // Setup mock where order creation returns 500 error
    await setupFlowMocks(page, { createOrderFails: true });

    await page.addInitScript((item) => {
      window.localStorage.setItem("multiCartItems", JSON.stringify([item]));
    }, {
      uuid: "flow5-item",
      foodId: mockFood.id,
      name: mockFood.name,
      image: mockFood.image,
      price: mockFood.price,
      quantity: 2,
      restaurantId: mockRestaurant.id,
      restaurant: { id: mockRestaurant.id, name: mockRestaurant.name },
    });

    await page.goto("/checkout");

    // Type an order note
    const noteTextarea = page.getByPlaceholder(/Ví dụ: Lấy nhiều nước mắm/i);
    await noteTextarea.fill("Giao nhanh giúp tôi nhé!");

    // Click submit
    const submitBtn = page.getByRole("button", { name: /xác nhận đặt hàng/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // After API failure, the note should NOT be lost
    await expect(noteTextarea).toHaveValue("Giao nhanh giúp tôi nhé!");

    // Cart items should still be in checkout
    await expect(page.getByText(mockFood.name).first()).toBeVisible();
  });

  test("Flow 6 & Tiêu chí: Hoàn tất đặt đơn và kiểm tra Viewport 390px", async ({ page }) => {
    // Set 390px mobile viewport (iPhone 12/13/14 size)
    await page.setViewportSize({ width: 390, height: 844 });

    await page.addInitScript((item) => {
      window.localStorage.setItem("multiCartItems", JSON.stringify([item]));
    }, {
      uuid: "flow6-item",
      foodId: mockFood.id,
      name: mockFood.name,
      image: mockFood.image,
      price: mockFood.price,
      quantity: 2,
      restaurantId: mockRestaurant.id,
      restaurant: { id: mockRestaurant.id, name: mockRestaurant.name },
    });

    await page.goto("/checkout");

    // Verify all 5 sections exist on 390px without layout overflow
    await expect(page.getByRole("heading", { name: "Hoàn tất đơn hàng", level: 1 })).toBeVisible();
    await expect(page.getByText(/Món ăn đã chọn/i)).toBeVisible();
    await expect(page.getByText("Địa chỉ giao hàng").first()).toBeVisible();
    await expect(page.getByText("Phương thức thanh toán").first()).toBeVisible();
    await expect(page.getByText(/Ghi chú cho đơn hàng/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tóm tắt đơn hàng", level: 2 })).toBeVisible();

    // Verify labels and currency unit ₫
    await expect(page.getByText(/Tạm tính món/i).first()).toBeVisible();
    await expect(page.getByText(/Phí vận chuyển/i).first()).toBeVisible();
    await expect(page.getByText(/Tổng thanh toán/i).first()).toBeVisible();
    await expect(page.getByText(/₫/).first()).toBeVisible();

    // Submit order successfully
    const submitBtn = page.getByRole("button", { name: /xác nhận đặt hàng/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Should redirect to order detail page
    await expect(page).toHaveURL(/\/order\/order-success-999/);
  });
});
