"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function ContributionForm({ memberId }: { memberId: string }) {
  const [amount, setAmount] = useState(500)
  const [type, setType] = useState<"SAVINGS" | "SHARE_CAPITAL" | "OTHER">("SAVINGS")
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  function submit() {
    setMessage(null)
    startTransition(async () => {
      try {
        const res = await fetch("/api/contributions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberId,
            amount: Number(amount),
            date: new Date().toISOString(),
            type,
            source: "MANUAL",
          }),
        })
        const data = await res.json()

        if (!res.ok) {
          setMessage({ type: "error", text: data.error?.toString?.() ?? "Unknown error" })
        } else {
          setMessage({ type: "success", text: "Contribution recorded successfully" })
          // Reset form
          setAmount(500)
          // Refresh page after success
          setTimeout(() => window.location.reload(), 1500)
        }
      } catch (error) {
        setMessage({ type: "error", text: "Network error occurred" })
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Record New Contribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (KES)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min="1"
              step="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SAVINGS">Savings</SelectItem>
                <SelectItem value="SHARE_CAPITAL">Share Capital</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={submit} disabled={isPending || amount <= 0} className="w-full">
          {isPending ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Recording...
            </>
          ) : (
            "Record Contribution"
          )}
        </Button>

        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span className="text-sm">{message.text}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
