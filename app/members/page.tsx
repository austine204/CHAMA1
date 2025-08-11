"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { MobileDataTable } from "@/components/ui/mobile-data-table"
import { LoadingCard } from "@/components/ui/loading-spinner"
import { Plus } from "lucide-react"

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
      <div className="space-y-6 p-4 md:p-8">
        <PageHeader title="Members" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  // Transform members data for mobile table
  const mobileData = members.map((member) => ({
    id: member.id,
    title: `${member.firstName} ${member.lastName}`,
    subtitle: member.email || member.phone,
    status: member.status,
    value: member.memberNumber,
    metadata: [
      { label: "Phone", value: member.phone },
      { label: "KYC Status", value: member.kycVerified ? "Verified" : "Pending" },
      { label: "Join Date", value: new Date(member.joinDate).toLocaleDateString() },
      { label: "Status", value: member.status },
    ],
    actions: [
      {
        label: "View Profile",
        onClick: () => (window.location.href = `/members/${member.id}`),
      },
      {
        label: "Edit",
        onClick: () => console.log("Edit member", member.id),
      },
    ],
  }))

  return (
    <div className="space-y-6 p-4 md:p-8 animate-fade-in">
      <PageHeader
        title="Members"
        description={`${members.length} total members`}
        action={{
          label: "Add Member",
          onClick: () => (window.location.href = "/members/new"),
          icon: Plus,
        }}
      />

      <MobileDataTable
        data={mobileData}
        searchPlaceholder="Search members..."
        onItemClick={(item) => (window.location.href = `/members/${item.id}`)}
        emptyMessage="No members found"
      />
    </div>
  )
}
