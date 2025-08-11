import { test, expect } from "@playwright/test"
import { AuthHelper } from "../utils/auth-helper"
import { testLoans } from "../fixtures/test-data"

test.describe("Loan Management", () => {
  let authHelper: AuthHelper

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page)
    await authHelper.login("admin")
  })

  test("should display loans list", async ({ page }) => {
    await page.goto("/loans")
    await expect(page.locator('[data-testid="loans-table"]')).toBeVisible()
  })

  test("should create new loan application", async ({ page }) => {
    await page.goto("/loans/new")

    await page.fill('[data-testid="amount-input"]', testLoans.personalLoan.amount.toString())
    await page.fill('[data-testid="purpose-input"]', testLoans.personalLoan.purpose)
    await page.fill('[data-testid="term-input"]', testLoans.personalLoan.term.toString())
    await page.click('[data-testid="submit-button"]')

    await expect(page.locator("text=Loan application submitted")).toBeVisible()
  })

  test("should approve loan application", async ({ page }) => {
    await page.goto("/loans")
    await page.click('[data-testid="loan-row"]:first-child [data-testid="approve-button"]')
    await page.click('[data-testid="confirm-approve"]')

    await expect(page.locator("text=Loan approved successfully")).toBeVisible()
  })

  test("should disburse approved loan", async ({ page }) => {
    await page.goto("/loans")
    await page.click('[data-testid="loan-row"]:first-child [data-testid="disburse-button"]')
    await page.click('[data-testid="confirm-disburse"]')

    await expect(page.locator("text=Loan disbursed successfully")).toBeVisible()
  })

  test("should calculate loan schedule correctly", async ({ page }) => {
    await page.goto("/loans/new")

    await page.fill('[data-testid="amount-input"]', "100000")
    await page.fill('[data-testid="term-input"]', "12")
    await page.fill('[data-testid="interest-rate-input"]', "12")

    await expect(page.locator('[data-testid="monthly-payment"]')).toContainText("9,456")
    await expect(page.locator('[data-testid="total-interest"]')).toContainText("13,472")
  })
})
