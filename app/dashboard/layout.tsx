import type React from "react"
import type { Metadata } from "next"
import { DashboardSidebar } from "@/components/dashboard/sidebar-fixed"
import { AuthProvider } from "@/lib/auth-provider"

export const metadata: Metadata = {
  title: "Dashboard | Social Media Chiyu",
  description: "Manage and schedule your social media posts",
}

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-shrink-0 hidden md:block">
            <DashboardSidebar />
          </div>
          <main className="flex-1 flex flex-col items-center w-full overflow-y-auto bg-slate-50 dark:bg-slate-950/20">
            <div className="w-full max-w-5xl px-4 sm:px-6 md:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  )
}
