"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Add error boundary
  const [error, setError] = React.useState<Error | null>(null)

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Theme Provider Error</h1>
        <p className="text-gray-500 mb-6 max-w-md">{error.message || "An error occurred in the theme provider."}</p>
        <button onClick={() => setError(null)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Try again
        </button>
      </div>
    )
  }

  try {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
  } catch (err) {
    console.error("Theme provider error:", err)
    setError(err instanceof Error ? err : new Error("Unknown error in theme provider"))
    return null
  }
}
