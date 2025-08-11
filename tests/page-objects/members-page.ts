import type { Page, Locator } from "@playwright/test"

export class MembersPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly addMemberButton: Locator
  readonly searchInput: Locator
  readonly membersList: Locator
  readonly memberCards: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.locator('h1:has-text("Members")')
    this.addMemberButton = page.locator("text=Add Member")
    this.searchInput = page.locator('[placeholder*="Search members"]')
    this.membersList = page.locator('[data-testid="members-list"]')
    this.memberCards = page.locator('[data-testid="member-card"]')
  }

  async goto() {
    await this.page.goto("/members")
  }

  async addNewMember() {
    await this.addMemberButton.click()
  }

  async searchMembers(query: string) {
    await this.searchInput.fill(query)
  }

  async getMembersCount() {
    return await this.memberCards.count()
  }

  async clickMember(memberName: string) {
    await this.page.click(`text=${memberName}`)
  }
}
