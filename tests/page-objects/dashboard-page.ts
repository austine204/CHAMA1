import type { Page, Locator } from "@playwright/test"

export class DashboardPage {
  readonly page: Page
  readonly header: Locator
  readonly totalMembersCard: Locator
  readonly totalLoansCard: Locator
  readonly totalContributionsCard: Locator
  readonly recentActivitiesSection: Locator

  constructor(page: Page) {
    this.page = page
    this.header = page.locator('[data-testid="dashboard-header"]')
    this.totalMembersCard = page.locator('[data-testid="total-members-card"]')
    this.totalLoansCard = page.locator('[data-testid="total-loans-card"]')
    this.totalContributionsCard = page.locator('[data-testid="total-contributions-card"]')
    this.recentActivitiesSection = page.locator('[data-testid="recent-activities"]')
  }

  async goto() {
    await this.page.goto("/dashboard")
  }

  async expectDashboardLoaded() {
    await this.header.waitFor()
    await this.totalMembersCard.waitFor()
    await this.totalLoansCard.waitFor()
    await this.totalContributionsCard.waitFor()
  }
}
