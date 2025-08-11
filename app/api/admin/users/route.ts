import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { RoleBasedAccessControl } from "@/lib/auth/rbac"
import type { UserRole } from "@/lib/types/roles"
import bcrypt from "bcryptjs"

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

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role as UserRole

    if (!RoleBasedAccessControl.hasPermission(userRole, "users", "read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role as UserRole

    if (!RoleBasedAccessControl.hasPermission(userRole, "users", "create")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { email, firstName, lastName, role, password } = body

    // Validate that user can assign this role
    if (!RoleBasedAccessControl.canManageUser(userRole, role)) {
      return NextResponse.json({ error: "Cannot assign this role" }, { status: 403 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser = {
      id: Date.now().toString(),
      email,
      firstName,
      lastName,
      role,
      status: "ACTIVE" as const,
      createdAt: new Date(),
      saccoId: (session.user as any).saccoId || null,
    }

    users.push(newUser)

    return NextResponse.json({ user: newUser })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
