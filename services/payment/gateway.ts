export interface STKPushRequest {
  phone: string
  amount: number
  accountRef?: string
  narrative?: string
}

export interface GatewayResult {
  requestId: string
  status: "PENDING" | "SUCCESS" | "FAILED"
  provider: "MPESA"
}

export interface PaymentGateway {
  initiateSTKPush(input: STKPushRequest): Promise<GatewayResult>
  registerWebhook(url: string): Promise<{ ok: boolean }>
  queryTransaction(externalId: string): Promise<{ status: "PENDING" | "SUCCESS" | "FAILED" }>
}
