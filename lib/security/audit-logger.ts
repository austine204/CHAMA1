import fs from "fs/promises"
import path from "path"

export interface AuditLogEntry {
  timestamp: string
  userId?: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  success: boolean
  errorMessage?: string
}

export class AuditLogger {
  private static logDir = process.env.AUDIT_LOG_DIR || "./logs/audit"

  // Initialize audit logging
  static async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.logDir, { recursive: true })
    } catch (error) {
      console.error("Failed to create audit log directory:", error)
    }
  }

  // Log an audit event
  static async log(entry: Omit<AuditLogEntry, "timestamp">): Promise<void> {
    const logEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    }

    try {
      const logFile = path.join(this.logDir, `audit-${this.getDateString()}.log`)
      const logLine = JSON.stringify(logEntry) + "\n"

      await fs.appendFile(logFile, logLine, "utf8")
    } catch (error) {
      console.error("Failed to write audit log:", error)
    }
  }

  // Log successful actions
  static async logSuccess(params: {
    userId?: string
    action: string
    resource: string
    resourceId?: string
    details?: Record<string, any>
    ipAddress?: string
    userAgent?: string
  }): Promise<void> {
    await this.log({
      ...params,
      success: true,
    })
  }

  // Log failed actions
  static async logFailure(params: {
    userId?: string
    action: string
    resource: string
    resourceId?: string
    details?: Record<string, any>
    ipAddress?: string
    userAgent?: string
    errorMessage: string
  }): Promise<void> {
    await this.log({
      ...params,
      success: false,
    })
  }

  // Log authentication events
  static async logAuth(params: {
    userId?: string
    action: "LOGIN" | "LOGOUT" | "LOGIN_FAILED" | "PASSWORD_CHANGE"
    ipAddress?: string
    userAgent?: string
    success: boolean
    errorMessage?: string
  }): Promise<void> {
    await this.log({
      ...params,
      resource: "AUTH",
    })
  }

  // Log data access events
  static async logDataAccess(params: {
    userId: string
    action: "READ" | "CREATE" | "UPDATE" | "DELETE"
    resource: string
    resourceId: string
    ipAddress?: string
    userAgent?: string
  }): Promise<void> {
    await this.log({
      ...params,
      success: true,
    })
  }

  // Log financial transactions
  static async logFinancialTransaction(params: {
    userId: string
    action: string
    amount: number
    currency: string
    memberId?: string
    loanId?: string
    transactionId: string
    ipAddress?: string
  }): Promise<void> {
    await this.log({
      userId: params.userId,
      action: params.action,
      resource: "FINANCIAL_TRANSACTION",
      resourceId: params.transactionId,
      details: {
        amount: params.amount,
        currency: params.currency,
        memberId: params.memberId,
        loanId: params.loanId,
      },
      ipAddress: params.ipAddress,
      success: true,
    })
  }

  // Get date string for log file naming
  private static getDateString(): string {
    const now = new Date()
    return now.toISOString().split("T")[0] // YYYY-MM-DD
  }

  // Read audit logs for a specific date
  static async readLogs(date: string): Promise<AuditLogEntry[]> {
    try {
      const logFile = path.join(this.logDir, `audit-${date}.log`)
      const content = await fs.readFile(logFile, "utf8")

      return content
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line))
    } catch (error) {
      console.error("Failed to read audit logs:", error)
      return []
    }
  }

  // Search audit logs
  static async searchLogs(params: {
    startDate: string
    endDate: string
    userId?: string
    action?: string
    resource?: string
  }): Promise<AuditLogEntry[]> {
    const results: AuditLogEntry[] = []
    const start = new Date(params.startDate)
    const end = new Date(params.endDate)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split("T")[0]
      const logs = await this.readLogs(dateString)

      const filtered = logs.filter((log) => {
        if (params.userId && log.userId !== params.userId) return false
        if (params.action && log.action !== params.action) return false
        if (params.resource && log.resource !== params.resource) return false
        return true
      })

      results.push(...filtered)
    }

    return results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }
}

// Initialize audit logging on module load
AuditLogger.initialize().catch(console.error)
