"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PermissionBadge } from "@/components/ui/permission-badge"
import { type UserRole, ROLE_DEFINITIONS } from "@/lib/types/roles"
import { RoleBadge } from "@/components/auth/role-badge"

export function RolePermissionsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Role Permissions Overview</h2>
        <p className="text-muted-foreground">View all system roles and their associated permissions</p>
      </div>

      <div className="grid gap-6">
        {Object.entries(ROLE_DEFINITIONS).map(([role, definition]) => (
          <Card key={role}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <RoleBadge role={role as UserRole} />
                  <div>
                    <div className="text-lg">{definition.displayName}</div>
                    <div className="text-sm text-muted-foreground font-normal">{definition.description}</div>
                  </div>
                </CardTitle>
                <Badge variant="secondary">Level {definition.level}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <h4 className="font-medium mb-3">Permissions:</h4>
                <div className="flex flex-wrap gap-2">
                  {definition.permissions.map((permission, index) => (
                    <PermissionBadge key={index} permission={permission} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
