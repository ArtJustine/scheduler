import type React from "react"
import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })

export const metadata: Metadata = {
  title: "Chiyu - Social Media Scheduler",
  description: "Schedule your social media posts across platforms with Chiyu. The premium scheduler for modern creators.",
  generator: 'v0.dev',
  icons: {
    icon: '/logo-light.png',
    apple: '/logo-light.png',
  },
  verification: {
    other: {
      'tiktok-developers-site-verification': ['zgDYjp9is7mmObhEghWencW7XqASt1nr'],
    },
  },
}

import { AuthProvider } from "@/lib/auth-provider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
