import { auth } from "@/lib/auth"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, BarChart3, PieChart, TrendingUp, RefreshCw } from "lucide-react"

const reports = [
  {
    title: "Balance Sheet",
    description: "Assets, liabilities, and equity statement",
    icon: BarChart3,
    endpoint: "/reports/balance-sheet",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    title: "Profit & Loss",
    description: "Income and expense statement",
    icon: TrendingUp,
    endpoint: "/reports/profit-loss",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    title: "Member Statements",
    description: "Individual member account statements",
    icon: FileText,
    endpoint: "#",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    title: "Loan Portfolio",
    description: "Comprehensive loan portfolio analysis",
    icon: PieChart,
    endpoint: "#",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
]

export default async function ReportsPage() {
  await auth()

  return (
    <div className="space-y-8 p-8 animate-fade-in">
      <PageHeader title="Reports & Analytics" description="Generate financial reports and business insights" />

      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <Card key={report.title} className={`border-2 ${report.color}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/50">
                    <Icon className="h-6 w-6" />
                  </div>
                  {report.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm opacity-80">{report.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" asChild>
                    <a href={report.endpoint} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      View Report
                    </a>
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="justify-start bg-transparent" asChild>
              <a href="/api/collections/reconcile" target="_blank" rel="noreferrer">
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Reconciliation
              </a>
            </Button>
            <Button variant="outline" className="justify-start bg-transparent" asChild>
              <a href="/openapi.yaml" target="_blank" rel="noreferrer">
                <FileText className="mr-2 h-4 w-4" />
                API Documentation
              </a>
            </Button>
            <Button variant="outline" className="justify-start bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Export All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
