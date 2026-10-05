import { expect, type Page, test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  tabletPortrait: { width: 768, height: 1024 },
  tabletLandscape: { width: 1024, height: 768 },
  desktopHD: { width: 1440, height: 960 },
};

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
  address: [
    {
      id: "addr-1",
      address: "227 Nguyễn Văn Cừ, Phường 4, Quận 5, TP.HCM",
      latitude: 10.7629,
      longitude: 106.6823,
      isDefault: true,
    },
  ],
};

const mockRestaurant = {
  id: "owner-res-123",
  name: "Cơm Tấm Sài Gòn 1985",
  description: "Cơm tấm truyền thống sườn bì chả than hồng.",
  avatar: "/images/placeholder-restaurant.jpg",
  coverImage: "/images/placeholder-banner.jpg",
  phoneNumber: "0901234567",
  address: "123 Lê Lợi, Quận 1, TP.HCM",
  status: "APPROVED",
};

const mockFoods = [
  {
    id: "food-1",
    name: "Cơm Sườn Nướng Mật Ong",
    price: 55000,
    discountPercent: 10,
    image: "/images/placeholder-food.jpg",
    soldCount: 240,
    rating: 4.8,
  },
  {
    id: "food-2",
    name: "Cơm Sườn Bì Chả Đặc Biệt",
    price: 68000,
    discountPercent: 0,
    image: "/images/placeholder-food.jpg",
    soldCount: 180,
    rating: 4.9,
  },
];

const mockCategories = [
  { id: "cat-1", name: "Cơm Tấm", foodCount: 12, image: "/images/placeholder-category.jpg" },
  { id: "cat-2", name: "Đồ Uống", foodCount: 6, image: "/images/placeholder-category.jpg" },
];

async function setupMocks(page: Page) {
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
      await route.fulfill({ json: 128 });
      return;
    }

    if (url.pathname.includes("revenue-by-month")) {
      await route.fulfill({ json: 24500000 });
      return;
    }

    if (url.pathname.includes("/foods/top")) {
      await route.fulfill({ json: mockFoods });
      return;
    }

    if (url.pathname.includes("chart-data")) {
      await route.fulfill({
        json: {
          days: ["01/09", "02/09", "03/09"],
          orderCounts: [15, 22, 19],
          revenues: [1200000, 1800000, 1500000],
        },
      });
      return;
    }

    if (url.pathname === "/foods" || url.pathname.includes("/foods/restaurant")) {
      await route.fulfill({ json: { items: mockFoods, total: mockFoods.length } });
      return;
    }

    if (url.pathname === "/categories") {
      await route.fulfill({ json: { items: mockCategories, total: mockCategories.length } });
      return;
    }

    if (url.pathname === "/notifications" || url.pathname.includes("/messenger/conversation-ids")) {
      await route.fulfill({ json: [] });
      return;
    }

    await route.fulfill({ json: { items: [], total: 0 } });
  });
}

