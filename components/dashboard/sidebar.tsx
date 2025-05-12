"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calendar,
  LayoutDashboard,
  Settings,
  BarChart3,
  PlusCircle,
  Library,
  HelpCircle,
  User,
  LucideLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Create Post",
      icon: PlusCircle,
      href: "/dashboard/create",
      active: pathname === "/dashboard/create",
    },
    {
      label: "Calendar",
      icon: Calendar,
      href: "/dashboard/calendar",
      active: pathname === "/dashboard/calendar",
    },
    {
      label: "Analytics",
      icon: BarChart3,
      href: "/dashboard/analytics",
      active: pathname === "/dashboard/analytics",
    },
    {
      label: "Content Library",
      icon: Library,
      href: "/dashboard/library",
      active: pathname === "/dashboard/library",
    },
    {
      label: "Connections",
      icon: LucideLink,
      href: "/dashboard/connections",
      active: pathname === "/dashboard/connections",
    },
    {
      label: "Profile",
      icon: User,
      href: "/dashboard/profile",
      active: pathname === "/dashboard/profile",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    },
    {
      label: "Help",
      icon: HelpCircle,
      href: "/dashboard/help",
      active: pathname === "/dashboard/help",
    },
  ]

  return (
    <div className="flex h-full w-[240px] flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Calendar className="h-6 w-6" />
          <span>SocialScheduler</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                route.active && "bg-muted text-foreground",
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Link href="/dashboard/create">
          <Button className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>
    </div>
  )
}
