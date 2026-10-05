import { expect, type Page, test } from "@playwright/test";

const food = {
  id: "phase1-food",
  name: "Bún Chả Phase 1",
  description: "Món dùng cho smoke test giao diện trang chủ.",
  price: 85_000,
  discountPercent: 10,
  image: "/images/placeholder-food.jpg",
  rating: 4.8,
  status: "available",
  restaurant: {
    id: "phase1-restaurant",
    name: "Bếp Foodee",
    status: "active",
  },
};

const authenticatedUser = {
  id: "phase1-user",
  username: "phase1",
  email: "phase1@foodee.test",
  name: "Người dùng Phase 1",
  role: { id: 1, name: "customer" },
  isActive: true,
  learningtime: 0,
  coursenumber: 0,
  createdAt: "2026-07-31T00:00:00.000Z",
};

async function mockGuestApi(page: Page) {
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

    if (url.pathname === "/foods/search") {
      await route.fulfill({ json: { items: [food], total: 1 } });
      return;
    }

    if (
      url.pathname === "/foods" ||
      url.pathname === "/foods/top-selling" ||
      url.pathname === "/foods/by-name"
    ) {
      await route.fulfill({ json: { items: [food], total: 1 } });
      return;
    }

    if (url.pathname === `/foods/${food.id}`) {
      await route.fulfill({ json: food });
      return;
    }

    if (url.pathname === `/foods/${food.id}/toppings`) {
      await route.fulfill({ json: [] });
      return;
    }

    if (url.pathname === "/categories") {
      await route.fulfill({
        json: {
          items: [
            {
              id: "phase1-category",
              name: "Món Phase 1",
              image: "/images/placeholder-food.jpg",
            },
          ],
          total: 1,
        },
      });
      return;
    }

    await route.fulfill({ json: { items: [], total: 0 } });
  });
}

test.beforeEach(async ({ page }) => {
  await mockGuestApi(page);
});

test("mobile navigation, skip link and layout stay accessible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);

  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", {
      name: "Bỏ qua điều hướng, đến nội dung chính",
    }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  const menuTrigger = page.getByRole("button", {
    name: "Mở menu điều hướng",
  });
  await menuTrigger.click();
  const dialog = page.getByRole("dialog", {
    name: "Điều hướng Foodee",
  });
  await expect(dialog).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Điều hướng Foodee" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(menuTrigger).toBeFocused();
});

test("hero search submits and preserves the query", async ({
  page,
}) => {
  await page.goto("/");

  const search = page.getByRole("combobox", { name: "Tìm món ăn" });
  await search.fill("Bún chả");
  await search.press("Enter");

  await expect(page).toHaveURL(
    /\/search\?search=B%C3%BAn\+ch%E1%BA%A3$/,
  );
  await expect(
    page.getByPlaceholder("Tìm kiếm món ăn, nhà hàng..."),
  ).toHaveValue("Bún chả");
  await expect(page.locator("main")).toHaveCount(1);
});

test("suggestion works with ArrowDown and Enter", async ({
  page,
}) => {
  await page.goto("/");

  const search = page.getByRole("combobox", { name: "Tìm món ăn" });
  await search.fill("Bún");
  await expect(
    page.getByRole("option", { name: /Bún Chả Phase 1/ }),
  ).toBeVisible();

  await search.press("ArrowDown");
  await expect(
    page.getByRole("option", { name: /Bún Chả Phase 1/ }),
  ).toHaveAttribute("aria-selected", "true");
  await search.press("Enter");

  await expect(page).toHaveURL(/\/food\/phase1-food$/);
});

test("category and add-to-cart provide visible feedback", async ({
  page,
}) => {
  await page.goto("/");

  const category = page.getByRole("button", {
    name: "Món Phase 1",
  });
  await category.click();
  await expect(category).toHaveAttribute("aria-pressed", "true");

  await page
    .getByRole("button", {
      name: "Thêm Bún Chả Phase 1 vào giỏ hàng",
    })
    .first()
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        () => window.localStorage.getItem("multiCartItems") ?? "",
      ),
    )
    .toContain(food.id);
});

test("authenticated cart and user triggers remain accessible", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("authToken", "phase1-token");
  });
  await page.goto("/");

  const cartTrigger = page.getByRole("button", {
    name: "Giỏ hàng (0)",
  });
  await expect(cartTrigger).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Thông báo" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Mở menu tài khoản" }),
  ).toBeVisible();

  await page
    .getByRole("button", {
      name: "Thêm Bún Chả Phase 1 vào giỏ hàng",
    })
    .first()
    .click();
  const populatedCartTrigger = page.getByRole("button", {
    name: "Giỏ hàng (1)",
  });
  await expect(populatedCartTrigger).toBeVisible();

  await populatedCartTrigger.click();
  await expect(
    page.getByRole("heading", { name: "Giỏ hàng của bạn" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "Giỏ hàng của bạn" }),
  ).toBeHidden();
  await expect(populatedCartTrigger).toBeFocused();
});
