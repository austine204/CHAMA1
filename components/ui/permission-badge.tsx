import { Badge } from "@/components/ui/badge"
import { Shield, Eye, Edit, Plus, Trash2, Settings } from "lucide-react"

interface PermissionBadgeProps {
  permission: string
  size?: "sm" | "md" | "lg"
}

const PERMISSION_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  read: { icon: Eye, color: "bg-blue-100 text-blue-800", label: "Read" },
  create: { icon: Plus, color: "bg-green-100 text-green-800", label: "Create" },
  update: { icon: Edit, color: "bg-yellow-100 text-yellow-800", label: "Update" },
  delete: { icon: Trash2, color: "bg-red-100 text-red-800", label: "Delete" },
  "*": { icon: Shield, color: "bg-purple-100 text-purple-800", label: "Full Access" },
  approve: { icon: Settings, color: "bg-orange-100 text-orange-800", label: "Approve" },
}

export function PermissionBadge({ permission, size = "sm" }: PermissionBadgeProps) {
  const [resource, action] = permission.split(":")
  const config = PERMISSION_CONFIG[action] || PERMISSION_CONFIG["read"]
  const Icon = config.icon

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  }

  return (
    <Badge className={`${config.color} ${sizeClasses[size]} font-medium`}>
      <Icon className="h-3 w-3 mr-1" />
      {resource}:{config.label}
    </Badge>
  )
}
