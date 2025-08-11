export type ID = string

export type UserRole = "SUPER_ADMIN" | "SACCO_ADMIN" | "LOAN_OFFICER" | "FINANCE_OFFICER" | "MEMBER" | "AUDITOR"

export type MemberStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING"

export type LoanStatus = "PENDING" | "APPROVED" | "DISBURSED" | "IN_ARREARS" | "CLOSED" | "WRITTEN_OFF" | "REJECTED"

export type RepaymentFrequency = "MONTHLY" | "WEEKLY" | "BIWEEKLY"

export type ContributionType = "SHARE_CAPITAL" | "SAVINGS" | "OTHER"
export type ContributionStatus = "PENDING" | "CONFIRMED" | "REVERSED"

export type PaymentProvider = "MPESA" | "BANK" | "MANUAL" | "AIRTEL" | "OTHER"
export type PaymentType = "CONTRIBUTION" | "REPAYMENT" | "DISBURSEMENT" | "FEE"
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "REVERSED"

export interface User {
  id: ID
  email: string
  passwordHash: string
  role: UserRole
  memberId?: ID
  createdAt: Date
  updatedAt: Date
}

export interface Member {
  id: ID
  saccoId?: ID
  memberNumber: string
  firstName: string
  lastName: string
  nationalId: string
  phone: string
  email?: string
  address?: string
  joinDate: Date
  status: MemberStatus
  kycVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Loan {
  id: ID
  memberId: ID
  productId?: ID
  principal: number
  interestRate: number // percent per annum
  termMonths: number
  repaymentFrequency: RepaymentFrequency
  status: LoanStatus
  disbursedAt?: Date
  principalOutstanding: number
  interestAccrued: number
  createdAt: Date
  updatedAt: Date
}

export interface Repayment {
  id: ID
  loanId: ID
  amount: number
  interestComponent: number
  principalComponent: number
  date: Date
  source: string
  reference?: string
  createdAt: Date
}

export interface Contribution {
  id: ID
  memberId: ID
  amount: number
  date: Date
  type: ContributionType
  source: string
  reference?: string
  status: ContributionStatus
  paymentTransactionId?: ID
  createdAt: Date
}

export interface PaymentTransaction {
  id: ID
  provider: PaymentProvider
  type: PaymentType
  status: PaymentStatus
  memberId?: ID
  loanId?: ID
  amount: number
  currency: string
  phone?: string
  externalId?: string // provider transaction id
  accountRef?: string
  idempotencyKey?: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface JournalEntry {
  id: ID
  date: Date
  description?: string
  debitAccount: string
  creditAccount: string
  amount: number
  referenceType?: string
  referenceId?: string
  createdAt: Date
}
