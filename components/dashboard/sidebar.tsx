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
  Link as LucideLink,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Sidebar() {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Check if we're on mobile and set collapsed state
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsCollapsed(window.innerWidth < 1024)
    }

    // Initial check
    checkScreenSize()

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

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
      label: "Link-in-Bio",
      icon: LucideLink,
      href: "/dashboard/link-in-bio",
      active: pathname === "/dashboard/link-in-bio",
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

  // Mobile sidebar with sheet component
  if (isMobile) {
    return (
      <>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="flex h-full w-[240px] flex-col border-r bg-background">
              <div className="flex h-14 items-center border-b px-4">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                  <Calendar className="h-6 w-6" />
                  <span>Chiyu</span>
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
          </SheetContent>
        </Sheet>
      </>
    )
  }

  // Desktop sidebar with collapsible state
  return (
    <div
      className={cn(
        "hidden md:flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[70px]" : "w-[240px]",
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Calendar className="h-6 w-6" />
          {!isCollapsed && <span>Chiyu</span>}
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
                isCollapsed && "justify-center px-2",
              )}
              title={isCollapsed ? route.label : undefined}
            >
              <route.icon className="h-5 w-5" />
              {!isCollapsed && <span>{route.label}</span>}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Link href="/dashboard/create">
          <Button className={cn("w-full", isCollapsed && "px-2")}>
            <PlusCircle className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">New Post</span>}
          </Button>
        </Link>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-[-12px] top-20 hidden md:flex h-6 w-6 rounded-full border shadow-md bg-background z-10"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? "→" : "←"}
      </Button>
    </div>
  )
}
