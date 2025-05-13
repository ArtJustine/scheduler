"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Calendar, FolderPlus, HelpCircle, Home, ImageIcon, Link2, Settings, User } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar"

const sidebarItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/dashboard",
  },
  {
    title: "Create Post",
    icon: FolderPlus,
    href: "/dashboard/create",
  },
  {
    title: "Calendar",
    icon: Calendar,
    href: "/dashboard/calendar",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/dashboard/analytics",
  },
  {
    title: "Content Library",
    icon: ImageIcon,
    href: "/dashboard/library",
  },
  {
    title: "Connections",
    icon: Link2,
    href: "/dashboard/connections",
  },
  {
    title: "Profile",
    icon: User,
    href: "/dashboard/profile",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
  {
    title: "Help",
    icon: HelpCircle,
    href: "/dashboard/help",
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="flex items-center justify-center py-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold">SocialScheduler</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {sidebarItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                  <Link href={item.href} className={cn("flex items-center")}>
                    <item.icon className="mr-2 h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} SocialScheduler</div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  )
}
