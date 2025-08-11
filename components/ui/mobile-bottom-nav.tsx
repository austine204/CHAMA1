"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Users, CreditCard, DollarSign, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Members", href: "/members", icon: Users },
  { name: "Loans", href: "/loans", icon: CreditCard },
  { name: "Payments", href: "/payments", icon: DollarSign },
  { name: "Reports", href: "/reports", icon: FileText },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  if (pathname === "/login") return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t md:hidden safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 text-xs font-medium transition-colors touch-manipulation",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className={cn("truncate", isActive && "text-primary")}>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
