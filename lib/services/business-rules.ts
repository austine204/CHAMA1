import type { Member, Loan, Contribution } from "@/lib/types"
import { BusinessRuleError } from "@/lib/errors"

export class BusinessRules {
  // Member eligibility rules
  static validateMemberEligibility(member: Member): void {
    if (!member.kycVerified) {
      throw new BusinessRuleError("Member must complete KYC verification")
    }

    if (member.status !== "ACTIVE") {
      throw new BusinessRuleError("Only active members can perform transactions")
    }
  }

  // Loan eligibility rules
  static validateLoanEligibility(member: Member, loanAmount: number, existingLoans: Loan[]): void {
    this.validateMemberEligibility(member)

    // Check if member has any active loans
    const activeLoans = existingLoans.filter((loan) => loan.status === "DISBURSED" || loan.status === "APPROVED")

    if (activeLoans.length > 0) {
      throw new BusinessRuleError("Member already has an active loan")
    }

    // Check loan amount limits
    const maxLoanAmount = 1000000 // KES 1M
    if (loanAmount > maxLoanAmount) {
      throw new BusinessRuleError(`Loan amount cannot exceed KES ${maxLoanAmount.toLocaleString()}`)
    }

    const minLoanAmount = 1000 // KES 1K
    if (loanAmount < minLoanAmount) {
      throw new BusinessRuleError(`Loan amount must be at least KES ${minLoanAmount.toLocaleString()}`)
    }
  }

  // Contribution rules
  static validateContribution(member: Member, amount: number): void {
    this.validateMemberEligibility(member)

    const minContribution = 100 // KES 100
    if (amount < minContribution) {
      throw new BusinessRuleError(`Minimum contribution is KES ${minContribution}`)
    }

    const maxContribution = 500000 // KES 500K
    if (amount > maxContribution) {
      throw new BusinessRuleError(`Maximum single contribution is KES ${maxContribution.toLocaleString()}`)
    }
  }

  // Loan repayment rules
  static validateRepayment(loan: Loan, amount: number): void {
    if (loan.status !== "DISBURSED") {
      throw new BusinessRuleError("Can only make repayments on disbursed loans")
    }

    if (amount <= 0) {
      throw new BusinessRuleError("Repayment amount must be positive")
    }

    const totalOutstanding = loan.principalOutstanding + loan.interestAccrued
    if (amount > totalOutstanding * 1.1) {
      // Allow 10% overpayment
      throw new BusinessRuleError("Repayment amount exceeds outstanding balance")
    }
  }

  // Interest calculation rules
  static calculateInterest(principal: number, annualRate: number, days: number): number {
    const dailyRate = annualRate / 100 / 365
    return principal * dailyRate * days
  }

  // Penalty calculation rules
  static calculatePenalty(overdueAmount: number, daysPastDue: number): number {
    if (daysPastDue <= 0) return 0

    const penaltyRate = 0.05 // 5% penalty rate
    return overdueAmount * penaltyRate * Math.min(daysPastDue / 30, 1) // Max 1 month penalty
  }

  // Dividend calculation rules
  static calculateDividend(totalShares: number, memberShares: number, totalDividend: number): number {
    if (totalShares === 0) return 0
    return (memberShares / totalShares) * totalDividend
  }

  // Investment pool rules
  static validateInvestmentContribution(
    poolTargetAmount: number,
    currentAmount: number,
    contributionAmount: number,
  ): void {
    if (contributionAmount <= 0) {
      throw new BusinessRuleError("Investment contribution must be positive")
    }

    if (currentAmount + contributionAmount > poolTargetAmount) {
      throw new BusinessRuleError("Contribution would exceed pool target amount")
    }

    const minContribution = 5000 // KES 5K minimum for investments
    if (contributionAmount < minContribution) {
      throw new BusinessRuleError(`Minimum investment contribution is KES ${minContribution.toLocaleString()}`)
    }
  }

  // Risk assessment rules
  static assessCreditRisk(member: Member, contributions: Contribution[], loans: Loan[]): "LOW" | "MEDIUM" | "HIGH" {
    let score = 0

    // Membership duration (longer = better)
    const membershipMonths = Math.floor((Date.now() - member.joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    if (membershipMonths >= 24) score += 30
    else if (membershipMonths >= 12) score += 20
    else if (membershipMonths >= 6) score += 10

    // KYC verification
    if (member.kycVerified) score += 20

    // Contribution history
    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0)
    if (totalContributions >= 100000) score += 25
    else if (totalContributions >= 50000) score += 15
    else if (totalContributions >= 10000) score += 10

    // Loan repayment history
    const completedLoans = loans.filter((l) => l.status === "CLOSED")
    if (completedLoans.length > 0) score += 15

    // Determine risk level
    if (score >= 70) return "LOW"
    if (score >= 40) return "MEDIUM"
    return "HIGH"
  }
}
