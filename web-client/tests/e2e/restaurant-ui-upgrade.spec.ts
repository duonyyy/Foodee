import { expect, test } from "@playwright/test";
import path from "path";

const ARTIFACT_SCREENSHOTS_DIR = "C:/Users/Admin/.gemini/antigravity-ide/brain/cfd61631-bc76-4187-9c8e-55d9a9f5631e/screenshots";

const mockRestaurant = {
  id: "res-super-1",
  name: "Quán Ăn Hoàng Kim",
  description: "Chuyên ẩm thực truyền thống và các món ăn vặt đặc sắc chuẩn vị Sài Gòn.",
  avatar: "/images/placeholder-restaurant.jpg",
  backgroundImage: "/images/placeholder-banner.jpg",
  phoneNumber: "0908889999",
  openTime: "08:00",
  closeTime: "22:00",
  deliveryTime: 25,
  status: "APPROVED",
  rating: 4.9,
  distance: 1.8,
  address: {
    street: "123 Hoàng Diệu 2",
    ward: "Linh Trung",
    district: "Thành phố Thủ Đức",
    city: "TP. Hồ Chí Minh",
  },
};

const mockFoods = [
  {
    id: "food-com-1",
    name: "Cơm Tấm Sườn Bì Chả Đặc Biệt",
    description: "Sườn nướng thảo mộc mềm ngọt kèm bì chả trứng tự làm thơm ngon.",
    price: 65_000,
    discountPercent: 15,
    image: "/images/placeholder-food.jpg",
    imageUrls: ["/images/placeholder-food.jpg"],
    rating: 5.0,
    soldCount: 890,
    popular: true,
    status: "available",
    category: { id: "cat-com", name: "Cơm Tấm Đặc Sản" },
    restaurant: mockRestaurant,
    toppings: [
      { id: "top-trung", name: "Trứng Ốp La Lòng Đào", price: 10_000 },
      { id: "top-cha", name: "Chả Cua Hấp Thêm", price: 15_000 },
      { id: "top-suon", name: "Thêm Miếng Sườn Cốt Lết", price: 30_000 },
    ],
  },
  {
    id: "food-tra-1",
    name: "Trà Đào Cam Sả Tươi Mát",
    description: "Trà đào thơm lừng kết hợp cam vàng mọng nước và hương sả thanh dịu.",
    price: 35_000,
    discountPercent: 0,
    image: "/images/placeholder-food.jpg",
    imageUrls: ["/images/placeholder-food.jpg"],
    rating: 4.8,
    soldCount: 420,
    popular: true,
    status: "available",
    category: { id: "cat-nuoc", name: "Trà & Đồ Uống" },
    restaurant: mockRestaurant,
    toppings: [
      { id: "top-thach", name: "Thạch Đào Giòn", price: 8_000 },
      { id: "top-tran-chau", name: "Trân Châu Trắng", price: 10_000 },
    ],
  },
];

