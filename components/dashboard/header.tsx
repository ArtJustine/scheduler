"use client"

import Link from "next/link"
import { Bell, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/dashboard/user-nav"

interface HeaderProps {
  user: {
    name?: string
    email?: string
    image?: string
  }
  onLogout?: () => void
  onMenuClick?: () => void
}

export function Header({ user, onLogout, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-4 md:px-6">
      <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>
      <div className="flex flex-1 items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
          <span className="text-xl font-bold">Chiyu</span>
        </Link>
        <div className="flex items-center gap-2 md:ml-auto">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </Button>
          <ThemeToggle />
          <UserNav user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  )
}
