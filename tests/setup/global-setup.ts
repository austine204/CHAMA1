import { chromium, type FullConfig } from "@playwright/test"
import { DatabaseHelper } from "../utils/database-helper"

async function globalSetup(config: FullConfig) {
  // Setup test database
  await DatabaseHelper.seedTestData()

  // Start the application and wait for it to be ready
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    await page.goto("http://localhost:3000")
    await page.waitForSelector("body", { timeout: 30000 })
  } catch (error) {
    console.error("Failed to start application:", error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup
