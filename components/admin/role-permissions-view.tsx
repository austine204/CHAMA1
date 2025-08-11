"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleBadge } from "@/components/auth/role-badge"
import { PermissionBadge } from "@/components/ui/permission-badge"
import { ROLE_DEFINITIONS } from "@/lib/types/roles"
import { Shield, Users, Lock } from "lucide-react"

export function RolePermissionsView() {
  const roles = Object.values(ROLE_DEFINITIONS).sort((a, b) => b.level - a.level)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Hierarchy & Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {roles.map((role) => (
              <div key={role.name} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RoleBadge role={role.name} size="lg" />
                    <div>
                      <p className="font-medium">{role.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Level {role.level} • {role.permissions.length} permissions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Active Users: 0</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Permissions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((permission, index) => (
                      <PermissionBadge key={index} permission={permission} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
