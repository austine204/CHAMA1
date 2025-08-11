import { NextResponse } from "next/server"
import { repo } from "@/lib/db/memory"
import { memberUpdateSchema } from "@/lib/validation"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const m = await repo.member.get(params.id)
  if (!m) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ data: m })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const parsed = memberUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const updated = await repo.member.update(params.id, parsed.data)
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ data: updated })
}
