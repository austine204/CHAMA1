import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { testUsers, testMembers } from "../fixtures/test-data"

const prisma = new PrismaClient()

export class DatabaseHelper {
  static async seedTestData() {
    // Clean existing data
    await prisma.contribution.deleteMany()
    await prisma.loanRepayment.deleteMany()
    await prisma.loan.deleteMany()
    await prisma.member.deleteMany()
    await prisma.user.deleteMany()

    // Create test users
    for (const [key, userData] of Object.entries(testUsers)) {
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role as any,
        },
      })
    }

    // Create test members
    const adminUser = await prisma.user.findUnique({
      where: { email: testUsers.admin.email },
    })

    if (adminUser) {
      await prisma.member.create({
        data: {
          ...testMembers.existingMember,
          userId: adminUser.id,
          membershipNumber: "MEM001",
          joinDate: new Date(),
          status: "ACTIVE",
        },
      })
    }
  }

  static async cleanupTestData() {
    await prisma.contribution.deleteMany()
    await prisma.loanRepayment.deleteMany()
    await prisma.loan.deleteMany()
    await prisma.member.deleteMany()
    await prisma.user.deleteMany()
  }

  static async disconnect() {
    await prisma.$disconnect()
  }
}
