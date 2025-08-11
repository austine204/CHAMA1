# Deployment Guide

## Environment Setup

1. **Generate NextAuth Secret**
   \`\`\`bash
   pnpm tsx scripts/generate-nextauth-secret.ts
   \`\`\`

2. **M-Pesa Configuration**
   - Get your Consumer Key and Consumer Secret from Daraja Portal
   - For sandbox: Use the provided test credentials
   - For production: Use your live credentials

3. **Database Setup**
   \`\`\`bash
   # Run migrations
   pnpm prisma migrate deploy
   
   # Seed initial data
   pnpm tsx prisma/seed.ts
   \`\`\`

## Vercel Deployment

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Vercel will auto-detect Next.js configuration

2. **Environment Variables**
   Add these in Vercel dashboard:
   \`\`\`
   DATABASE_URL=your-postgres-connection-string
   NEXTAUTH_SECRET=your-generated-secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   MPESA_CONSUMER_KEY=your-consumer-key
   MPESA_CONSUMER_SECRET=your-consumer-secret
   MPESA_ENVIRONMENT=sandbox
   MPESA_CALLBACK_URL=https://your-domain.vercel.app/api/payments/mpesa/webhook
   \`\`\`

3. **Database Provider**
   - Recommended: Neon, Supabase, or PlanetScale
   - Ensure connection pooling is enabled

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] M-Pesa webhook URL registered
- [ ] SSL certificate active
- [ ] Monitoring configured (Sentry)
- [ ] Backup strategy in place
- [ ] Rate limiting enabled
- [ ] Audit logging configured

## Security Notes

- Never commit secrets to version control
- Use strong, unique passwords for all accounts
- Enable 2FA on all service accounts
- Regularly rotate API keys
- Monitor for suspicious activity
- Keep dependencies updated
