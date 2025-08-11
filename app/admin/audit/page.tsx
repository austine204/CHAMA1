import { AuditLogs } from "@/components/admin/audit-logs"
import { PageHeader } from "@/components/ui/page-header"

export default function AuditPage() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader title="Audit Logs" description="View system activity and security logs" />
      <AuditLogs />
    </div>
  )
}
