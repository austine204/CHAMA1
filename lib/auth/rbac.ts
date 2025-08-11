import { type UserRole, ROLE_DEFINITIONS, ROLE_HIERARCHY } from "@/lib/types/roles"

export class RoleBasedAccessControl {
  static hasPermission(userRole: UserRole, resource: string, action: string): boolean {
    const roleDefinition = ROLE_DEFINITIONS[userRole]

    if (!roleDefinition) return false

    // Super admin has all permissions
    if (roleDefinition.permissions.includes("*")) return true

    // Check for specific permission
    const specificPermission = `${resource}:${action}`
    if (roleDefinition.permissions.includes(specificPermission)) return true

    // Check for wildcard resource permission
    const wildcardPermission = `${resource}:*`
    if (roleDefinition.permissions.includes(wildcardPermission)) return true

    return false
  }

  static canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
    const managerLevel = ROLE_DEFINITIONS[managerRole]?.level || 0
    const targetLevel = ROLE_DEFINITIONS[targetRole]?.level || 0

    return managerLevel > targetLevel
  }

  static getAvailableRoles(userRole: UserRole): UserRole[] {
    const userLevel = ROLE_DEFINITIONS[userRole]?.level || 0

    return ROLE_HIERARCHY.filter((role) => {
      const roleLevel = ROLE_DEFINITIONS[role]?.level || 0
      return roleLevel < userLevel
    })
  }

  static isHigherRole(role1: UserRole, role2: UserRole): boolean {
    const level1 = ROLE_DEFINITIONS[role1]?.level || 0
    const level2 = ROLE_DEFINITIONS[role2]?.level || 0

    return level1 > level2
  }

  static getPermissions(userRole: UserRole): string[] {
    return ROLE_DEFINITIONS[userRole]?.permissions || []
  }
}
