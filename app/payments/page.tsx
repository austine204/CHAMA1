"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Smartphone, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"

export default function PaymentsPage() {
  const [phone, setPhone] = useState("0712345678")
  const [amount, setAmount] = useState(100)
  const [accountRef, setAccountRef] = useState("TEST-001")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function initiateSTK() {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/payments/mpesa/stk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          amount: Number(amount),
          accountRef,
          narrative: "SACCO Contribution",
        }),
      })

      const data = await res.json()
      setResult(data)
    } catch (error) {
      setResult({ error: "Failed to initiate payment" })
    } finally {
      setLoading(false)
    }
  }

  async function runReconciliation() {
    setLoading(true)
    try {
      const res = await fetch("/api/collections/reconcile", { method: "POST" })
      const data = await res.json()
      setResult(data)
    } catch (error) {
      setResult({ error: "Reconciliation failed" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 p-8 animate-fade-in">
      <PageHeader title="Payments & M-Pesa" description="Manage mobile money payments and reconciliation" />

      <Tabs defaultValue="stk" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stk">STK Push</TabsTrigger>
          <TabsTrigger value="reconcile">Reconciliation</TabsTrigger>
        </TabsList>

        <TabsContent value="stk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Send STK Push Request
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712345678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (KES)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountRef">Account Reference</Label>
                  <Input
                    id="accountRef"
                    value={accountRef}
                    onChange={(e) => setAccountRef(e.target.value)}
                    placeholder="Member ID or reference"
                  />
                </div>
              </div>

              <Button onClick={initiateSTK} disabled={loading} className="w-full md:w-auto">
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Sending STK Push...
                  </>
                ) : (
                  <>
                    <Smartphone className="mr-2 h-4 w-4" />
                    Send STK Push
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconcile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Payment Reconciliation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Run reconciliation to match pending transactions with M-Pesa confirmations.
              </p>

              <Button onClick={runReconciliation} disabled={loading} variant="outline">
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Running Reconciliation...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Run Reconciliation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.error ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              )}
              {result.error ? "Error" : "Success"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4">
              <pre className="text-sm overflow-auto whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
