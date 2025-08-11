import { notFound } from "next/navigation"
import { repo } from "@/lib/db/memory"
import { auth } from "@/lib/auth"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import ContributionForm from "./record-contribution"
import { User, Phone, Mail, MapPin, Calendar, CreditCard, DollarSign } from "lucide-react"

export default async function MemberProfile({ params }: { params: { id: string } }) {
  await auth()
  const member = await repo.member.get(params.id)
  if (!member) return notFound()

  const contributions = await repo.contribution.listForMember(member.id)
  const loans = (await import("@/lib/db/memory")).db.loans.filter((l) => l.memberId === member.id)

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0)
  const totalLoans = loans.reduce((sum, l) => sum + l.principal, 0)
  const activeLoans = loans.filter((l) => l.status === "DISBURSED").length

  return (
    <div className="space-y-8 p-8 animate-fade-in">
      <PageHeader
        title={`${member.firstName} ${member.lastName}`}
        description={`Member ${member.memberNumber} • Joined ${member.joinDate.toLocaleDateString()}`}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Member Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Member Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <StatusBadge status={member.status} />
                {member.kycVerified && <Badge variant="outline">KYC Verified</Badge>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {member.phone}
                </div>
                {member.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {member.email}
                  </div>
                )}
                {member.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {member.address}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Joined {member.joinDate.toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 rounded-lg bg-emerald-50">
                <DollarSign className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-emerald-700">KES {totalContributions.toLocaleString()}</div>
                <p className="text-sm text-emerald-600">Total Contributions</p>
              </div>

              <div className="text-center p-4 rounded-lg bg-blue-50">
                <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700">KES {totalLoans.toLocaleString()}</div>
                <p className="text-sm text-blue-600">Total Loans</p>
              </div>

              <div className="text-center p-4 rounded-lg bg-purple-50">
                <CreditCard className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-700">{activeLoans}</div>
                <p className="text-sm text-purple-600">Active Loans</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contributions */}
        <Card>
          <CardHeader>
            <CardTitle>Contributions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-64 overflow-y-auto space-y-3">
              {contributions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No contributions yet</p>
              ) : (
                contributions.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">KES {c.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {c.type} • {c.source} • {c.date.toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                ))
              )}
            </div>

            <Separator />
            <ContributionForm memberId={member.id} />
          </CardContent>
        </Card>

        {/* Loans */}
        <Card>
          <CardHeader>
            <CardTitle>Loans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-64 overflow-y-auto space-y-3">
              {loans.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No loans yet</p>
              ) : (
                loans.map((l) => (
                  <div key={l.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">KES {l.principal.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {l.interestRate}% • {l.termMonths} months
                      </p>
                    </div>
                    <StatusBadge status={l.status} />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
