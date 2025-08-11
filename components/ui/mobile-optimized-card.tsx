"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronRight, MoreVertical } from "lucide-react"
import { useState } from "react"

interface MobileOptimizedCardProps {
  title: string
  subtitle?: string
  value?: string | number
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  menu?: Array<{
    label: string
    onClick: () => void
  }>
  className?: string
  children?: React.ReactNode
  clickable?: boolean
  onClick?: () => void
}

export function MobileOptimizedCard({
  title,
  subtitle,
  value,
  description,
  action,
  menu,
  className,
  children,
  clickable = false,
  onClick,
}: MobileOptimizedCardProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleTouchStart = () => setIsPressed(true)
  const handleTouchEnd = () => setIsPressed(false)

  return (
    <Card
      className={cn(
        "transition-all duration-200 active:scale-[0.98]",
        clickable && "cursor-pointer hover:shadow-md",
        isPressed && "shadow-lg scale-[0.98]",
        className,
      )}
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold truncate">{title}</CardTitle>
            {subtitle && <p className="text-sm text-muted-foreground mt-1 truncate">{subtitle}</p>}
          </div>
          <div className="flex items-center space-x-2 ml-2">
            {menu && (
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            )}
            {clickable && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {value && (
          <div className="mb-3">
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}

        {children}

        {action && (
          <div className="mt-4">
            <Button onClick={action.onClick} className="w-full h-11 text-base font-medium">
              {action.label}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
