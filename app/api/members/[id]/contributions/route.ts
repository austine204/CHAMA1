import { NextResponse } from "next/server"
import { repo } from "@/lib/db/memory"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const list = await repo.contribution.listForMember(params.id)
  return NextResponse.json({ data: list })
}
