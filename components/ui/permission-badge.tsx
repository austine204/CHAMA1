"use client"

import { Badge } from "@/components/ui/badge"
import { Shield, Eye, Edit, Trash2, Plus } from "lucide-react"

interface PermissionBadgeProps {
  permission: string
  variant?: "default" | "secondary" | "destructive" | "outline"
}

export function PermissionBadge({ permission, variant = "outline" }: PermissionBadgeProps) {
  const getPermissionIcon = (perm: string) => {
    if (perm.includes("read")) return <Eye className="h-3 w-3" />
    if (perm.includes("create")) return <Plus className="h-3 w-3" />
    if (perm.includes("update")) return <Edit className="h-3 w-3" />
    if (perm.includes("delete")) return <Trash2 className="h-3 w-3" />
    if (perm === "*") return <Shield className="h-3 w-3" />
    return <Shield className="h-3 w-3" />
  }

  const getPermissionColor = (perm: string) => {
    if (perm === "*") return "bg-red-100 text-red-800 border-red-200"
    if (perm.includes("delete")) return "bg-red-50 text-red-700 border-red-200"
    if (perm.includes("create") || perm.includes("update")) return "bg-orange-50 text-orange-700 border-orange-200"
    return "bg-blue-50 text-blue-700 border-blue-200"
  }

  return (
    <Badge
      variant={variant}
      className={`flex items-center gap-1 ${variant === "outline" ? getPermissionColor(permission) : ""}`}
    >
      {getPermissionIcon(permission)}
      <span className="text-xs">{permission}</span>
    </Badge>
  )
}
