"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RoleBadge } from "@/components/auth/role-badge"
import type { UserRole } from "@/lib/types/roles"
import { ROLE_DEFINITIONS } from "@/lib/types/roles"

interface RoleSelectorProps {
  value: UserRole
  onChange: (role: UserRole) => void
  availableRoles?: UserRole[]
  disabled?: boolean
}

export function RoleSelector({
  value,
  onChange,
  availableRoles = Object.keys(ROLE_DEFINITIONS) as UserRole[],
  disabled = false,
}: RoleSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue>
          <RoleBadge role={value} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {availableRoles.map((role) => (
          <SelectItem key={role} value={role}>
            <div className="flex items-center justify-between w-full">
              <RoleBadge role={role} />
              <span className="text-xs text-muted-foreground ml-2">Level {ROLE_DEFINITIONS[role].level}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
