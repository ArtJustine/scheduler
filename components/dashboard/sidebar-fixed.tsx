"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Calendar, FolderPlus, HelpCircle, Home, ImageIcon, Link2, Settings, User, Facebook, Twitter, Instagram, Youtube, MessageSquare, Share2, Link as LucideLink } from "lucide-react"



import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar"
import { signOut } from "@/lib/firebase/auth"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"

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
    items: [
      { title: "Media", href: "/dashboard/library?tab=media" },
      { title: "Hashtags", href: "/dashboard/library?tab=hashtags" },
      { title: "Captions", href: "/dashboard/library?tab=captions" },
    ]
  },
  {
    title: "Link-in-Bio",
    icon: LucideLink,
    href: "/dashboard/link-in-bio",
  },
]

const socialChannels = [
  {
    title: "TikTok",
    icon: Share2,
    href: "/dashboard/platform/tiktok",
    color: "text-rose-600",
  },
  {
    title: "YouTube",
    icon: Youtube,
    href: "/dashboard/platform/youtube",
    color: "text-red-600",
  },
]

const settingsItems = [
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
  const { user: authUser, loading: authLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [connectedAccounts, setConnectedAccounts] = useState<any>({})

  useEffect(() => {
    const loadAccounts = async () => {
      if (!authUser) {
        setConnectedAccounts({})
        return
      }

      try {
        const { getSocialAccounts } = await import("@/lib/firebase/social-accounts")
        const accounts = await getSocialAccounts()
        setConnectedAccounts(accounts)
      } catch (error) {
        console.error("Error loading social accounts for sidebar:", error)
      }
    }

    if (!authLoading) {
      loadAccounts()
    }

    // Add an event listener for storage or a custom event to refresh when accounts change
    const handleRefresh = () => loadAccounts()
    window.addEventListener('social-accounts-updated', handleRefresh)
    return () => window.removeEventListener('social-accounts-updated', handleRefresh)
  }, [authUser, authLoading])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  const getChannelDisplay = (channel: any) => {
    const platform = channel.title.toLowerCase()
    const connected = connectedAccounts[platform]

    // Debug logging
    console.log(`Sidebar - Channel: ${channel.title}, Platform key: ${platform}, Connected:`, connected)
    console.log(`Sidebar - All connected accounts:`, connectedAccounts)

    if (connected) {
      return {
        title: connected.username || channel.title,
        icon: connected.profileImage ? null : channel.icon,
        image: connected.profileImage,
      }
    }

    return {
      title: channel.title,
      icon: channel.icon,
      image: null,
    }
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="flex items-center justify-start px-6 pt-10 pb-8">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <Calendar className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold font-heading tracking-tight">Chiyu</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="px-2 pt-4">
          <SidebarMenu className="gap-2">
            {sidebarItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                  <Link href={item.href} className={cn("flex items-center")}>
                    <item.icon className="mr-2 h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                {item.items && (
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.href}>
                        <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                          <Link href={subItem.href}>{subItem.title}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          <div className="px-3 py-4">
            <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Social Channels
            </h2>
            <SidebarMenu>
              {socialChannels.filter(channel => connectedAccounts[channel.title.toLowerCase()]).length > 0 ? (
                socialChannels
                  .filter(channel => connectedAccounts[channel.title.toLowerCase()])
                  .map((channel) => {
                    const display = getChannelDisplay(channel)
                    return (
                      <SidebarMenuItem key={channel.href}>
                        <SidebarMenuButton asChild isActive={pathname === channel.href} tooltip={display.title}>
                          <Link href={channel.href} className={cn("flex items-center")}>
                            {display.image ? (
                              <img src={display.image} alt="" className="mr-2 h-5 w-5 rounded-full" />
                            ) : (
                              <channel.icon className={cn("mr-2 h-5 w-5", channel.color)} />
                            )}
                            <span className="truncate">{display.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })
              ) : (
                <div className="px-4 py-2 text-xs text-muted-foreground italic">
                  No accounts connected yet.
                </div>
              )}
            </SidebarMenu>
          </div>

          <SidebarMenu>
            {settingsItems.map((item) => (
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
