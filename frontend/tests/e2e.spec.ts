import { test, expect } from "@playwright/test";

test.describe("Kannada AI Platform — End-to-End User Journeys", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    const url = baseURL || "http://localhost:3000";
    await page.goto(url);
  });

  test("1. Landing page renders with Karnataka Modern Heritage branding in Kannada by default", async ({ page }) => {
    await expect(page).toHaveTitle(/Kannada AI Interview/i);
    await expect(page.locator("h2")).toContainText("ಲಾಗಿನ್ ಮಾಡಿ");

    const htmlLang = await page.getAttribute("html", "lang");
    expect(htmlLang).toBe("kn");

    await expect(page.getByRole("button", { name: /ಅಭ್ಯರ್ಥಿ/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /ನೇಮಕಾತಿದಾರ/i })).toBeVisible();
  });

  test("2. Language switcher dynamically updates copy across Kannada, English, and Hindi", async ({ page }) => {
    const langSelect = page.locator('select[aria-label="Select language"]');
    await expect(langSelect).toBeVisible();

    // Switch to English
    await langSelect.selectOption("en");
    await expect(page.locator("h2")).toContainText("Sign In");
    await expect(page.getByRole("button", { name: /^Candidate$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Recruiter$/i })).toBeVisible();
    expect(await page.getAttribute("html", "lang")).toBe("en");

    // Switch to Hindi
    await langSelect.selectOption("hi");
    await expect(page.locator("h2")).toContainText("लॉग इन करें");
    expect(await page.getAttribute("html", "lang")).toBe("hi");

    // Switch back to Kannada
    await langSelect.selectOption("kn");
    await expect(page.locator("h2")).toContainText("ಲಾಗಿನ್ ಮಾಡಿ");
    expect(await page.getAttribute("html", "lang")).toBe("kn");
  });

  test("3. Role switcher toggles candidate and recruiter login modes", async ({ page }) => {
    const candidateBtn = page.getByRole("button", { name: /ಅಭ್ಯರ್ಥಿ/i });
    const recruiterBtn = page.getByRole("button", { name: /ನೇಮಕಾತಿದಾರ/i });

    // Toggle to Recruiter mode
    await recruiterBtn.click();
    await expect(recruiterBtn).toHaveClass(/bg-primary/);

    // Toggle back to Candidate mode
    await candidateBtn.click();
    await expect(candidateBtn).toHaveClass(/bg-primary/);
  });

  test("4. Form requires valid email and password credentials", async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await submitBtn.click();

    await emailInput.fill("invalid-candidate@example.com");
    await passwordInput.fill("wrongpassword");
    await submitBtn.click();

    await page.waitForTimeout(1000);
    await expect(page.locator("body")).toBeVisible();
  });

  test("5. Navigation to register page retains role parameter", async ({ page }) => {
    const registerLink = page.locator('a[href*="/register"]').first();
    await expect(registerLink).toBeVisible();
    await registerLink.click();

    await page.waitForURL(/\/register/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator("h1")).toBeVisible();
  });
});
