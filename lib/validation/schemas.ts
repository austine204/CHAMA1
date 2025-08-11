import { z } from "zod"

// User schemas
export const userCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["SUPER_ADMIN", "SACCO_ADMIN", "LOAN_OFFICER", "FINANCE_OFFICER", "MEMBER", "AUDITOR"]),
  memberId: z.string().optional(),
})

export const userUpdateSchema = userCreateSchema.partial().omit({ password: true })

// Member schemas
export const memberCreateSchema = z.object({
  memberNumber: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  nationalId: z.string().min(5),
  phone: z.string().min(7),
  email: z.string().email().optional(),
  address: z.string().optional(),
  joinDate: z.coerce.date(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]).default("ACTIVE"),
  kycVerified: z.boolean().default(false),
})

export const memberUpdateSchema = memberCreateSchema.partial()

// Loan schemas
export const loanCreateSchema = z.object({
  memberId: z.string().min(1),
  productId: z.string().optional(),
  principal: z.number().positive(),
  interestRate: z.number().positive(),
  termMonths: z.number().int().positive(),
  repaymentFrequency: z.enum(["MONTHLY", "WEEKLY", "BIWEEKLY"]),
})

export const loanUpdateSchema = loanCreateSchema.partial()

// Contribution schemas
export const contributionCreateSchema = z.object({
  memberId: z.string().min(1),
  amount: z.number().positive(),
  date: z.coerce.date(),
  type: z.enum(["SHARE_CAPITAL", "SAVINGS", "OTHER"]),
  source: z.string().min(1),
  reference: z.string().optional(),
})

// Payment schemas
export const paymentTransactionSchema = z.object({
  provider: z.enum(["MPESA", "BANK", "MANUAL", "AIRTEL", "OTHER"]),
  type: z.enum(["CONTRIBUTION", "REPAYMENT", "DISBURSEMENT", "FEE"]),
  amount: z.number().positive(),
  currency: z.string().default("KES"),
  phone: z.string().optional(),
  accountRef: z.string().optional(),
  memberId: z.string().optional(),
  loanId: z.string().optional(),
})

// Investment schemas
export const investmentPoolSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  targetAmount: z.number().positive(),
  minimumContribution: z.number().positive(),
  expectedReturn: z.number().min(0).max(100),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
  duration: z.number().int().positive(),
  status: z.enum(["OPEN", "CLOSED", "MATURED"]).default("OPEN"),
})

// System configuration schemas
export const systemConfigSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  description: z.string().optional(),
  category: z.string().default("GENERAL"),
})
