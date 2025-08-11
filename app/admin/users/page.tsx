import { UserManagement } from "@/components/admin/user-management"
import { PageHeader } from "@/components/ui/page-header"

export default function UsersPage() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader title="User Management" description="Manage system users and their roles" />
      <UserManagement />
    </div>
  )
}
