import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { RoleBasedAccessControl } from "@/lib/auth/rbac"
import type { UserRole } from "@/lib/types/roles"
import { db } from "@/lib/db/memory"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role as UserRole

    if (!RoleBasedAccessControl.hasPermission(userRole, "users", "update")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = params
    const updates = await request.json()

    const userIndex = db.users.findIndex((u) => u.id === id)
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const targetUser = db.users[userIndex]

    // If updating role, check permissions
    if (updates.role && updates.role !== targetUser.role) {
      if (!RoleBasedAccessControl.canManageRole(userRole, updates.role)) {
        return NextResponse.json({ error: "Cannot assign this role" }, { status: 403 })
      }
    }

    // Update user
    db.users[userIndex] = {
      ...targetUser,
      ...updates,
      updatedAt: new Date(),
    }

    // Return updated user without password
    const { password: _, ...userResponse } = db.users[userIndex]
    return NextResponse.json(userResponse)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role as UserRole

    if (!RoleBasedAccessControl.hasPermission(userRole, "users", "delete")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = params

    const userIndex = db.users.findIndex((u) => u.id === id)
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const targetUser = db.users[userIndex]

    // Check if can delete this user's role
    if (!RoleBasedAccessControl.canManageRole(userRole, targetUser.role)) {
      return NextResponse.json({ error: "Cannot delete this user" }, { status: 403 })
    }

    // Remove user
    db.users.splice(userIndex, 1)

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
