import { type NextRequest, NextResponse } from "next/server"

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  message?: string
  skipSuccessfulRequests?: boolean
}

interface RequestInfo {
  count: number
  resetTime: number
}

const store = new Map<string, RequestInfo>()

export function createRateLimit(config: RateLimitConfig) {
  const { windowMs, maxRequests, message = "Too many requests", skipSuccessfulRequests = false } = config

  return async (request: NextRequest): Promise<NextResponse | null> => {
    const key = getClientKey(request)
    const now = Date.now()

    // Clean up expired entries
    cleanupExpiredEntries(now)

    const requestInfo = store.get(key)

    if (!requestInfo || now > requestInfo.resetTime) {
      // First request or window expired
      store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
      return null // Allow request
    }

    if (requestInfo.count >= maxRequests) {
      return NextResponse.json(
        { error: message },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": requestInfo.resetTime.toString(),
          },
        },
      )
    }

    // Increment counter
    requestInfo.count++

    return null // Allow request
  }
}

function getClientKey(request: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const ip = forwarded?.split(",")[0] || realIp || "unknown"

  return `${ip}:${request.nextUrl.pathname}`
}

function cleanupExpiredEntries(now: number) {
  for (const [key, info] of store.entries()) {
    if (now > info.resetTime) {
      store.delete(key)
    }
  }
}

// Predefined rate limiters
export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: "Too many API requests, please try again later",
})

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: "Too many authentication attempts, please try again later",
})

export const paymentRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 3,
  message: "Too many payment requests, please wait before trying again",
})
