import { NextResponse } from "next/server"
import { repo } from "@/lib/db/memory"
import { generateAmortizationReducingBalance } from "@/services/finance/amortization"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const loan = await repo.loan.get(params.id)
  if (!loan) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const amort = generateAmortizationReducingBalance(loan.principal, loan.interestRate, loan.termMonths)
  return NextResponse.json({ data: amort })
}
