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
      <div className="flex min-h-screen flex-col md:flex-row">
        <DashboardSidebar />
        <div className="flex-1">{children}</div>
      </div>
    </AuthProvider>
  )
}
