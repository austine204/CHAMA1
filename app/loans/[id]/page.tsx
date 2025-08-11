"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function LoanDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [loan, setLoan] = useState<any>(null)
  const [schedule, setSchedule] = useState<any[]>([])
  const [amount, setAmount] = useState(1000)

  async function load() {
    const l = await fetch(`/api/loans`, { cache: "no-store" }).then((r) => r.json())
    const data = (l.data as any[]).find((x) => x.id === id)
    setLoan(data)
    const sched = await fetch(`/api/loans/${id}/schedule`).then((r) => r.json())
    setSchedule(sched.data || [])
  }

  useEffect(() => {
    load()
  }, [])

  async function approve() {
    await fetch(`/api/loans/${id}/approve`, { method: "POST" })
    await load()
  }
  async function disburse() {
    await fetch(`/api/loans/${id}/disburse`, { method: "POST" })
    await load()
  }
  async function repay() {
    await fetch(`/api/loans/${id}/repay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), source: "MANUAL" }),
    })
    await load()
  }

  if (!loan)
    return (
      <main className="p-6">
        <p>Loading...</p>
      </main>
    )
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Loan {loan.id?.slice(0, 6)}</h1>
      <div className="flex gap-2">
        <Button onClick={approve} disabled={loan.status !== "PENDING"}>
          Approve
        </Button>
        <Button onClick={disburse} disabled={loan.status !== "APPROVED"}>
          Disburse
        </Button>
        <div className="flex items-center gap-2">
          <input
            className="border rounded px-2 py-1 w-28"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <Button onClick={repay} disabled={loan.status === "PENDING"}>
            Repay
          </Button>
        </div>
      </div>
      <section>
        <h2 className="text-lg font-medium">Schedule</h2>
        <div className="overflow-auto border rounded">
          <table className="min-w-[600px] text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="px-2 py-1 text-left">#</th>
                <th className="px-2 py-1 text-left">Date</th>
                <th className="px-2 py-1 text-right">Opening</th>
                <th className="px-2 py-1 text-right">Principal</th>
                <th className="px-2 py-1 text-right">Interest</th>
                <th className="px-2 py-1 text-right">Payment</th>
                <th className="px-2 py-1 text-right">Closing</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1">{r.period}</td>
                  <td className="px-2 py-1">{new Date(r.date).toDateString()}</td>
                  <td className="px-2 py-1 text-right">{r.openingBalance.toFixed(2)}</td>
                  <td className="px-2 py-1 text-right">{r.principal.toFixed(2)}</td>
                  <td className="px-2 py-1 text-right">{r.interest.toFixed(2)}</td>
                  <td className="px-2 py-1 text-right">{r.payment.toFixed(2)}</td>
                  <td className="px-2 py-1 text-right">{r.closingBalance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
