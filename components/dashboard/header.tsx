"use client"

import { UserNav } from "@/components/dashboard/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { useEffect, useState } from "react"

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkScreenSize()

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="ml-auto flex items-center space-x-2">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </div>
  )
}
