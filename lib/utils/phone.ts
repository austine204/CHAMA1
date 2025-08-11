/**
 * Normalize phone number to international format (254...)
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove any non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, "")

  // Remove leading +
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1)
  }

  // Convert local format (07...) to international (254...)
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.substring(1)
  }

  // Ensure it starts with 254 for Kenya
  if (!cleaned.startsWith("254")) {
    cleaned = "254" + cleaned
  }

  return cleaned
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const normalized = normalizePhoneNumber(phone)
  if (normalized.startsWith("254")) {
    return "+" + normalized.substring(0, 3) + " " + normalized.substring(3)
  }
  return phone
}
