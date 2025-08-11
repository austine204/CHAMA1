import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { investmentPoolSchema } from "@/lib/validation/schemas"
import { handleError } from "@/lib/errors"
import { AuditLogger } from "@/lib/security/audit-logger"

// Mock investment pools data
const investmentPools = [
  {
    id: "pool-1",
    name: "Real Estate Development Fund",
    description: "Investment in commercial real estate projects",
    targetAmount: 5000000,
    currentAmount: 2500000,
    minimumContribution: 10000,
    expectedReturn: 12.5,
    riskLevel: "MEDIUM",
    duration: 24,
    status: "OPEN",
    createdAt: new Date(),
    participants: 25,
  },
  {
    id: "pool-2",
    name: "Agricultural Investment Pool",
    description: "Funding for agricultural projects and equipment",
    targetAmount: 2000000,
    currentAmount: 1800000,
    minimumContribution: 5000,
    expectedReturn: 15.0,
    riskLevel: "HIGH",
    duration: 12,
    status: "OPEN",
    createdAt: new Date(),
    participants: 36,
  },
]

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await AuditLogger.logDataAccess({
      userId: session.user?.email || "unknown",
      action: "READ",
      resource: "INVESTMENT_POOLS",
      resourceId: "all",
    })

    return NextResponse.json({
      data: investmentPools,
      total: investmentPools.length,
    })
  } catch (error) {
    const appError = handleError(error)
    return NextResponse.json({ error: appError.message }, { status: appError.statusCode })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = investmentPoolSchema.parse(body)

    const newPool = {
      id: `pool-${Date.now()}`,
      ...validatedData,
      currentAmount: 0,
      participants: 0,
      createdAt: new Date(),
    }

    investmentPools.push(newPool)

    await AuditLogger.logDataAccess({
      userId: session.user?.email || "unknown",
      action: "CREATE",
      resource: "INVESTMENT_POOL",
      resourceId: newPool.id,
    })

    return NextResponse.json({ data: newPool }, { status: 201 })
  } catch (error) {
    const appError = handleError(error)
    return NextResponse.json({ error: appError.message }, { status: appError.statusCode })
  }
}
