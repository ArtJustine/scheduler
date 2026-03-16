"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, TrendingUp, AlertCircle, Info, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Insight {
  title: string
  observation: string
  recommendation: string
  type: "info" | "success" | "warning"
}

interface AIAnalyticsInsightsProps {
  stats: any
  platform: string
}

export function AIAnalyticsInsights({ stats, platform }: AIAnalyticsInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = async () => {
    if (!stats) return
    
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/analytics/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats, platform })
      })

      if (!response.ok) throw new Error("Failed to fetch insights")
      
      const data = await response.json()
      setInsights(data)
    } catch (err) {
      console.error(err)
      setError("Unable to generate insights at this time.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [platform])

  if (loading) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <CardTitle className="text-lg">AI Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="h-4 bg-primary/10 rounded w-1/4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || insights.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground mb-4 opacity-20" />
          <h3 className="font-semibold text-muted-foreground">AI Intelligence</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect more data to unlock personalized AI insights.
          </p>
          <Button variant="outline" size="sm" onClick={fetchInsights} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/30 bg-primary/5 overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Smart Insights</CardTitle>
          </div>
          <CardDescription>AI-powered suggestions based on your performance</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchInsights} disabled={loading} className="rounded-full">
           <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className="group relative p-4 rounded-xl bg-background border border-border/50 hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                insight.type === "success" ? "bg-green-500/10 text-green-500" :
                insight.type === "warning" ? "bg-amber-500/10 text-amber-500" :
                "bg-blue-500/10 text-blue-500"
              }`}>
                {insight.type === "success" ? <TrendingUp className="h-4 w-4" /> :
                 insight.type === "warning" ? <AlertCircle className="h-4 w-4" /> :
                 <Info className="h-4 w-4" />}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm">{insight.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">Observation:</span> {insight.observation}
                </p>
                <p className="text-xs text-primary font-medium mt-1 leading-relaxed">
                   {insight.recommendation}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
