"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, X, Copy, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getHashtagGroups, createHashtagGroup, deleteHashtagGroup, updateHashtagGroup } from "@/lib/firebase/hashtags"
import type { HashtagGroup } from "@/types/hashtag"

export function HashtagManager() {
  const [hashtagGroups, setHashtagGroups] = useState<HashtagGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newGroupName, setNewGroupName] = useState("")
  const [newHashtag, setNewHashtag] = useState("")
  const [editingGroup, setEditingGroup] = useState<HashtagGroup | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadHashtags = async () => {
      try {
        const groups = await getHashtagGroups()
        setHashtagGroups(groups)
      } catch (error) {
        console.error("Error loading hashtag groups:", error)
        toast({
          variant: "destructive",
          title: "Failed to load hashtags",
          description: "There was a problem loading your hashtag groups.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadHashtags()
  }, [toast])

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast({
        variant: "destructive",
        title: "Group name required",
        description: "Please enter a name for your hashtag group.",
      })
      return
    }

    setIsSaving(true)
    try {
      const newGroup = await createHashtagGroup({
        name: newGroupName,
        hashtags: [],
      })
      setHashtagGroups([...hashtagGroups, newGroup])
      setNewGroupName("")
      toast({
        title: "Group created",
        description: "Your hashtag group has been created.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create group",
        description: "There was a problem creating your hashtag group.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteHashtagGroup(groupId)
      setHashtagGroups(hashtagGroups.filter((group) => group.id !== groupId))
      toast({
        title: "Group deleted",
        description: "Your hashtag group has been deleted.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete group",
        description: "There was a problem deleting your hashtag group.",
      })
    }
  }

  const handleAddHashtag = async () => {
    if (!editingGroup) return
    if (!newHashtag.trim()) {
      toast({
        variant: "destructive",
        title: "Hashtag required",
        description: "Please enter a hashtag to add.",
      })
      return
    }

    // Format hashtag (ensure it starts with #)
    const formattedHashtag = newHashtag.startsWith("#") ? newHashtag : `#${newHashtag}`

    // Check if hashtag already exists in the group
    if (editingGroup.hashtags.includes(formattedHashtag)) {
      toast({
        variant: "destructive",
        title: "Duplicate hashtag",
        description: "This hashtag already exists in the group.",
      })
      return
    }

    setIsSaving(true)
    try {
      const updatedHashtags = [...editingGroup.hashtags, formattedHashtag]
      await updateHashtagGroup(editingGroup.id, {
        hashtags: updatedHashtags,
      })

      // Update local state
      const updatedGroups = hashtagGroups.map((group) =>
        group.id === editingGroup.id ? { ...group, hashtags: updatedHashtags } : group,
      )
      setHashtagGroups(updatedGroups)
      setEditingGroup({ ...editingGroup, hashtags: updatedHashtags })
      setNewHashtag("")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to add hashtag",
        description: "There was a problem adding the hashtag.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveHashtag = async (groupId: string, hashtagToRemove: string) => {
    const group = hashtagGroups.find((g) => g.id === groupId)
    if (!group) return

    setIsSaving(true)
    try {
      const updatedHashtags = group.hashtags.filter((tag) => tag !== hashtagToRemove)
      await updateHashtagGroup(groupId, {
        hashtags: updatedHashtags,
      })

      // Update local state
      const updatedGroups = hashtagGroups.map((g) => (g.id === groupId ? { ...g, hashtags: updatedHashtags } : g))
      setHashtagGroups(updatedGroups)
      if (editingGroup?.id === groupId) {
        setEditingGroup({ ...editingGroup, hashtags: updatedHashtags })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to remove hashtag",
        description: "There was a problem removing the hashtag.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyHashtags = (hashtags: string[]) => {
    navigator.clipboard.writeText(hashtags.join(" "))
    toast({
      title: "Hashtags copied",
      description: "Hashtags have been copied to clipboard.",
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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="new-group">New Hashtag Group</Label>
          <div className="flex mt-2">
            <Input
              id="new-group"
              placeholder="Enter group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="rounded-r-none"
            />
            <Button onClick={handleCreateGroup} disabled={isSaving || !newGroupName.trim()} className="rounded-l-none">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {hashtagGroups.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No hashtag groups found</p>
          <p className="text-sm text-muted-foreground">
            Create your first hashtag group to organize hashtags for your posts
          </p>
        </div>
      ) : (
        <Tabs defaultValue={hashtagGroups[0]?.id} className="space-y-4">
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-auto">
              {hashtagGroups.map((group) => (
                <TabsTrigger
                  key={group.id}
                  value={group.id}
                  onClick={() => setEditingGroup(group)}
                  className="whitespace-nowrap"
                >
                  {group.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {hashtagGroups.map((group) => (
            <TabsContent key={group.id} value={group.id} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{group.name}</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopyHashtags(group.hashtags)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy All
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteGroup(group.id)}>
                    <X className="mr-2 h-4 w-4" />
                    Delete Group
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add new hashtag"
                  value={newHashtag}
                  onChange={(e) => setNewHashtag(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddHashtag} disabled={isSaving || !newHashtag.trim()}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Add
                </Button>
              </div>

              <Card>
                <CardContent className="p-4">
                  {group.hashtags.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No hashtags in this group</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {group.hashtags.map((hashtag, index) => (
                        <Badge key={index} variant="secondary" className="px-2 py-1 text-sm">
                          {hashtag}
                          <button
                            onClick={() => handleRemoveHashtag(group.id, hashtag)}
                            className="ml-2 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
