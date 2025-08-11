"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MobileOptimizedCard } from "@/components/ui/mobile-optimized-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Search, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileDataItem {
  id: string
  title: string
  subtitle?: string
  value?: string
  status?: string
  metadata?: Array<{
    label: string
    value: string
  }>
  actions?: Array<{
    label: string
    onClick: () => void
  }>
}

interface MobileDataTableProps {
  data: MobileDataItem[]
  searchPlaceholder?: string
  onItemClick?: (item: MobileDataItem) => void
  emptyMessage?: string
  className?: string
}

export function MobileDataTable({
  data,
  searchPlaceholder = "Search...",
  onItemClick,
  emptyMessage = "No items found",
  className,
}: MobileDataTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const filteredData = data.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <div className={cn("space-y-4", className)} data-testid="mobile-data-table">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredData.length} of {data.length} items
      </div>

      {/* Data List */}
      <div className="space-y-3" data-testid="data-list">
        {filteredData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">{emptyMessage}</div>
        ) : (
          filteredData.map((item) => {
            const isExpanded = expandedItems.has(item.id)

            return (
              <MobileOptimizedCard
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                value={item.value}
                clickable={!!onItemClick}
                onClick={() => onItemClick?.(item)}
                data-testid="data-item"
              >
                <div className="space-y-3">
                  {/* Status Badge */}
                  {item.status && (
                    <div className="flex justify-start">
                      <StatusBadge status={item.status} />
                    </div>
                  )}

                  {/* Expandable Metadata */}
                  {item.metadata && item.metadata.length > 0 && (
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleExpanded(item.id)
                        }}
                        className="h-8 px-0 text-muted-foreground hover:text-foreground"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Show Details
                          </>
                        )}
                      </Button>

                      {isExpanded && (
                        <div className="mt-2 space-y-2 pl-4 border-l-2 border-muted">
                          {item.metadata.map((meta, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{meta.label}:</span>
                              <span className="font-medium">{meta.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {item.actions && item.actions.length > 0 && (
                    <div className="flex gap-2 pt-2">
                      {item.actions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            action.onClick()
                          }}
                          className="flex-1"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </MobileOptimizedCard>
            )
          })
        )}
      </div>
    </div>
  )
}
