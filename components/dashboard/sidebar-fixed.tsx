"use client"

import { useState, useEffect, useRef } from "react"
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
  Youtube,
  TrendingUp,
  ChevronRight
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
import { WorkspaceSwitcher } from "./workspace-switcher"

const sidebarItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/dashboard",
  },
  {
    title: "Trends",
    icon: TrendingUp,
    href: "/dashboard/trends",
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
    title: "Link-in-Bio",
    icon: LucideLink,
    href: "/dashboard/link-in-bio",
  },
]

const socialChannels = [
  {
    title: "TikTok",
    icon: Share2,
    image: "/tiktok.webp",
    href: "/dashboard/platform/tiktok",
    color: "text-rose-600",
  },
  {
    title: "YouTube",
    icon: Youtube,
    image: "/youtube.webp",
    href: "/dashboard/platform/youtube",
    color: "text-red-600",
  },
  {
    title: "Instagram",
    icon: Share2,
    image: "/instagram.webp",
    href: "/dashboard/platform/instagram",
    color: "text-pink-600",
  },
  {
    title: "Threads",
    icon: Share2,
    image: "/threads.webp",
    href: "/dashboard/platform/threads",
    color: "text-slate-900 dark:text-white",
  },
  {
    title: "LinkedIn",
    icon: Share2,
    image: "/linkedin.webp",
    href: "/dashboard/platform/linkedin",
    color: "text-blue-700",
  },
  {
    title: "Pinterest",
    icon: Share2,
    image: "/pinterest.webp",
    href: "/dashboard/platform/pinterest",
    color: "text-red-600",
  },
  {
    title: "Bluesky",
    icon: Share2,
    image: "/bluesky.webp",
    href: "/dashboard/platform/bluesky",
    color: "text-blue-500",
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
    if (!channel || !channel.title) {
      return { title: "Unknown", icon: Share2, image: channel?.image || null }
    }
    const platform = channel.title?.toLowerCase()
    const connected = connectedAccounts[platform]

    // Use synced icons from public folder
    const syncedIconPath = `/${platform}.webp`

    if (connected) {
      return {
        title: connected.username || channel.title,
        icon: null,
        image: connected.profileImage || syncedIconPath,
        platformIcon: syncedIconPath, // Store for badge
      }
    }

    return {
      title: channel.title,
      icon: null,
      image: syncedIconPath,
      platformIcon: syncedIconPath,
    }
  }

  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({ opacity: 0, transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)" })
  const [hoverStyle, setHoverStyle] = useState<React.CSSProperties>({ opacity: 0, transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" })
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mounted && contentRef.current) {
      const updateIndicator = () => {
        const activeItem = contentRef.current?.querySelector('[data-active="true"]') as HTMLElement
        const container = contentRef.current
        if (activeItem && container) {
          const itemRect = activeItem.getBoundingClientRect()
          const containerRect = container.getBoundingClientRect()

          setIndicatorStyle({
            top: itemRect.top - containerRect.top + container.scrollTop,
            height: itemRect.height,
            opacity: 1,
            backgroundColor: "hsl(var(--primary))",
            borderRadius: "0.5rem",
            width: itemRect.width,
            left: itemRect.left - containerRect.left,
            zIndex: 0,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          })
        } else {
          setIndicatorStyle(prev => ({ ...prev, opacity: 0 }))
        }
      }
      // Small delay to ensure DOM is ready and sub-menus are expanded
      const timer = setTimeout(updateIndicator, 50)
      return () => clearTimeout(timer)
    }
  }, [mounted, pathname, currentTab, Object.keys(connectedAccounts).length])

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget
    const container = contentRef.current
    if (container) {
      const itemRect = target.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      setHoverStyle({
        top: itemRect.top - containerRect.top + container.scrollTop,
        height: itemRect.height,
        opacity: 1,
        backgroundColor: resolvedTheme === 'dark' ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
        borderRadius: "0.5rem",
        width: itemRect.width,
        left: itemRect.left - containerRect.left,
        zIndex: 0,
        pointerEvents: "none",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      })
    }
  }

  const handleMouseLeave = () => {
    setHoverStyle(prev => ({ ...prev, opacity: 0 }))
  }

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center px-6 pt-10 pb-4">
        <Link href="/dashboard" className="flex items-center space-x-3 w-full justify-center">
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

      <div id="tour-workspace-switcher">
        <WorkspaceSwitcher />
      </div>

      <SidebarContent
        ref={contentRef}
        className="px-2 pt-4 relative scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20 transition-colors"
        onMouseLeave={handleMouseLeave}
      >
        {/* Sliding Highlight Indicator (Active) */}
        <div
          className="absolute z-0 pointer-events-none"
          style={{
            ...indicatorStyle,
            position: "absolute",
          }}
        />

        {/* Sliding Highlight Indicator (Hover) */}
        <div
          className="absolute z-0 pointer-events-none"
          style={{
            ...hoverStyle,
            position: "absolute",
          }}
        />

        <SidebarMenu className="gap-2 z-10">
          {sidebarItems.map((item) => (
            <SidebarMenuItem key={item.href} onMouseEnter={handleMouseEnter}>
              {(item as any).items ? (
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
                      {((item as any).items as any[]).map((subItem) => (
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
                <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title} id={item.title === "Dashboard" ? "tour-dashboard" : item.title === "Create Post" ? "tour-create-post" : item.title === "Calendar" ? "tour-calendar" : undefined}>
                  <Link href={item.href} className={cn("flex items-center")}>
                    <item.icon className="mr-2 h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <Collapsible defaultOpen={true} className="relative z-10 group/channels">
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="cursor-pointer">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                    Channels
                  </span>
                  <ChevronRight className="ml-auto h-3 w-3 text-muted-foreground/50 transition-transform duration-200 group-data-[state=open]/channels:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent>
              {socialChannels.filter(channel => {
                const acc = connectedAccounts[channel.title.toLowerCase()]
                return acc && (acc.connected || acc.accessToken || acc.access_token)
              }).length > 0 ? (
                socialChannels
                  .filter(channel => {
                    const acc = connectedAccounts[channel.title.toLowerCase()]
                    return acc && (acc.connected || acc.accessToken || acc.access_token)
                  })
                  .map((channel) => {
                    const { title, icon: Icon, image, platformIcon } = getChannelDisplay(channel)
                    const active = pathname === channel.href

                    return (
                      <SidebarMenuItem key={channel.title} onMouseEnter={handleMouseEnter}>
                        <SidebarMenuButton asChild isActive={active} tooltip={title}>
                          <Link href={channel.href} className="flex items-center">
                            <div className="relative h-5 w-5 mr-2 flex-shrink-0">
                              {image ? (
                                <div className={cn(
                                  "h-full w-full rounded-full flex items-center justify-center overflow-hidden border border-white/10",
                                  image.endsWith('.webp') ? "bg-white" : "bg-muted"
                                )}>
                                  <img
                                    src={image}
                                    alt={title}
                                    referrerPolicy="no-referrer"
                                    className={cn(
                                      "rounded-full object-cover",
                                      image.endsWith('.webp') ? "h-[65%] w-[65%] object-contain" : "h-full w-full"
                                    )}
                                    onError={(e) => {
                                      if (!image.endsWith('.webp')) {
                                        const pName = channel.title?.toLowerCase();
                                        (e.target as HTMLImageElement).src = `/${pName}.webp`;
                                        (e.target as HTMLImageElement).classList.add('h-[65%]', 'w-[65%]', 'object-contain');
                                        (e.target as HTMLImageElement).classList.remove('h-full', 'w-full', 'object-cover');
                                        (e.target as HTMLImageElement).parentElement?.classList.add('bg-white');
                                      }
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className={cn("h-full w-full rounded-full flex items-center justify-center bg-muted", channel.color)}>
                                  {Icon && <Icon className="h-3 w-3" />}
                                </div>
                              )}
                              {platformIcon && (
                                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-white border border-black/5 p-[1px] shadow-sm flex items-center justify-center">
                                  <img src={platformIcon} alt="" className="h-[80%] w-[80%] object-contain" />
                                </div>
                              )}
                            </div>
                            <span className="truncate">{title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })
              ) : (
                <SidebarMenuItem>
                  <div className="px-2 py-1 text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">
                    No Connections
                  </div>
                </SidebarMenuItem>
              )}
            </CollapsibleContent>
          </SidebarMenu>
        </Collapsible>

        <SidebarMenu className="relative z-10 gap-1">
          {settingsItems.map((item) => (
            <SidebarMenuItem key={item.href} onMouseEnter={handleMouseEnter}>
              <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title} id={item.title === "Connections" ? "tour-connections" : undefined}>
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
