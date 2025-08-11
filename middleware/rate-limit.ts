const buckets = new Map<string, { count: number; resetAt: number }>()

export function simpleRateLimit(ip: string, limit = 60, windowMs = 60_000) {
  const now = Date.now()
  const b = buckets.get(ip)
  if (!b || now > b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + windowMs })
    return { ok: true }
  }
  if (b.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) }
  }
  b.count++
  return { ok: true }
}
