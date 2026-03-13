import { test, expect } from "@playwright/test";

// Skipped: requires auth cookie setup (middleware redirects to /login without it)
test.describe.skip("exam flow (requires auth)", () => {
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
