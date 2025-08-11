import { z } from "zod"

export const memberCreateSchema = z.object({
  memberNumber: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  nationalId: z.string().min(5),
  phone: z.string().min(7),
  email: z.string().email().optional(),
  address: z.string().optional(),
  joinDate: z
    .string()
    .or(z.date())
    .transform((v) => new Date(v as any)),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]).default("ACTIVE"),
  kycVerified: z.boolean().optional().default(false),
})

export const memberUpdateSchema = memberCreateSchema.partial()

export const contributionCreateSchema = z.object({
  memberId: z.string().min(1),
  amount: z.number().positive(),
  date: z
    .string()
    .or(z.date())
    .transform((v) => new Date(v as any)),
  type: z.enum(["SHARE_CAPITAL", "SAVINGS", "OTHER"]),
  source: z.string().min(1),
  reference: z.string().optional(),
})

export const loanApplySchema = z.object({
  memberId: z.string().min(1),
  productId: z.string().optional(),
  principal: z.number().positive(),
  interestRate: z.number().positive(), // percent p.a.
  termMonths: z.number().int().positive(),
  repaymentFrequency: z.enum(["MONTHLY", "WEEKLY", "BIWEEKLY"]),
})

export const repaymentSchema = z.object({
  amount: z.number().positive(),
  source: z.string().default("MANUAL"),
  reference: z.string().optional(),
})
