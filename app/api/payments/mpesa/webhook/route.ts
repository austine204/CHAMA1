import { NextResponse } from "next/server"
import { repo } from "@/lib/db/memory"
import { postDoubleEntry } from "@/services/accounting/journal"

// Expected payload example:
// { externalId: "MPESA123", phone: "2547...", amount: 1000, type: "CONTRIBUTION", memberId?, loanId?, accountRef? }

// M-Pesa STK Push callback structure
interface MpesaCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string
      CheckoutRequestID: string
      ResultCode: number
      ResultDesc: string
      CallbackMetadata?: {
        Item: Array<{
          Name: string
          Value: string | number
        }>
      }
    }
  }
}

export async function POST(req: Request) {
  try {
    const callback: MpesaCallback = await req.json()
    const stkCallback = callback.Body?.stkCallback

    if (!stkCallback) {
      return NextResponse.json({ error: "Invalid callback format" }, { status: 400 })
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback

    // Create or update transaction record
    const tx = await repo.transaction.createOrGetByExternalId({
      provider: "MPESA",
      type: "CONTRIBUTION",
      status: ResultCode === 0 ? "SUCCESS" : "FAILED",
      amount: 0, // Will be updated from metadata
      currency: "KES",
      externalId: CheckoutRequestID,
      idempotencyKey: CheckoutRequestID,
      metadata: callback,
    })

    if (ResultCode === 0 && CallbackMetadata) {
      // Extract transaction details from callback metadata
      const items = CallbackMetadata.Item || []
      const amount = items.find((item) => item.Name === "Amount")?.Value as number
      const mpesaReceiptNumber = items.find((item) => item.Name === "MpesaReceiptNumber")?.Value as string
      const phone = items.find((item) => item.Name === "PhoneNumber")?.Value as string

      if (amount && phone) {
        // Update transaction with actual amount
        tx.amount = amount
        tx.phone = phone.toString()
        await repo.transaction.markSuccess(tx.id)

        // Try to match to a member by phone number
        const members = await repo.member.list()
        const member = members.find((m) => m.phone === phone || m.phone === `0${phone.slice(3)}`)

        if (member) {
          // Create contribution record
          const contribution = await repo.contribution.create({
            memberId: member.id,
            amount: amount,
            date: new Date(),
            type: "SAVINGS",
            source: "MPESA",
            reference: mpesaReceiptNumber,
            paymentTransactionId: tx.id,
            status: "CONFIRMED",
          })

          // Post accounting entries
          await postDoubleEntry({
            amount: amount,
            debitAccount: "1001-BANK",
            creditAccount: "2001-MEMBER-SAVINGS",
            description: `M-Pesa contribution ${mpesaReceiptNumber}`,
            referenceType: "Contribution",
            referenceId: contribution.id,
          })

          return NextResponse.json({
            ResultCode: 0,
            ResultDesc: "Success",
            data: { transaction: tx, contribution },
          })
        }
      }
    }

    // Return success to M-Pesa even if we couldn't process fully
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    })
  } catch (error: any) {
    console.error("M-Pesa webhook error:", error)
    return NextResponse.json(
      {
        ResultCode: 1,
        ResultDesc: "Failed",
      },
      { status: 500 },
    )
  }
}
