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
  name: "Quán Ăn Gia Đình",
  status: "APPROVED",
};

const mockTopFoods = [
  {
    id: "food-1",
    name: "Cơm Chiên Dương Châu",
    image: "/images/placeholder-food.jpg",
    soldCount: 150,
    price: 55000,
    discountPercent: 10,
  },
  {
    id: "food-2",
    name: "Mì Xào Bò",
    image: "/images/placeholder-food.jpg",
    soldCount: 90,
    price: 60000,
    discountPercent: 0,
  },
];

const mockChartData = {
  days: ["01/09", "02/09", "03/09"],
  orderCounts: [12, 19, 15],
  revenues: [650000, 1150000, 890000],
};

async function setupStatsMocks(page: Page) {
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

    if (url.pathname.includes("order-count-by-month")) {
      await route.fulfill({ json: 42 });
      return;
    }

    if (url.pathname.includes("revenue-by-month")) {
      await route.fulfill({ json: 18500000 });
      return;
    }

    if (url.pathname.includes("/foods/top")) {
      await route.fulfill({ json: mockTopFoods });
      return;
    }

    if (url.pathname.includes("chart-data")) {
      await route.fulfill({ json: mockChartData });
      return;
    }

    if (url.pathname === "/notifications" || url.pathname.includes("/messenger/conversation-ids")) {
      await route.fulfill({ json: [] });
      return;
    }

    await route.fulfill({ json: { items: [], total: 0 } });
  });
}

test.describe("Phase 4 (Part 4): Dashboard, Stat Cards & Charts", () => {
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
    await setupStatsMocks(page);
  });

  test("Owner Statistics: Unified Stat Cards display values, periods, and icons", async ({ page }) => {
    await page.goto(`/restaurant/${mockRestaurant.id}/edit/statistics`);

    // Verify PageHeader
    await expect(page.getByRole("heading", { name: "Báo cáo & Thống kê", level: 1 })).toBeVisible();

    // Verify 3 Stat Cards
    await expect(page.getByText("Đơn hàng hoàn tất")).toBeVisible();
    await expect(page.getByText(/42 đơn/i)).toBeVisible();

    await expect(page.getByText("Tổng doanh thu")).toBeVisible();
    await expect(page.getByText(/18\.500\.000/i)).toBeVisible();

    await expect(page.getByRole("heading", { name: "Món bán chạy nhất" })).toBeVisible();
    await expect(page.getByText("Cơm Chiên Dương Châu").first()).toBeVisible();

    // Verify time period is clearly labeled
    await expect(page.getByText(/trong Tháng/i).first()).toBeVisible();
  });

  test("Charts & Top Selling Foods: Render chart containers and rankings", async ({ page }) => {
    await page.goto(`/restaurant/${mockRestaurant.id}/edit/statistics`);

    // Chart containers with accessible units
    await expect(page.getByText("Lượng đơn theo thời gian")).toBeVisible();
    await expect(page.getByText("Đơn vị: đơn")).toBeVisible();

    await expect(page.getByText("Doanh thu theo thời gian")).toBeVisible();
    await expect(page.getByText("Đơn vị: VNĐ")).toBeVisible();

    // Top selling foods list
    await expect(page.getByRole("heading", { name: "Top các món ăn bán chạy", level: 2 })).toBeVisible();
    await expect(page.getByText("#1")).toBeVisible();
    await expect(page.getByText("#2")).toBeVisible();
    await expect(page.getByText(/Đã bán: 150/i).first()).toBeVisible();
    await expect(page.getByText(/Đã bán: 90/i).first()).toBeVisible();
  });
});
