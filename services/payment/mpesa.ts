import { DarajaGateway } from "./daraja"
import type { PaymentGateway } from "./gateway"

// Export the appropriate gateway based on environment
export function createMpesaGateway(): PaymentGateway {
  const env = process.env.NODE_ENV

  if (env === "test" || !process.env.MPESA_CONSUMER_KEY) {
    // Use mock gateway for tests or when credentials not configured
    return new MpesaMockGateway()
  }

  return new DarajaGateway()
}

// Keep mock for testing
export class MpesaMockGateway implements PaymentGateway {
  async initiateSTKPush(input: any) {
    return {
      requestId: "REQ-" + Math.random().toString(36).slice(2),
      status: "PENDING" as const,
      provider: "MPESA" as const,
    }
  }

  async registerWebhook(url: string) {
    return { ok: true }
  }

  async queryTransaction(externalId: string) {
    const ok = externalId.length % 2 === 0
    return { status: ok ? "SUCCESS" : "PENDING" } as const
  }
}
