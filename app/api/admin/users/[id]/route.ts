import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { RoleBasedAccessControl } from "@/lib/auth/rbac"
import type { UserRole } from "@/lib/types/roles"

// Mock users database - replace with real database
const users = [
  {
    id: "1",
    email: "admin@sacco.local",
    firstName: "System",
    lastName: "Administrator",
    role: "SUPER_ADMIN" as UserRole,
    status: "ACTIVE" as const,
    createdAt: new Date(),
    lastLogin: new Date(),
    saccoId: null,
  },
]

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role as UserRole

    if (!RoleBasedAccessControl.hasPermission(userRole, "users", "update")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { firstName, lastName, role, status } = body

    const userIndex = users.findIndex((u) => u.id === params.id)
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const targetUser = users[userIndex]

    // Validate that user can manage this target user
    if (!RoleBasedAccessControl.canManageUser(userRole, targetUser.role)) {
      return NextResponse.json({ error: "Cannot manage this user" }, { status: 403 })
    }

    // Validate that user can assign the new role
    if (role && !RoleBasedAccessControl.canManageUser(userRole, role)) {
      return NextResponse.json({ error: "Cannot assign this role" }, { status: 403 })
    }

    // Update user
    users[userIndex] = {
      ...targetUser,
      firstName: firstName || targetUser.firstName,
      lastName: lastName || targetUser.lastName,
      role: role || targetUser.role,
      status: status || targetUser.status,
    }

    return NextResponse.json({ user: users[userIndex] })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role as UserRole

    if (!RoleBasedAccessControl.hasPermission(userRole, "users", "delete")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const userIndex = users.findIndex((u) => u.id === params.id)
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const targetUser = users[userIndex]

    // Validate that user can manage this target user
    if (!RoleBasedAccessControl.canManageUser(userRole, targetUser.role)) {
      return NextResponse.json({ error: "Cannot delete this user" }, { status: 403 })
    }

    users.splice(userIndex, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
