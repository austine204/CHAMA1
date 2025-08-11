import crypto from "crypto"

interface CSRFTokenStore {
  [sessionId: string]: {
    token: string
    expires: number
  }
}

export class CSRFProtection {
  private static store: CSRFTokenStore = {}
  private static readonly TOKEN_EXPIRY = 60 * 60 * 1000 // 1 hour

  // Generate CSRF token for a session
  static generateToken(sessionId: string): string {
    const token = crypto.randomBytes(32).toString("hex")
    const expires = Date.now() + this.TOKEN_EXPIRY

    this.store[sessionId] = { token, expires }

    // Clean up expired tokens
    this.cleanupExpiredTokens()

    return token
  }

  // Validate CSRF token
  static validateToken(sessionId: string, token: string): boolean {
    const storedData = this.store[sessionId]

    if (!storedData) {
      return false
    }

    if (Date.now() > storedData.expires) {
      delete this.store[sessionId]
      return false
    }

    return crypto.timingSafeEqual(Buffer.from(storedData.token), Buffer.from(token))
  }

  // Remove token for session
  static removeToken(sessionId: string): void {
    delete this.store[sessionId]
  }

  // Clean up expired tokens
  private static cleanupExpiredTokens(): void {
    const now = Date.now()

    for (const [sessionId, data] of Object.entries(this.store)) {
      if (now > data.expires) {
        delete this.store[sessionId]
      }
    }
  }

  // Get token for session (without generating new one)
  static getToken(sessionId: string): string | null {
    const storedData = this.store[sessionId]

    if (!storedData || Date.now() > storedData.expires) {
      return null
    }

    return storedData.token
  }
}

// Middleware function for CSRF protection
export function createCSRFMiddleware() {
  return {
    generateToken: (sessionId: string) => CSRFProtection.generateToken(sessionId),
    validateToken: (sessionId: string, token: string) => CSRFProtection.validateToken(sessionId, token),
    removeToken: (sessionId: string) => CSRFProtection.removeToken(sessionId),
  }
}
