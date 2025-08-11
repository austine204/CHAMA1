"use client"

import type React from "react"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface SwipeAction {
  label: string
  onClick: () => void
  color: "red" | "green" | "blue" | "yellow"
  icon?: React.ReactNode
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
  const [startX, setStartX] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const maxSwipeDistance = 120

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return

    const currentX = e.touches[0].clientX
    const deltaX = currentX - startX

    // Limit swipe distance
    const newTranslateX = Math.max(-maxSwipeDistance, Math.min(maxSwipeDistance, deltaX))
    setTranslateX(newTranslateX)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)

    // Snap to position based on swipe distance
    if (Math.abs(translateX) > 60) {
      if (translateX > 0 && leftActions.length > 0) {
        setTranslateX(maxSwipeDistance)
      } else if (translateX < 0 && rightActions.length > 0) {
        setTranslateX(-maxSwipeDistance)
      } else {
        setTranslateX(0)
      }
    } else {
      setTranslateX(0)
    }
  }

  const handleActionClick = (action: SwipeAction) => {
    action.onClick()
    setTranslateX(0)
  }

  const getActionColor = (color: string) => {
    switch (color) {
      case "red":
        return "bg-red-500 text-white"
      case "green":
        return "bg-green-500 text-white"
      case "blue":
        return "bg-blue-500 text-white"
      case "yellow":
        return "bg-yellow-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <div className="absolute left-0 top-0 h-full flex">
          {leftActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              className={cn(
                "flex items-center justify-center px-4 text-sm font-medium transition-all",
                getActionColor(action.color),
                translateX > 0 ? "opacity-100" : "opacity-0",
              )}
              style={{
                width: maxSwipeDistance / leftActions.length,
                transform: `translateX(${Math.min(0, translateX - maxSwipeDistance)}px)`,
              }}
            >
              {action.icon && <span className="mr-1">{action.icon}</span>}
              {action.label}
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
              className={cn(
                "flex items-center justify-center px-4 text-sm font-medium transition-all",
                getActionColor(action.color),
                translateX < 0 ? "opacity-100" : "opacity-0",
              )}
              style={{
                width: maxSwipeDistance / rightActions.length,
                transform: `translateX(${Math.max(0, translateX + maxSwipeDistance)}px)`,
              }}
            >
              {action.icon && <span className="mr-1">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div
        className="transition-transform duration-200 ease-out touch-manipulation"
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
