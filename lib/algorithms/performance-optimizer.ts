// Connection pooling for database operations
export class ConnectionPool {
  private connections: any[] = []
  private maxConnections: number
  private currentConnections = 0
  private waitingQueue: Array<(connection: any) => void> = []

  constructor(maxConnections = 10) {
    this.maxConnections = maxConnections
  }

  async getConnection(): Promise<any> {
    return new Promise((resolve) => {
      if (this.connections.length > 0) {
        resolve(this.connections.pop())
      } else if (this.currentConnections < this.maxConnections) {
        this.currentConnections++
        resolve(this.createConnection())
      } else {
        this.waitingQueue.push(resolve)
      }
    })
  }

  releaseConnection(connection: any): void {
    if (this.waitingQueue.length > 0) {
      const resolve = this.waitingQueue.shift()!
      resolve(connection)
    } else {
      this.connections.push(connection)
    }
  }

  private createConnection(): any {
    // Mock connection object
    return {
      id: Math.random().toString(36),
      createdAt: Date.now(),
      query: async (sql: string) => {
        // Simulate database query
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 100))
        return { rows: [] }
      },
    }
  }

  getStats(): { total: number; available: number; waiting: number } {
    return {
      total: this.currentConnections,
      available: this.connections.length,
      waiting: this.waitingQueue.length,
    }
  }
}

// Query batching for efficient database operations
export class QueryBatcher {
  private batches: Map<string, any[]> = new Map()
  private timers: Map<string, NodeJS.Timeout> = new Map()
  private batchSize: number
  private batchTimeout: number

  constructor(batchSize = 100, batchTimeout = 50) {
    this.batchSize = batchSize
    this.batchTimeout = batchTimeout
  }

  // Add query to batch
  addQuery(batchKey: string, query: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.batches.has(batchKey)) {
        this.batches.set(batchKey, [])
      }

      const batch = this.batches.get(batchKey)!
      batch.push({ query, resolve, reject })

      // Execute batch if it reaches the size limit
      if (batch.length >= this.batchSize) {
        this.executeBatch(batchKey)
      } else {
        // Set timer for batch execution
        if (!this.timers.has(batchKey)) {
          const timer = setTimeout(() => {
            this.executeBatch(batchKey)
          }, this.batchTimeout)
          this.timers.set(batchKey, timer)
        }
      }
    })
  }

  // Execute a batch of queries
  private async executeBatch(batchKey: string): Promise<void> {
    const batch = this.batches.get(batchKey)
    if (!batch || batch.length === 0) return

    // Clear timer
    const timer = this.timers.get(batchKey)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(batchKey)
    }

    // Remove batch from map
    this.batches.delete(batchKey)

    try {
      // Execute all queries in the batch
      const results = await Promise.all(batch.map(({ query }) => this.executeQuery(query)))

      // Resolve all promises
      batch.forEach(({ resolve }, index) => {
        resolve(results[index])
      })
    } catch (error) {
      // Reject all promises
      batch.forEach(({ reject }) => {
        reject(error)
      })
    }
  }

  // Mock query execution
  private async executeQuery(query: any): Promise<any> {
    // Simulate database query execution
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 50))
    return { success: true, data: query }
  }

  // Get batching statistics
  getStats(): { activeBatches: number; totalQueries: number } {
    let totalQueries = 0
    for (const batch of this.batches.values()) {
      totalQueries += batch.length
    }

    return {
      activeBatches: this.batches.size,
      totalQueries,
    }
  }
}

// Memory management utilities
export class MemoryManager {
  private static memoryUsage: NodeJS.MemoryUsage[] = []
  private static maxSamples = 100

  // Track memory usage
  static trackMemoryUsage(): void {
    const usage = process.memoryUsage()
    this.memoryUsage.push(usage)

    // Keep only recent samples
    if (this.memoryUsage.length > this.maxSamples) {
      this.memoryUsage.shift()
    }
  }

