"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { LoadingCard } from "@/components/ui/loading-spinner"
import { Plus, Eye, Edit } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

interface Member {
  id: string
  memberNumber: string
  firstName: string
  lastName: string
  phone: string
  email?: string
  status: string
  kycVerified: boolean
  joinDate: string
}

const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "memberNumber",
    header: "Member No.",
  },
  {
    accessorKey: "firstName",
    header: "Name",
    cell: ({ row }) => {
      const member = row.original
      return (
        <div>
          <div className="font-medium">
            {member.firstName} {member.lastName}
          </div>
          <div className="text-sm text-muted-foreground">{member.email}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "kycVerified",
    header: "KYC",
    cell: ({ row }) => <StatusBadge status={row.getValue("kycVerified") ? "CONFIRMED" : "PENDING"} />,
  },
  {
    accessorKey: "joinDate",
    header: "Join Date",
    cell: ({ row }) => new Date(row.getValue("joinDate")).toLocaleDateString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const member = row.original
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/members/${member.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/members")
      .then((r) => r.json())
      .then((data) => {
        setMembers(data.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-8 p-8">
        <PageHeader title="Members" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8 animate-fade-in">
      <PageHeader
        title="Members"
        description="Manage your SACCO members and their information"
        action={{
          label: "Add Member",
          onClick: () => (window.location.href = "/members/new"),
          icon: Plus,
        }}
      />

      <DataTable columns={columns} data={members} searchKey="firstName" searchPlaceholder="Search members..." />
    </div>
  )
}
