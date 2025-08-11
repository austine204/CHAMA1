import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  variant?: "default" | "secondary" | "destructive" | "outline"
}

const statusConfig = {
  ACTIVE: { variant: "default" as const, className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" },
  INACTIVE: { variant: "secondary" as const, className: "bg-gray-100 text-gray-800" },
  SUSPENDED: { variant: "destructive" as const, className: "bg-red-100 text-red-800 hover:bg-red-100" },
  PENDING: { variant: "outline" as const, className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  APPROVED: { variant: "default" as const, className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  DISBURSED: { variant: "default" as const, className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" },
  CLOSED: { variant: "secondary" as const, className: "bg-gray-100 text-gray-800" },
  IN_ARREARS: { variant: "destructive" as const, className: "bg-red-100 text-red-800 hover:bg-red-100" },
  CONFIRMED: { variant: "default" as const, className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" },
  SUCCESS: { variant: "default" as const, className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" },
  FAILED: { variant: "destructive" as const, className: "bg-red-100 text-red-800 hover:bg-red-100" },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING

  return (
    <Badge variant={config.variant} className={cn("font-medium", config.className)}>
      {status.replace(/_/g, " ")}
    </Badge>
  )
}
