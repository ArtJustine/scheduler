"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Copy, Edit, Loader2, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  getCaptionTemplates,
  createCaptionTemplate,
  updateCaptionTemplate,
  deleteCaptionTemplate,
} from "@/lib/firebase/captions"
import type { CaptionTemplate } from "@/types/caption"

export function CaptionLibrary() {
  const [templates, setTemplates] = useState<CaptionTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<CaptionTemplate | null>(null)
  const [newTemplate, setNewTemplate] = useState({
    title: "",
    content: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const loadedTemplates = await getCaptionTemplates()
        setTemplates(loadedTemplates)
      } catch (error) {
        console.error("Error loading caption templates:", error)
        toast({
          variant: "destructive",
          title: "Failed to load templates",
          description: "There was a problem loading your caption templates.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadTemplates()
  }, [toast])

  const handleCreateTemplate = async () => {
    if (!newTemplate.title.trim() || !newTemplate.content.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide both a title and content for your template.",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const createdTemplate = await createCaptionTemplate({
        title: newTemplate.title,
        content: newTemplate.content,
      })
      setTemplates([...templates, createdTemplate])
      setNewTemplate({ title: "", content: "" })
      toast({
        title: "Template created",
        description: "Your caption template has been created.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create template",
        description: "There was a problem creating your caption template.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return
    if (!editingTemplate.title.trim() || !editingTemplate.content.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide both a title and content for your template.",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await updateCaptionTemplate(editingTemplate.id, {
        title: editingTemplate.title,
        content: editingTemplate.content,
      })

      // Update local state
      const updatedTemplates = templates.map((template) =>
        template.id === editingTemplate.id ? editingTemplate : template,
      )
      setTemplates(updatedTemplates)
      setEditingTemplate(null)

      toast({
        title: "Template updated",
        description: "Your caption template has been updated.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update template",
        description: "There was a problem updating your caption template.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteCaptionTemplate(id)
      setTemplates(templates.filter((template) => template.id !== id))
      if (editingTemplate?.id === id) {
        setEditingTemplate(null)
      }
      toast({
        title: "Template deleted",
        description: "Your caption template has been deleted.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete template",
        description: "There was a problem deleting your caption template.",
      })
    }
  }

  const handleCopyCaption = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Caption copied",
      description: "Caption has been copied to clipboard.",
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Caption Template</DialogTitle>
            <DialogDescription>Create a reusable caption template for your posts</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Template Name</Label>
              <Input
                id="title"
                placeholder="E.g., Product Launch, Motivational Quote"
                value={newTemplate.title}
                onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Caption Content</Label>
              <Textarea
                id="content"
                placeholder="Enter your caption template here..."
                rows={6}
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Use placeholders like {"{product_name}"} or {"{link}"} for dynamic content
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTemplate({ title: "", content: "" })}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {templates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No caption templates found</p>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first caption template to save time when creating posts
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Caption Template</DialogTitle>
                <DialogDescription>Create a reusable caption template for your posts</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Template Name</Label>
                  <Input
                    id="title"
                    placeholder="E.g., Product Launch, Motivational Quote"
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Caption Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter your caption template here..."
                    rows={6}
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use placeholders like {"{product_name}"} or {"{link}"} for dynamic content
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewTemplate({ title: "", content: "" })}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Template"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="text-base">{template.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{template.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleCopyCaption(template.content)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditingTemplate(template)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Caption Template</DialogTitle>
                        <DialogDescription>Update your caption template</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-title">Template Name</Label>
                          <Input
                            id="edit-title"
                            value={editingTemplate?.title || ""}
                            onChange={(e) =>
                              setEditingTemplate(editingTemplate ? { ...editingTemplate, title: e.target.value } : null)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-content">Caption Content</Label>
                          <Textarea
                            id="edit-content"
                            rows={6}
                            value={editingTemplate?.content || ""}
                            onChange={(e) =>
                              setEditingTemplate(
                                editingTemplate ? { ...editingTemplate, content: e.target.value } : null,
                              )
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpdateTemplate} disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
