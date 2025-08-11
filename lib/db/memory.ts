import { randomUUID } from "crypto"
import type { Contribution, ID, JournalEntry, Loan, Member, PaymentTransaction, Repayment, User } from "../types"
import bcrypt from "bcryptjs"

function uid(): ID {
  try {
    return randomUUID()
  } catch {
    return Math.random().toString(36).slice(2)
  }
}

const now = () => new Date()

// In-memory stores (demo only)
export const db = {
  users: [] as User[],
  members: [] as Member[],
  loans: [] as Loan[],
  repayments: [] as Repayment[],
  contributions: [] as Contribution[],
  transactions: [] as PaymentTransaction[],
  journals: [] as JournalEntry[],
}

// Seed default admin + 10 members in-memory for preview
;(async function seedMemory() {
  if (db.users.length === 0) {
    const passwordHash = await bcrypt.hash("admin123", 12)
    db.users.push({
      id: uid(),
      email: "admin@sacco.local",
      passwordHash,
      role: "SUPER_ADMIN",
      createdAt: now(),
      updatedAt: now(),
    })
  }
  if (db.members.length === 0) {
    const base = new Date()
    base.setMonth(base.getMonth() - 12)
    for (let i = 1; i <= 10; i++) {
      const padded = String(i).padStart(4, "0")
      const joinDate = new Date(base)
      joinDate.setMonth(base.getMonth() + i)
      db.members.push({
        id: uid(),
        saccoId: "SACCO-1",
        memberNumber: `MBR-${padded}`,
        firstName: `Member${padded}`,
        lastName: "Test",
        nationalId: `ID${String(10000000 + i)}`,
        phone: `0712${String(100000 + i).padStart(6, "0")}`,
        email: `member${i}@example.com`,
        address: `P.O. Box ${2000 + i}, Nairobi`,
        joinDate,
        status: "ACTIVE",
        kycVerified: i % 3 === 0,
        createdAt: now(),
        updatedAt: now(),
      })
    }
  }
})()

// Repositories
export const repo = {
  user: {
    async findByEmail(email: string) {
      return db.users.find((u) => u.email === email) || null
    },
  },
  member: {
    async list() {
      return db.members
    },
    async get(id: ID) {
      return db.members.find((m) => m.id === id) || null
    },
    async getByMemberNumber(memberNumber: string) {
      return db.members.find((m) => m.memberNumber === memberNumber) || null
    },
    async create(data: Omit<Member, "id" | "createdAt" | "updatedAt">) {
      const existsNat = db.members.find((m) => m.nationalId === data.nationalId)
      if (existsNat) throw new Error("nationalId must be unique")
      const existsNo = db.members.find((m) => m.memberNumber === data.memberNumber)
      if (existsNo) throw new Error("memberNumber must be unique")
      const rec: Member = { ...data, id: uid(), createdAt: now(), updatedAt: now() }
      db.members.push(rec)
      return rec
    },
    async update(id: ID, patch: Partial<Member>) {
      const m = db.members.find((x) => x.id === id)
      if (!m) return null
      Object.assign(m, patch, { updatedAt: now() })
      return m
    },
  },
  loan: {
    async list() {
      return db.loans
    },
    async get(id: ID) {
      return db.loans.find((l) => l.id === id) || null
    },
    async create(
      data: Omit<
        Loan,
        "id" | "status" | "disbursedAt" | "principalOutstanding" | "interestAccrued" | "createdAt" | "updatedAt"
      >,
    ) {
      const rec: Loan = {
        ...data,
        id: uid(),
        status: "PENDING",
        disbursedAt: undefined,
        principalOutstanding: data.principal,
        interestAccrued: 0,
        createdAt: now(),
        updatedAt: now(),
      }
      db.loans.push(rec)
      return rec
    },
    async approve(id: ID) {
      const l = db.loans.find((x) => x.id === id)
      if (!l) throw new Error("Loan not found")
      l.status = "APPROVED"
      l.updatedAt = now()
      return l
    },
    async disburse(id: ID) {
      const l = db.loans.find((x) => x.id === id)
      if (!l) throw new Error("Loan not found")
      l.status = "DISBURSED"
      l.disbursedAt = now()
      l.updatedAt = now()
      return l
    },
    async applyRepayment(loanId: ID, amount: number, interestFirst = true) {
      const l = db.loans.find((x) => x.id === loanId)
      if (!l) throw new Error("Loan not found")
      let interestComponent = 0
      let principalComponent = 0
      if (interestFirst) {
        const applyToInterest = Math.min(amount, l.interestAccrued)
        interestComponent = applyToInterest
        const remaining = amount - applyToInterest
        principalComponent = Math.min(remaining, l.principalOutstanding)
      } else {
        principalComponent = Math.min(amount, l.principalOutstanding)
        const remaining = amount - principalComponent
        interestComponent = Math.min(remaining, l.interestAccrued)
      }
      l.principalOutstanding = Math.max(0, l.principalOutstanding - principalComponent)
      l.interestAccrued = Math.max(0, l.interestAccrued - interestComponent)
      l.updatedAt = now()
      if (l.principalOutstanding === 0 && l.interestAccrued === 0) {
        l.status = "CLOSED"
      }
      return { loan: l, interestComponent, principalComponent }
    },
  },
  repayment: {
    async create(data: Omit<Repayment, "id" | "createdAt">) {
      const rec: Repayment = { ...data, id: uid(), createdAt: now() }
      db.repayments.push(rec)
      return rec
    },
    async listForLoan(loanId: ID) {
      return db.repayments.filter((r) => r.loanId === loanId)
    },
  },
  contribution: {
    async create(data: Omit<Contribution, "id" | "createdAt" | "status"> & { status?: Contribution["status"] }) {
      const rec: Contribution = {
        ...data,
        id: uid(),
        status: data.status ?? "CONFIRMED",
        createdAt: now(),
      }
      db.contributions.push(rec)
      return rec
    },
    async listForMember(memberId: ID) {
      return db.contributions.filter((c) => c.memberId === memberId)
    },
  },
  transaction: {
    async createOrGetByExternalId(data: Omit<PaymentTransaction, "id" | "createdAt" | "updatedAt">) {
      if (data.externalId) {
        const exists = db.transactions.find((t) => t.externalId === data.externalId)
        if (exists) return exists
      }
      const rec: PaymentTransaction = {
        ...data,
        id: uid(),
        createdAt: now(),
        updatedAt: now(),
      }
      db.transactions.push(rec)
      return rec
    },
    async listPending() {
      return db.transactions.filter((t) => t.status === "PENDING")
    },
    async markSuccess(id: ID) {
      const t = db.transactions.find((x) => x.id === id)
      if (t) {
        t.status = "SUCCESS"
        t.updatedAt = now()
      }
      return t
    },
  },
  journal: {
    async post(entry: Omit<JournalEntry, "id" | "createdAt" | "date"> & { date?: Date }) {
      const rec: JournalEntry = { ...entry, id: uid(), createdAt: now(), date: entry.date ?? now() }
      db.journals.push(rec)
      return rec
    },
    async all() {
      return db.journals
    },
  },
}
