"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore"
import { firebaseDb } from "@/lib/firebase-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { 
  TrendingUp, 
  RefreshCw, 
  Instagram, 
  Youtube, 
  Video, 
  MessageSquare, 
  Lightbulb, 
  Users,
  Search,
  ArrowRight,
  ExternalLink,
  Settings,
  Smartphone,
  Monitor,
  X
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface Trend {
  title: string
  description: string
  engagementType: string
  platform: string
  exampleTopics: string[]
  strategy: string
}

interface Competitor {
  name: string
  platform: string
  reason: string
}

interface TrendsData {
  trends: Trend[]
  topCompetitors: Competitor[]
  suggestedKeywords: string[]
  niche: string
  lastSyncedAt: any
}

export default function TrendsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null)
  const { toast } = useToast()

  const loadTrends = async () => {
    if (!user || !firebaseDb) return
    
    setLoading(true)
    try {
      const docRef = doc(firebaseDb, "trends", user.uid)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        setTrendsData(docSnap.data() as TrendsData)
      } else {
        // If no trends exist, check if user has niche and offer to sync
        const userDocRef = doc(firebaseDb, "users", user.uid)
        const userSnap = await getDoc(userDocRef)
        const userData = userSnap.data()
        
        if (userData?.niche) {
          // Auto-sync if it's the first time
          handleSync()
        }
      }
    } catch (error) {
      console.error("Error loading trends:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrends()
  }, [user])

  const handleSync = async () => {
    setSyncing(true)
    try {
      // In a real app, you might call your API route
      // Here we'll call the sync logic directly or via fetch to our internal API
      const response = await fetch(`/api/trends/sync?userId=${user.uid}`, {
        method: "GET", 
      })
      
      if (response.ok) {
        await loadTrends()
        toast({
          title: "Trends updated!",
          description: "We've fetched the latest trends for your niche.",
        })
      } else {
        const errorData = await response.json()
        const errorMsg = errorData.error || ""
        if (errorMsg.includes("generativelanguage.googleapis.com") || errorMsg.includes("403")) {
          if (errorMsg.includes("API_KEY_SERVICE_BLOCKED")) {
            throw new Error("API Key Blocked: Your key doesn't have permission for Gemini. Create a dedicated key at aistudio.google.com")
          }
          throw new Error("AI API is disabled. Please enable 'Generative Language API' in your Google Cloud Console.")
        }
        throw new Error(errorMsg || "Failed to sync")
      }
    } catch (error: any) {
      console.error("Sync error:", error)
      toast({
        variant: "destructive",
        title: "Sync failed",
        description: error.message || "Could not fetch trends. Please make sure you have a niche set in settings.",
      })
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!trendsData && !syncing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="p-6 bg-primary/10 rounded-full">
          <TrendingUp className="h-12 w-12 text-primary" />
        </div>
        <div className="max-w-md">
          <h2 className="text-2xl font-bold mb-2">Discover Your Niche Trends</h2>
          <p className="text-muted-foreground mb-6">
            Tell us about your niche and competitors in Settings, and we'll use AI to find what's trending, who to watch, and how to grow.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push("/dashboard/settings?tab=trends")} variant="outline" className="rounded-full px-8">
              Configure Niche
            </Button>
            <Button onClick={handleSync} disabled={syncing} className="rounded-full px-8 shadow-lg shadow-primary/20">
              <RefreshCw className={cn("mr-2 h-4 w-4", syncing && "animate-spin")} />
              {syncing ? "Analyzing..." : "Sync Trends Now"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-8 pb-12">
      <AnimatePresence>
        {syncing && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 bg-white/90 dark:bg-slate-900/90 shadow-2xl rounded-2xl border border-primary/20 p-4 w-80 backdrop-blur-xl pointer-events-auto"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <RefreshCw className="h-3 w-3 text-primary" />
                  </div>
                </div>
                <h3 className="text-xs font-bold">Analyzing Niche</h3>
              </div>
              <button 
                onClick={() => setSyncing(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Run in background"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Our AI is scanning TikTok, Instagram, and YouTube. You can continue using the app.
            </p>

            <div className="mt-3 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-progress-indeterminate" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Trends & Insights</h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
              {trendsData?.niche || "Your Niche"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            AI analysis of what's viral and high-engagement in your niche this week.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push("/dashboard/settings?tab=trends")}
            className="rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-primary/20 hover:bg-primary/5 transition-all"
          >
            <Settings className="mr-2 h-4 w-4" />
            Config
          </Button>
          <Button 
            variant="default" 
            onClick={handleSync} 
            disabled={syncing}
            className="rounded-full shadow-lg shadow-primary/20 transition-all"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", syncing && "animate-spin")} />
            {syncing ? "Analyzing..." : "Refresh Weekly Sync"}
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Trends Column */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Hot Topics & Formats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendsData?.trends.map((trend, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="h-full border-none shadow-xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-transparent" />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={cn(
                          "rounded-full border-none",
                          trend.platform === "TikTok" ? "bg-black text-white" : 
                          trend.platform === "Instagram" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" :
                          "bg-red-600 text-white"
                        )}>
                          {trend.platform === "TikTok" && <Video className="h-3 w-3 mr-1" />}
                          {trend.platform === "Instagram" && <Instagram className="h-3 w-3 mr-1" />}
                          {trend.platform === "YouTube" && <Youtube className="h-3 w-3 mr-1" />}
                          {trend.platform}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground/60">
                          {trend.engagementType}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{trend.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {trend.description}
                      </p>
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary/70">Example Topics</h4>
                        <div className="flex flex-wrap gap-2">
                          {trend.exampleTopics.map((topic, i) => (
                            <span key={i} className="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <div className="w-full p-3 bg-primary/5 rounded-xl border border-primary/10">
                        <div className="flex items-start gap-2">
                          <ArrowRight className="h-3 w-3 mt-1 text-primary shrink-0" />
                          <p className="text-xs font-medium italic">{trend.strategy}</p>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar Insights Column */}
          <div className="space-y-8">
            {/* Competitors Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                Channels to Watch
              </h2>
              <div className="space-y-3">
                {trendsData?.topCompetitors.map((comp, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-border/50 flex items-center gap-4 group cursor-pointer hover:border-primary/30 transition-all">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-lg text-primary">
                      {comp.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold truncate">{comp.name}</h4>
                        <Badge variant="outline" className="text-[8px] h-4 px-1">{comp.platform}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{comp.reason}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>

            {/* Keywords Section */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-indigo-500/10 border border-primary/20">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Trending Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendsData?.suggestedKeywords.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-white dark:bg-slate-800 hover:bg-primary hover:text-white transition-colors cursor-pointer">
                    #{tag}
                  </Badge>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-4 italic">
                Pro tip: Use these hashtags in your next post descriptions to boost discoverability.
              </p>
            </div>

            <Card className="bg-slate-950 text-white border-none shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <MessageSquare className="h-24 w-24" />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Need Content Ideas?</CardTitle>
                <CardDescription className="text-slate-400">
                  Let AI generate a full script based on these trends.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full rounded-full bg-white text-black hover:bg-slate-200">
                  Generate Post Idea
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </AnimatePresence>
      
      <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Powered by AI (Gemini 1.5 Flash)
        </div>
        <div>
          Last synced: {trendsData?.lastSyncedAt ? new Date(trendsData.lastSyncedAt.seconds * 1000).toLocaleString() : "Recently"}
        </div>
      </div>
    </div>
  )
}
