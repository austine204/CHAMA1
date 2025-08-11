import { NextResponse } from "next/server"
import { repo } from "@/lib/db/memory"
import { createMpesaGateway } from "@/services/payment/mpesa"

export async function POST() {
  try {
    const gw = createMpesaGateway()
    const pending = await repo.transaction.listPending()
    let matched = 0

    for (const t of pending) {
      if (t.externalId) {
        const q = await gw.queryTransaction(t.externalId)
        if (q.status === "SUCCESS") {
          await repo.transaction.markSuccess(t.id)

          // Auto-create contribution if member linked
          if (t.type === "CONTRIBUTION" && t.memberId) {
            await repo.contribution.create({
              memberId: t.memberId,
              amount: t.amount,
              date: new Date(),
              type: "SAVINGS",
              source: "MPESA",
              reference: t.externalId,
              paymentTransactionId: t.id,
              status: "CONFIRMED",
            })
            matched++
          }
        } else if (q.status === "FAILED") {
          // Mark as failed
          const tx = await repo.transaction.createOrGetByExternalId({
            ...t,
            status: "FAILED",
          })
        }
      }
    }

    return NextResponse.json({
      data: {
        reconciled: matched,
        pending: pending.length,
        processed: pending.filter((t) => t.externalId).length,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
