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
import type { CaptionTemplate } from "@/types/caption"

interface CaptionLibraryProps {
  templates: CaptionTemplate[]
  onAdd?: (caption: Omit<CaptionTemplate, "id" | "userId" | "createdAt" | "updatedAt">) => void
  onDelete?: (id: string) => void
}

export function CaptionLibrary({ templates, onAdd, onDelete }: CaptionLibraryProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onAdd) {
      onAdd({
        title,
        content,
        tags: tags.split(",").map((tag) => tag.trim()),
      })
    }
    setTitle("")
    setContent("")
    setTags("")
    setOpen(false)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Caption copied",
      description: "The caption has been copied to your clipboard.",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Caption Library</CardTitle>
          <CardDescription>Save and reuse your best captions</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Caption
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Caption</DialogTitle>
                <DialogDescription>Create a new caption template for your posts.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Product Launch"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Caption</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your caption here..."
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="E.g., product, launch, announcement"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Caption</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed">
              <p className="text-sm text-muted-foreground">No captions saved yet</p>
              <Button variant="link" size="sm" onClick={() => setOpen(true)}>
                Add your first caption
              </Button>
            </div>
          ) : (
            templates.map((caption) => (
              <div key={caption.id} className="rounded-md border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">{caption.title}</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(caption.content)}>
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
                        <DropdownMenuItem onClick={() => onDelete?.(caption.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{caption.content}</p>
                {caption.tags && caption.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {caption.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
