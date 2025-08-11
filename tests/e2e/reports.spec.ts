import { test, expect } from "@playwright/test"
import { AuthHelper } from "../utils/auth-helper"

test.describe("Reports", () => {
  let authHelper: AuthHelper

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page)
    await authHelper.login("admin")
  })

  test("should generate balance sheet report", async ({ page }) => {
    await page.goto("/reports")
    await page.click('[data-testid="balance-sheet-report"]')

    await expect(page.locator('[data-testid="balance-sheet-table"]')).toBeVisible()
    await expect(page.locator("text=Total Assets")).toBeVisible()
    await expect(page.locator("text=Total Liabilities")).toBeVisible()
  })

  test("should generate profit and loss report", async ({ page }) => {
    await page.goto("/reports")
    await page.click('[data-testid="profit-loss-report"]')

    await expect(page.locator('[data-testid="profit-loss-table"]')).toBeVisible()
    await expect(page.locator("text=Total Income")).toBeVisible()
    await expect(page.locator("text=Total Expenses")).toBeVisible()
  })

  test("should export reports to PDF", async ({ page }) => {
    await page.goto("/reports")
    await page.click('[data-testid="balance-sheet-report"]')

    const downloadPromise = page.waitForEvent("download")
    await page.click('[data-testid="export-pdf"]')
    const download = await downloadPromise

    expect(download.suggestedFilename()).toContain("balance-sheet")
  })

  test("should filter reports by date range", async ({ page }) => {
    await page.goto("/reports")
    await page.click('[data-testid="balance-sheet-report"]')

    await page.fill('[data-testid="start-date"]', "2024-01-01")
    await page.fill('[data-testid="end-date"]', "2024-12-31")
    await page.click('[data-testid="apply-filter"]')

    await expect(page.locator('[data-testid="date-range-display"]')).toContainText("2024-01-01 to 2024-12-31")
  })
})
