import { auth } from "@/lib/auth"
import { db } from "@/lib/db/memory"
import { StatsCard } from "@/components/ui/stats-card"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"
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
  const recentLoans = loans.slice(-5).reverse()
  const recentContributions = contributions.slice(-5).reverse()

  return (
    <div className="space-y-8 p-8 animate-fade-in">
      <PageHeader title="Dashboard" description="Overview of your SACCO operations" />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Members"
          value={members.length}
          change={{ value: 12, label: "from last month" }}
          icon={Users}
          trend="up"
        />
        <StatsCard
          title="Active Loans"
          value={activeLoans}
          change={{ value: 8, label: "from last month" }}
          icon={CreditCard}
          trend="up"
        />
        <StatsCard
          title="Total Contributions"
          value={`KES ${totalContributions.toLocaleString()}`}
          change={{ value: 15, label: "from last month" }}
          icon={DollarSign}
          trend="up"
        />
        <StatsCard
          title="Loan Portfolio"
          value={`KES ${totalLoanValue.toLocaleString()}`}
          change={{ value: 5, label: "from last month" }}
          icon={TrendingUp}
          trend="up"
        />
      </div>

      {/* Alerts */}
      {(delinquentLoans > 0 || pendingTransactions > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {delinquentLoans > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <CardTitle className="text-sm font-medium text-red-800 ml-2">Attention Required</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700">
                  {delinquentLoans} loan{delinquentLoans > 1 ? "s" : ""} in arrears requiring follow-up
                </p>
              </CardContent>
            </Card>
          )}

          {pendingTransactions > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CheckCircle className="h-4 w-4 text-yellow-600" />
                <CardTitle className="text-sm font-medium text-yellow-800 ml-2">Pending Reconciliation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-700">
                  {pendingTransactions} transaction{pendingTransactions > 1 ? "s" : ""} awaiting reconciliation
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Loans
              <Link href="/loans" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentLoans.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent loans</p>
            ) : (
              recentLoans.map((loan) => {
                const member = members.find((m) => m.id === loan.memberId)
                return (
                  <div key={loan.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {member ? `${member.firstName} ${member.lastName}` : "Unknown Member"}
                      </p>
                      <p className="text-xs text-muted-foreground">KES {loan.principal.toLocaleString()}</p>
                    </div>
                    <StatusBadge status={loan.status} />
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Contributions
              <Link href="/members" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentContributions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent contributions</p>
            ) : (
              recentContributions.map((contrib) => {
                const member = members.find((m) => m.id === contrib.memberId)
                return (
                  <div key={contrib.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {member ? `${member.firstName} ${member.lastName}` : "Unknown Member"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {contrib.type} • {contrib.source}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">KES {contrib.amount.toLocaleString()}</p>
                      <StatusBadge status={contrib.status} />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
