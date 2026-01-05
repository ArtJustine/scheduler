"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    const cycleTheme = () => {
        if (theme === "light") {
            setTheme("dark")
        } else if (theme === "dark") {
            setTheme("system")
        } else {
            setTheme("light")
        }
    }

    if (!mounted) {
        return (
            <Button variant="outline" size="icon" className="bg-transparent border-border">
                <Sun className="h-[1.2rem] w-[1.2rem] text-primary" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        )
    }

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={cycleTheme}
            className="bg-transparent border-border hover:bg-muted transition-colors relative"
            title={`Current theme: ${theme}. Click to change.`}
        >
            <Sun className={`h-[1.2rem] w-[1.2rem] text-primary transition-all ${theme === 'light' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90 absolute'}`} />
            <Moon className={`h-[1.2rem] w-[1.2rem] text-primary transition-all ${theme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 rotate-90 absolute'}`} />
            <Monitor className={`h-[1.2rem] w-[1.2rem] text-primary transition-all ${theme === 'system' ? 'scale-100 rotate-0' : 'scale-0 rotate-90 absolute'}`} />
            <span className="sr-only">Toggle theme (Current: {theme})</span>
        </Button>
    )
}
