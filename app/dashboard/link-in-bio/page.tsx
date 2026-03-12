"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { getUserBioProfile, saveBioProfile, isUsernameAvailable, type BioLink } from "@/lib/firebase/link-in-bio"
import { toast } from "sonner"
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
    Eye,
    Heading1,
    Heading2,
    Link as LinkIcon
} from "lucide-react"
import { getSocialAccounts } from "@/lib/data-service"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableLinkItem({ id, children }: { id: string, children: (props: any) => React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 50 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            {children({ listeners, attributes })}
        </div>
    );
}

export default function LinkInBioPage() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [username, setUsername] = useState("")
    const [displayName, setDisplayName] = useState("")
    const [bio, setBio] = useState("")
    const [socialAccounts, setSocialAccounts] = useState<any>(null)
    const [theme, setTheme] = useState("Default")
    const [links, setLinks] = useState<BioLink[]>([
        { id: "1", title: "My YouTube Channel", url: "https://youtube.com", enabled: true, type: "link", layout: "classic" },
        { id: "2", title: "Latest Product Launch", url: "https://example.com", enabled: true, type: "link", layout: "classic" }
    ])

    useEffect(() => {
        const loadProfile = async () => {
            if (!user) return
            
            try {
                const accounts = await getSocialAccounts(user.uid)
                setSocialAccounts(accounts)
            } catch (err) { }
            
            try {
                const profile = await getUserBioProfile(user.uid)
                if (profile) {
                    setUsername(profile.username || "")
                    setDisplayName(profile.displayName || "")
                    setBio(profile.bio || "")
                    setTheme(profile.theme || "Default")
                    if (profile.links && profile.links.length > 0) {
                        setLinks(profile.links)
                    }
                } else {
                    setDisplayName(user.displayName || "")
                    if (!username) {
                        setUsername(user.email?.split("@")[0].replace(/[^a-z0-9]/g, "") || "user")
                    }
                }
            } catch (error) {
                console.error("Failed to load bio profile", error)
                toast.error("Failed to load your profile data")
            }
        }
        
        loadProfile()
    }, [user])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setLinks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const addBlock = (type: 'link' | 'heading' | 'subheading' | 'social') => {
        let defaultUrl = "https://"
        if (type === 'social') {
            if (socialAccounts?.instagram?.username) defaultUrl = `https://instagram.com/${socialAccounts.instagram.username}`
            else if (socialAccounts?.youtube?.id) defaultUrl = `https://youtube.com/channel/${socialAccounts.youtube.id}`
            else if (socialAccounts?.tiktok?.username) defaultUrl = `https://tiktok.com/@${socialAccounts.tiktok.username}`
        }

        const newLink: BioLink = {
            id: Math.random().toString(36).substr(2, 9),
            title: type === 'heading' ? "My Heading" : type === 'subheading' ? "My Subheading" : type === 'social' ? 'instagram' : "New Link",
            url: type === 'social' ? defaultUrl : (type === 'link' ? "https://" : ""),
            enabled: true,
            type: type,
            platform: type === 'social' ? 'instagram' : undefined,
            layout: type === 'link' ? 'classic' : 'center',
            backgroundColor: type === 'link' ? '#ffffff' : undefined,
            fontColor: '#000000'
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
        if (!user) return
        if (!username) {
            toast.error("Please set a username")
            return
        }
        
        setIsLoading(true)
        try {
            const available = await isUsernameAvailable(username, user.uid)
            if (!available) {
                toast.error("This username is already taken. Please choose another.")
                setIsLoading(false)
                return
            }
            
            await saveBioProfile(user.uid, {
                username,
                displayName,
                bio,
                theme,
                links,
                profileImage: user.photoURL || null
            })
            toast.success("Digital identity updated successfully!")
        } catch (error) {
            console.error("Failed to save bio profile", error)
            toast.error("Something went wrong saving your profile")
        } finally {
            setIsLoading(false)
        }
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
                                <h3 className="text-lg font-semibold">Your Content</h3>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="sm" className="rounded-full">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Block
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => addBlock('link')}>
                                            <LinkIcon className="mr-2 h-4 w-4" /> Link
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => addBlock('heading')}>
                                            <Heading1 className="mr-2 h-4 w-4" /> Heading
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => addBlock('subheading')}>
                                            <Heading2 className="mr-2 h-4 w-4" /> Subheading
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => addBlock('social')}>
                                            <Share2 className="mr-2 h-4 w-4" /> Social Icon
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="space-y-4">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={links.map(l => l.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {links.map((link) => (
                                            <SortableLinkItem key={link.id} id={link.id}>
                                                {({ listeners, attributes }) => (
                                                    <Card className="overflow-hidden border-border/50 bg-card/30 backdrop-blur-sm group hover:border-primary/30 transition-all">
                                                        <CardContent className="p-4 flex items-start gap-4">
                                                            <div 
                                                                className="mt-2 text-muted-foreground cursor-grab active:cursor-grabbing hover:text-primary transition-colors focus:outline-none rounded -ml-1 px-1 touch-none"
                                                                {...listeners}
                                                                {...attributes}
                                                            >
                                                                <GripVertical className="h-5 w-5" />
                                                            </div>
                                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="secondary" className="text-[10px] uppercase font-bold">{link.type || 'link'}</Badge>
                                                </div>
                                                
                                                {(link.type === 'heading' || link.type === 'subheading') && (
                                                    <div className="grid gap-4">
                                                        <Input
                                                            value={link.title}
                                                            onChange={(e) => updateLink(link.id, { title: e.target.value })}
                                                            placeholder={link.type === 'heading' ? "Heading Text" : "Subheading Text"}
                                                            className={`${link.type === 'heading' ? 'font-bold text-xl' : 'font-semibold text-lg'} border-none p-0 h-auto focus-visible:ring-0`}
                                                        />
                                                        <div className="flex gap-4 items-center">
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Alignment</Label>
                                                                <select 
                                                                    className="w-full text-sm rounded bg-background border p-1"
                                                                    value={link.layout || 'center'}
                                                                    onChange={(e) => updateLink(link.id, { layout: e.target.value })}
                                                                >
                                                                    <option value="left">Left</option>
                                                                    <option value="center">Center</option>
                                                                    <option value="right">Right</option>
                                                                </select>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Font Color</Label>
                                                                <div className="flex items-center gap-2">
                                                                    <input type="color" className="h-6 w-6 rounded border-0 p-0" value={link.fontColor || '#ffffff'} onChange={(e) => updateLink(link.id, { fontColor: e.target.value })} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {link.type === 'social' && (
                                                    <div className="grid gap-4">
                                                        <div className="flex gap-2">
                                                            <select 
                                                                className="w-1/3 text-sm rounded bg-background border p-1"
                                                                value={link.platform || 'instagram'}
                                                                onChange={(e) => updateLink(link.id, { platform: e.target.value, title: e.target.value })}
                                                            >
                                                                <option value="instagram">Instagram</option>
                                                                <option value="youtube">YouTube</option>
                                                                <option value="tiktok">TikTok</option>
                                                                <option value="threads">Threads</option>
                                                                <option value="linkedin">LinkedIn</option>
                                                                <option value="facebook">Facebook</option>
                                                                <option value="pinterest">Pinterest</option>
                                                                <option value="bluesky">BlueSky</option>
                                                                <option value="twitter">X (Twitter)</option>
                                                            </select>
                                                            <Input
                                                                value={link.url}
                                                                onChange={(e) => updateLink(link.id, { url: e.target.value })}
                                                                placeholder="https://social.com/username"
                                                                className="text-sm border-none p-1 h-auto flex-1 focus-visible:ring-0"
                                                            />
                                                        </div>
                                                        <div className="flex gap-4 items-center">
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Icon Color</Label>
                                                                <div className="flex items-center gap-2">
                                                                    <input type="color" className="h-6 w-6 rounded border-0 p-0" value={link.fontColor || '#ffffff'} onChange={(e) => updateLink(link.id, { fontColor: e.target.value })} />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Background</Label>
                                                                <div className="flex items-center gap-2">
                                                                    <input type="color" className="h-6 w-6 rounded border-0 p-0" value={link.backgroundColor || '#000000'} onChange={(e) => updateLink(link.id, { backgroundColor: e.target.value })} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {(!link.type || link.type === 'link') && (
                                                    <div className="grid gap-4">
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
                                                        <div className="flex gap-4 items-center">
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Layout</Label>
                                                                <select 
                                                                    className="w-full text-sm rounded bg-background border p-1"
                                                                    value={link.layout || 'classic'}
                                                                    onChange={(e) => updateLink(link.id, { layout: e.target.value })}
                                                                >
                                                                    <option value="classic">Classic (Outline)</option>
                                                                    <option value="solid">Solid Block</option>
                                                                </select>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Text</Label>
                                                                <div className="flex items-center gap-2">
                                                                    <input type="color" className="h-6 w-6 rounded border-0 p-0" value={link.fontColor || '#000000'} onChange={(e) => updateLink(link.id, { fontColor: e.target.value })} />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Background</Label>
                                                                <div className="flex items-center gap-2">
                                                                    <input type="color" className="h-6 w-6 rounded border-0 p-0" value={link.backgroundColor || '#ffffff'} onChange={(e) => updateLink(link.id, { backgroundColor: e.target.value })} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
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
                                                )}
                                            </SortableLinkItem>
                                        ))}
                                    </SortableContext>
                                </DndContext>
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
                                        ].map((t) => (
                                                <div 
                                                    key={t.name} 
                                                    className={`border rounded-xl p-2 cursor-pointer hover:border-primary transition-all group ${theme === t.name ? 'border-primary ring-2 ring-primary/20' : 'border-border/50'}`}
                                                    onClick={() => setTheme(t.name)}
                                                >
                                                    <div className={`aspect-[4/3] rounded-lg ${t.bg} relative overflow-hidden mb-2`}>
                                                        <div className={`absolute bottom-2 left-2 right-2 h-1 ${t.accent} rounded-full opacity-50`} />
                                                        <div className={`absolute bottom-5 left-2 right-2 h-1 ${t.accent} rounded-full opacity-30`} />
                                                    </div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === t.name ? 'text-primary' : 'text-muted-foreground'} group-hover:text-primary`}>
                                                        {t.name}
                                                    </span>
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
                                        <Button 
                                            size="sm" 
                                            variant="ghost"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`https://chiyusocial.com/u/${username}`)
                                                toast.success("Link copied to clipboard!")
                                            }}
                                        >
                                            Copy Link
                                        </Button>
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

                        <div className={`relative mx-auto w-full max-w-[300px] aspect-[9/19] ${
                                theme === 'Glass' ? 'bg-slate-50' :
                                theme === 'Night' ? 'bg-black' :
                                theme === 'Forest' ? 'bg-emerald-950' :
                                theme === 'Ocean' ? 'bg-blue-950' : 
                                theme === 'Sunset' ? 'bg-orange-950' :
                                'bg-slate-950'
                            } rounded-[3rem] border-8 border-slate-900 shadow-2xl p-6 overflow-hidden flex flex-col`}>
                            {/* Device Top Bar */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20 flex items-center justify-center gap-1">
                                <div className="w-10 h-1 bg-white/10 rounded-full" />
                            </div>

                            <div className="relative z-10 flex flex-col items-center flex-1">
                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-purple-500 mb-4 shadow-xl border-4 border-slate-900" />
                                <h4 className="text-lg font-bold text-white mb-1">{displayName || "Your Name"}</h4>
                                <p className="text-xs text-slate-400 mb-8 text-center">{bio || "Add a bio to tell the world about yourself"}</p>

                                <div className="w-full space-y-3">
                                    {links.filter(l => l.enabled).map(link => {
                                        if (link.type === 'heading' || link.type === 'subheading') {
                                            return (
                                                <div 
                                                    key={link.id} 
                                                    className="w-full"
                                                    style={{ 
                                                        textAlign: link.layout as any || 'center',
                                                        color: link.fontColor || '#ffffff',
                                                        fontWeight: link.type === 'heading' ? 'bold' : '600',
                                                        fontSize: link.type === 'heading' ? '1.25rem' : '1rem',
                                                        marginTop: link.type === 'heading' ? '1.5rem' : '0.5rem'
                                                    }}
                                                >
                                                    {link.title}
                                                </div>
                                            )
                                        }

                                        if (link.type === 'social') {
                                            return (
                                                <a 
                                                    key={link.id}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold hover:scale-[1.02] transition-transform duration-300"
                                                    style={{
                                                        backgroundColor: link.backgroundColor || '#000000',
                                                        color: link.fontColor || '#ffffff',
                                                    }}
                                                >
                                                    <Share2 className="h-4 w-4" />
                                                    <span className="capitalize">{link.platform || 'Social'}</span>
                                                </a>
                                            )
                                        }

                                        return (
                                            <a 
                                                key={link.id} 
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`w-full py-3 px-4 rounded-2xl text-center text-sm font-semibold hover:scale-[1.02] transition-transform duration-300 block ${link.layout === 'solid' ? '' : 'border border-white/10 bg-white/5'}`}
                                                style={link.layout === 'solid' ? {
                                                    backgroundColor: link.backgroundColor || '#ffffff',
                                                    color: link.fontColor || '#000000'
                                                } : {
                                                    color: link.fontColor || '#ffffff'
                                                }}
                                            >
                                                {link.title || "Untitled Link"}
                                            </a>
                                        )
                                    })}
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
