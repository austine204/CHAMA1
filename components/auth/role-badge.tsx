import { Badge } from "@/components/ui/badge"
import type { UserRole } from "@/lib/types/roles"
import { ROLE_DEFINITIONS } from "@/lib/types/roles"

interface RoleBadgeProps {
  role: UserRole
  showIcon?: boolean
  size?: "sm" | "md" | "lg"
}

export function RoleBadge({ role, showIcon = true, size = "md" }: RoleBadgeProps) {
  const roleDefinition = ROLE_DEFINITIONS[role]

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  }

  return (
    <Badge variant="outline" className={`${roleDefinition.color} ${sizeClasses[size]} font-medium`}>
      {showIcon && <span className="mr-1">{roleDefinition.icon}</span>}
      {role.replace("_", " ")}
    </Badge>
  )
}
