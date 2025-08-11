import { BusinessRules } from "./business-rules"
import { AuditLogger } from "@/lib/security/audit-logger"

export interface InvestmentPool {
  id: string
  name: string
  description: string
  targetAmount: number
  currentAmount: number
  minimumContribution: number
  expectedReturn: number
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  duration: number // months
  status: "OPEN" | "CLOSED" | "MATURED"
  createdAt: Date
  maturityDate?: Date
  participants: number
}

export interface PoolContribution {
  id: string
  poolId: string
  memberId: string
  amount: number
  date: Date
  status: "PENDING" | "CONFIRMED" | "CANCELLED"
}

export class InvestmentPoolService {
  private static pools: InvestmentPool[] = []
  private static contributions: PoolContribution[] = []

  // Create new investment pool
  static async createPool(
    poolData: Omit<InvestmentPool, "id" | "currentAmount" | "participants" | "createdAt">,
  ): Promise<InvestmentPool> {
    const pool: InvestmentPool = {
      ...poolData,
      id: `pool-${Date.now()}`,
      currentAmount: 0,
      participants: 0,
      createdAt: new Date(),
    }

    if (pool.duration > 0) {
      pool.maturityDate = new Date()
      pool.maturityDate.setMonth(pool.maturityDate.getMonth() + pool.duration)
    }

    this.pools.push(pool)

    await AuditLogger.logDataAccess({
      userId: "system",
      action: "CREATE",
      resource: "INVESTMENT_POOL",
      resourceId: pool.id,
    })

    return pool
  }

  // Get all pools
  static async getAllPools(): Promise<InvestmentPool[]> {
    return this.pools
  }

  // Get pool by ID
  static async getPoolById(poolId: string): Promise<InvestmentPool | null> {
    return this.pools.find((pool) => pool.id === poolId) || null
  }

  // Contribute to pool
  static async contributeToPool(
    poolId: string,
    memberId: string,
    amount: number,
    userId: string,
  ): Promise<{ contribution: PoolContribution; pool: InvestmentPool }> {
    const pool = await this.getPoolById(poolId)
    if (!pool) {
      throw new Error("Investment pool not found")
    }

    if (pool.status !== "OPEN") {
      throw new Error("Investment pool is not open for contributions")
    }

    // Validate contribution using business rules
    BusinessRules.validateInvestmentContribution(pool.targetAmount, pool.currentAmount, amount)

    // Create contribution
    const contribution: PoolContribution = {
      id: `contrib-${Date.now()}`,
      poolId,
      memberId,
      amount,
      date: new Date(),
      status: "CONFIRMED",
    }

    this.contributions.push(contribution)

    // Update pool
    pool.currentAmount += amount

    // Check if this is a new participant
    const existingContributions = this.contributions.filter(
      (c) => c.poolId === poolId && c.memberId === memberId && c.status === "CONFIRMED",
    )

    if (existingContributions.length === 1) {
      // First contribution from this member
      pool.participants += 1
    }

    // Check if pool is fully funded
    if (pool.currentAmount >= pool.targetAmount) {
      pool.status = "CLOSED"
    }

    await AuditLogger.logFinancialTransaction({
      userId,
      action: "INVESTMENT_CONTRIBUTION",
      amount,
      currency: "KES",
      memberId,
      transactionId: contribution.id,
    })

    return { contribution, pool }
  }

  // Get contributions for a pool
  static async getPoolContributions(poolId: string): Promise<PoolContribution[]> {
    return this.contributions.filter((c) => c.poolId === poolId)
  }

  // Get member's contributions across all pools
  static async getMemberContributions(memberId: string): Promise<PoolContribution[]> {
    return this.contributions.filter((c) => c.memberId === memberId)
  }

  // Calculate returns for matured pools
  static async calculateReturns(poolId: string): Promise<{ [memberId: string]: number }> {
    const pool = await this.getPoolById(poolId)
    if (!pool || pool.status !== "MATURED") {
      throw new Error("Pool is not matured")
    }

    const contributions = await this.getPoolContributions(poolId)
    const totalContributed = contributions.reduce((sum, c) => sum + c.amount, 0)
    const totalReturns = totalContributed * (pool.expectedReturn / 100) * (pool.duration / 12)

    const memberReturns: { [memberId: string]: number } = {}

    // Group contributions by member
    const memberContributions: { [memberId: string]: number } = {}
    contributions.forEach((c) => {
      memberContributions[c.memberId] = (memberContributions[c.memberId] || 0) + c.amount
    })

    // Calculate proportional returns
    Object.entries(memberContributions).forEach(([memberId, amount]) => {
      const proportion = amount / totalContributed
      memberReturns[memberId] = amount + totalReturns * proportion
    })

    return memberReturns
  }

  // Get pool analytics
  static async getPoolAnalytics(poolId: string): Promise<{
    totalContributions: number
    averageContribution: number
    contributionTrend: Array<{ date: string; amount: number }>
    topContributors: Array<{ memberId: string; amount: number }>
  }> {
    const contributions = await this.getPoolContributions(poolId)

    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0)
    const averageContribution = contributions.length > 0 ? totalContributions / contributions.length : 0

    // Group contributions by date
    const dailyContributions: { [date: string]: number } = {}
    contributions.forEach((c) => {
      const date = c.date.toISOString().split("T")[0]
      dailyContributions[date] = (dailyContributions[date] || 0) + c.amount
    })

    const contributionTrend = Object.entries(dailyContributions)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Group contributions by member
    const memberContributions: { [memberId: string]: number } = {}
    contributions.forEach((c) => {
      memberContributions[c.memberId] = (memberContributions[c.memberId] || 0) + c.amount
    })

    const topContributors = Object.entries(memberContributions)
      .map(([memberId, amount]) => ({ memberId, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)

    return {
      totalContributions,
      averageContribution,
      contributionTrend,
      topContributors,
    }
  }

  // Mature pools that have reached their duration
  static async maturePools(): Promise<void> {
    const now = new Date()

    for (const pool of this.pools) {
      if (pool.status === "CLOSED" && pool.maturityDate && now >= pool.maturityDate) {
        pool.status = "MATURED"

        await AuditLogger.logDataAccess({
          userId: "system",
          action: "UPDATE",
          resource: "INVESTMENT_POOL",
          resourceId: pool.id,
          details: { status: "MATURED" },
        })
      }
    }
  }
}