  // Get memory statistics
  static getMemoryStats(): {
    current: NodeJS.MemoryUsage
    average: NodeJS.MemoryUsage
    peak: NodeJS.MemoryUsage
  } {
    const current = process.memoryUsage()

    if (this.memoryUsage.length === 0) {
      return { current, average: current, peak: current }
    }

    const average = {
      rss: this.memoryUsage.reduce((sum, usage) => sum + usage.rss, 0) / this.memoryUsage.length,
      heapTotal: this.memoryUsage.reduce((sum, usage) => sum + usage.heapTotal, 0) / this.memoryUsage.length,
      heapUsed: this.memoryUsage.reduce((sum, usage) => sum + usage.heapUsed, 0) / this.memoryUsage.length,
      external: this.memoryUsage.reduce((sum, usage) => sum + usage.external, 0) / this.memoryUsage.length,
      arrayBuffers: this.memoryUsage.reduce((sum, usage) => sum + usage.arrayBuffers, 0) / this.memoryUsage.length,
    }

    const peak = {
      rss: Math.max(...this.memoryUsage.map((usage) => usage.rss)),
      heapTotal: Math.max(...this.memoryUsage.map((usage) => usage.heapTotal)),
      heapUsed: Math.max(...this.memoryUsage.map((usage) => usage.heapUsed)),
      external: Math.max(...this.memoryUsage.map((usage) => usage.external)),
      arrayBuffers: Math.max(...this.memoryUsage.map((usage) => usage.arrayBuffers)),
    }

    return { current, average, peak }
  }

  // Force garbage collection (if available)
  static forceGarbageCollection(): void {
    if (global.gc) {
      global.gc()
    }
  }

  // Check if memory usage is high
  static isMemoryUsageHigh(threshold = 0.8): boolean {
    const usage = process.memoryUsage()
    const heapUsageRatio = usage.heapUsed / usage.heapTotal
    return heapUsageRatio > threshold
  }
}

// Background job queue with priorities
export class JobQueue {
  private queues: Map<string, any[]> = new Map()
  private processing: Set<string> = new Set()
  private workers: Map<string, (job: any) => Promise<any>> = new Map()

  // Register a worker for a job type
  registerWorker(jobType: string, worker: (job: any) => Promise<any>): void {
    this.workers.set(jobType, worker)
    if (!this.queues.has(jobType)) {
      this.queues.set(jobType, [])
    }
  }

  // Add job to queue
  addJob(jobType: string, data: any, priority = 0): void {
    if (!this.queues.has(jobType)) {
      throw new Error(`No worker registered for job type: ${jobType}`)
    }

    const job = {
      id: Math.random().toString(36),
      type: jobType,
      data,
      priority,
      createdAt: Date.now(),
    }

    const queue = this.queues.get(jobType)!
    queue.push(job)

    // Sort by priority (higher priority first)
    queue.sort((a, b) => b.priority - a.priority)

    // Start processing if not already processing
    if (!this.processing.has(jobType)) {
      this.processQueue(jobType)
    }
  }

  // Process jobs in queue
  private async processQueue(jobType: string): Promise<void> {
    if (this.processing.has(jobType)) return

    this.processing.add(jobType)
    const queue = this.queues.get(jobType)!
    const worker = this.workers.get(jobType)!

    while (queue.length > 0) {
      const job = queue.shift()!

      try {
        await worker(job)
      } catch (error) {
        console.error(`Job ${job.id} failed:`, error)
      }
    }

    this.processing.delete(jobType)
  }

  // Get queue statistics
  getStats(): { [jobType: string]: { queued: number; processing: boolean } } {
    const stats: { [jobType: string]: { queued: number; processing: boolean } } = {}

    for (const [jobType, queue] of this.queues.entries()) {
      stats[jobType] = {
        queued: queue.length,
        processing: this.processing.has(jobType),
      }
    }

    return stats
  }
}

// Global instances
export const connectionPool = new ConnectionPool(20)
export const queryBatcher = new QueryBatcher(50, 100)
export const jobQueue = new JobQueue()

// Initialize memory tracking
setInterval(() => {
  MemoryManager.trackMemoryUsage()
}, 30000) // Track every 30 seconds
