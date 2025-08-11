import { testMembers, testLoans } from "../fixtures/test-data"

export class DatabaseHelper {
  static async seedTestData() {
    // In a real app, this would interact with your database
    // For now, we'll use the in-memory database
    console.log("Seeding test data...")
  }

  static async cleanupTestData() {
    // Clean up any test data created during tests
    console.log("Cleaning up test data...")
  }

  static async createTestMember(memberData = testMembers[0]) {
    // Create a test member via API
    const response = await fetch("http://localhost:3000/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(memberData),
    })
    return response.json()
  }

  static async createTestLoan(memberId: string, loanData = testLoans[0]) {
    const response = await fetch("http://localhost:3000/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...loanData, memberId }),
    })
    return response.json()
  }
}
