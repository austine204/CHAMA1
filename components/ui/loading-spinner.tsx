import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        className,
      )}
      data-testid="loading-spinner"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export function LoadingCard({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)} data-testid="loading-card">
      <div className="rounded-lg border bg-card p-6 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
        <div className="h-3 bg-muted rounded w-2/3"></div>
      </div>
    </div>
  )
}
