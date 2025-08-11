"use client"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db/memory"
import { PageHeader } from "@/components/ui/page-header"
import { MobileOptimizedCard } from "@/components/ui/mobile-optimized-card"
import { CreditCard, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Plus } from "lucide-react"
import { StatusBadge } from "@/components/ui/status-badge"

export default async function DashboardPage() {
  await auth()

  const loans = db.loans
  const members = db.members
  const contributions = db.contributions
  const transactions = db.transactions

  // Calculate metrics
  const totalLoanValue = loans.reduce((sum, loan) => sum + loan.principal, 0)
  const totalContributions = contributions.reduce((sum, contrib) => sum + contrib.amount, 0)
  const activeLoans = loans.filter((l) => l.status === "DISBURSED").length
  const delinquentLoans = loans.filter((l) => l.status === "IN_ARREARS").length
  const pendingTransactions = transactions.filter((t) => t.status === "PENDING").length

  // Recent activities
  const recentLoans = loans.slice(-3).reverse()
  const recentContributions = contributions.slice(-3).reverse()

  return (
    <div className="space-y-6 p-4 md:p-8 animate-fade-in">
      <PageHeader title="Dashboard" description="Overview of your SACCO operations" />

      {/* Mobile-First Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MobileOptimizedCard
          title="Members"
          value={members.length}
          description="+12 from last month"
          clickable
          onClick={() => (window.location.href = "/members")}
        />
        <MobileOptimizedCard
          title="Active Loans"
          value={activeLoans}
          description="+8 from last month"
          clickable
          onClick={() => (window.location.href = "/loans")}
        />
        <MobileOptimizedCard
          title="Contributions"
          value={`KES ${(totalContributions / 1000).toFixed(0)}K`}
          description="+15% from last month"
          clickable
          onClick={() => (window.location.href = "/members")}
          className="col-span-2 lg:col-span-1"
        />
        <MobileOptimizedCard
          title="Loan Portfolio"
          value={`KES ${(totalLoanValue / 1000000).toFixed(1)}M`}
          description="+5% from last month"
          clickable
          onClick={() => (window.location.href = "/loans")}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* Alerts - Mobile Optimized */}
      {(delinquentLoans > 0 || pendingTransactions > 0) && (
        <div className="space-y-3">
          {delinquentLoans > 0 && (
            <MobileOptimizedCard
              title="Attention Required"
              subtitle={`${delinquentLoans} loan${delinquentLoans > 1 ? "s" : ""} in arrears requiring follow-up`}
              className="border-red-200 bg-red-50"
              action={{
                label: "Review Loans",
                onClick: () => (window.location.href = "/loans"),
              }}
            >
              <div className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span className="font-medium">Urgent</span>
              </div>
            </MobileOptimizedCard>
          )}

          {pendingTransactions > 0 && (
            <MobileOptimizedCard
              title="Pending Reconciliation"
              subtitle={`${pendingTransactions} transaction${pendingTransactions > 1 ? "s" : ""} awaiting reconciliation`}
              className="border-yellow-200 bg-yellow-50"
              action={{
                label: "Reconcile Now",
                onClick: () => (window.location.href = "/payments"),
              }}
            >
              <div className="flex items-center text-yellow-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Review Required</span>
              </div>
            </MobileOptimizedCard>
          )}
        </div>
      )}

      {/* Quick Actions - Mobile First */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <MobileOptimizedCard
          title="New Member"
          clickable
          onClick={() => (window.location.href = "/members/new")}
          className="h-20"
        >
          <div className="flex items-center justify-center">
            <Plus className="h-6 w-6 text-primary" />
          </div>
        </MobileOptimizedCard>

        <MobileOptimizedCard
          title="Loan Application"
          clickable
          onClick={() => (window.location.href = "/loans/new")}
          className="h-20"
        >
          <div className="flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
        </MobileOptimizedCard>

        <MobileOptimizedCard
          title="M-Pesa Payment"
          clickable
          onClick={() => (window.location.href = "/payments")}
          className="h-20"
        >
          <div className="flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
        </MobileOptimizedCard>

        <MobileOptimizedCard
          title="Reports"
          clickable
          onClick={() => (window.location.href = "/reports")}
          className="h-20"
        >
          <div className="flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
        </MobileOptimizedCard>
      </div>

      {/* Recent Activity - Mobile Optimized */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>

        <div className="space-y-3">
          <h3 className="text-base font-medium text-muted-foreground">Recent Loans</h3>
          {recentLoans.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent loans</p>
          ) : (
            <div className="space-y-2">
              {recentLoans.map((loan) => {
                const member = members.find((m) => m.id === loan.memberId)
                return (
                  <MobileOptimizedCard
                    key={loan.id}
                    title={member ? `${member.firstName} ${member.lastName}` : "Unknown Member"}
                    subtitle={`KES ${loan.principal.toLocaleString()}`}
                    clickable
                    onClick={() => (window.location.href = `/loans/${loan.id}`)}
                  >
                    <StatusBadge status={loan.status} />
                  </MobileOptimizedCard>
                )
              })}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-medium text-muted-foreground">Recent Contributions</h3>
          {recentContributions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent contributions</p>
          ) : (
            <div className="space-y-2">
              {recentContributions.map((contrib) => {
                const member = members.find((m) => m.id === contrib.memberId)
                return (
                  <MobileOptimizedCard
                    key={contrib.id}
                    title={member ? `${member.firstName} ${member.lastName}` : "Unknown Member"}
                    subtitle={`${contrib.type} • ${contrib.source}`}
                    value={`KES ${contrib.amount.toLocaleString()}`}
                    clickable
                    onClick={() => (window.location.href = `/members/${contrib.memberId}`)}
                  >
                    <StatusBadge status={contrib.status} />
                  </MobileOptimizedCard>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
