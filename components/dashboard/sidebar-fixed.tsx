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
import { signOut } from "@/lib/firebase/auth"
import { useRouter } from "next/navigation"

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
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (error) {
      // Optionally show a toast or error message
      console.error("Logout failed", error)
    }
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="flex items-center justify-center py-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Chiyu</span>
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
        <SidebarFooter className="p-4 flex flex-col gap-2">
          <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} Chiyu</div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full rounded bg-destructive text-destructive-foreground py-2 text-xs font-medium hover:bg-destructive/90 transition-colors"
          >
            Log out
          </button>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  )
}
