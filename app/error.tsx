"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Something went wrong!</h1>
          <p className="mt-2 text-muted-foreground">{error.message || "An unexpected error occurred"}</p>
          <div className="mt-6 space-y-2">
            <Button onClick={reset} className="w-full">
              Try again
            </Button>
            <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/")}>
              Go back home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
