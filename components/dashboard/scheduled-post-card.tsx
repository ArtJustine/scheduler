"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import type { PostType } from "@/types/post"
import { Badge } from "@/components/ui/badge"
import { getPlatformColor } from "@/lib/utils"
import Link from "next/link"
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
import { useState } from "react"
import { deletePost } from "@/lib/firebase/posts"
import { useToast } from "@/components/ui/use-toast"

interface ScheduledPostCardProps {
  post: PostType
  onDelete?: (postId: string) => void
}

export function ScheduledPostCard({ post, onDelete }: ScheduledPostCardProps) {
  const platformColor = getPlatformColor(post.platform)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deletePost(post.id)
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      })
      if (onDelete) {
        onDelete(post.id)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete post",
        description: "There was an error deleting your post. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div>
            <Badge
              className="mb-2"
              style={{
                backgroundColor: platformColor.bg,
                color: platformColor.text,
              }}
            >
              {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
            </Badge>
            <h3 className="font-semibold text-lg line-clamp-1">{post.title}</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[100px] overflow-hidden">
          <p className="text-sm text-muted-foreground line-clamp-3">{post.description || "No description provided."}</p>
        </div>
        <div className="mt-4 flex flex-col space-y-1">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            {format(new Date(post.scheduledFor), "MMM d, yyyy")}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            {format(new Date(post.scheduledFor), "h:mm a")}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Link href={`/dashboard/post/${post.id}`}>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your post and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
