"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ApplyLoanPage() {
  const [members, setMembers] = useState<any[]>([])
  const [memberId, setMemberId] = useState<string>("")
  const [principal, setPrincipal] = useState<number>(10000)
  const [rate, setRate] = useState<number>(12)
  const [term, setTerm] = useState<number>(12)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/members")
      .then((r) => r.json())
      .then((d) => {
        setMembers(d.data || [])
        if (d.data?.[0]) setMemberId(d.data[0].id)
      })
  }, [])

  async function apply() {
    setMsg(null)
    const res = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId,
        principal: Number(principal),
        interestRate: Number(rate),
        termMonths: Number(term),
        repaymentFrequency: "MONTHLY",
      }),
    })
    const data = await res.json()
    setMsg(res.ok ? "Application submitted" : "Error: " + (data.error?.toString?.() ?? "Unknown"))
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Apply for Loan</h1>
      <div className="space-y-2">
        <label className="text-sm font-medium">Member</label>
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className="border rounded px-2 py-1">
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.firstName} {m.lastName}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <div>
          <label className="text-sm font-medium">Principal</label>
          <Input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm font-medium">Rate % p.a.</label>
          <Input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm font-medium">Term (months)</label>
          <Input type="number" value={term} onChange={(e) => setTerm(Number(e.target.value))} />
        </div>
      </div>
      <Button onClick={apply}>Submit</Button>
      {msg && <p className="text-sm">{msg}</p>}
    </main>
  )
}
