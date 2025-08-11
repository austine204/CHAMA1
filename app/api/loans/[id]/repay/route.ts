import { NextResponse } from "next/server"
import { repo } from "@/lib/db/memory"
import { repaymentSchema } from "@/lib/validation"
import { postDoubleEntry } from "@/services/accounting/journal"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const parsed = repaymentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  try {
    const { loan, interestComponent, principalComponent } = await repo.loan.applyRepayment(
      params.id,
      parsed.data.amount,
      true,
    )
    const repay = await repo.repayment.create({
      loanId: loan.id,
      amount: parsed.data.amount,
      interestComponent,
      principalComponent,
      date: new Date(),
      source: parsed.data.source,
      reference: parsed.data.reference,
    })
    // Accounting: Debit Bank(1001) -> on receive? For posting, when applying repayment:
    // Debit Bank 1001 (cash in), Credit Interest Income (4001) for interest, Credit Loan Receivable (1101) for principal
    if (interestComponent > 0) {
      await postDoubleEntry({
        amount: interestComponent,
        debitAccount: "1001-BANK",
        creditAccount: "4001-INTEREST-INCOME",
        description: "Loan interest repayment",
        referenceType: "Repayment",
        referenceId: repay.id,
      })
    }
    if (principalComponent > 0) {
      await postDoubleEntry({
        amount: principalComponent,
        debitAccount: "1001-BANK",
        creditAccount: "1101-LOAN-RECEIVABLE",
        description: "Loan principal repayment",
        referenceType: "Repayment",
        referenceId: repay.id,
      })
    }
    return NextResponse.json({ data: repay, loan })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
