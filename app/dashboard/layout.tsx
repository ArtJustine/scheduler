import type React from "react"
import type { Metadata } from "next"
import { DashboardSidebar } from "@/components/dashboard/sidebar-fixed"
import { AuthProvider } from "@/lib/auth-provider"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Dashboard | Social Media Chiyu",
  description: "Manage and schedule your social media posts",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background text-foreground font-sans">
          <DashboardSidebar />
          <main className="flex-1 flex flex-col min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950/20">
            {/* Top Bar for Desktop/Mobile Toggle */}
            <header className="h-14 border-b bg-background/50 backdrop-blur-md flex items-center px-4 sticky top-0 z-40">
              <SidebarTrigger className="h-9 w-9 border border-border bg-white dark:bg-black shadow-sm hover:bg-accent transition-all" />
              <div className="ml-4 flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Dashboard</span>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 w-full">
                {children}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </AuthProvider>
  )
}
