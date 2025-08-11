import type { Page, Locator } from "@playwright/test"

export class MembersPage {
  readonly page: Page
  readonly addMemberButton: Locator
  readonly membersTable: Locator
  readonly searchInput: Locator
  readonly nameInput: Locator
  readonly emailInput: Locator
  readonly phoneInput: Locator
  readonly nationalIdInput: Locator
  readonly addressInput: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    this.page = page
    this.addMemberButton = page.locator('[data-testid="add-member-button"]')
    this.membersTable = page.locator('[data-testid="members-table"]')
    this.searchInput = page.locator('[data-testid="search-input"]')
    this.nameInput = page.locator('[data-testid="name-input"]')
    this.emailInput = page.locator('[data-testid="email-input"]')
    this.phoneInput = page.locator('[data-testid="phone-input"]')
    this.nationalIdInput = page.locator('[data-testid="national-id-input"]')
    this.addressInput = page.locator('[data-testid="address-input"]')
    this.submitButton = page.locator('[data-testid="submit-button"]')
  }

  async goto() {
    await this.page.goto("/members")
  }

  async addMember(memberData: any) {
    await this.addMemberButton.click()
    await this.nameInput.fill(memberData.name)
    await this.emailInput.fill(memberData.email)
    await this.phoneInput.fill(memberData.phone)
    await this.nationalIdInput.fill(memberData.nationalId)
    await this.addressInput.fill(memberData.address)
    await this.submitButton.click()
  }

  async searchMember(searchTerm: string) {
    await this.searchInput.fill(searchTerm)
    await this.page.keyboard.press("Enter")
  }

  async expectMemberInTable(memberName: string) {
    await this.page.waitForSelector(`text=${memberName}`)
  }
}
