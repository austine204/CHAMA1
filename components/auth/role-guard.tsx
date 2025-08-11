"use client"

import { useSession } from "next-auth/react"
import type { UserRole } from "@/lib/types/roles"
import { RoleBasedAccessControl } from "@/lib/auth/rbac"
import type { ReactNode } from "react"

interface RoleGuardProps {
  children: ReactNode
  allowedRoles?: UserRole[]
  requiredPermission?: {
    resource: string
    action: string
  }
  fallback?: ReactNode
}

export function RoleGuard({ children, allowedRoles, requiredPermission, fallback = null }: RoleGuardProps) {
  const { data: session } = useSession()

  if (!session?.user) {
    return <>{fallback}</>
  }

  const userRole = (session.user as any).role as UserRole

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <>{fallback}</>
  }

  // Check permission-based access
  if (requiredPermission) {
    const hasPermission = RoleBasedAccessControl.hasPermission(
      userRole,
      requiredPermission.resource,
      requiredPermission.action,
    )

    if (!hasPermission) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}
