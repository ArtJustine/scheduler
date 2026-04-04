"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-provider"
import { updateUserProfile } from "@/lib/firebase/auth"
import { useTheme } from "next-themes"
import { Sun, Moon, Laptop, ShieldCheck, Activity, RefreshCw, ExternalLink, Info, AlertCircle, Github } from "lucide-react"
import { getSocialAccounts } from "@/lib/firebase/social-accounts"
import { getActiveWorkspace, deleteWorkspace, updateWorkspaceSettings } from "@/lib/firebase/workspaces"
import type { SocialAccounts } from "@/types/social"
import type { WorkspaceSettings } from "@/types/workspace"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)
  const [name, setName] = useState(user?.displayName || "")
  const [email, setEmail] = useState(user?.email || "")
  const [activeWorkspace, setActiveWorkspace] = useState<any>(null)
  const { theme, setTheme } = useTheme()
  const [socialAccounts, setSocialAccounts] = useState<SocialAccounts>({})

  // Workspace-scoped settings
  const [niche, setNiche] = useState("")
  const [competitors, setCompetitors] = useState<string[]>([])
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifPostReminders, setNotifPostReminders] = useState(true)
  const [notifAnalytics, setNotifAnalytics] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "profile"

  useEffect(() => {
    const loadData = async () => {
      if (!user) return
      try {
        const [accounts, ws] = await Promise.all([
          getSocialAccounts(),
          getActiveWorkspace(user.uid),
        ])
        setSocialAccounts(accounts)
        setActiveWorkspace(ws)

        if (ws?.settings) {
          setNiche(ws.settings.niche || "")
          setCompetitors(ws.settings.trendCompetitors || [])
          setNotifEmail(ws.settings.notifications?.email ?? true)
          setNotifPostReminders(ws.settings.notifications?.postReminders ?? true)
          setNotifAnalytics(ws.settings.notifications?.analyticsUpdates ?? false)
        }
      } catch (error) {
        console.error("Error loading settings data:", error)
      }
    }

    loadData()
  }, [user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      await updateUserProfile({ displayName: name })
      toast({ title: "Profile updated", description: "Your profile has been updated successfully." })
    } catch (error) {
      toast({ variant: "destructive", title: "Update failed", description: "There was a problem updating your profile." })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleTrendsConfigSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeWorkspace) {
      toast({ variant: "destructive", title: "No workspace", description: "No active workspace found." })
      return
    }
    setIsUpdating(true)
    try {
      await updateWorkspaceSettings(activeWorkspace.id, {
        niche,
        trendCompetitors: competitors.filter(c => c.trim() !== ""),
      })
      toast({ title: "Trends config saved", description: "Saved for this workspace." })
    } catch (error) {
      toast({ variant: "destructive", title: "Save failed", description: "Could not save trends configuration." })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleNotificationsSave = async () => {
    if (!activeWorkspace) {
      toast({ variant: "destructive", title: "No workspace", description: "No active workspace found." })
      return
    }
    setIsSavingNotifications(true)
    try {
      await updateWorkspaceSettings(activeWorkspace.id, {
        notifications: {
          email: notifEmail,
          postReminders: notifPostReminders,
          analyticsUpdates: notifAnalytics,
        },
      })
      toast({ title: "Preferences saved", description: "Notification preferences updated for this workspace." })
    } catch (error) {
      toast({ variant: "destructive", title: "Save failed", description: "Could not save notification preferences." })
    } finally {
      setIsSavingNotifications(false)
    }
  }

  const handleDeleteWorkspace = async () => {
    if (!activeWorkspace) return
    setIsDeleting(true)
    try {
      await deleteWorkspace(activeWorkspace.id)
      toast({ title: "Workspace deleted", description: "Your workspace has been permanently removed." })
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      toast({ variant: "destructive", title: "Delete failed", description: "There was a problem deleting your workspace." })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
          {activeWorkspace && (
            <span className="ml-2 text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Workspace: {activeWorkspace.name}
            </span>
          )}
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-border/50">
          <TabsTrigger
            value="profile"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            Account
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            Appearance
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="connections"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            Connections
          </TabsTrigger>
          <TabsTrigger
            value="trends"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            Trends Config
          </TabsTrigger>
          <TabsTrigger
            value="scheduler"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            Scheduler
          </TabsTrigger>
        </TabsList>

        {/* ── Profile ── */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <form onSubmit={handleProfileUpdate}>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal display name</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} disabled />
                  <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* ── Account ── */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Change Password</Button>
            </CardFooter>
          </Card>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Destructive actions for your workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-destructive/20 bg-white/50 dark:bg-black/20">
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">Delete this workspace</p>
                  <p className="text-sm text-muted-foreground">
                    All your posts, media, and connections in <strong>{activeWorkspace?.name || "this workspace"}</strong> will be permanently deleted.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="rounded-xl" disabled={!activeWorkspace || isDeleting}>
                      {isDeleting ? "Deleting..." : "Delete Workspace"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the
                        <strong> {activeWorkspace?.name} </strong> workspace and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteWorkspace}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        Delete Permanently
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Appearance ── */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the appearance of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <Button
                      type="button"
                      variant={theme === "light" ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setTheme("light")}
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </Button>
                    <Button
                      type="button"
                      variant={theme === "dark" ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setTheme("dark")}
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </Button>
                    <Button
                      type="button"
                      variant={theme === "system" ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setTheme("system")}
                    >
                      <Laptop className="h-4 w-4 mr-2" />
                      System
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Notifications — workspace-scoped ── */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage notifications for{" "}
                <span className="font-semibold text-foreground">{activeWorkspace?.name || "this workspace"}</span>.
                Each workspace has its own notification settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications about your scheduled posts
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifEmail}
                  onCheckedChange={setNotifEmail}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="post-reminders">Post Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminders before your posts are scheduled to go live
                  </p>
                </div>
                <Switch
                  id="post-reminders"
                  checked={notifPostReminders}
                  onCheckedChange={setNotifPostReminders}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics-updates">Analytics Updates</Label>
                  <p className="text-sm text-muted-foreground">Receive weekly analytics updates for your posts</p>
                </div>
                <Switch
                  id="analytics-updates"
                  checked={notifAnalytics}
                  onCheckedChange={setNotifAnalytics}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleNotificationsSave} disabled={isSavingNotifications || !activeWorkspace}>
                {isSavingNotifications ? "Saving..." : "Save Preferences"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ── Connections ── */}
        <TabsContent value="connections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Connections</CardTitle>
              <CardDescription>
                Connections for{" "}
                <span className="font-semibold text-foreground">{activeWorkspace?.name || "this workspace"}</span>.
                Each workspace has its own set of connected accounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-black/5 overflow-hidden p-2 shadow-sm">
                    <img src="/instagram.webp" alt="Instagram" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="font-medium">Instagram</p>
                    <p className="text-sm text-muted-foreground">
                      {socialAccounts?.instagram
                        ? `Connected as ${socialAccounts.instagram.username}`
                        : "Not connected"}
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => router.push("/dashboard/connections")}>
                  {socialAccounts?.instagram ? "Manage" : "Connect"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-black/5 overflow-hidden p-2 shadow-sm">
                    <img src="/tiktok.webp" alt="TikTok" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="font-medium">TikTok</p>
                    <p className="text-sm text-muted-foreground">
                      {socialAccounts?.tiktok ? `Connected as ${socialAccounts.tiktok.username}` : "Not connected"}
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => router.push("/dashboard/connections")}>
                  {socialAccounts?.tiktok ? "Manage" : "Connect"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-black/5 overflow-hidden p-2 shadow-sm">
                    <img src="/youtube.webp" alt="YouTube" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="font-medium">YouTube</p>
                    <p className="text-sm text-muted-foreground">
                      {socialAccounts?.youtube ? `Connected as ${socialAccounts.youtube.username}` : "Not connected"}
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => router.push("/dashboard/connections")}>
                  {socialAccounts?.youtube ? "Manage" : "Connect"}
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Connecting your accounts allows for direct posting and analytics tracking.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ── Trends Config — workspace-scoped ── */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <form onSubmit={handleTrendsConfigSave}>
              <CardHeader>
                <CardTitle>Trends Configuration</CardTitle>
                <CardDescription>
                  AI trends config for{" "}
                  <span className="font-semibold text-foreground">{activeWorkspace?.name || "this workspace"}</span>.
                  Each workspace tracks its own niche and competitors independently.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="trends-niche">My Niche / Industry</Label>
                  <Input
                    id="trends-niche"
                    placeholder="e.g. Minimalist Interior Design, AI Tech, Fitness Coaching"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">The primary topic you want to track.</p>
                </div>

                <div className="space-y-4">
                  <Label>Competitor References (Links/Handles)</Label>
                  <p className="text-sm text-muted-foreground">Add links to websites or social media pages you want AI to analyze as competition.</p>

                  <div className="space-y-3">
                    {competitors.map((comp, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="e.g. youtube.com/c/competitor or @competitor"
                          value={comp}
                          onChange={(e) => {
                            const newComps = [...competitors]
                            newComps[index] = e.target.value
                            setCompetitors(newComps)
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => setCompetitors(competitors.filter((_, i) => i !== index))}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed"
                      onClick={() => setCompetitors([...competitors, ""])}
                    >
                      + Add Reference Link
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdating || !activeWorkspace}>
                  {isUpdating ? "Saving..." : "Save Trends Config"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* ── Scheduler — GitHub Actions ── */}
        <TabsContent value="scheduler" className="space-y-6">
          <Card className="overflow-hidden border-primary/10">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Automated Scheduling
                  </CardTitle>
                  <CardDescription>Configure and monitor your automated posting pipeline.</CardDescription>
                </div>
                <Badge className="bg-green-600 text-white hover:bg-green-700 rounded-full px-3 flex items-center gap-1.5">
                  <Github className="h-3.5 w-3.5" />
                  GitHub Actions
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-border/50 space-y-3">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    Cron Status
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Scheduling is powered by a GitHub Actions workflow that triggers every 5 minutes — compatible with all plans, no Vercel Pro required.
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="font-mono text-[10px]">*/5 * * * *</Badge>
                    <Badge variant="secondary" className="font-mono text-[10px]">GitHub Actions</Badge>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-border/50 space-y-3">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <RefreshCw className="h-5 w-5 text-blue-500" />
                    Manual Control
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Need to push posts immediately? Trigger the scheduler right now without waiting for the next cron cycle.
                  </p>
                  <Button
                    className="w-full shadow-sm rounded-xl"
                    onClick={async () => {
                      setIsUpdating(true);
                      try {
                        const secret = process.env.NEXT_PUBLIC_CRON_SECRET || ""
                        const res = await fetch(`/api/cron/scheduler${secret ? `?secret=${secret}` : ""}`)
                        const data = await res.json();
                        if (data.success) {
                          toast({ title: "Scheduler Success", description: data.message });
                        } else {
                          toast({ title: "Scheduler Failed", description: data.error, variant: "destructive" });
                        }
                      } catch (e) {
                        toast({ title: "Error", description: "Could not reach the scheduler API.", variant: "destructive" });
                      } finally {
                        setIsUpdating(false);
                      }
                    }}
                    disabled={isUpdating}
                  >
                    {isUpdating ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Activity className="h-4 w-4 mr-2" />}
                    Run Scheduler Now
                  </Button>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Scheduler Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      className="font-mono text-xs bg-muted/30 rounded-xl"
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/cron/scheduler`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => {
                        const url = `${window.location.origin}/api/cron/scheduler`;
                        navigator.clipboard.writeText(url);
                        toast({ title: "Copied!", description: "Webhook URL copied to clipboard." });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>GitHub Actions Setup:</strong> The workflow at{" "}
                      <code className="font-mono bg-blue-100 dark:bg-blue-900/50 px-1 rounded">.github/workflows/cron-scheduler.yml</code>{" "}
                      pings this endpoint every 5 minutes using your <code className="font-mono bg-blue-100 dark:bg-blue-900/50 px-1 rounded">CRON_SECRET</code>{" "}
                      stored as a GitHub Actions secret.
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary rounded-xl">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                      View GitHub Actions Logs <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
