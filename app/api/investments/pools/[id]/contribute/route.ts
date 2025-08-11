import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { z } from "zod"
import { BusinessRules } from "@/lib/services/business-rules"
import { AuditLogger } from "@/lib/security/audit-logger"
import { handleError } from "@/lib/errors"

const contributeSchema = z.object({
  amount: z.number().positive(),
  memberId: z.string().min(1),
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { amount, memberId } = contributeSchema.parse(body)

    // Mock pool data - in real app, fetch from database
    const pool = {
      id: params.id,
      name: "Real Estate Development Fund",
      targetAmount: 5000000,
      currentAmount: 2500000,
      minimumContribution: 10000,
      status: "OPEN",
    }

    if (!pool) {
      return NextResponse.json({ error: "Investment pool not found" }, { status: 404 })
    }

    if (pool.status !== "OPEN") {
      return NextResponse.json({ error: "Investment pool is not open for contributions" }, { status: 400 })
    }

    // Validate contribution using business rules
    BusinessRules.validateInvestmentContribution(pool.targetAmount, pool.currentAmount, amount)

    // Create contribution record
    const contribution = {
      id: `contrib-${Date.now()}`,
      poolId: params.id,
      memberId,
      amount,
      date: new Date(),
      status: "CONFIRMED",
    }

    // Update pool amount (in real app, this would be a database transaction)
    pool.currentAmount += amount

    await AuditLogger.logFinancialTransaction({
      userId: session.user?.email || "unknown",
      action: "INVESTMENT_CONTRIBUTION",
      amount,
      currency: "KES",
      memberId,
      transactionId: contribution.id,
    })

    return NextResponse.json({
      data: {
        contribution,
        pool: {
          ...pool,
          currentAmount: pool.currentAmount,
          percentageFunded: (pool.currentAmount / pool.targetAmount) * 100,
        },
      },
    })
  } catch (error) {
    const appError = handleError(error)
    return NextResponse.json({ error: appError.message }, { status: appError.statusCode })
  }
}
