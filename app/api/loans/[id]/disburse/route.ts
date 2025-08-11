import { NextResponse } from "next/server"
import { repo } from "@/lib/db/memory"
import { postDoubleEntry } from "@/services/accounting/journal"

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const loan = await repo.loan.disburse(params.id)
    // Accounting: Debit Loan Receivable (1xxx), Credit Bank (1001)
    await postDoubleEntry({
      amount: loan.principal,
      debitAccount: "1101-LOAN-RECEIVABLE",
      creditAccount: "1001-BANK",
      description: "Loan disbursement",
      referenceType: "Loan",
      referenceId: loan.id,
    })
    return NextResponse.json({ data: loan })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
