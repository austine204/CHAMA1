import { NextResponse } from "next/server"
import { repo } from "@/lib/db/memory"
import { generateAmortizationReducingBalance } from "@/services/finance/amortization"

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const loan = await repo.loan.approve(params.id)
    const amort = generateAmortizationReducingBalance(loan.principal, loan.interestRate, loan.termMonths)
    return NextResponse.json({ data: loan, amortization: amort })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
