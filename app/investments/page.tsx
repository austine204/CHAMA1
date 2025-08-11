import { auth } from "@/lib/auth"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Target, Clock, AlertTriangle, CheckCircle } from "lucide-react"

// Mock data - in real app, fetch from API
const investmentPools = [
  {
    id: "pool-1",
    name: "Real Estate Development Fund",
    description: "Investment in commercial real estate projects in Nairobi CBD",
    targetAmount: 5000000,
    currentAmount: 3250000,
    minimumContribution: 10000,
    expectedReturn: 12.5,
    riskLevel: "MEDIUM",
    duration: 24,
    status: "OPEN",
    participants: 32,
    daysRemaining: 45,
  },
  {
    id: "pool-2",
    name: "Agricultural Investment Pool",
    description: "Funding for modern farming equipment and greenhouse projects",
    targetAmount: 2000000,
    currentAmount: 1800000,
    minimumContribution: 5000,
    expectedReturn: 15.0,
    riskLevel: "HIGH",
    duration: 12,
    status: "OPEN",
    participants: 28,
    daysRemaining: 12,
  },
  {
    id: "pool-3",
    name: "Technology Startup Fund",
    description: "Investment in promising fintech and agritech startups",
    targetAmount: 3000000,
    currentAmount: 3000000,
    minimumContribution: 15000,
    expectedReturn: 20.0,
    riskLevel: "HIGH",
    duration: 36,
    status: "CLOSED",
    participants: 20,
    daysRemaining: 0,
  },
]

function getRiskColor(risk: string) {
  switch (risk) {
    case "LOW":
      return "bg-green-100 text-green-800"
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800"
    case "HIGH":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "OPEN":
      return "bg-blue-100 text-blue-800"
    case "CLOSED":
      return "bg-gray-100 text-gray-800"
    case "MATURED":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default async function InvestmentsPage() {
  await auth()

  const totalInvested = investmentPools.reduce((sum, pool) => sum + pool.currentAmount, 0)
  const totalTarget = investmentPools.reduce((sum, pool) => sum + pool.targetAmount, 0)
  const averageReturn = investmentPools.reduce((sum, pool) => sum + pool.expectedReturn, 0) / investmentPools.length

  return (
    <div className="space-y-8 p-8 animate-fade-in">
      <PageHeader
        title="Investment Pools"
        description="Diversify your portfolio with collective investment opportunities"
      />

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalInvested.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((totalInvested / totalTarget) * 100).toFixed(1)}% of target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pools</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investmentPools.filter((p) => p.status === "OPEN").length}</div>
            <p className="text-xs text-muted-foreground">{investmentPools.length} total pools</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Expected Return</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageReturn.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Per annum</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {investmentPools.reduce((sum, pool) => sum + pool.participants, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all pools</p>
          </CardContent>
        </Card>
      </div>

      {/* Investment Pools */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {investmentPools.map((pool) => {
          const percentageFunded = (pool.currentAmount / pool.targetAmount) * 100
          const isNearDeadline = pool.daysRemaining <= 14 && pool.status === "OPEN"

          return (
            <Card key={pool.id} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{pool.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getRiskColor(pool.riskLevel)}>{pool.riskLevel}</Badge>
                    <Badge className={getStatusColor(pool.status)}>{pool.status}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{pool.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{percentageFunded.toFixed(1)}%</span>
                  </div>
                  <Progress value={percentageFunded} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>KES {pool.currentAmount.toLocaleString()}</span>
                    <span>KES {pool.targetAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Expected Return</p>
                    <p className="font-semibold text-green-600">{pool.expectedReturn}% p.a.</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-semibold">{pool.duration} months</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Min. Investment</p>
                    <p className="font-semibold">KES {pool.minimumContribution.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Participants</p>
                    <p className="font-semibold">{pool.participants}</p>
                  </div>
                </div>

                {/* Time Remaining */}
                {pool.status === "OPEN" && (
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      isNearDeadline ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {isNearDeadline ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    <span className="text-sm font-medium">{pool.daysRemaining} days remaining</span>
                  </div>
                )}

                {pool.status === "CLOSED" && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Fully funded</span>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  className="w-full"
                  disabled={pool.status !== "OPEN"}
                  variant={pool.status === "OPEN" ? "default" : "secondary"}
                >
                  {pool.status === "OPEN" ? "Invest Now" : "View Details"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create New Pool (Admin Only) */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Investment Pool</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Launch a new investment opportunity for SACCO members</p>
          <Button variant="outline">
            <TrendingUp className="mr-2 h-4 w-4" />
            Create Pool
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
