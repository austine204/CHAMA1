import { DatabaseHelper } from "../utils/database-helper"

async function globalTeardown() {
  // Clean up test data
  await DatabaseHelper.cleanupTestData()
  await DatabaseHelper.disconnect()
}

export default globalTeardown
