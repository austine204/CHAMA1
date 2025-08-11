import { test, expect } from "@playwright/test"
import { AuthHelper } from "../utils/auth-helper"
import { testContributions } from "../fixtures/test-data"

test.describe("Contributions Management", () => {
  let authHelper: AuthHelper

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page)
    await authHelper.login("admin")
  })

  test("should record manual contribution", async ({ page }) => {
    await page.goto("/members")
    await page.click('[data-testid="member-row"]:first-child [data-testid="record-contribution"]')

    await page.fill('[data-testid="amount-input"]', testContributions.monthly.amount.toString())
    await page.selectOption('[data-testid="type-select"]', testContributions.monthly.type)
    await page.fill('[data-testid="description-input"]', testContributions.monthly.description)
    await page.click('[data-testid="submit-button"]')

    await expect(page.locator("text=Contribution recorded successfully")).toBeVisible()
  })

  test("should display contribution history", async ({ page }) => {
    await page.goto("/members/1")
    await page.click('[data-testid="contributions-tab"]')

    await expect(page.locator('[data-testid="contributions-table"]')).toBeVisible()
  })

  test("should validate contribution amount", async ({ page }) => {
    await page.goto("/members")
    await page.click('[data-testid="member-row"]:first-child [data-testid="record-contribution"]')

    await page.fill('[data-testid="amount-input"]', "0")
    await page.click('[data-testid="submit-button"]')

    await expect(page.locator("text=Amount must be greater than 0")).toBeVisible()
  })

  test("should handle M-Pesa payment integration", async ({ page }) => {
    await page.goto("/payments")

    await page.fill('[data-testid="phone-input"]', "+254712345678")
    await page.fill('[data-testid="amount-input"]', "5000")
    await page.click('[data-testid="initiate-payment"]')

    await expect(page.locator("text=Payment request sent")).toBeVisible()
  })
})
