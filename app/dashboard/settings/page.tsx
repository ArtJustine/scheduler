"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-provider"
import { updateUserProfile } from "@/lib/firebase/auth"
import { useTheme } from "next-themes"
import { Sun, Moon, Laptop, Copy, ExternalLink, Clock, ShieldCheck, Check, AlertCircle } from "lucide-react"
import { getSocialAccounts } from "@/lib/firebase/social-accounts"
import type { SocialAccounts } from "@/types/social"
import { useRouter } from "next/navigation"
import { config } from "@/lib/config"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [name, setName] = useState(user?.displayName || "")
  const [email, setEmail] = useState(user?.email || "")
  const { theme, setTheme } = useTheme()
  const [currentTheme, setCurrentTheme] = useState(theme)
  const [socialAccounts, setSocialAccounts] = useState<SocialAccounts>({})
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const cronUrl = `${config.app.baseUrl}/api/cron/scheduler?secret=${config.app.cronSecret}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(cronUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "URL Copied",
        description: "The scheduler URL has been copied to your clipboard.",
      })
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

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
    if (user) {
      setName(user.displayName || "")
      setEmail(user.email || "")
    }
  }, [user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      await updateUserProfile({ displayName: name })
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

      <Tabs defaultValue="profile" className="space-y-6">
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

        <TabsContent value="scheduler" className="space-y-6">
          <Card className="border-primary/20 shadow-sm overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Clock className="w-24 h-24" />
            </div>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>Cron-job.org Integration</CardTitle>
              </div>
              <CardDescription>
                Schedule your posts using an external cron service to bypass Vercel Hobby plan limitations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-border/50">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                  Your Scheduler Webhook URL
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={cronUrl}
                      readOnly
                      className="pr-10 bg-background font-mono text-sm border-primary/20 focus-visible:ring-primary/30"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {config.app.cronSecret === "development" ? (
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  <Button
                    variant={copied ? "default" : "outline"}
                    size="icon"
                    onClick={copyToClipboard}
                    className="shrink-0 transition-all duration-300"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                {config.app.cronSecret === "development" && (
                  <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Using default secret. Set CRON_SECRET in your environment variables for better security.
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  How to setup with Cron-job.org
                </h3>
                <div className="grid gap-3">
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </div>
                    <p className="text-sm">
                      Create a free account at{" "}
                      <a
                        href="https://cron-job.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        cron-job.org
                      </a>
                    </p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </div>
                    <p className="text-sm">
                      Click <span className="font-semibold">"Create Cronjob"</span> and paste the URL above.
                    </p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </div>
                    <p className="text-sm">
                      Set the execution interval (e.g., <span className="font-semibold">every 1 minute</span> or 5
                      minutes).
                    </p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </div>
                    <p className="text-sm">
                      Save the cronjob. Your posts will now be published automatically even on the Vercel Hobby plan.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-border/50 px-6 py-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-primary transition-colors pl-0"
                onClick={() => window.open(cronUrl, "_blank")}
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Test Webhook Manually
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
