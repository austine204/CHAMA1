import { test, expect } from "@playwright/test"
import { DashboardPage } from "../page-objects/dashboard-page"
import { AuthHelper } from "../utils/auth-helper"

test.describe("Dashboard", () => {
  let dashboardPage: DashboardPage
  let authHelper: AuthHelper

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page)
    authHelper = new AuthHelper(page)
    await authHelper.login("admin")
  })

  test("should display dashboard statistics", async ({ page }) => {
    await dashboardPage.goto()

    await expect(dashboardPage.totalMembersCard).toBeVisible()
    await expect(dashboardPage.totalLoansCard).toBeVisible()
    await expect(dashboardPage.totalContributionsCard).toBeVisible()
  })

  test("should show recent activities", async ({ page }) => {
    await dashboardPage.goto()

    await expect(dashboardPage.recentActivitiesSection).toBeVisible()
  })

  test("should navigate to different sections", async ({ page }) => {
    await dashboardPage.goto()

    await page.click('[data-testid="members-nav"]')
    await expect(page).toHaveURL("/members")

    await page.click('[data-testid="loans-nav"]')
    await expect(page).toHaveURL("/loans")

    await page.click('[data-testid="payments-nav"]')
    await expect(page).toHaveURL("/payments")
  })

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await dashboardPage.goto()

    await expect(dashboardPage.header).toBeVisible()
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()
  })
})
