import type React from "react"
import type { Metadata } from "next"
import { DashboardSidebar } from "@/components/dashboard/sidebar-fixed"
import { AuthProvider } from "@/lib/auth-provider"

export const metadata: Metadata = {
  title: "Dashboard | Social Media Scheduler",
  description: "Manage and schedule your social media posts",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex bg-background">
        <div className="flex-shrink-0">
          <DashboardSidebar />
        </div>
        <main className="flex-1 flex flex-col items-center w-full">
          <div className="w-full max-w-5xl px-2 sm:px-4 md:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}
