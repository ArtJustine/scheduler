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
import { updateUserProfile, getUserProfile } from "@/lib/firebase/auth"
import { useTheme } from "next-themes"
import { Sun, Moon, Laptop, ShieldCheck, Activity, RefreshCw, ExternalLink, Info } from "lucide-react"
import { getSocialAccounts } from "@/lib/firebase/social-accounts"
import type { SocialAccounts } from "@/types/social"
import { useRouter, useSearchParams } from "next/navigation"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [name, setName] = useState(user?.displayName || "")
  const [email, setEmail] = useState(user?.email || "")
  const [niche, setNiche] = useState(user?.niche || "")
  const [competitors, setCompetitors] = useState<string[]>(user?.trendCompetitors || [])
  const { theme, setTheme } = useTheme()
  const [currentTheme, setCurrentTheme] = useState(theme)
  const [socialAccounts, setSocialAccounts] = useState<SocialAccounts>({})
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "profile"


  useEffect(() => {
    const loadSocialAccounts = async () => {
      try {
        const accounts = await getSocialAccounts()
        setSocialAccounts(accounts)
      } catch (error) {
        console.error("Error loading social accounts:", error)
      }
    }

    loadSocialAccounts()
  }, [])

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setName(user.displayName || "")
        setEmail(user.email || "")
        try {
          const profile: any = await getUserProfile()
          if (profile) {
            setNiche(profile.niche || "")
            setCompetitors(profile.trendCompetitors || [])
          }
        } catch (error) {
          console.error("Error loading user profile:", error)
        }
      }
    }
    loadProfile()
  }, [user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      await updateUserProfile({ 
        displayName: name, 
        niche, 
        trendCompetitors: competitors.filter(c => c.trim() !== "") 
      })
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating your profile.",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
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

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <form onSubmit={handleProfileUpdate}>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
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
        </TabsContent>

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

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications about your scheduled posts
                  </p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="post-reminders">Post Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminders before your posts are scheduled to go live
                  </p>
                </div>
                <Switch id="post-reminders" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics-updates">Analytics Updates</Label>
                  <p className="text-sm text-muted-foreground">Receive weekly analytics updates for your posts</p>
                </div>
                <Switch id="analytics-updates" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Connections</CardTitle>
              <CardDescription>Connect your social media accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                    IG
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
                  <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center text-white font-bold">
                    TT
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
                  <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                    YT
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
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <form onSubmit={handleProfileUpdate}>
              <CardHeader>
                <CardTitle>Trends Configuration</CardTitle>
                <CardDescription>Configure how we find trends for you using AI.</CardDescription>
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
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Trends Config"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

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
                <Badge className="bg-primary text-white hover:bg-primary/90 rounded-full px-3">
                  Vercel Pro Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-border/50 space-y-3">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    Vercel Cron Status
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your Vercel Pro account enables minute-by-minute scheduling. We've configured your app to check for due posts every 60 seconds.
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="font-mono text-[10px]">*/1 * * * *</Badge>
                    <Badge variant="secondary" className="font-mono text-[10px]">300s Timeout</Badge>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-border/50 space-y-3">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <RefreshCw className="h-5 w-5 text-blue-500" />
                    Manual Control
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Need to push posts immediately? You can manually trigger the scheduler without waiting for the next cron cycle.
                  </p>
                  <Button 
                    className="w-full shadow-sm rounded-xl"
                    onClick={async () => {
                      setIsUpdating(true);
                      try {
                        const res = await fetch('/api/cron/scheduler?secret=Artgwapito!1');
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
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/cron/scheduler?secret=Artgwapito!1`} 
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-xl"
                      onClick={() => {
                        const url = `${window.location.origin}/api/cron/scheduler?secret=Artgwapito!1`;
                        navigator.clipboard.writeText(url);
                        toast({ title: "Copied!", description: "Webhook URL copied to clipboard." });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>Security Note:</strong> The scheduler secret identifies your account. Only provide this URL to trusted services like Vercel Cron.
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary rounded-xl">
                    <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">
                      View Logs in Vercel <ExternalLink className="h-3 w-3 ml-1" />
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
