"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-provider"
import { updateUserProfile, updateUserAvatar } from "@/lib/firebase/auth"
import { getUserStats } from "@/lib/firebase/stats"
import { Loader2, Upload } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [name, setName] = useState(user?.displayName || "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.photoURL || null)
  const [stats, setStats] = useState({
    totalPosts: 0,
    scheduledPosts: 0,
    publishedPosts: 0,
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const userStats = await getUserStats()
        setStats(userStats)
      } catch (error) {
        console.error("Error loading user stats:", error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    loadStats()
  }, [])

  useEffect(() => {
    if (user) {
      setName(user.displayName || "")
      setAvatarPreview(user.photoURL || null)
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return

    setIsUploading(true)

    try {
      const photoURL = await updateUserAvatar(avatarFile)
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      })
      setAvatarPreview(photoURL)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was a problem uploading your profile picture.",
      })
    } finally {
      setIsUploading(false)
      setAvatarFile(null)
    }
  }

  const initials = name
    ? name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and account</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
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
              value="billing"
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              Billing
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
                    <Input id="email" type="email" value={user?.email || ""} disabled />
                    <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
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

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Plan</CardTitle>
                <CardDescription>Manage your subscription and billing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Free Plan</p>
                      <p className="text-sm text-muted-foreground">Basic features with limited posts</p>
                    </div>
                    <Button variant="outline">Upgrade</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Plan Features</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Up to 10 scheduled posts per month</li>
                    <li>Basic analytics</li>
                    <li>Single user account</li>
                    <li>Manual posting only</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your profile picture</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview || undefined} alt={name} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-2 w-full">
                <Label htmlFor="avatar" className="sr-only">
                  Choose profile picture
                </Label>
                <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="w-full" />
                {avatarFile && (
                  <Button onClick={handleAvatarUpload} disabled={isUploading} className="w-full">
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
              <CardDescription>Your account activity</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Posts</span>
                    <span className="font-medium">{stats.totalPosts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scheduled</span>
                    <span className="font-medium">{stats.scheduledPosts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Published</span>
                    <span className="font-medium">{stats.publishedPosts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Created</span>
                    <span className="font-medium">
                      {user?.metadata.creationTime
                        ? new Date(user.metadata.creationTime).toLocaleDateString()
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
