import type { Page } from "@playwright/test"
import { testUsers } from "../fixtures/test-data"

export class AuthHelper {
  constructor(private page: Page) {}

  async login(userType: "admin" | "member" = "admin") {
    const user = testUsers[userType]

    await this.page.goto("/login")
    await this.page.fill('[data-testid="email-input"]', user.email)
    await this.page.fill('[data-testid="password-input"]', user.password)
    await this.page.click('[data-testid="login-button"]')

    // Wait for redirect to dashboard
    await this.page.waitForURL("/dashboard")
  }

  async logout() {
    // Click user avatar dropdown
    await this.page.click('[data-testid="user-menu"]')
    await this.page.click("text=Log out")

    // Wait for redirect to login
    await this.page.waitForURL("/login")
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.waitForSelector('[data-testid="user-menu"]', { timeout: 5000 })
      return true
    } catch {
      return false
    }
  }
}
