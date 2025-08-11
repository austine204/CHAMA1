import { test as setup, expect } from "@playwright/test"
import { testUsers } from "../fixtures/test-data"

const authFile = "playwright/.auth/user.json"

setup("authenticate", async ({ page }) => {
  // Perform authentication steps
  await page.goto("/login")
  await page.fill('[data-testid="email-input"]', testUsers.admin.email)
  await page.fill('[data-testid="password-input"]', testUsers.admin.password)
  await page.click('[data-testid="login-button"]')

  // Wait until the page receives the cookies
  await page.waitForURL("/dashboard")

  // Ensure we're logged in
  await expect(page.locator("text=Dashboard")).toBeVisible()

  // End of authentication steps
  await page.context().storageState({ path: authFile })
})
