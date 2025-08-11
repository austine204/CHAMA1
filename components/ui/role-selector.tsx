"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type UserRole, ROLE_DEFINITIONS } from "@/lib/types/roles"
import { RoleBasedAccessControl } from "@/lib/auth/rbac"
import { useSession } from "next-auth/react"

interface RoleSelectorProps {
  value?: UserRole
  onValueChange: (role: UserRole) => void
  disabled?: boolean
}

export function RoleSelector({ value, onValueChange, disabled }: RoleSelectorProps) {
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role as UserRole

  const availableRoles = userRole ? RoleBasedAccessControl.getAvailableRoles(userRole) : []

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        {availableRoles.map((role) => (
          <SelectItem key={role} value={role}>
            <div className="flex flex-col">
              <span className="font-medium">{ROLE_DEFINITIONS[role].displayName}</span>
              <span className="text-xs text-muted-foreground">{ROLE_DEFINITIONS[role].description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
