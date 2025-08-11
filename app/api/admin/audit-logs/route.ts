import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { RoleBasedAccessControl } from "@/lib/auth/rbac"
import type { UserRole } from "@/lib/types/roles"

// Mock audit logs - replace with real database
const auditLogs = [
  {
    id: "1",
    userId: "1",
    userEmail: "admin@sacco.local",
    action: "USER_LOGIN",
    resource: "auth",
    severity: "LOW" as const,
    details: { loginMethod: "credentials" },
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0...",
    timestamp: new Date(),
  },
  {
    id: "2",
    userId: "1",
    userEmail: "admin@sacco.local",
    action: "MEMBER_CREATED",
    resource: "members",
    resourceId: "member-123",
    severity: "MEDIUM" as const,
    details: { memberNumber: "M001", firstName: "John", lastName: "Doe" },
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0...",
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: "3",
    userId: "1",
    userEmail: "admin@sacco.local",
    action: "LOAN_APPROVED",
    resource: "loans",
    resourceId: "loan-456",
    severity: "HIGH" as const,
    details: { loanAmount: 50000, memberId: "member-123" },
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0...",
    timestamp: new Date(Date.now() - 7200000),
  },
]

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role as UserRole

    if (!RoleBasedAccessControl.hasPermission(userRole, "audit", "read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Sort by timestamp descending
    const sortedLogs = auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({ logs: sortedLogs })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
