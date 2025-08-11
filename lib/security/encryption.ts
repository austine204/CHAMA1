import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const KEY_LENGTH = 32
const IV_LENGTH = 16
const TAG_LENGTH = 16

export class EncryptionService {
  private key: Buffer

  constructor(secretKey?: string) {
    if (secretKey) {
      this.key = crypto.scryptSync(secretKey, "salt", KEY_LENGTH)
    } else {
      // Generate a random key if none provided
      this.key = crypto.randomBytes(KEY_LENGTH)
    }
  }

  encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(IV_LENGTH)
      const cipher = crypto.createCipher(ALGORITHM, this.key)
      cipher.setAAD(Buffer.from("sacco-erp", "utf8"))

      let encrypted = cipher.update(text, "utf8", "hex")
      encrypted += cipher.final("hex")

      const tag = cipher.getAuthTag()

      // Combine iv + tag + encrypted data
      return iv.toString("hex") + tag.toString("hex") + encrypted
    } catch (error) {
      throw new Error("Encryption failed")
    }
  }

  decrypt(encryptedData: string): string {
    try {
      // Extract iv, tag, and encrypted data
      const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), "hex")
      const tag = Buffer.from(encryptedData.slice(IV_LENGTH * 2, (IV_LENGTH + TAG_LENGTH) * 2), "hex")
      const encrypted = encryptedData.slice((IV_LENGTH + TAG_LENGTH) * 2)

      const decipher = crypto.createDecipher(ALGORITHM, this.key)
      decipher.setAAD(Buffer.from("sacco-erp", "utf8"))
      decipher.setAuthTag(tag)

      let decrypted = decipher.update(encrypted, "hex", "utf8")
      decrypted += decipher.final("utf8")

      return decrypted
    } catch (error) {
      throw new Error("Decryption failed")
    }
  }

  hash(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex")
  }

  generateToken(length = 32): string {
    return crypto.randomBytes(length).toString("hex")
  }

  compareHash(data: string, hash: string): boolean {
    const dataHash = this.hash(data)
    return crypto.timingSafeEqual(Buffer.from(dataHash), Buffer.from(hash))
  }
}

// Singleton instance
export const encryption = new EncryptionService(process.env.ENCRYPTION_KEY)

// Utility functions for common use cases
export function encryptPII(data: string): string {
  return encryption.encrypt(data)
}

export function decryptPII(encryptedData: string): string {
  return encryption.decrypt(encryptedData)
}

export function hashSensitiveData(data: string): string {
  return encryption.hash(data)
}

export function generateSecureToken(): string {
  return encryption.generateToken()
}
