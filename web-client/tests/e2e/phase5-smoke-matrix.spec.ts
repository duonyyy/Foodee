import { expect, type Page, test } from "@playwright/test";

const mockRestaurant = {
  id: "owner-res-123",
  name: "Cơm Tấm Sài Gòn 1985",
  description: "Cơm tấm truyền thống sườn bì chả than hồng.",
  avatar: "/images/placeholder-restaurant.jpg",
  coverImage: "/images/placeholder-banner.jpg",
  phoneNumber: "0901234567",
  address: "123 Lê Lợi, Quận 1, TP.HCM",
  status: "APPROVED",
  openTime: "07:00",
  closeTime: "22:00",
  owner: { id: "owner-user" },
};

const mockFoods = [
  {
    id: "food-1",
    name: "Cơm Sườn Nướng Mật Ong",
    price: 55000,
    discountPercent: 0,
    image: "/images/placeholder-food.jpg",
    soldCount: 240,
    rating: 4.8,
  },
];

const mockAdminUser = {
  id: "admin-user",
  name: "Quản trị viên",
  email: "admin@foodee.test",
  role: { id: 1, name: "administrator" },
  isActive: true,
};

const mockOwnerUser = {
  id: "owner-user",
  name: "Chủ Quán Cơm Tấm",
  email: "owner@foodee.test",
  role: { id: 3, name: "owner" },
  isActive: true,
};

const mockRegularUser = {
  id: "regular-user",
  name: "Khách hàng thân thiết",
  email: "user@foodee.test",
  role: { id: 2, name: "user" },
  isActive: true,
  address: [
    {
      id: "addr-1",
      address: "227 Nguyễn Văn Cừ, Quận 5",
      latitude: 10.7629,
      longitude: 106.6823,
      isDefault: true,
    },
  ],
};

async function setupApiMocks(page: Page, userRole: "guest" | "user" | "owner" | "administrator") {
  await page.route(/http:\/\/localhost:(3000|3001)\/.*/, async (route) => {
    const url = new URL(route.request().url());

    if (!url.pathname.match(/^\/(users|foods|categories|notifications|promotions|orders|restaurants|auth|stats|cart|payment|chat)/)) {
      await route.continue();
      return;
    }

    if (url.pathname === "/auth/check") {
      if (userRole === "guest") {
        await route.fulfill({ status: 401, json: { isLogin: false, message: "Unauthorized" } });
      } else {
        const uid =
          userRole === "administrator"
            ? "admin-user"
            : userRole === "owner"
            ? "owner-user"
            : "regular-user";
        await route.fulfill({
          json: {
            isLogin: true,
            user: {
              uid,
              email: `${userRole}@foodee.test`,
            },
          },
        });
      }
      return;
    }

    if (url.pathname === "/role/user-role-and-permission") {
      await route.fulfill({
        json: {
          role: { name: userRole },
          permissions: userRole === "administrator" ? ["all"] : [],
        },
      });
      return;
    }

    if (url.pathname === "/users/me") {
      const userObj =
        userRole === "administrator"
          ? mockAdminUser
          : userRole === "owner"
          ? mockOwnerUser
          : mockRegularUser;
      await route.fulfill({ json: userObj });
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

    if (url.pathname.includes("order-count-by-month")) {
      await route.fulfill({ json: 50 });
      return;
    }

    if (url.pathname.includes("revenue-by-month")) {
      await route.fulfill({ json: 15000000 });
      return;
    }

    if (
      url.pathname.includes("/foods/top") ||
      url.pathname === "/foods" ||
      url.pathname.includes("/foods/restaurant")
    ) {
      await route.fulfill({ json: { items: mockFoods, total: mockFoods.length } });
      return;
    }

    if (url.pathname.includes("chart-data")) {
      await route.fulfill({
        json: {
          days: ["01/09", "02/09"],
          orderCounts: [10, 15],
          revenues: [500000, 750000],
        },
      });
      return;
    }

    if (url.pathname === "/categories") {
      await route.fulfill({ json: { items: [{ id: "c1", name: "Món chính" }], total: 1 } });
      return;
    }

    if (url.pathname === "/notifications" || url.pathname.includes("/messenger/conversation-ids")) {
      await route.fulfill({ json: [] });
      return;
    }

    await route.fulfill({ json: { items: [], total: 0 } });
  });
}

test.describe("Phase 5: Smoke Test Matrix (4 Personas)", () => {
  test("1. Persona GUEST: Can explore public catalog; blocked from admin", async ({ page, context }) => {
    // Clear cookies to simulate unauthenticated guest
    await context.clearCookies();
    await setupApiMocks(page, "guest");

    // Guest views Home
    await page.goto("/");
    await expect(page).toHaveURL(/\//);

    // Guest views Search
    await page.goto("/search");
    await expect(page).toHaveURL(/\/search/);

    // Guest attempts to access Admin -> Should be redirected to /unauthorized
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/unauthorized/);
  });

  test("2. Persona USER: Can explore foods, view cart & checkout", async ({ page, context }) => {
    await context.addCookies([
      { name: "auth_token", value: "flow-test-user-token", domain: "localhost", path: "/" },
    ]);
    await page.addInitScript(() => {
      window.localStorage.setItem("authToken", "flow-test-user-token");
    });
    await setupApiMocks(page, "user");

    // User views checkout
    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "Hoàn tất đơn hàng", level: 1 })).toBeVisible();

    // User views order history
    await page.goto("/order");
    await expect(page).toHaveURL(/\/order/);
  });

  test("3. Persona OWNER: Can access restaurant management, food list & statistics", async ({ page, context }) => {
    await context.addCookies([
      { name: "auth_token", value: "flow-test-owner-token", domain: "localhost", path: "/" },
    ]);
    await page.addInitScript(() => {
      window.localStorage.setItem("authToken", "flow-test-owner-token");
    });
    await setupApiMocks(page, "owner");

    // Owner views restaurant edit page (which routes to statistics dashboard)
    await page.goto(`/restaurant/${mockRestaurant.id}/edit`);
    await expect(page.getByRole("heading", { name: "Báo cáo & Thống kê", level: 1 })).toBeVisible();

    // Owner views food list
    await page.goto(`/restaurant/${mockRestaurant.id}/edit/food-list`);
    await expect(page.getByRole("heading", { name: "Thực đơn món ăn", level: 1 })).toBeVisible();

    // Owner views statistics explicitly
    await page.goto(`/restaurant/${mockRestaurant.id}/edit/statistics`);
    await expect(page.getByRole("heading", { name: "Báo cáo & Thống kê", level: 1 })).toBeVisible();
  });

  test("4. Persona ADMIN: Full access to Admin Dashboard, Users, Categories, and Orders", async ({ page, context }) => {
    await context.addCookies([
      { name: "auth_token", value: "flow-test-admin-token", domain: "localhost", path: "/" },
    ]);
    await page.addInitScript(() => {
      window.localStorage.setItem("authToken", "flow-test-admin-token");
    });
    await setupApiMocks(page, "administrator");

    // Admin views dashboard
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin/);

    // Admin views categories management
    await page.goto("/admin/categories");
    await expect(page.getByRole("heading", { name: /Quản lý danh mục/i, level: 1 })).toBeVisible();

    // Admin views orders management
    await page.goto("/admin/orders");
    await expect(page.getByRole("heading", { name: "Quản lý đơn hàng", level: 1 })).toBeVisible();
  });
});
