import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { RoleBasedAccessControl } from "@/lib/auth/rbac"
import type { UserRole } from "@/lib/types/roles"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db/memory"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role as UserRole

    if (!RoleBasedAccessControl.hasPermission(userRole, "users", "read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const users = db.users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      memberId: user.memberId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }))

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role as UserRole

    if (!RoleBasedAccessControl.hasPermission(userRole, "users", "create")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { email, role, password } = await request.json()

    // Validate that user can assign this role
    if (!RoleBasedAccessControl.canManageRole(userRole, role)) {
      return NextResponse.json({ error: "Cannot assign this role" }, { status: 403 })
    }

    // Check if user already exists
    const existingUser = db.users.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      role: role as UserRole,
      password: hashedPassword,
      memberId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    db.users.push(newUser)

    // Return user without password
    const { password: _, ...userResponse } = newUser
    return NextResponse.json(userResponse, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
