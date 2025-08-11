"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NewMemberPage() {
  const [payload, setPayload] = useState({
    memberNumber: "MBR-9999",
    firstName: "New",
    lastName: "Member",
    nationalId: "ID99999999",
    phone: "0712000000",
    email: "new@example.com",
    address: "P.O. Box 1",
    joinDate: new Date().toISOString().slice(0, 10),
    status: "ACTIVE",
    kycVerified: false,
  })
  const [msg, setMsg] = useState<string | null>(null)

  async function submit() {
    setMsg(null)
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setMsg(res.ok ? "Member created" : "Error: " + (data.error?.toString?.() ?? "Unknown"))
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">New Member</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(payload).map(([k, v]) => (
          <div key={k} className="space-y-1">
            <label className="text-sm font-medium">{k}</label>
            <Input value={String(v)} onChange={(e) => setPayload({ ...payload, [k]: e.target.value })} />
          </div>
        ))}
      </div>
      <Button onClick={submit}>Create</Button>
      {msg && <p className="text-sm">{msg}</p>}
    </main>
  )
}
