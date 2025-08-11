import type { Page } from "@playwright/test"
import { testUsers } from "../fixtures/test-data"

export class AuthHelper {
  constructor(private page: Page) {}

  async login(userType: "admin" | "manager" | "member" = "admin") {
    const user = testUsers[userType]

    await this.page.goto("/login")
    await this.page.fill('[data-testid="email-input"]', user.email)
    await this.page.fill('[data-testid="password-input"]', user.password)
    await this.page.click('[data-testid="login-button"]')

    // Wait for successful login redirect
    await this.page.waitForURL("/dashboard")
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]')
    await this.page.click('[data-testid="logout-button"]')
    await this.page.waitForURL("/login")
  }

  async ensureLoggedIn(userType: "admin" | "manager" | "member" = "admin") {
    try {
      await this.page.waitForSelector('[data-testid="dashboard-header"]', { timeout: 2000 })
    } catch {
      await this.login(userType)
    }
  }
}
