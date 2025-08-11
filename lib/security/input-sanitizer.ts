import DOMPurify from "isomorphic-dompurify"

export class InputSanitizer {
  // Sanitize HTML content
  static sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br"],
      ALLOWED_ATTR: [],
    })
  }

  // Remove SQL injection patterns
  static sanitizeSql(input: string): string {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(--|\/\*|\*\/|;|'|"|`)/g,
      /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi,
    ]

    let sanitized = input
    sqlPatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, "")
    })

    return sanitized.trim()
  }

  // Sanitize for XSS prevention
  static sanitizeXss(input: string): string {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    ]

    let sanitized = input
    xssPatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, "")
    })

    return sanitized
  }

  // Sanitize phone numbers
  static sanitizePhone(phone: string): string {
    // Remove all non-digit characters except +
    let sanitized = phone.replace(/[^\d+]/g, "")

    // Handle Kenyan phone numbers
    if (sanitized.startsWith("0")) {
      sanitized = "254" + sanitized.substring(1)
    } else if (sanitized.startsWith("+254")) {
      sanitized = sanitized.substring(1)
    } else if (!sanitized.startsWith("254") && sanitized.length === 9) {
      sanitized = "254" + sanitized
    }

    return sanitized
  }

  // Sanitize email addresses
  static sanitizeEmail(email: string): string {
    return email
      .toLowerCase()
      .trim()
      .replace(/[^\w@.-]/g, "")
  }

  // Sanitize numeric inputs
  static sanitizeNumber(input: string | number): number {
    if (typeof input === "number") return input

    const sanitized = input.replace(/[^\d.-]/g, "")
    const number = Number.parseFloat(sanitized)

    return isNaN(number) ? 0 : number
  }

  // Sanitize text inputs (general purpose)
  static sanitizeText(input: string, maxLength = 1000): string {
    let sanitized = input.trim()

    // Remove control characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "")

    // Limit length
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength)
    }

    return sanitized
  }

  // Comprehensive sanitization for user inputs
  static sanitizeUserInput(input: any): any {
    if (typeof input === "string") {
      return this.sanitizeText(this.sanitizeXss(input))
    }

    if (typeof input === "number") {
      return this.sanitizeNumber(input)
    }

    if (Array.isArray(input)) {
      return input.map((item) => this.sanitizeUserInput(item))
    }

    if (typeof input === "object" && input !== null) {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(input)) {
        sanitized[this.sanitizeText(key, 100)] = this.sanitizeUserInput(value)
      }
      return sanitized
    }

    return input
  }
}

// Middleware function for request sanitization
export function sanitizeRequest(data: any): any {
  return InputSanitizer.sanitizeUserInput(data)
}
