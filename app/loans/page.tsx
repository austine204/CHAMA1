"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { LoadingCard } from "@/components/ui/loading-spinner"
import { Plus, Eye } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

interface Loan {
  id: string
  memberId: string
  principal: number
  interestRate: number
  termMonths: number
  status: string
  disbursedAt?: string
  principalOutstanding: number
  createdAt: string
}

const columns: ColumnDef<Loan>[] = [
  {
    accessorKey: "id",
    header: "Loan ID",
    cell: ({ row }) => <div className="font-mono text-sm">{row.getValue<string>("id").slice(0, 8)}</div>,
  },
  {
    accessorKey: "memberId",
    header: "Member",
    cell: ({ row }) => <div className="font-mono text-sm">{row.getValue<string>("memberId").slice(0, 8)}</div>,
  },
  {
    accessorKey: "principal",
    header: "Principal",
    cell: ({ row }) => <div className="font-medium">KES {row.getValue<number>("principal").toLocaleString()}</div>,
  },
  {
    accessorKey: "interestRate",
    header: "Rate",
    cell: ({ row }) => `${row.getValue("interestRate")}%`,
  },
  {
    accessorKey: "termMonths",
    header: "Term",
    cell: ({ row }) => `${row.getValue("termMonths")} months`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "principalOutstanding",
    header: "Outstanding",
    cell: ({ row }) => (
      <div className="font-medium text-red-600">
        KES {row.getValue<number>("principalOutstanding").toLocaleString()}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const loan = row.original
      return (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/loans/${loan.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      )
    },
  },
]

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/loans")
      .then((r) => r.json())
      .then((data) => {
        setLoans(data.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-8 p-8">
        <PageHeader title="Loans" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  const totalPortfolio = loans.reduce((sum, loan) => sum + loan.principal, 0)
  const totalOutstanding = loans.reduce((sum, loan) => sum + loan.principalOutstanding, 0)

  return (
    <div className="space-y-8 p-8 animate-fade-in">
      <PageHeader
        title="Loan Portfolio"
        description={`Total: KES ${totalPortfolio.toLocaleString()} • Outstanding: KES ${totalOutstanding.toLocaleString()}`}
        action={{
          label: "New Application",
          onClick: () => (window.location.href = "/loans/new"),
          icon: Plus,
        }}
      />

      <DataTable columns={columns} data={loans} searchKey="id" searchPlaceholder="Search loans..." />
    </div>
  )
}
