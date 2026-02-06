"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Download, Mail, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { LogOut, Lock } from "lucide-react"

import { WaitlistEntry } from "@/lib/firebase/waitlist"

export default function AdminWaitlistPage() {
    const { user, loading: authLoading } = useAuth()
    const [signups, setSignups] = useState<WaitlistEntry[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin")
        }

        if (user) {
            fetchSignups()
        }
    }, [user, authLoading, router])

    const fetchSignups = async () => {
        try {
            // Import the function here to ensure it's used on the client
            const { getWaitlistSignups } = await import("@/lib/firebase/waitlist")
            const data = await getWaitlistSignups()
            setSignups(data || [])
        } catch (error) {
            console.error("Error fetching signups:", error)
        } finally {
            setLoading(false)
        }
    }

    const exportToCSV = () => {
        const csv = [
            ["Email", "Signup Date", "Status"],
            ...signups.map((s) => [s.email, new Date(s.createdAt).toLocaleString(), s.status]),
        ]
            .map((row) => row.join(","))
            .join("\n")

        const blob = new Blob([csv], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `waitlist-${new Date().toISOString().split("T")[0]}.csv`
        a.click()
    }

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-6">
                    <div className="flex items-center space-x-2">
                        <Lock className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold">Admin Portal</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/dashboard")}>
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container py-8 px-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Waitlist Signups</h1>
                        <p className="text-muted-foreground">Manage your early access entries</p>
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={exportToCSV} variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{signups.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Mail className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {signups.filter((s) => s.status === "pending").length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Latest Signup</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium">
                                {signups.length > 0
                                    ? new Date(signups[0].createdAt).toLocaleDateString()
                                    : "No signups yet"}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Signups</CardTitle>
                        <CardDescription>View and manage all waitlist entries</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Email</th>
                                        <th className="text-left p-4 font-medium">Signup Date</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {signups.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="text-center p-8 text-muted-foreground">
                                                No signups yet
                                            </td>
                                        </tr>
                                    ) : (
                                        signups.map((signup) => (
                                            <tr key={signup.id} className="border-b hover:bg-muted/50">
                                                <td className="p-4">{signup.email}</td>
                                                <td className="p-4">{new Date(signup.createdAt).toLocaleString()}</td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                                                        {signup.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div >
    )
}
