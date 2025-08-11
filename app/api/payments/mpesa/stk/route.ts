import { NextResponse } from "next/server"
import { createMpesaGateway } from "@/services/payment/mpesa"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const gw = createMpesaGateway()
    const res = await gw.initiateSTKPush({
      phone: body.phone,
      amount: body.amount,
      accountRef: body.accountRef,
      narrative: body.narrative,
    })
    return NextResponse.json({ data: res })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
