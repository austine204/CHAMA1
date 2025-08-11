"use client"

import { Badge } from "@/components/ui/badge"
import { type UserRole, ROLE_DEFINITIONS } from "@/lib/types/roles"

interface RoleBadgeProps {
  role: UserRole
  variant?: "default" | "secondary" | "destructive" | "outline"
}

const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN: "bg-red-500 text-white",
  SACCO_ADMIN: "bg-purple-500 text-white",
  LOAN_OFFICER: "bg-blue-500 text-white",
  FINANCE_OFFICER: "bg-green-500 text-white",
  AUDITOR: "bg-orange-500 text-white",
  MEMBER: "bg-gray-500 text-white",
}

export function RoleBadge({ role, variant = "default" }: RoleBadgeProps) {
  const roleDefinition = ROLE_DEFINITIONS[role]

  if (!roleDefinition) {
    return <Badge variant="outline">Unknown Role</Badge>
  }

  return (
    <Badge
      variant={variant}
      className={variant === "default" ? ROLE_COLORS[role] : ""}
      title={roleDefinition.description}
    >
      {roleDefinition.displayName}
    </Badge>
  )
}
