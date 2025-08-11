"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/lib/types/roles"
import { RoleBasedAccessControl } from "@/lib/auth/rbac"
import { Home, Users, CreditCard, DollarSign, FileText, Settings, TrendingUp, Shield, UserCheck } from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  requiredPermission?: {
    resource: string
    action: string
  }
  allowedRoles?: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Home,
  },
  {
    href: "/members",
    label: "Members",
    icon: Users,
    requiredPermission: { resource: "members", action: "read" },
  },
  {
    href: "/loans",
    label: "Loans",
    icon: CreditCard,
    requiredPermission: { resource: "loans", action: "read" },
  },
  {
    href: "/contributions",
    label: "Contributions",
    icon: DollarSign,
    requiredPermission: { resource: "contributions", action: "read" },
  },
  {
    href: "/payments",
    label: "Payments",
    icon: TrendingUp,
    requiredPermission: { resource: "payments", action: "read" },
  },
  {
    href: "/reports",
    label: "Reports",
    icon: FileText,
    requiredPermission: { resource: "reports", action: "read" },
  },
  {
    href: "/investments",
    label: "Investments",
    icon: TrendingUp,
    allowedRoles: ["SUPER_ADMIN", "SACCO_ADMIN", "FINANCE_OFFICER"],
  },
  {
    href: "/admin/users",
    label: "User Management",
    icon: UserCheck,
    allowedRoles: ["SUPER_ADMIN", "SACCO_ADMIN"],
  },
  {
    href: "/admin/audit",
    label: "Audit Logs",
    icon: Shield,
    requiredPermission: { resource: "audit", action: "read" },
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
]

export function RoleBasedNavigation() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session?.user) return null

  const userRole = (session.user as any).role as UserRole

  const visibleItems = NAV_ITEMS.filter((item) => {
    // Check role-based access
    if (item.allowedRoles && !item.allowedRoles.includes(userRole)) {
      return false
    }

    // Check permission-based access
    if (item.requiredPermission) {
      return RoleBasedAccessControl.hasPermission(
        userRole,
        item.requiredPermission.resource,
        item.requiredPermission.action,
      )
    }

    return true
  })

  return (
    <nav className="space-y-2">
      {visibleItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
