import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import { auth } from "@/lib/auth"
import Navigation from "@/components/navigation"

export const metadata: Metadata = {
  title: "SACCO ERP",
  description: "Complete ERP solution for SACCOs and microfinance institutions",
  generator: "v0.dev",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <SessionProvider session={session}>
          {session && <Navigation />}
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
