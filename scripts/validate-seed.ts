import { PrismaClient } from "@prisma/client"

async function run() {
  const prisma = new PrismaClient()
  try {
    const members = await prisma.member.findMany({ take: 15, orderBy: { memberNumber: "asc" } })
    console.log("Members found:", members.length)
    for (const m of members) {
      console.log(`${m.memberNumber} - ${m.firstName} ${m.lastName} (${m.status})`)
    }
  } finally {
    await prisma.$disconnect()
  }
}

run().catch((err) => {
  console.error("Validation error:", err)
  process.exit(1)
})