test.describe("Nâng cấp UI/UX: Chi tiết Nhà hàng & Topping Modal", () => {
  test("Hiển thị đầy đủ Sticky Category Nav, Topping Modal tương tác và Floating Cart Bar", async ({
    page,
  }) => {
    // Intercept mock API
    await page.route("**/restaurants/**", async (route) => {
      await route.fulfill({
        json: {
          ...mockRestaurant,
          foods: mockFoods,
        },
      });
    });

    await page.route("**/foods/**", async (route) => {
      const url = route.request().url();
      if (url.includes("/toppings")) {
        if (url.includes("food-com-1")) {
          await route.fulfill({ json: mockFoods[0].toppings });
        } else if (url.includes("food-tra-1")) {
          await route.fulfill({ json: mockFoods[1].toppings });
        } else {
          await route.fulfill({ json: [] });
        }
        return;
      }

      if (url.includes("food-com-1")) {
        await route.fulfill({ json: mockFoods[0] });
      } else if (url.includes("food-tra-1")) {
        await route.fulfill({ json: mockFoods[1] });
      } else {
        await route.fulfill({ json: mockFoods[0] });
      }
    });

    // 1. Mở trang chi tiết nhà hàng
    await page.goto(`/restaurant/${mockRestaurant.id}`);
    await page.waitForLoadState("domcontentloaded");

    // 2. Kiểm tra Header
    const restaurantHeading = page.getByRole("heading", {
      name: mockRestaurant.name,
      level: 1,
    });
    await expect(restaurantHeading).toBeVisible();

    // Kiểm tra Live Open Indicator & Share button
    await expect(page.getByText("Đang mở cửa")).toBeVisible();
    await expect(page.getByRole("button", { name: "Chia sẻ" })).toBeVisible();

    // 3. Kiểm tra Sticky Category Tabs Nav
    const stickyNav = page.locator("nav[aria-label='Thanh danh mục thực đơn']");
    await expect(stickyNav).toBeVisible();

    // Kiểm tra các pill danh mục
    await expect(stickyNav.getByText("Tất cả món")).toBeVisible();
    await expect(stickyNav.getByText("Món bán chạy")).toBeVisible();
    await expect(stickyNav.getByText("Cơm Tấm Đặc Sản")).toBeVisible();
    await expect(stickyNav.getByText("Trà & Đồ Uống")).toBeVisible();

    // Chụp screenshot giao diện nhà hàng với sticky nav
    await page.screenshot({
      path: path.join(ARTIFACT_SCREENSHOTS_DIR, "restaurant_ui_sticky_nav.png"),
      fullPage: false,
    });

    // 4. Kiểm tra mở Topping Modal khi bấm Giỏ hàng trên món có topping
    const comCard = page.locator(".group", { hasText: "Cơm Tấm Sườn Bì Chả Đặc Biệt" }).first();
    await expect(comCard).toBeVisible();

    const addToCartButton = comCard.getByRole("button", { name: /Giỏ hàng/i });
    await addToCartButton.click();

    // 5. Kiểm tra Topping Modal xuất hiện
    const toppingModal = page.getByRole("dialog");
    await expect(toppingModal).toBeVisible();
    await expect(toppingModal.getByText("Tùy chỉnh món ăn")).toBeVisible();
    await expect(toppingModal.getByText("Chọn Topping kèm theo")).toBeVisible();

    // Kiểm tra bộ đếm số lượng: ban đầu là 1
    await expect(toppingModal.getByText("1", { exact: true })).toBeVisible();

    // Bấm tăng số lượng lên 2
    const increaseBtn = toppingModal.getByRole("button", { name: "Tăng số lượng" });
    await increaseBtn.click();
    await expect(toppingModal.getByText("2", { exact: true })).toBeVisible();

    // Chọn Topping "Trứng Ốp La Lòng Đào"
    const toppingCheckbox = toppingModal.getByText("Trứng Ốp La Lòng Đào");
    await toppingCheckbox.click();

    // Chụp screenshot Topping Modal
    await page.screenshot({
      path: path.join(ARTIFACT_SCREENSHOTS_DIR, "topping_modal_interactive.png"),
    });

    // Xác nhận thêm vào giỏ
    const confirmBtn = toppingModal.getByRole("button", { name: /Thêm vào giỏ hàng/i });
    await confirmBtn.click();

    // Đảm bảo modal đóng
    await expect(toppingModal).not.toBeVisible();

    // 6. Kiểm tra Floating Restaurant Cart Bar xuất hiện
    const floatingCartBar = page.locator("aside[aria-label='Thanh giỏ hàng hiện tại']");
    await expect(floatingCartBar).toBeVisible();
    await expect(floatingCartBar.getByText(/2/)).toBeVisible(); // 2 món
    await expect(floatingCartBar.getByRole("button", { name: /Xem giỏ hàng/i })).toBeVisible();

    // Chụp screenshot toàn trang có Floating Cart Bar
    await page.screenshot({
      path: path.join(ARTIFACT_SCREENSHOTS_DIR, "restaurant_floating_cart_bar.png"),
    });

    // 7. Nhấn "Xem giỏ hàng" để kích hoạt Cart Drawer
    await floatingCartBar.getByRole("button", { name: /Xem giỏ hàng/i }).click();

    await expect(page.getByText("Giỏ hàng của bạn")).toBeVisible();
  });

  test("Hiển thị hoàn hảo trên Mobile 390x844 (Sticky Scroll, Topping Modal, Floating Bar)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.route("**/restaurants/**", async (route) => {
      await route.fulfill({
        json: {
          ...mockRestaurant,
          foods: mockFoods,
        },
      });
    });

    await page.route("**/foods/**", async (route) => {
      const url = route.request().url();
      if (url.includes("/toppings")) {
        await route.fulfill({ json: mockFoods[0].toppings });
        return;
      }
      await route.fulfill({ json: mockFoods[0] });
    });

    await page.goto(`/restaurant/${mockRestaurant.id}`);
    await page.waitForLoadState("domcontentloaded");

    // Header & Sticky nav visible on mobile
    await expect(page.getByRole("heading", { name: mockRestaurant.name, level: 1 })).toBeVisible();
    const stickyNav = page.locator("nav[aria-label='Thanh danh mục thực đơn']");
    await expect(stickyNav).toBeVisible();

    await page.screenshot({
      path: path.join(ARTIFACT_SCREENSHOTS_DIR, "restaurant_mobile_sticky_nav.png"),
    });

    // Add item to cart to trigger Floating Cart Bar
    const addToCartButton = page.locator(".group", { hasText: "Cơm Tấm Sườn Bì Chả Đặc Biệt" }).first().getByRole("button", { name: /Giỏ hàng/i });
    await addToCartButton.click();

    const toppingModal = page.getByRole("dialog");
    await expect(toppingModal).toBeVisible();

    const confirmBtn = toppingModal.getByRole("button", { name: /Thêm vào giỏ hàng/i });
    await confirmBtn.click();
    await expect(toppingModal).not.toBeVisible();

    const floatingCartBar = page.locator("aside[aria-label='Thanh giỏ hàng hiện tại']");
    await expect(floatingCartBar).toBeVisible();

    await page.screenshot({
      path: path.join(ARTIFACT_SCREENSHOTS_DIR, "restaurant_mobile_floating_cart.png"),
    });
  });
});
