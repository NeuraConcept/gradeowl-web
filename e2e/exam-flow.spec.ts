import { test, expect } from "@playwright/test";

test.describe("exam flow", () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Set up auth cookies for authenticated state
  });

  test("exam list page renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Your Exams")).toBeVisible();
  });

  test("create exam navigates to form", async ({ page }) => {
    await page.goto("/");
    await page.getByText("+ New Exam").click();
    await expect(page).toHaveURL(/\/exams\/new/);
    await expect(page.getByText("Create New Exam")).toBeVisible();
  });

  test("exam dashboard shows stepper", async ({ page }) => {
    await page.goto("/exams/1");
    await expect(page.getByText("Upload")).toBeVisible();
    await expect(page.getByText("Rubric")).toBeVisible();
    await expect(page.getByText("Results")).toBeVisible();
  });
});
