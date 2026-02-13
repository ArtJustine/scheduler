"use client"

import { useState, useEffect } from "react"
import {
    Building2,
    ChevronDown,
    Plus,
    Check,
    Settings,
    MoreVertical
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-provider"
import {
    getUserWorkspaces,
    getActiveWorkspace,
    setActiveWorkspace,
    createWorkspace
} from "@/lib/firebase/workspaces"
import { Workspace } from "@/types/workspace"

export function WorkspaceSwitcher() {
    const { user } = useAuth()
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [activeWorkspace, setActiveWorkspaceData] = useState<Workspace | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newWorkspaceName, setNewWorkspaceName] = useState("")

    useEffect(() => {
        if (user) {
            loadWorkspaces()
        }
    }, [user])

    const loadWorkspaces = async () => {
        if (!user) return
        setIsLoading(true)
        try {
            const all = await getUserWorkspaces(user.uid)
            setWorkspaces(all)

            const active = await getActiveWorkspace(user.uid)
            setActiveWorkspaceData(active)
        } catch (error) {
            console.error("Error loading workspaces:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSwitch = async (id: string) => {
        if (!user || !id) return
        try {
            await setActiveWorkspace(user.uid, id)
            // Refresh state
            const active = workspaces.find(w => w.id === id) || null
            setActiveWorkspaceData(active)
            // Notify components to reload data
            window.dispatchEvent(new CustomEvent('social-accounts-updated'))
            window.location.reload() // Reload to ensure all services fetch from new workspace
        } catch (error) {
            console.error("Error switching workspace:", error)
        }
    }

    const handleCreate = async () => {
        if (!user || !newWorkspaceName.trim()) return
        try {
            const id = await createWorkspace(user.uid, newWorkspaceName)
            setIsCreateOpen(false)
            setNewWorkspaceName("")
            await loadWorkspaces()
            window.location.reload()
        } catch (error) {
            console.error("Error creating workspace:", error)
        }
    }

    if (isLoading && !activeWorkspace) {
        return (
            <div className="flex items-center gap-2 px-6 py-4 animate-pulse">
                <div className="h-8 w-8 rounded bg-muted"></div>
                <div className="h-4 w-24 rounded bg-muted"></div>
            </div>
        )
    }

    return (
        <div className="px-3 mb-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="w-full justify-between h-14 px-4 hover:bg-muted/50 rounded-xl border border-transparent hover:border-border/50 group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col items-start overflow-hidden">
                                <span className="text-sm font-bold truncate">
                                    {activeWorkspace?.name || "Add New Brand"}
                                </span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                    {activeWorkspace ? "Workspace" : "Get Started"}
                                </span>
                            </div>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[280px] p-2" align="start">
                    {workspaces.length > 0 && (
                        <>
                            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-3 py-2">
                                Your Brands
                            </DropdownMenuLabel>
                            <div className="space-y-1">
                                {workspaces.map((w) => (
                                    <DropdownMenuItem
                                        key={w.id}
                                        onClick={() => handleSwitch(w.id)}
                                        className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                                                activeWorkspace?.id === w.id ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"
                                            )}>
                                                <Building2 className="h-4 w-4" />
                                            </div>
                                            <span className={cn(
                                                "text-sm",
                                                activeWorkspace?.id === w.id ? "font-bold" : "font-medium"
                                            )}>
                                                {w.name}
                                            </span>
                                        </div>
                                        {activeWorkspace?.id === w.id && <Check className="h-4 w-4 text-primary" />}
                                    </DropdownMenuItem>
                                ))}
                            </div>
                            <DropdownMenuSeparator className="my-2" />
                        </>
                    )}

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <button
                                className="flex items-center gap-3 w-full p-3 text-sm font-semibold rounded-xl hover:bg-primary/5 text-primary transition-colors text-left"
                                onClick={(e) => {
                                    e.stopPropagation()
                                }}
                            >
                                <Plus className="h-4 w-4" />
                                Add New Brand
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create New Workspace</DialogTitle>
                                <DialogDescription>
                                    Give your new brand/workspace a name. You can connect completely different social accounts here.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Workspace Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. My Awesome Brand"
                                        value={newWorkspaceName}
                                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreate} disabled={!newWorkspaceName.trim()}>Create Workspace</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
