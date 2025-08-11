import { NextResponse } from "next/server"
import { repo } from "@/lib/db/memory"
import { memberCreateSchema } from "@/lib/validation"

export async function GET() {
  const members = await repo.member.list()
  return NextResponse.json({ data: members })
}

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = memberCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  try {
    const created = await repo.member.create(parsed.data)
    return NextResponse.json({ data: created }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
