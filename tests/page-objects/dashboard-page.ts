import type { Page, Locator } from "@playwright/test"

export class DashboardPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly statsCards: Locator
  readonly quickActions: Locator
  readonly recentActivity: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.locator('h1:has-text("Dashboard")')
    this.statsCards = page.locator('[data-testid="stats-card"]')
    this.quickActions = page.locator('[data-testid="quick-actions"]')
    this.recentActivity = page.locator('[data-testid="recent-activity"]')
  }

  async goto() {
    await this.page.goto("/dashboard")
  }

  async getStatsCount() {
    return await this.statsCards.count()
  }

  async clickQuickAction(action: string) {
    await this.page.click(`text=${action}`)
  }
}
