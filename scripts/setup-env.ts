#!/usr/bin/env node

import { randomBytes } from "crypto"
import { writeFileSync, existsSync } from "fs"
import { join } from "path"

function generateSecureKey(length = 32): string {
  return randomBytes(length).toString("hex")
}

function setupEnvironment() {
  const envPath = join(process.cwd(), ".env.local")

  if (existsSync(envPath)) {
    console.log("✅ .env.local already exists")
    return
  }

  const nextAuthSecret = generateSecureKey(32)
  const encryptionKey = generateSecureKey(32)

  const envContent = `# NextAuth Configuration
NEXTAUTH_SECRET=${nextAuthSecret}
NEXTAUTH_URL=http://localhost:3000

# Database Configuration
DATABASE_URL="file:./dev.db"

# M-Pesa Configuration (Sandbox)
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=your-mpesa-passkey
MPESA_ENVIRONMENT=sandbox

# Security Configuration
ENCRYPTION_KEY=${encryptionKey}
AUDIT_LOG_DIR=./logs/audit

# Application Configuration
NODE_ENV=development
`

  writeFileSync(envPath, envContent)
  console.log("✅ Created .env.local with secure keys")
  console.log("🔧 Please update M-Pesa credentials with your actual values")
}

if (require.main === module) {
  setupEnvironment()
}

export { setupEnvironment }
