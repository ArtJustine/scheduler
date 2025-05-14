import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-gray-500 mb-6 max-w-md">The page you are looking for doesn't exist or has been moved.</p>
      <Button asChild>
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  )
}
