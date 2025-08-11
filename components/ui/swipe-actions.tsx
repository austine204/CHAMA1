"use client"

import type * as React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SwipeAction {
  label: string
  icon?: React.ReactNode
  color: "red" | "green" | "blue" | "yellow"
  onClick: () => void
}

interface SwipeActionsProps {
  children: React.ReactNode
  leftActions?: SwipeAction[]
  rightActions?: SwipeAction[]
  className?: string
}

export function SwipeActions({ children, leftActions = [], rightActions = [], className }: SwipeActionsProps) {
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const currentX = useRef(0)

  const actionColors = {
    red: "bg-red-500 text-white",
    green: "bg-green-500 text-white",
    blue: "bg-blue-500 text-white",
    yellow: "bg-yellow-500 text-white",
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    startX.current = e.touches[0].clientX
    currentX.current = translateX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return

    const deltaX = e.touches[0].clientX - startX.current
    const newTranslateX = currentX.current + deltaX

    // Limit swipe distance
    const maxSwipe = 120
    const clampedX = Math.max(-maxSwipe, Math.min(maxSwipe, newTranslateX))

    setTranslateX(clampedX)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)

    // Snap to position based on swipe distance
    const threshold = 60

    if (translateX > threshold && leftActions.length > 0) {
      setTranslateX(120) // Show left actions
    } else if (translateX < -threshold && rightActions.length > 0) {
      setTranslateX(-120) // Show right actions
    } else {
      setTranslateX(0) // Reset to center
    }
  }

  const handleActionClick = (action: SwipeAction) => {
    action.onClick()
    setTranslateX(0) // Reset position after action
  }

  // Reset on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setTranslateX(0)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden touch-pan-y", className)}
      data-testid="swipe-actions"
    >
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <div className="absolute left-0 top-0 h-full flex">
          {leftActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              className={cn("flex items-center justify-center w-20 h-full transition-all", actionColors[action.color])}
              style={{
                transform: `translateX(${Math.min(0, translateX - 120)}px)`,
              }}
            >
              <div className="flex flex-col items-center space-y-1">
                {action.icon}
                <span className="text-xs font-medium">{action.label}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <div className="absolute right-0 top-0 h-full flex">
          {rightActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              className={cn("flex items-center justify-center w-20 h-full transition-all", actionColors[action.color])}
              style={{
                transform: `translateX(${Math.max(0, translateX + 120)}px)`,
              }}
            >
              <div className="flex flex-col items-center space-y-1">
                {action.icon}
                <span className="text-xs font-medium">{action.label}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div
        className="relative z-10 bg-background transition-transform duration-200 ease-out touch-manipulation"
        style={{
          transform: `translateX(${translateX}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}
