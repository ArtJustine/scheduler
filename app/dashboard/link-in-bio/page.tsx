"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Plus,
    Trash2,
    GripVertical,
    ExternalLink,
    Save,
    Smartphone,
    Globe,
    Palette,
    Layout,
    Share2,
    Eye
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface BioLink {
    id: string
    title: string
    url: string
    enabled: boolean
}

export default function LinkInBioPage() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [username, setUsername] = useState("")
    const [displayName, setDisplayName] = useState("")
    const [bio, setBio] = useState("")
    const [links, setLinks] = useState<BioLink[]>([
        { id: "1", title: "My YouTube Channel", url: "https://youtube.com", enabled: true },
        { id: "2", title: "Latest Product Launch", url: "https://example.com", enabled: true }
    ])

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || "")
            // Generate a default username if not set
            if (!username) {
                setUsername(user.email?.split("@")[0].replace(/[^a-z0-9]/g, "") || "user")
            }
        }
    }, [user])

    const addLink = () => {
        const newLink: BioLink = {
            id: Math.random().toString(36).substr(2, 9),
            title: "New Link",
            url: "https://",
            enabled: true
        }
        setLinks([...links, newLink])
    }

    const removeLink = (id: string) => {
        setLinks(links.filter(l => l.id !== id))
    }

    const updateLink = (id: string, updates: Partial<BioLink>) => {
        setLinks(links.map(l => l.id === id ? { ...l, ...updates } : l))
    }

    const saveProfile = async () => {
        setIsLoading(true)
        // Simulate save
        setTimeout(() => {
            setIsLoading(false)
            alert("Digital identity updated successfully!")
        }, 1000)
    }

    if (!user) return null

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Link-in-Bio</h2>
                    <p className="text-muted-foreground">
                        Manage your digital landing page and connect all your platforms.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={saveProfile} disabled={isLoading}>
                        <Save className="mr-2 h-4 w-4" />
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Editor Side */}
                <div className="lg:col-span-7 space-y-8">
                    <Tabs defaultValue="links" className="w-full">
                        <TabsList className="flex w-fit gap-3 mb-8 bg-muted/50 p-1 rounded-xl">
                            <TabsTrigger value="links" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <Layout className="mr-2 h-4 w-4" />
                                Links
                            </TabsTrigger>
                            <TabsTrigger value="appearance" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <Palette className="mr-2 h-4 w-4" />
                                Appearance
                            </TabsTrigger>
                            <TabsTrigger value="settings" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <Globe className="mr-2 h-4 w-4" />
                                Settings
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="links" className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Your Links</h3>
                                <Button onClick={addLink} size="sm" className="rounded-full">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Link
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {links.map((link) => (
                                    <Card key={link.id} className="overflow-hidden border-border/50 bg-card/30 backdrop-blur-sm group hover:border-primary/30 transition-all">
                                        <CardContent className="p-4 flex items-start gap-4">
                                            <div className="mt-2 text-muted-foreground cursor-grab active:cursor-grabbing">
                                                <GripVertical className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div className="grid gap-2">
                                                    <Input
                                                        value={link.title}
                                                        onChange={(e) => updateLink(link.id, { title: e.target.value })}
                                                        placeholder="Link Title"
                                                        className="font-semibold text-base border-none p-0 h-auto focus-visible:ring-0"
                                                    />
                                                    <Input
                                                        value={link.url}
                                                        onChange={(e) => updateLink(link.id, { url: e.target.value })}
                                                        placeholder="https://your-link.com"
                                                        className="text-sm text-muted-foreground border-none p-0 h-auto focus-visible:ring-0"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={link.enabled}
                                                    onChange={(e) => updateLink(link.id, { enabled: e.target.checked })}
                                                    className="h-4 w-4 rounded border-primary"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeLink(link.id)}
                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="appearance" className="space-y-6">
                            <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle>Profile Customization</CardTitle>
                                    <CardDescription>How you appear to your audience.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center gap-6">
                                        <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-dashed border-primary/40 relative group cursor-pointer">
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                                                <span className="text-[10px] text-white font-bold">CHANGE</span>
                                            </div>
                                            <Badge className="absolute -bottom-1 -right-1">PRO</Badge>
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="grid gap-2">
                                                <Label>Display Name</Label>
                                                <Input
                                                    value={displayName}
                                                    onChange={(e) => setDisplayName(e.target.value)}
                                                    placeholder="Your Name"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Bio</Label>
                                                <Textarea
                                                    value={bio}
                                                    onChange={(e) => setBio(e.target.value)}
                                                    placeholder="Tell your story in a few words..."
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle>Themes</CardTitle>
                                    <CardDescription>Choose a look that fits your brand.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { name: "Default", bg: "bg-slate-900", accent: "bg-primary" },
                                            { name: "Glass", bg: "bg-slate-50", accent: "bg-blue-500" },
                                            { name: "Night", bg: "bg-black", accent: "bg-white" },
                                            { name: "Forest", bg: "bg-emerald-950", accent: "bg-emerald-400" },
                                            { name: "Ocean", bg: "bg-blue-950", accent: "bg-cyan-400" },
                                            { name: "Sunset", bg: "bg-orange-950", accent: "bg-orange-400" },
                                        ].map((theme) => (
                                            <div key={theme.name} className="border border-border/50 rounded-xl p-2 cursor-pointer hover:border-primary transition-all group">
                                                <div className={`aspect-[4/3] rounded-lg ${theme.bg} relative overflow-hidden mb-2`}>
                                                    <div className={`absolute bottom-2 left-2 right-2 h-1 ${theme.accent} rounded-full opacity-50`} />
                                                    <div className={`absolute bottom-5 left-2 right-2 h-1 ${theme.accent} rounded-full opacity-30`} />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary">{theme.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="settings" className="space-y-6">
                            <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle>Global Settings</CardTitle>
                                    <CardDescription>Domain and SEO configuration.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label>Your Chiyu Handle</Label>
                                        <div className="flex items-center">
                                            <span className="bg-muted px-3 py-2 rounded-l-md border border-r-0 text-muted-foreground text-sm font-medium">chiyu.io/u/</span>
                                            <Input
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))}
                                                className="rounded-l-none"
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">This is your permanent public address.</p>
                                    </div>

                                    <div className="p-4 border border-primary/20 bg-primary/5 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Share2 className="text-primary h-5 w-5" />
                                            <div>
                                                <p className="text-sm font-bold">Public Shareable Link</p>
                                                <p className="text-xs text-muted-foreground">https://chiyu.io/u/{username}</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="ghost">Copy Link</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Preview Side */}
                <div className="lg:col-span-5 relative">
                    <div className="sticky top-24">
                        <div className="flex justify-center mb-4">
                            <Badge variant="outline" className="rounded-full px-4 py-1 flex items-center gap-2 border-primary/20 bg-primary/5 text-primary">
                                <Smartphone className="h-3 w-3" />
                                Live Preview
                            </Badge>
                        </div>

                        <div className="relative mx-auto w-full max-w-[300px] aspect-[9/19] bg-slate-950 rounded-[3rem] border-8 border-slate-900 shadow-2xl p-6 overflow-hidden flex flex-col">
                            {/* Device Top Bar */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20 flex items-center justify-center gap-1">
                                <div className="w-10 h-1 bg-white/10 rounded-full" />
                            </div>

                            <div className="relative z-10 flex flex-col items-center flex-1">
                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-purple-500 mb-4 shadow-xl border-4 border-slate-900" />
                                <h4 className="text-lg font-bold text-white mb-1">{displayName || "Your Name"}</h4>
                                <p className="text-xs text-slate-400 mb-8 text-center">{bio || "Add a bio to tell the world about yourself"}</p>

                                <div className="w-full space-y-3">
                                    {links.filter(l => l.enabled).map(link => (
                                        <div key={link.id} className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded-2xl text-center text-sm font-semibold text-white hover:scale-[1.02] transition-transform duration-300">
                                            {link.title || "Untitled Link"}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto pt-8 flex gap-4 opacity-50">
                                    <div className="h-4 w-4 bg-white/20 rounded-full" />
                                    <div className="h-4 w-4 bg-white/20 rounded-full" />
                                    <div className="h-4 w-4 bg-white/20 rounded-full" />
                                </div>
                                <div className="mt-4 text-[8px] font-bold text-slate-600 uppercase tracking-widest flex items-center opacity-50">
                                    Powered by <span className="ml-1 text-primary">Chiyu</span>
                                </div>
                            </div>

                            {/* Decorative background in phone */}
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 to-transparent -z-10" />
                        </div>

                        <div className="mt-8 flex justify-center gap-4">
                            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                                <Smartphone className="mr-2 h-3 w-3" />
                                Mobile View
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
