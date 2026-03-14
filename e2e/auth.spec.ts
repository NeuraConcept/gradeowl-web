import { test, expect } from "@playwright/test";

test("redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
});

test("login page renders", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("GradeOwl")).toBeVisible();
  await expect(page.getByText("Sign in with Google")).toBeVisible();
});
