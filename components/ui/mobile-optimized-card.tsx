"use client"

import type * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MobileOptimizedCardProps {
  title?: string
  subtitle?: string
  value?: string | number
  description?: string
  children?: React.ReactNode
  className?: string
  clickable?: boolean
  onClick?: () => void
  action?: {
    label: string
    onClick: () => void
  }
}

export function MobileOptimizedCard({
  title,
  subtitle,
  value,
  description,
  children,
  className,
  clickable = false,
  onClick,
  action,
}: MobileOptimizedCardProps) {
  const CardWrapper = clickable ? "button" : "div"

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        clickable && "cursor-pointer hover:shadow-md active:scale-[0.98] touch-manipulation",
        className,
      )}
      data-testid="mobile-card"
    >
      <CardWrapper
        onClick={onClick}
        className={cn(
          "w-full text-left",
          clickable && "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg",
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {title && <CardTitle className="text-base font-medium truncate">{title}</CardTitle>}
              {subtitle && <p className="text-sm text-muted-foreground mt-1 truncate">{subtitle}</p>}
            </div>
            {value && (
              <div className="text-right ml-2">
                <p className="text-lg font-semibold">{value}</p>
              </div>
            )}
          </div>
        </CardHeader>

        {(children || description || action) && (
          <CardContent className="pt-0">
            {children}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            {action && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  action.onClick()
                }}
                className="mt-2 w-full"
              >
                {action.label}
              </Button>
            )}
          </CardContent>
        )}
      </CardWrapper>
    </Card>
  )
}
