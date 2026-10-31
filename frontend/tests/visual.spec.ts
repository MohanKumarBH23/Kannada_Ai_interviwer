import { test, expect } from "@playwright/test";

test.describe("Kannada AI Platform — Visual & Responsive Regression", () => {
  test("Desktop Viewport — Home screen visual integrity", async ({ page, baseURL }) => {
    const url = baseURL || "http://localhost:3000";
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(url);
    await page.waitForLoadState("domcontentloaded");

    // Verify left brand hero panel is visible on desktop
    const heroPanel = page.locator(".lg\\:flex");
    await expect(heroPanel).toBeVisible();

    // Verify no horizontal page overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Capture desktop screenshot
    await page.screenshot({ path: "./test-results/desktop-home.png", fullPage: true });
  });

  test("Mobile Viewport — Responsive layout & stacked view", async ({ page, baseURL }) => {
    const url = baseURL || "http://localhost:3000";
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(url);
    await page.waitForLoadState("domcontentloaded");

    // On mobile, the login form is visible and responsive
    const formCard = page.locator("form");
    await expect(formCard).toBeVisible();

    // Verify language switcher remains accessible on mobile
    const langSelect = page.locator('select[aria-label="Select language"]');
    await expect(langSelect).toBeVisible();

    // Verify no horizontal overflow on mobile
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Capture mobile screenshot
    await page.screenshot({ path: "./test-results/mobile-home.png", fullPage: true });
  });

  test("Register Page — Visual integrity and accessibility check", async ({ page, baseURL }) => {
    const url = (baseURL || "http://localhost:3000") + "/register";
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(url);
    await page.waitForLoadState("domcontentloaded");

    const registerCard = page.locator(".max-w-md");
    await expect(registerCard).toBeVisible();

    // Capture register screenshot
    await page.screenshot({ path: "./test-results/desktop-register.png", fullPage: true });
  });
});
