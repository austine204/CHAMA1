"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileDataItem {
  id: string
  title: string
  subtitle?: string
  status?: string
  value?: string | number
  metadata?: Array<{ label: string; value: string }>
  actions?: Array<{ label: string; onClick: () => void }>
}

interface MobileDataTableProps {
  data: MobileDataItem[]
  searchPlaceholder?: string
  onItemClick?: (item: MobileDataItem) => void
  className?: string
  emptyMessage?: string
}

export function MobileDataTable({
  data,
  searchPlaceholder = "Search...",
  onItemClick,
  className,
  emptyMessage = "No items found",
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
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Data Items */}
      <div className="space-y-3">
        {filteredData.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">{emptyMessage}</p>
            </CardContent>
          </Card>
        ) : (
          filteredData.map((item) => {
            const isExpanded = expandedItems.has(item.id)
            const hasMetadata = item.metadata && item.metadata.length > 0
            const hasActions = item.actions && item.actions.length > 0

            return (
              <Card
                key={item.id}
                className="transition-all duration-200 active:scale-[0.98] cursor-pointer"
                onClick={() => onItemClick?.(item)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">{item.title}</h3>
                      {item.subtitle && <p className="text-sm text-muted-foreground mt-1 truncate">{item.subtitle}</p>}
                    </div>

                    <div className="flex items-center space-x-2 ml-3">
                      {item.status && (
                        <Badge variant="outline" className="text-xs">
                          {item.status}
                        </Badge>
                      )}
                      {item.value && <span className="font-semibold text-sm">{item.value}</span>}
                      {(hasMetadata || hasActions) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleExpanded(item.id)
                          }}
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (hasMetadata || hasActions) && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      {/* Metadata */}
                      {hasMetadata && (
                        <div className="grid grid-cols-2 gap-3">
                          {item.metadata!.map((meta, index) => (
                            <div key={index}>
                              <p className="text-xs text-muted-foreground">{meta.label}</p>
                              <p className="text-sm font-medium">{meta.value}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      {hasActions && (
                        <div className="flex flex-wrap gap-2">
                          {item.actions!.map((action, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                action.onClick()
                              }}
                              className="h-9"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
