import type { UserRole } from "@/lib/types/roles"
import { ROLE_DEFINITIONS } from "@/lib/types/roles"

export class RoleBasedAccessControl {
  static hasPermission(userRole: UserRole, resource: string, action: string): boolean {
    const roleDefinition = ROLE_DEFINITIONS[userRole]

    // Super admin has all permissions
    if (roleDefinition.permissions.includes("*")) {
      return true
    }

    // Check for specific permission
    const permission = `${resource}:${action}`
    if (roleDefinition.permissions.includes(permission)) {
      return true
    }

    // Check for wildcard resource permission
    const wildcardPermission = `${resource}:*`
    if (roleDefinition.permissions.includes(wildcardPermission)) {
      return true
    }

    return false
  }

  static canAccessResource(userRole: UserRole, resource: string): boolean {
    return this.hasPermission(userRole, resource, "read")
  }

  static canModifyResource(userRole: UserRole, resource: string): boolean {
    return this.hasPermission(userRole, resource, "update") || this.hasPermission(userRole, resource, "create")
  }

  static getRoleLevel(userRole: UserRole): number {
    return ROLE_DEFINITIONS[userRole].level
  }

  static canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
    const managerLevel = this.getRoleLevel(managerRole)
    const targetLevel = this.getRoleLevel(targetRole)

    // Can only manage users with lower level
    return managerLevel > targetLevel
  }

  static getAvailableRoles(userRole: UserRole): UserRole[] {
    const userLevel = this.getRoleLevel(userRole)

    return Object.values(ROLE_DEFINITIONS)
      .filter((role) => role.level < userLevel)
      .map((role) => role.name)
  }
}
