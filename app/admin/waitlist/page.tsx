"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Download, Mail, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { firebaseAuth } from "@/lib/firebase-client"
import { onAuthStateChanged } from "firebase/auth"

interface WaitlistEntry {
    id: string
    email: string
    createdAt: string
    status: string
}

export default function AdminWaitlistPage() {
    const [signups, setSignups] = useState<WaitlistEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (!firebaseAuth) {
            router.push("/login")
            return
        }

        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            if (user) {
                setIsAuthenticated(true)
                fetchSignups()
            } else {
                router.push("/login")
            }
        })

        return () => unsubscribe()
    }, [router])

    const fetchSignups = async () => {
        try {
            const response = await fetch("/api/admin/waitlist")
            if (response.ok) {
                const data = await response.json()
                setSignups(data.signups || [])
            }
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

    if (!isAuthenticated || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-heading">Waitlist Signups</h1>
                        <p className="text-muted-foreground">Manage your waitlist entries</p>
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={exportToCSV} variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                        <Link href="/dashboard">
                            <Button variant="outline">Back to Dashboard</Button>
                        </Link>
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
            </div>
        </div>
    )
}
