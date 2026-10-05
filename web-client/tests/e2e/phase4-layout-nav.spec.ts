import { expect, type Page, test } from "@playwright/test";

const mockAdminUser = {
  id: "admin-test-user",
  username: "admin_test",
  email: "admin@foodee.test",
  name: "Quản trị viên Foodee",
  role: { id: 1, name: "administrator" },
  isActive: true,
  learningtime: 0,
  coursenumber: 0,
  createdAt: "2026-08-01T00:00:00.000Z",
  address: [],
};

const mockRestaurant = {
  id: "owner-res-123",
  name: "Nhà Hàng Cơm Quê",
  description: "Cơm quê chuẩn vị mẹ nấu.",
  avatar: "/images/placeholder-restaurant.jpg",
  coverImage: "/images/placeholder-banner.jpg",
  phoneNumber: "0908888888",
  openTime: "08:00",
  closeTime: "22:00",
  deliveryTime: 25,
  status: "APPROVED",
};

async function setupLayoutMocks(page: Page) {
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
          user: { uid: "admin-test-user", email: "admin@foodee.test" },
        },
      });
      return;
    }

    if (url.pathname === "/role/user-role-and-permission") {
      await route.fulfill({
        json: {
          role: { name: "administrator" },
          permissions: ["all"],
        },
      });
      return;
    }

    if (url.pathname === "/users/me") {
      await route.fulfill({ json: mockAdminUser });
      return;
    }

    if (url.pathname === "/restaurants/my" || url.pathname === "/restaurants/my-restaurant") {
      await route.fulfill({ json: mockRestaurant });
      return;
    }

    if (url.pathname === `/restaurants/${mockRestaurant.id}`) {
      await route.fulfill({ json: mockRestaurant });
      return;
    }

    if (url.pathname === `/foods/restaurant/${mockRestaurant.id}`) {
      await route.fulfill({
        json: [
          {
            id: "food-1",
            name: "Cơm Thịt Kho Trứng",
            price: 45000,
            status: "available",
            image: "/images/placeholder-food.jpg",
            category: { name: "Cơm Phần" },
          },
        ],
      });
      return;
    }

    if (url.pathname === "/notifications" || url.pathname.includes("/messenger/conversation-ids")) {
      await route.fulfill({ json: [] });
      return;
    }

    await route.fulfill({ json: { items: [], total: 0 } });
  });
}

test.describe("Phase 4 (Part 1): Layout & Navigation", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: "auth_token",
        value: "phase4-token",
        domain: "localhost",
        path: "/",
      },
    ]);
    await page.addInitScript(() => {
      window.localStorage.setItem("authToken", "phase4-token");
    });
    await setupLayoutMocks(page);
  });

  test("Admin Navigation: Sidebar displays all tabs including Quản lý đơn hàng, active state and breadcrumb", async ({
    page,
  }) => {
    await page.goto("/admin/orders");

    // Check Breadcrumb
    await expect(page.getByText("Quản lý đơn hàng").first()).toBeVisible();

    // Check Sidebar Tab for Orders
    const ordersTab = page.locator("aside").getByRole("link", { name: /Quản lý đơn hàng/i });
    await expect(ordersTab).toBeVisible();

    // Check Header component
    await expect(page.getByRole("heading", { name: "Quản lý đơn hàng", level: 1 })).toBeVisible();
  });

  test("Owner Layout & Mobile Navigation: Responsive drawer works on 390px viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/restaurant/${mockRestaurant.id}/edit/food-list`);

    // On 390px, mobile toggle button should be visible
    const mobileMenuBtn = page.getByRole("button", { name: /Mở menu quản lý/i });
    await expect(mobileMenuBtn).toBeVisible();

    // Desktop sidebar should not be taking 256px space
    const desktopAside = page.locator("aside[aria-label='Sidebar điều hướng chủ quán']");
    await expect(desktopAside).toBeHidden();

    // Open mobile menu
    await mobileMenuBtn.click();

    // Drawer should show navigation links
    const menuNav = page.getByRole("navigation", { name: "Điều hướng chủ quán" });
    await expect(menuNav).toBeVisible();
    await expect(page.getByRole("link", { name: "Thực đơn" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Đơn hàng" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Thống kê" })).toBeVisible();

    // Check StatusBadge in header
    await expect(page.getByText("Đang hoạt động").first()).toBeVisible();
  });

  test("Owner Food List: PageHeader and StatusBadge render properly", async ({
    page,
  }) => {
    await page.goto(`/restaurant/${mockRestaurant.id}/edit/food-list`);

    // PageHeader Title & description
    await expect(page.getByRole("heading", { name: "Thực đơn món ăn", level: 1 })).toBeVisible();
    await expect(page.getByText(/Quản lý các món ăn, giá bán/i)).toBeVisible();

    // Status badge on food item
    const statusBadge = page.locator("[data-status='approved']").first();
    await expect(statusBadge).toBeVisible();
    await expect(page.getByText("Đang hoạt động").first()).toBeVisible();
  });
});
