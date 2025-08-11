import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
      case "APPROVED":
      case "DISBURSED":
      case "CONFIRMED":
      case "COMPLETED":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "PENDING":
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "REJECTED":
      case "FAILED":
      case "CANCELLED":
      case "IN_ARREARS":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "INACTIVE":
      case "SUSPENDED":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
      case "CLOSED":
      case "MATURED":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <Badge className={cn(getStatusColor(status), className)} data-testid="status-badge">
      {status.replace("_", " ")}
    </Badge>
  )
}
