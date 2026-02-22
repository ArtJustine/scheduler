"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ChevronLeft,
    MessageSquare,
    Mail,
    Clock,
    User,
    Search,
    ExternalLink,
    CheckCircle2,
    Clock3
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getHelpRequests, HelpRequest } from "@/lib/firebase/help"
import { format } from "date-fns"

export default function AdminHelpRequestsPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [requests, setRequests] = useState<HelpRequest[]>([])
    const [isFetching, setIsFetching] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        if (!loading && !user) {
            router.push("/admin")
        }

        if (user) {
            fetchRequests()
        }
    }, [user, loading, router])

    const fetchRequests = async () => {
        try {
            setIsFetching(true)
            const data = await getHelpRequests()
            setRequests(data)
        } catch (error) {
            console.error("Error fetching help requests:", error)
        } finally {
            setIsFetching(false)
        }
    }

    const filteredRequests = requests.filter(req =>
        req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.message.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading || isFetching) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-lg">Loading help requests...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-6">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/dashboard")}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center space-x-2">
                            <MessageSquare className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold">Help Requests</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container py-8 px-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Support Inbox</h1>
                        <p className="text-muted-foreground mt-1">Manage and respond to user inquiries</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search requests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="grid gap-6">
                    {filteredRequests.length > 0 ? (
                        filteredRequests.map((req) => (
                            <Card key={req.id} className="overflow-hidden border-border/40 hover:border-primary/40 transition-all shadow-sm">
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{req.subject}</CardTitle>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                                    <span className="font-medium text-foreground">{req.name}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {req.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant={req.status === 'new' ? 'default' : 'secondary'} className="capitalize">
                                                {req.status === 'new' && <Clock3 className="h-3 w-3 mr-1" />}
                                                {req.status}
                                            </Badge>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {req.createdAt?.toDate ? format(req.createdAt.toDate(), "MMM d, h:mm a") : "Just now"}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="bg-muted/20 border border-border/40 rounded-xl p-6 mb-4">
                                        <p className="whitespace-pre-wrap leading-relaxed text-foreground/90 italic">"{req.message}"</p>
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground"
                                            onClick={() => window.open(`mailto:${req.email}?subject=Re: ${req.subject}`)}
                                        >
                                            <Mail className="h-4 w-4 mr-2" />
                                            Reply via Email
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            Mark as Read
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-muted/20 rounded-[2rem] border border-dashed border-border/60">
                            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Search className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                            <h3 className="text-xl font-semibold">No requests found</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                                {searchTerm ? "Try adjusting your search terms" : "When users send help messages, they will appear here."}
                            </p>
                            {searchTerm && (
                                <Button variant="link" onClick={() => setSearchTerm("")} className="mt-4">
                                    Clear Search
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
