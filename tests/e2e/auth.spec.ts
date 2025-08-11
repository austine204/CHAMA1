import { test, expect } from "@playwright/test"
import { LoginPage } from "../page-objects/login-page"
import { DashboardPage } from "../page-objects/dashboard-page"
import { testUsers } from "../fixtures/test-data"

test.describe("Authentication", () => {
  let loginPage: LoginPage
  let dashboardPage: DashboardPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    dashboardPage = new DashboardPage(page)
  })

  test("should login with valid credentials", async ({ page }) => {
    await loginPage.goto()

    await loginPage.login(testUsers.admin.email, testUsers.admin.password)

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard")
    await expect(dashboardPage.pageTitle).toBeVisible()
  })

  test("should show error with invalid credentials", async ({ page }) => {
    await loginPage.goto()

    await loginPage.login("invalid@email.com", "wrongpassword")

    // Should stay on login page and show error
    await expect(page).toHaveURL("/login")
    await expect(loginPage.errorMessage).toBeVisible()

    const errorText = await loginPage.getErrorMessage()
    expect(errorText).toContain("Invalid")
  })

  test("should logout successfully", async ({ page }) => {
    // Login first
    await loginPage.goto()
    await loginPage.login(testUsers.admin.email, testUsers.admin.password)
    await expect(page).toHaveURL("/dashboard")

    // Logout
    await page.click('[data-testid="user-menu"]')
    await page.click("text=Log out")

    // Should redirect to login
    await expect(page).toHaveURL("/login")
  })

  test("should redirect to login when accessing protected route", async ({ page }) => {
    await page.goto("/dashboard")

    // Should redirect to login
    await expect(page).toHaveURL("/login")
  })
})