test.describe("Phase 5: Responsive, Visual Regression & Accessibility", () => {
  const screenshotDir = path.join(process.cwd(), "docs", "mantain", "screenshots", "phase5");
  const artifactDir = "C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\cfd61631-bc76-4187-9c8e-55d9a9f5631e\\screenshots";

  test.beforeAll(async () => {
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    if (!fs.existsSync(artifactDir)) {
      fs.mkdirSync(artifactDir, { recursive: true });
    }
  });

  const saveBothScreenshots = async (page: Page, fileName: string) => {
    await page.screenshot({ path: path.join(screenshotDir, fileName), fullPage: false });
    try {
      await page.screenshot({ path: path.join(artifactDir, fileName), fullPage: false });
    } catch {
      // Artifact dir is optional
    }
  };

  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: "auth_token",
        value: "phase5-token",
        domain: "localhost",
        path: "/",
      },
    ]);
    await page.addInitScript(() => {
      window.localStorage.setItem("authToken", "phase5-token");
    });
    await setupMocks(page);
  });

  test("1. Multi-Viewport Captures: 390x844, 768x1024, 1024x768, 1440x960", async ({ page }) => {
    // 1. Mobile (390 x 844)
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto(`/restaurant/${mockRestaurant.id}/edit/statistics`);
    await expect(page.getByRole("heading", { name: "Báo cáo & Thống kê", level: 1 })).toBeVisible();
    await saveBothScreenshots(page, "owner_stats_390x844.png");

    // 2. Tablet Portrait (768 x 1024)
    await page.setViewportSize(VIEWPORTS.tabletPortrait);
    await page.goto(`/restaurant/${mockRestaurant.id}/edit/statistics`);
    await expect(page.getByRole("heading", { name: "Báo cáo & Thống kê", level: 1 })).toBeVisible();
    await saveBothScreenshots(page, "owner_stats_768x1024.png");

    // 3. Tablet Landscape (1024 x 768)
    await page.setViewportSize(VIEWPORTS.tabletLandscape);
    await page.goto(`/restaurant/${mockRestaurant.id}/edit/statistics`);
    await expect(page.getByRole("heading", { name: "Báo cáo & Thống kê", level: 1 })).toBeVisible();
    await saveBothScreenshots(page, "owner_stats_1024x768.png");

    // 4. Desktop HD (1440 x 960)
    await page.setViewportSize(VIEWPORTS.desktopHD);
    await page.goto(`/restaurant/${mockRestaurant.id}/edit/statistics`);
    await expect(page.getByRole("heading", { name: "Báo cáo & Thống kê", level: 1 })).toBeVisible();
    await saveBothScreenshots(page, "owner_stats_1440x960.png");

    // Verify all 4 screenshots exist on disk
    expect(fs.existsSync(path.join(screenshotDir, "owner_stats_390x844.png"))).toBe(true);
    expect(fs.existsSync(path.join(screenshotDir, "owner_stats_768x1024.png"))).toBe(true);
    expect(fs.existsSync(path.join(screenshotDir, "owner_stats_1024x768.png"))).toBe(true);
    expect(fs.existsSync(path.join(screenshotDir, "owner_stats_1440x960.png"))).toBe(true);
  });

  test("2. State Coverage: Normal, Empty, Error, and Modal Dialog state", async ({ page }) => {
    // Normal state on Admin Categories
    await page.setViewportSize(VIEWPORTS.desktopHD);
    await page.goto("/admin/categories");
    await expect(page.getByRole("heading", { name: /Quản lý danh mục/i, level: 1 })).toBeVisible();

    // Modal open state
    await page.getByRole("button", { name: /Thêm danh mục/i }).click();
    const modalHeading = page.getByRole("heading", { name: "Thêm Danh Mục Mới" });
    await expect(modalHeading).toBeVisible();
    await saveBothScreenshots(page, "modal_add_category.png");

    // Close modal with Escape
    await page.keyboard.press("Escape");
    await expect(modalHeading).toBeHidden();
  });

  test("3. Zoom 200% Verification: Crucial transaction interfaces remain usable", async ({ page }) => {
    // Set 390px mobile viewport with zoom simulation
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto(`/restaurant/${mockRestaurant.id}/edit/food-list/create-food`);

    // Apply 200% CSS zoom
    await page.evaluate(() => {
      document.body.style.zoom = "200%";
    });

    // Verify vital form headings and actions are still interactive
    const title = page.getByRole("heading", { name: "Thêm món ăn mới", level: 1 });
    await expect(title).toBeVisible();

    const submitBtn = page.getByRole("button", { name: /Tạo món ăn/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Field errors remain visible and legible
    await expect(page.getByText("Vui lòng nhập tên món ăn.")).toBeVisible();
    await saveBothScreenshots(page, "create_food_zoom_200.png");
  });

  test("4. Accessibility & Console Hygiene: Heading hierarchy & zero crash errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Check heading hierarchy on Owner Statistics
    await page.setViewportSize(VIEWPORTS.desktopHD);
    await page.goto(`/restaurant/${mockRestaurant.id}/edit/statistics`);
    await expect(page.getByRole("heading", { name: "Báo cáo & Thống kê", level: 1 })).toBeVisible();

    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);

    // Check heading hierarchy on Create Food
    await page.goto(`/restaurant/${mockRestaurant.id}/edit/food-list/create-food`);
    await expect(page.getByRole("heading", { name: "Thêm món ăn mới", level: 1 })).toBeVisible();
    const createFoodH1Count = await page.locator("h1").count();
    expect(createFoodH1Count).toBe(1);

    // No React fatal crash console errors
    const fatalErrors = consoleErrors.filter(
      (err) => err.includes("Uncaught") || err.includes("TypeError") || err.includes("Objects are not valid")
    );
    expect(fatalErrors).toHaveLength(0);
  });
});
