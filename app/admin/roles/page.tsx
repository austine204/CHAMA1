import { RolePermissionsView } from "@/components/admin/role-permissions-view"
import { PageHeader } from "@/components/ui/page-header"

export default function RolesPage() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader title="Role Management" description="View and understand system roles and permissions" />
      <RolePermissionsView />
    </div>
  )
}
