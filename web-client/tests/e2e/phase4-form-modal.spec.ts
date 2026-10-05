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

const mockCategories = [
  { id: "cat-1", name: "Cơm Phần", foodCount: 10, image: "/images/placeholder-category.jpg" },
  { id: "cat-2", name: "Đồ Uống", foodCount: 5, image: "/images/placeholder-category.jpg" },
];

async function setupFormMocks(page: Page) {
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

    if (url.pathname === "/categories") {
      await route.fulfill({
        json: {
          items: mockCategories,
          total: mockCategories.length,
        },
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

test.describe("Phase 4 (Part 3): Forms, Modals & File Upload", () => {
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
    await setupFormMocks(page);
  });

  test("Form Validation: Inline field errors on submit, error recovery on input", async ({ page }) => {
    await page.goto(`/restaurant/${mockRestaurant.id}/edit/food-list/create-food`);

    // Ensure form is loaded
    await expect(page.getByRole("heading", { name: "Thêm món ăn mới", level: 1 })).toBeVisible();

    // Click submit with empty form
    const submitBtn = page.getByRole("button", { name: /Tạo món ăn/i });
    await submitBtn.click();

    // Field-level validation errors must appear
    await expect(page.getByText("Vui lòng nhập tên món ăn.")).toBeVisible();
    await expect(page.getByText("Giá món ăn phải lớn hơn 0đ.")).toBeVisible();
    await expect(page.getByText("Vui lòng chọn danh mục cho món ăn.")).toBeVisible();
    await expect(page.getByText("Vui lòng tải lên ảnh đại diện món ăn.")).toBeVisible();

    // Typing in name should clear the name error
    const nameInput = page.getByRole("textbox", { name: /Tên món ăn/i });
    await nameInput.fill("Cơm Tấm Sườn Bì Chả");
    await expect(page.getByText("Vui lòng nhập tên món ăn.")).toBeHidden();
  });

  test("File Upload Component: Shows constraints, drag-drop zone, and accessible label", async ({ page }) => {
    await page.goto(`/restaurant/${mockRestaurant.id}/edit/food-list/create-food`);

    // Check file upload zone
    const uploadZone = page.getByRole("button", {
      name: /Khu vực tải ảnh lên/i,
    });
    await expect(uploadZone).toBeVisible();
    await expect(page.getByText(/Tối đa 5MB/i).first()).toBeVisible();
  });

  test("Modal Dialog: Escape key closes modal, action buttons responsive", async ({ page }) => {
    await page.goto("/admin/categories");

    // Open Add Category Modal
    const addBtn = page.getByRole("button", { name: /Thêm danh mục/i });
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Verify modal is displayed
    const modalHeading = page.getByRole("heading", { name: "Thêm Danh Mục Mới" });
    await expect(modalHeading).toBeVisible();

    // Press Escape to close modal
    await page.keyboard.press("Escape");
    await expect(modalHeading).toBeHidden();
  });
});
