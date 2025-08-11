export type UserRole = "SUPER_ADMIN" | "SACCO_ADMIN" | "LOAN_OFFICER" | "FINANCE_OFFICER" | "AUDITOR" | "MEMBER"

export interface RoleDefinition {
  displayName: string
  description: string
  level: number
  permissions: string[]
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  SUPER_ADMIN: {
    displayName: "Super Administrator",
    description: "Full system access across all SACCOs",
    level: 100,
    permissions: ["*"],
  },
  SACCO_ADMIN: {
    displayName: "SACCO Administrator",
    description: "Full administrative access to SACCO operations",
    level: 90,
    permissions: [
      "members:*",
      "loans:*",
      "contributions:*",
      "payments:*",
      "reports:*",
      "settings:*",
      "users:create",
      "users:read",
      "users:update",
    ],
  },
  LOAN_OFFICER: {
    displayName: "Loan Officer",
    description: "Manage loan applications and disbursements",
    level: 70,
    permissions: ["loans:*", "members:read", "reports:loans", "payments:read"],
  },
  FINANCE_OFFICER: {
    displayName: "Finance Officer",
    description: "Manage financial operations and accounting",
    level: 70,
    permissions: ["contributions:*", "payments:*", "reports:*", "accounting:*", "members:read", "loans:read"],
  },
  AUDITOR: {
    displayName: "Auditor",
    description: "Read-only access for auditing purposes",
    level: 50,
    permissions: ["members:read", "loans:read", "contributions:read", "payments:read", "reports:read", "audit:read"],
  },
  MEMBER: {
    displayName: "Member",
    description: "Basic member access to personal account",
    level: 10,
    permissions: ["profile:read", "profile:update", "contributions:read:own", "loans:read:own", "loans:apply"],
  },
}

export const ROLE_HIERARCHY: UserRole[] = [
  "SUPER_ADMIN",
  "SACCO_ADMIN",
  "LOAN_OFFICER",
  "FINANCE_OFFICER",
  "AUDITOR",
  "MEMBER",
]
