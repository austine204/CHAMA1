import { NextResponse } from "next/server"
import { profitAndLoss } from "@/services/accounting/journal"

export async function GET() {
  const pl = await profitAndLoss()
  return NextResponse.json({ data: pl })
}
