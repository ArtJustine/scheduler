"use client"

import type React from "react"

import { useState } from "react"
import { Copy, MoreHorizontal, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

interface HashtagGroup {
  id: string
  name: string
  hashtags: string[]
  category: string
}

interface HashtagManagerProps {
  hashtagGroups: HashtagGroup[]
  onAdd?: (group: Omit<HashtagGroup, "id">) => void
  onDelete?: (id: string) => void
}

export function HashtagManager({ hashtagGroups, onAdd, onDelete }: HashtagManagerProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [hashtags, setHashtags] = useState("")
  const [category, setCategory] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onAdd) {
      onAdd({
        name,
        hashtags: hashtags.split(" ").map((tag) => tag.trim().replace(/^#/, "")),
        category,
      })
    }
    setName("")
    setHashtags("")
    setCategory("")
    setOpen(false)
  }

  const handleCopy = (tags: string[]) => {
    const formattedTags = tags.map((tag) => `#${tag}`).join(" ")
    navigator.clipboard.writeText(formattedTags)
    toast({
      title: "Hashtags copied",
      description: "The hashtags have been copied to your clipboard.",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Hashtag Manager</CardTitle>
          <CardDescription>Organize and reuse hashtag groups</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add Hashtag Group</DialogTitle>
                <DialogDescription>Create a new group of related hashtags for your posts.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g., Photography"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="E.g., Creative"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hashtags">Hashtags</Label>
                  <Textarea
                    id="hashtags"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="#photography #photo #photographer"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate hashtags with spaces. The # symbol is optional.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Group</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hashtagGroups.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed">
              <p className="text-sm text-muted-foreground">No hashtag groups saved yet</p>
              <Button variant="link" size="sm" onClick={() => setOpen(true)}>
                Add your first group
              </Button>
            </div>
          ) : (
            hashtagGroups.map((group) => (
              <div key={group.id} className="rounded-md border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{group.name}</h3>
                    {group.category && <p className="text-xs text-muted-foreground">{group.category}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(group.hashtags)}>
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onDelete?.(group.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {group.hashtags.map((tag) => (
                    <span key={tag} className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
