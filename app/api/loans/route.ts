import { NextResponse } from "next/server"
import { repo } from "@/lib/db/memory"
import { loanApplySchema } from "@/lib/validation"
import { generateAmortizationReducingBalance } from "@/services/finance/amortization"

export async function GET() {
  const list = await repo.loan.list()
  return NextResponse.json({ data: list })
}

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = loanApplySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  // Simple eligibility: joined > 6 months and >=3 contributions
  const member = await repo.member.get(parsed.data.memberId)
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 })
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  if (member.joinDate > sixMonthsAgo) {
    return NextResponse.json({ error: "Member not eligible: joinDate < 6 months" }, { status: 400 })
  }
  const contribs = await repo.contribution.listForMember(member.id)
  if (contribs.length < 3) {
    return NextResponse.json({ error: "Member not eligible: at least 3 contributions required" }, { status: 400 })
  }

  const created = await repo.loan.create(parsed.data)
  const amort = generateAmortizationReducingBalance(created.principal, created.interestRate, created.termMonths)
  return NextResponse.json({ data: created, amortization: amort }, { status: 201 })
}
