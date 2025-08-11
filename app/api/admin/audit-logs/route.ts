import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { RoleBasedAccessControl } from "@/lib/auth/rbac"
import type { UserRole } from "@/lib/types/roles"

// Mock audit logs data
const mockAuditLogs = [
  {
    id: "audit_1",
    userId: "user_1",
    userEmail: "admin@sacco.local",
    action: "LOGIN",
    resource: "AUTH",
    details: "User logged in successfully",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    severity: "LOW" as const,
  },
  {
    id: "audit_2",
    userId: "user_2",
    userEmail: "loan.officer@sacco.local",
    action: "APPROVE_LOAN",
    resource: "LOANS",
    details: "Approved loan application LN-2024-001 for KES 50,000",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    severity: "MEDIUM" as const,
  },
  {
    id: "audit_3",
    userId: "user_3",
    userEmail: "finance@sacco.local",
    action: "DISBURSE_LOAN",
    resource: "PAYMENTS",
    details: "Disbursed loan LN-2024-001 amount KES 50,000 to member M-001",
    ipAddress: "192.168.1.102",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
    severity: "HIGH" as const,
  },
  {
    id: "audit_4",
    userId: "user_1",
    userEmail: "admin@sacco.local",
    action: "CREATE_USER",
    resource: "USERS",
    details: "Created new user account for newuser@sacco.local with role MEMBER",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    severity: "MEDIUM" as const,
  },
  {
    id: "audit_5",
    userId: "unknown",
    userEmail: "unknown@suspicious.com",
    action: "FAILED_LOGIN",
    resource: "AUTH",
    details: "Multiple failed login attempts detected from suspicious IP",
    ipAddress: "203.0.113.42",
    userAgent: "curl/7.68.0",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    severity: "CRITICAL" as const,
  },
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role as UserRole

    if (!RoleBasedAccessControl.hasPermission(userRole, "audit", "read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // In a real app, this would query the database
    // For now, return mock data sorted by timestamp (newest first)
    const sortedLogs = mockAuditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json(sortedLogs)
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
