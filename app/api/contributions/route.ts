import { NextResponse } from "next/server"
import { repo } from "@/lib/db/memory"
import { contributionCreateSchema } from "@/lib/validation"
import { postDoubleEntry } from "@/services/accounting/journal"

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = contributionCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const c = await repo.contribution.create(parsed.data)
  // Accounting: debit Cash/Bank(1xxx), credit Member Savings(2xxx? or 3xxx equity)
  await postDoubleEntry({
    amount: c.amount,
    debitAccount: "1001-BANK",
    creditAccount: c.type === "SHARE_CAPITAL" ? "3001-SHARE-CAPITAL" : "2001-MEMBER-SAVINGS",
    description: `Contribution ${c.type} ${c.reference ?? ""}`.trim(),
    referenceType: "Contribution",
    referenceId: c.id,
  })
  return NextResponse.json({ data: c }, { status: 201 })
}
