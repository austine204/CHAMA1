export type UserRole = "SUPER_ADMIN" | "SACCO_ADMIN" | "LOAN_OFFICER" | "FINANCE_OFFICER" | "AUDITOR" | "MEMBER"

export interface RoleDefinition {
  name: UserRole
  level: number
  description: string
  permissions: string[]
  color: string
  icon: string
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  SUPER_ADMIN: {
    name: "SUPER_ADMIN",
    level: 100,
    description: "Full system access across all SACCOs",
    permissions: ["*"],
    color: "bg-red-100 text-red-800 border-red-200",
    icon: "👑",
  },
  SACCO_ADMIN: {
    name: "SACCO_ADMIN",
    level: 90,
    description: "Full administrative access to SACCO",
    permissions: ["members:*", "loans:*", "contributions:*", "payments:*", "reports:*", "settings:*"],
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: "🏛️",
  },
  LOAN_OFFICER: {
    name: "LOAN_OFFICER",
    level: 70,
    description: "Loan management and approval",
    permissions: ["loans:read", "loans:create", "loans:update", "loans:approve", "members:read", "reports:loans"],
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "💳",
  },
  FINANCE_OFFICER: {
    name: "FINANCE_OFFICER",
    level: 70,
    description: "Financial operations and accounting",
    permissions: ["contributions:*", "payments:*", "reports:*", "members:read", "loans:read"],
    color: "bg-green-100 text-green-800 border-green-200",
    icon: "💰",
  },
  AUDITOR: {
    name: "AUDITOR",
    level: 50,
    description: "Read-only access for auditing",
    permissions: ["members:read", "loans:read", "contributions:read", "payments:read", "reports:read", "audit:read"],
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: "🔍",
  },
  MEMBER: {
    name: "MEMBER",
    level: 10,
    description: "Personal account access only",
    permissions: ["profile:read", "profile:update", "contributions:own", "loans:own", "statements:own"],
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "👤",
  },
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  createdAt: Date
  lastLogin?: Date
  saccoId?: string
}
