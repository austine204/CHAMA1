import { PrismaClient, UserRole, MemberStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Seed admin user (idempotent)
  const adminEmail = "admin@sacco.local"
  const adminPassword = "admin123" // For local/dev only; change in production

  const passwordHash = await bcrypt.hash(adminPassword, 12)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: UserRole.SUPER_ADMIN },
    create: {
      email: adminEmail,
      passwordHash,
      role: UserRole.SUPER_ADMIN,
    },
  })

  // Seed 10 sample members (idempotent on memberNumber)
  const baseJoinDate = new Date()
  baseJoinDate.setMonth(baseJoinDate.getMonth() - 12)

  const membersPayload = Array.from({ length: 10 }).map((_, i) => {
    const idx = i + 1
    const padded = String(idx).padStart(4, "0")
    const joinDate = new Date(baseJoinDate)
    joinDate.setMonth(baseJoinDate.getMonth() + i)

    return {
      memberNumber: `MBR-${padded}`,
      firstName: `Member${padded}`,
      lastName: "Test",
      nationalId: `ID${String(10000000 + idx)}`,
      phone: `0712${String(100000 + idx).padStart(6, "0")}`,
      email: `member${idx}@example.com`,
      address: `P.O. Box ${2000 + idx}, Nairobi`,
      joinDate,
      status: MemberStatus.ACTIVE,
      kycVerified: i % 3 === 0, // some verified, some not
    }
  })

  for (const m of membersPayload) {
    await prisma.member.upsert({
      where: { memberNumber: m.memberNumber },
      update: {
        firstName: m.firstName,
        lastName: m.lastName,
        phone: m.phone,
        email: m.email,
        address: m.address ?? null,
        status: m.status,
        kycVerified: m.kycVerified,
      },
      create: m,
    })
  }

  const count = await prisma.member.count()
  console.log(`Seed complete: admin user ensured, members in DB: ${count}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
