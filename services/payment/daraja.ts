import type { PaymentGateway, STKPushRequest, GatewayResult } from "./gateway"

interface DarajaTokenResponse {
  access_token: string
  expires_in: string
}

interface STKPushResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

export class DarajaGateway implements PaymentGateway {
  private baseUrl: string
  private consumerKey: string
  private consumerSecret: string
  private businessShortCode: string
  private passkey: string
  private callbackUrl: string

  constructor() {
    const env = process.env.MPESA_ENVIRONMENT || "sandbox"
    this.baseUrl = env === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke"

    this.consumerKey = process.env.MPESA_CONSUMER_KEY!
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET!
    this.businessShortCode = process.env.MPESA_BUSINESS_SHORT_CODE || "174379"
    this.passkey = process.env.MPESA_PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
    this.callbackUrl = process.env.MPESA_CALLBACK_URL || "https://your-domain.com/api/payments/mpesa/webhook"

    if (!this.consumerKey || !this.consumerSecret) {
      throw new Error("M-Pesa credentials not configured")
    }
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString("base64")

    const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`)
    }

    const data: DarajaTokenResponse = await response.json()
    return data.access_token
  }

  private generateTimestamp(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const hour = String(now.getHours()).padStart(2, "0")
    const minute = String(now.getMinutes()).padStart(2, "0")
    const second = String(now.getSeconds()).padStart(2, "0")

    return `${year}${month}${day}${hour}${minute}${second}`
  }

  private generatePassword(): string {
    const timestamp = this.generateTimestamp()
    const password = Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString("base64")
    return password
  }

  async initiateSTKPush(input: STKPushRequest): Promise<GatewayResult> {
    try {
      const accessToken = await this.getAccessToken()
      const timestamp = this.generateTimestamp()
      const password = this.generatePassword()

      // Format phone number (ensure it starts with 254)
      let phone = input.phone.replace(/^\+/, "")
      if (phone.startsWith("0")) {
        phone = "254" + phone.substring(1)
      }
      if (!phone.startsWith("254")) {
        phone = "254" + phone
      }

      const payload = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(input.amount),
        PartyA: phone,
        PartyB: this.businessShortCode,
        PhoneNumber: phone,
        CallBackURL: this.callbackUrl,
        AccountReference: input.accountRef || "SACCO-ERP",
        TransactionDesc: input.narrative || "SACCO Contribution",
      }

      const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data: STKPushResponse = await response.json()

      if (data.ResponseCode === "0") {
        return {
          requestId: data.CheckoutRequestID,
          status: "PENDING",
          provider: "MPESA",
        }
      } else {
        throw new Error(`STK Push failed: ${data.ResponseDescription}`)
      }
    } catch (error) {
      console.error("STK Push error:", error)
      throw error
    }
  }

  async registerWebhook(url: string): Promise<{ ok: boolean }> {
    // In production, you would register C2B URLs with Daraja
    // For now, return success as webhook URL is configured via environment
    return { ok: true }
  }

  async queryTransaction(checkoutRequestId: string): Promise<{ status: "PENDING" | "SUCCESS" | "FAILED" }> {
    try {
      const accessToken = await this.getAccessToken()
      const timestamp = this.generateTimestamp()
      const password = this.generatePassword()

      const payload = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      }

      const response = await fetch(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.ResponseCode === "0") {
        // Transaction successful
        return { status: "SUCCESS" }
      } else if (data.ResponseCode === "1032") {
        // Transaction cancelled by user
        return { status: "FAILED" }
      } else {
        // Still pending or other status
        return { status: "PENDING" }
      }
    } catch (error) {
      console.error("Query transaction error:", error)
      return { status: "PENDING" }
    }
  }
}
