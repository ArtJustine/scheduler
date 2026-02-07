"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowLeft, CalendarIcon, Save } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { getPostById, updatePost } from "@/lib/data-service"
import type { PostType } from "@/types/post"
import { useToast } from "@/components/ui/use-toast"

export default function EditPostPage() {
    const router = useRouter()
    const params = useParams()
    const id = params?.id as string
    const { toast } = useToast()

    const [post, setPost] = useState<PostType | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [scheduledDate, setScheduledDate] = useState<Date | undefined>(new Date())
    const [scheduledTime, setScheduledTime] = useState<string>("09:00")

    useEffect(() => {
        const loadPost = async () => {
            if (!id) return
            try {
                setIsLoading(true)
                const postData = await getPostById(id)
                if (postData) {
                    setPost(postData)
                    setTitle(postData.title || "")
                    setContent(postData.content || "")

                    if (postData.scheduledFor) {
                        const date = new Date(postData.scheduledFor)
                        setScheduledDate(date)
                        setScheduledTime(format(date, "HH:mm"))
                    }
                }
            } catch (error) {
                console.error("Error loading post:", error)
                toast({
                    title: "Error",
                    description: "Failed to load post",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        loadPost()
    }, [id, toast])

    const handleSave = async () => {
        if (!post) return

        try {
            setIsSaving(true)

            const scheduledFor = (() => {
                try {
                    if (!scheduledDate) return new Date().toISOString()
                    const [hours, minutes] = (scheduledTime || "09:00").split(":").map(Number)
                    if (isNaN(hours) || isNaN(minutes)) return new Date().toISOString()

                    const d = new Date(scheduledDate)
                    d.setHours(hours, minutes, 0, 0)
                    return d.toISOString()
                } catch (e) {
                    console.error("Error formatting date:", e)
                    return new Date().toISOString()
                }
            })()

            await updatePost(post.id, {
                title,
                content,
                scheduledFor,
                description: content.substring(0, 100),
            })

            toast({
                title: "Success",
                description: "Post updated successfully",
            })

            router.push(`/dashboard/post/${post.id}`)
        } catch (error) {
            console.error("Error updating post:", error)
            toast({
                title: "Error",
                description: "Failed to update post",
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        )
    }

    if (!post) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">Post Not Found</h2>
                <p className="text-muted-foreground mb-6">The post you're trying to edit doesn't exist.</p>
                <Button onClick={() => router.push("/dashboard")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/post/${post.id}`)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Post</h1>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Post title"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's on your mind?"
                            className="min-h-[300px]"
                        />
                        <div className="text-xs text-muted-foreground text-right">
                            {content.length} characters
                        </div>
                    </div>

                    {post.mediaUrl && (
                        <div className="space-y-2">
                            <Label>Media</Label>
                            <div className="border rounded-lg overflow-hidden">
                                {post.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                    <img
                                        src={post.mediaUrl}
                                        alt="Post media"
                                        className="w-full h-auto max-h-[400px] object-contain"
                                    />
                                ) : (
                                    <video
                                        src={post.mediaUrl}
                                        controls
                                        className="w-full h-auto max-h-[400px] object-contain"
                                    />
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Media cannot be changed after creation
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Scheduled Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !scheduledDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {scheduledDate ? format(scheduledDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={scheduledDate}
                                        onSelect={setScheduledDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="time">Scheduled Time</Label>
                            <Input
                                id="time"
                                type="time"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
