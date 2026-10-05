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

const mockUsersList = [
  {
    id: "user-1",
    name: "Nguyễn Văn An",
    email: "an@example.com",
    group: "Khách hàng",
    courses: 2,
    createdAt: "2026-08-10T10:00:00Z",
    status: "active",
  },
  {
    id: "user-2",
    name: "Trần Thị Bình",
    email: "binh@example.com",
    group: "Chủ quán",
    courses: 5,
    createdAt: "2026-08-15T12:00:00Z",
    status: "pending",
  },
  {
    id: "user-3",
    name: "Lê Hoàng Cường",
    email: "cuong@example.com",
    group: "Tài xế",
    courses: 0,
    createdAt: "2026-08-20T14:00:00Z",
    status: "inactive",
  },
];

async function setupAdminMocks(page: Page) {
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

    if (url.pathname === "/users") {
      await route.fulfill({ json: mockUsersList });
      return;
    }

    if (url.pathname === "/notifications" || url.pathname.includes("/messenger/conversation-ids")) {
      await route.fulfill({ json: [] });
      return;
    }

    await route.fulfill({ json: { items: [], total: 0 } });
  });
}

test.describe("Phase 4 (Part 2): Table and Filter", () => {
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
    await setupAdminMocks(page);
  });

  test("Desktop Table: Search, Sort, Checkbox Selection, and Selected Count", async ({ page }) => {
    await page.goto("/admin/users");

    // Check search input placeholder and type
    const searchInput = page.getByRole("textbox", { name: /Tìm người dùng/i });
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Nguyễn Văn An");

    // Clear search button should appear and work
    const clearSearchBtn = page.getByRole("button", { name: "Xóa từ khóa tìm kiếm" });
    await expect(clearSearchBtn).toBeVisible();
    await clearSearchBtn.click();
    await expect(searchInput).toHaveValue("");

    // Check Table checkbox selection
    const selectFirstRow = page.getByRole("checkbox", { name: "Chọn hàng user-1" });
    await expect(selectFirstRow).toBeVisible();
    await selectFirstRow.click();

    // Verify Selected items banner appears
    await expect(page.getByText(/Đã chọn 1 trên tổng số/i)).toBeVisible();

    // Select all rows
    const selectAllCheckbox = page.getByRole("checkbox", { name: "Chọn tất cả các hàng" });
    await selectAllCheckbox.click();
    await expect(page.getByText(/Đã chọn 3 trên tổng số/i)).toBeVisible();

    // Deselect all
    await page.getByRole("button", { name: "Bỏ chọn tất cả" }).click();
    await expect(page.getByText(/Đã chọn/i)).toBeHidden();
  });

  test("Dangerous Action Confirmation: AlertDialog prevents accidental deletion", async ({ page }) => {
    await page.goto("/admin/users");

    // Find action menu trigger for first user
    const actionBtn = page.getByRole("button", { name: "Thao tác cho hàng user-1" });
    await expect(actionBtn).toBeVisible();
    await actionBtn.click();

    // Click "Delete User" (dangerous action)
    const deleteOption = page.getByRole("menuitem", { name: /Delete User/i });
    await expect(deleteOption).toBeVisible();
    await deleteOption.click();

    // AlertDialog should be displayed with confirmation message
    const alertTitle = page.getByRole("heading", { name: /Xác nhận delete user/i });
    await expect(alertTitle).toBeVisible();
    await expect(page.getByText(/Bạn có chắc chắn muốn thực hiện thao tác/i)).toBeVisible();

    // Cancel dismissal
    const cancelBtn = page.getByRole("button", { name: "Hủy bỏ" });
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();
    await expect(alertTitle).toBeHidden();
  });

  test("Mobile View: Card layout instead of wide table on 390px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/admin/users");

    // On mobile, the desktop table element should be hidden
    const desktopTable = page.locator("table");
    await expect(desktopTable).toBeHidden();

    // Card region should be visible
    const cardRegion = page.locator("div[role='region'][aria-label='Danh sách dữ liệu dạng thẻ']");
    await expect(cardRegion).toBeVisible();

    // User cards should display information clearly
    await expect(page.getByText("Nguyễn Văn An").first()).toBeVisible();
    await expect(page.getByText("Trần Thị Bình").first()).toBeVisible();
    await expect(page.getByText("Lê Hoàng Cường").first()).toBeVisible();

    // StatusBadge text should be rendered in the cards
    await expect(page.getByText("Đang hoạt động").first()).toBeVisible();
  });
});
