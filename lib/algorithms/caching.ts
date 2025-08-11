interface CacheItem<T> {
  value: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
}

export class LRUCache<T> {
  private cache = new Map<string, CacheItem<T>>()
  private maxSize: number
  private defaultTTL: number

  constructor(maxSize = 1000, defaultTTL = 300000) {
    // 5 minutes default
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  set(key: string, value: T, ttl?: number): void {
    const now = Date.now()
    const itemTTL = ttl || this.defaultTTL

    // Remove expired items first
    this.cleanup()

    // If at capacity, remove least recently used item
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    this.cache.set(key, {
      value,
      timestamp: now,
      ttl: itemTTL,
      accessCount: 0,
      lastAccessed: now,
    })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    const now = Date.now()

    // Check if item has expired
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    // Update access statistics
    item.accessCount++
    item.lastAccessed = now

    // Move to end (most recently used)
    this.cache.delete(key)
    this.cache.set(key, item)

    return item.value
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    this.cleanup()
    return this.cache.size
  }

  // Remove expired items
  private cleanup(): void {
    const now = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Evict least recently used item
  private evictLRU(): void {
    let lruKey: string | null = null
    let lruTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < lruTime) {
        lruTime = item.lastAccessed
        lruKey = key
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey)
    }
  }

  // Get cache statistics
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
    items: Array<{ key: string; accessCount: number; age: number }>
  } {
    this.cleanup()
    const now = Date.now()
    const items = Array.from(this.cache.entries()).map(([key, item]) => ({
      key,
      accessCount: item.accessCount,
      age: now - item.timestamp,
    }))

    const totalAccesses = items.reduce((sum, item) => sum + item.accessCount, 0)
    const hitRate = totalAccesses > 0 ? totalAccesses / (totalAccesses + this.cache.size) : 0

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate,
      items: items.sort((a, b) => b.accessCount - a.accessCount),
    }
  }
}

// Global cache instances
export const memberCache = new LRUCache<any>(500, 600000) // 10 minutes
export const loanCache = new LRUCache<any>(1000, 300000) // 5 minutes
export const reportCache = new LRUCache<any>(100, 1800000) // 30 minutes

// Cache utility functions
export function getCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(":")}`
}

export async function withCache<T>(
  cache: LRUCache<T>,
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number,
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get(key)
  if (cached !== null) {
    return cached
  }

  // Fetch and cache the result
  const result = await fetcher()
  cache.set(key, result, ttl)
  return result
}
