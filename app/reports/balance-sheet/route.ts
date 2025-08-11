import { NextResponse } from "next/server"
import { balanceSheet } from "@/services/accounting/journal"

export async function GET() {
  const bs = await balanceSheet()
  return NextResponse.json({ data: bs })
}
