"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import {
  BarChart3,
  Calendar,
  FolderPlus,
  HelpCircle,
  Home,
  ImageIcon,
  Link2,
  Settings,
  User,
  Share2,
  Link as LucideLink,
  ChevronRight,
  Youtube
} from "lucide-react"

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
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { signOut } from "@/lib/firebase/auth"
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
      { title: "Descriptions", href: "/dashboard/library?tab=descriptions" },
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
  const searchParams = useSearchParams()
  const router = useRouter()
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Determine current active path with query params for accurate highlighting
  const currentTab = searchParams.get('tab')
  const currentPathWithTab = currentTab ? `${pathname}?tab=${currentTab}` : pathname

  useEffect(() => {
    setMounted(true)
  }, [])
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

  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({ opacity: 0, transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)" })

  useEffect(() => {
    if (mounted) {
      const updateIndicator = () => {
        const activeItem = document.querySelector('[data-active="true"]') as HTMLElement
        if (activeItem) {
          setIndicatorStyle({
            top: activeItem.offsetTop,
            height: activeItem.offsetHeight,
            opacity: 1,
            backgroundColor: "hsl(var(--primary))",
            borderRadius: "0.5rem",
            width: "calc(100% - 1rem)",
            left: "0.5rem",
            zIndex: 0,
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          })
        }
      }
      // Small delay to ensure DOM is ready
      const timer = setTimeout(updateIndicator, 100)
      return () => clearTimeout(timer)
    }
  }, [mounted, pathname, currentTab])

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget
    setIndicatorStyle(prev => ({
      ...prev,
      top: target.offsetTop,
      height: target.offsetHeight,
      opacity: 1,
      backgroundColor: resolvedTheme === 'dark' ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    }))
  }

  const handleMouseLeave = () => {
    const activeItem = document.querySelector('[data-active="true"]') as HTMLElement
    if (activeItem) {
      setIndicatorStyle(prev => ({
        ...prev,
        top: activeItem.offsetTop,
        height: activeItem.offsetHeight,
        backgroundColor: "hsl(var(--primary))",
      }))
    } else {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }))
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center px-6 pt-10 pb-8">
        <Link href="/dashboard" className="flex items-center space-x-3">
          {mounted ? (
            <>
              <img
                src="/logo-light.png"
                alt="Chiyu"
                className="h-10 w-10 object-contain dark:hidden"
              />
              <img
                src="/logo-dark.png"
                alt="Chiyu"
                className="h-10 w-10 object-contain hidden dark:block"
              />
            </>
          ) : (
            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2 pt-4 relative" onMouseLeave={handleMouseLeave}>
        {/* Sliding Highlight Indicator */}
        <div
          className="absolute z-0 pointer-events-none"
          style={{
            ...indicatorStyle,
            position: "absolute",
            zIndex: 0,
          }}
        />

        <SidebarMenu className="gap-2 z-10">
          {sidebarItems.map((item) => (
            <SidebarMenuItem key={item.href} onMouseEnter={handleMouseEnter}>
              {item.items ? (
                <Collapsible defaultOpen={pathname === item.href || currentPathWithTab.startsWith(item.href)} className="group/collapsible">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={pathname === item.href && !currentTab}
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.href} onMouseEnter={(e) => {
                          e.stopPropagation();
                          handleMouseEnter(e);
                        }}>
                          <SidebarMenuSubButton asChild isActive={currentPathWithTab === subItem.href}>
                            <Link href={subItem.href}>{subItem.title}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                  <Link href={item.href} className={cn("flex items-center")}>
                    <item.icon className="mr-2 h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="px-3 py-4 relative z-10">
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
                    <SidebarMenuItem key={channel.href} onMouseEnter={handleMouseEnter}>
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

        <SidebarMenu className="relative z-10">
          {settingsItems.map((item) => (
            <SidebarMenuItem key={item.href} onMouseEnter={handleMouseEnter}>
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
        <div className="text-xs text-muted-foreground text-center">© {new Date().getFullYear()} Chiyu</div>
        <button
          onClick={handleLogout}
          className="mt-2 w-full rounded bg-destructive text-destructive-foreground py-2 text-xs font-medium hover:bg-destructive/90 transition-colors"
        >
          Log out
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
