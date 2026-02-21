"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, Info, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function BlueskyConnectPage() {
    const [identifier, setIdentifier] = useState("")
    const [appPassword, setAppPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()
    const searchParams = useSearchParams()
    const userId = searchParams.get("userId")
    const workspaceId = searchParams.get("workspaceId")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!identifier || !appPassword) {
            toast({
                title: "Error",
                description: "Identifier and App Password are required.",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/bluesky/connect", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ identifier, appPassword, userId, workspaceId }),
            })

            const data = await response.json()

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Bluesky account connected successfully!",
                })
                router.push("/dashboard/connections?success=bluesky_connected")
            } else {
                toast({
                    title: "Connection Failed",
                    description: data.error || "Failed to connect to Bluesky. Please check your credentials.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Bluesky connection error:", error)
            toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container max-w-2xl py-10 space-y-6">
            <Button
                variant="ghost"
                onClick={() => router.push("/dashboard/connections")}
                className="mb-4"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Connections
            </Button>

            <Card className="border-2">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-500 rounded-full p-2">
                            <img src="/bluesky.webp" alt="Bluesky" className="w-6 h-6 invert brightness-0" />
                        </div>
                        <CardTitle className="text-2xl">Connect Bluesky</CardTitle>
                    </div>
                    <CardDescription>
                        Enter your Bluesky handle and an App Password to connect your account.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <Alert className="bg-blue-50 border-blue-200">
                            <Info className="h-4 w-4 text-blue-600" />
                            <AlertTitle className="text-blue-800">Use an App Password</AlertTitle>
                            <AlertDescription className="text-blue-700">
                                For security, do not use your main account password. Create an App Password in your Bluesky settings under <strong>Settings {">"} App Passwords</strong>.
                                <a
                                    href="https://bsky.app/settings/app-passwords"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 mt-1 font-medium hover:underline"
                                >
                                    Go to Bluesky Settings <ExternalLink className="h-3 w-3" />
                                </a>
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <Label htmlFor="identifier">Bluesky Handle (e.g., username.bsky.social)</Label>
                            <Input
                                id="identifier"
                                placeholder="my-handle.bsky.social"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">App Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="xxxx-xxxx-xxxx-xxxx"
                                value={appPassword}
                                onChange={(e) => setAppPassword(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || !identifier || !appPassword}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Connect Account"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
