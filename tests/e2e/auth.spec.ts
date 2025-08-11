import { test, expect } from "@playwright/test"
import { LoginPage } from "../page-objects/login-page"
import { DashboardPage } from "../page-objects/dashboard-page"
import { AuthHelper } from "../utils/auth-helper"
import { testUsers } from "../fixtures/test-data"

test.describe("Authentication", () => {
  let loginPage: LoginPage
  let dashboardPage: DashboardPage
  let authHelper: AuthHelper

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    dashboardPage = new DashboardPage(page)
    authHelper = new AuthHelper(page)
  })

  test("should login with valid credentials", async ({ page }) => {
    await loginPage.goto()
    await loginPage.login(testUsers.admin.email, testUsers.admin.password)

    await expect(page).toHaveURL("/dashboard")
    await dashboardPage.expectDashboardLoaded()
  })

  test("should show error with invalid credentials", async ({ page }) => {
    await loginPage.goto()
    await loginPage.login("invalid@email.com", "wrongpassword")

    await loginPage.expectErrorMessage("Invalid credentials")
  })

  test("should logout successfully", async ({ page }) => {
    await authHelper.login("admin")
    await authHelper.logout()

    await expect(page).toHaveURL("/login")
  })

  test("should redirect to login when accessing protected route", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL("/login")
  })

  test("should maintain session after page refresh", async ({ page }) => {
    await authHelper.login("admin")
    await page.reload()

    await expect(page).toHaveURL("/dashboard")
    await dashboardPage.expectDashboardLoaded()
  })
})
