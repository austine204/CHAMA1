"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { RoleGuard } from "@/components/auth/role-guard"
import { Search, Filter, AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react"

interface AuditLog {
  id: string
  userId: string
  userEmail: string
  action: string
  resource: string
  resourceId?: string
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  timestamp: Date
}

const SEVERITY_CONFIG = {
  LOW: { color: "bg-gray-100 text-gray-800", icon: Info },
  MEDIUM: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  HIGH: { color: "bg-orange-100 text-orange-800", icon: AlertTriangle },
  CRITICAL: { color: "bg-red-100 text-red-800", icon: XCircle },
}

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("ALL")
  const [actionFilter, setActionFilter] = useState<string>("ALL")

  useEffect(() => {
    loadAuditLogs()
  }, [])

  async function loadAuditLogs() {
    try {
      const response = await fetch("/api/admin/audit-logs")
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error("Failed to load audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSeverity = severityFilter === "ALL" || log.severity === severityFilter
    const matchesAction = actionFilter === "ALL" || log.action === actionFilter

    return matchesSearch && matchesSeverity && matchesAction
  })

  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)))

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <RoleGuard requiredPermission={{ resource: "audit", action: "read" }}>
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Severity</label>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Severities</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Action</label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Actions</SelectItem>
                    {uniqueActions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Logs ({filteredLogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No audit logs found</p>
              ) : (
                filteredLogs.map((log) => {
                  const severityConfig = SEVERITY_CONFIG[log.severity]
                  const SeverityIcon = severityConfig.icon

                  return (
                    <div key={log.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={severityConfig.color}>
                            <SeverityIcon className="h-3 w-3 mr-1" />
                            {log.severity}
                          </Badge>
                          <div>
                            <p className="font-medium">{log.action}</p>
                            <p className="text-sm text-muted-foreground">
                              {log.userEmail} • {log.resource}
                              {log.resourceId && ` (${log.resourceId.slice(0, 8)})`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{new Date(log.timestamp).toLocaleString()}</p>
                          <p>{log.ipAddress}</p>
                        </div>
                      </div>

                      {Object.keys(log.details).length > 0 && (
                        <div className="bg-muted rounded p-3">
                          <p className="text-sm font-medium mb-2">Details:</p>
                          <pre className="text-xs overflow-auto">{JSON.stringify(log.details, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
