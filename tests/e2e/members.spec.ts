import { test, expect } from "@playwright/test"
import { MembersPage } from "../page-objects/members-page"
import { AuthHelper } from "../utils/auth-helper"
import { testMembers } from "../fixtures/test-data"

test.describe("Members Management", () => {
  let membersPage: MembersPage
  let authHelper: AuthHelper

  test.beforeEach(async ({ page }) => {
    membersPage = new MembersPage(page)
    authHelper = new AuthHelper(page)
    await authHelper.login("admin")
  })

  test("should display members list", async ({ page }) => {
    await membersPage.goto()
    await expect(membersPage.membersTable).toBeVisible()
  })

  test("should add new member", async ({ page }) => {
    await membersPage.goto()
    await membersPage.addMember(testMembers.newMember)

    await expect(page.locator("text=Member added successfully")).toBeVisible()
    await membersPage.expectMemberInTable(testMembers.newMember.name)
  })

  test("should search for members", async ({ page }) => {
    await membersPage.goto()
    await membersPage.searchMember("John")

    await expect(page.locator("text=John")).toBeVisible()
  })

  test("should validate required fields", async ({ page }) => {
    await membersPage.goto()
    await membersPage.addMemberButton.click()
    await membersPage.submitButton.click()

    await expect(page.locator("text=Name is required")).toBeVisible()
    await expect(page.locator("text=Email is required")).toBeVisible()
  })

  test("should prevent duplicate email registration", async ({ page }) => {
    await membersPage.goto()
    await membersPage.addMember({
      ...testMembers.newMember,
      email: testMembers.existingMember.email,
    })

    await expect(page.locator("text=Email already exists")).toBeVisible()
  })
})
