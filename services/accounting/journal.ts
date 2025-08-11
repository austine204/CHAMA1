import { repo } from "@/lib/db/memory"

// Simple double-entry posting helper
export async function postDoubleEntry(params: {
  amount: number
  debitAccount: string
  creditAccount: string
  description?: string
  referenceType?: string
  referenceId?: string
  date?: Date
}) {
  const { amount, debitAccount, creditAccount, description, referenceId, referenceType, date } = params
  if (amount <= 0) throw new Error("amount must be positive")
  await repo.journal.post({
    amount,
    debitAccount,
    creditAccount,
    description,
    referenceId,
    referenceType,
    date,
  })
}

export async function trialBalance() {
  const entries = await repo.journal.all()
  const balances: Record<string, number> = {}
  for (const j of entries) {
    balances[j.debitAccount] = (balances[j.debitAccount] ?? 0) + j.amount
    balances[j.creditAccount] = (balances[j.creditAccount] ?? 0) - j.amount
  }
  return balances
}

export async function balanceSheet() {
  // naive grouping by prefix
  const tb = await trialBalance()
  const assets = Object.entries(tb).filter(([a]) => a.startsWith("1"))
  const liabilities = Object.entries(tb).filter(([a]) => a.startsWith("2"))
  const equity = Object.entries(tb).filter(([a]) => a.startsWith("3"))
  const sum = (arr: [string, number][]) => arr.reduce((acc, [, v]) => acc + v, 0)
  return {
    assets: Object.fromEntries(assets),
    liabilities: Object.fromEntries(liabilities),
    equity: Object.fromEntries(equity),
    totals: {
      assets: sum(assets),
      liabilities: sum(liabilities),
      equity: sum(equity),
    },
  }
}

export async function profitAndLoss() {
  const tb = await trialBalance()
  const income = Object.entries(tb).filter(([a]) => a.startsWith("4"))
  const expenses = Object.entries(tb).filter(([a]) => a.startsWith("5"))
  const sum = (arr: [string, number][]) => arr.reduce((acc, [, v]) => acc + v, 0)
  return {
    income: Object.fromEntries(income),
    expenses: Object.fromEntries(expenses),
    totals: {
      income: sum(income),
      expenses: sum(expenses),
      netIncome: sum(income) - sum(expenses),
    },
  }
}
