"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { getPostStatsForHeatmap } from "@/lib/firebase/posts"
import { Loader2 } from "lucide-react"

interface ContributionDay {
    date: string
    count: number
    level: 0 | 1 | 2 | 3 | 4
}

const BRAND_COLOR = "#72A5EE"

export function ContributionCalendar() {
    const currentYear = new Date().getFullYear()
    const [selectedYear, setSelectedYear] = useState(currentYear)
    const [realData, setRealData] = useState<ContributionDay[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadStats = async () => {
            setIsLoading(true)
            try {
                const stats = await getPostStatsForHeatmap(selectedYear)
                setRealData(stats || [])
            } catch (error) {
                console.error("Error loading heatmap data:", error)
                setRealData([])
            } finally {
                setIsLoading(false)
            }
        }
        loadStats()
    }, [selectedYear])

    const data = useMemo(() => {
        // Base structure for the year
        const yearData: ContributionDay[] = []
        const isCurrentYear = selectedYear === currentYear

        let startDate: Date
        let endDate: Date

        if (isCurrentYear) {
            endDate = new Date()
            startDate = new Date()
            startDate.setDate(endDate.getDate() - 364)
        } else {
            startDate = new Date(selectedYear, 0, 1)
            endDate = new Date(selectedYear, 11, 31)
        }

        // Initialize every day with 0 or real count
        let current = new Date(startDate)
        while (current <= endDate) {
            const dateStr = current.toISOString().split("T")[0]
            const existingStat = realData.find(d => d.date === dateStr)

            yearData.push({
                date: dateStr,
                count: existingStat?.count || 0,
                level: existingStat?.level || 0,
            })
            current.setDate(current.getDate() + 1)
        }

        return yearData
    }, [selectedYear, realData, currentYear])

    // Available years: current and past 3
    const years = Array.from({ length: 4 }, (_, i) => currentYear - i)

    // Group data by weeks
    const weeks = useMemo(() => {
        const result: ContributionDay[][] = []
        let currentWeek: ContributionDay[] = []

        data.forEach((day, i) => {
            const date = new Date(day.date)
            if (date.getDay() === 0 && currentWeek.length > 0) {
                result.push(currentWeek)
                currentWeek = []
            }
            currentWeek.push(day)
        })

        if (currentWeek.length > 0) {
            result.push(currentWeek)
        }

        return result
    }, [data])

    const monthLabels = useMemo(() => {
        const labels: { label: string; index: number }[] = []
        let lastMonth = -1

        weeks.forEach((week, i) => {
            const firstDayOfWeek = new Date(week[0].date)
            const month = firstDayOfWeek.getMonth()

            if (month !== lastMonth) {
                labels.push({
                    label: firstDayOfWeek.toLocaleString("default", { month: "short" }),
                    index: i,
                })
                lastMonth = month
            }
        })

        return labels
    }, [weeks])

    const totalContributions = data.reduce((sum, day) => sum + day.count, 0)

    const getLevelColor = (level: number) => {
        switch (level) {
            case 0: return "bg-slate-100 dark:bg-slate-800/50"
            case 1: return "bg-[#72A5EE]/20"
            case 2: return "bg-[#72A5EE]/40"
            case 3: return "bg-[#72A5EE]/70"
            case 4: return "bg-[#72A5EE]"
            default: return "bg-slate-100 dark:bg-slate-800/50"
        }
    }

    return (
        <Card className="w-full border-border/50 bg-card/50 backdrop-blur-sm shadow-soft">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <CardTitle className="text-lg font-bold">Engagement Heatmap</CardTitle>
                            <CardDescription>
                                {totalContributions} platform interactions in {selectedYear === currentYear ? 'the last 12 months' : selectedYear}
                            </CardDescription>
                        </div>
                        <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                            <SelectTrigger className="w-[100px] h-8 text-xs bg-slate-50 dark:bg-slate-900/50 border-border/50">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map(y => (
                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="text-xs text-muted-foreground hidden sm:block">
                        Personal Insights
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <div className="overflow-x-auto pb-4 custom-scrollbar">
                        <div className="inline-flex flex-col min-w-full">
                            {/* Month Labels */}
                            <div className="flex text-[10px] text-muted-foreground mb-1 ml-8">
                                {monthLabels.map((label, i) => (
                                    <div
                                        key={i}
                                        className="absolute"
                                        style={{ left: `${label.index * 14 + 32}px` }}
                                    >
                                        {label.label}
                                    </div>
                                ))}
                            </div>

                            {/* Grid */}
                            <div className="flex mt-4 relative">
                                {isLoading && (
                                    <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
                                    </div>
                                )}
                                {/* Day Labels */}
                                <div className="flex flex-col justify-between text-[10px] text-muted-foreground mr-2 h-[84px] py-1">
                                    <span>Mon</span>
                                    <span>Wed</span>
                                    <span>Fri</span>
                                </div>

                                {/* Squares */}
                                <div className="flex gap-[3px]">
                                    <TooltipProvider delayDuration={0}>
                                        {weeks.map((week, weekIndex) => (
                                            <div key={weekIndex} className="flex flex-col gap-[3px]">
                                                {/* Buffer for partial first week */}
                                                {weekIndex === 0 && week.length < 7 && (
                                                    Array.from({ length: 7 - week.length }).map((_, i) => (
                                                        <div key={`empty-${i}`} className="w-[11px] h-[11px] invisible" />
                                                    ))
                                                )}
                                                {week.map((day) => (
                                                    <Tooltip key={day.date}>
                                                        <TooltipTrigger asChild>
                                                            <div
                                                                className={`w-[11px] h-[11px] rounded-[2px] transition-all duration-200 cursor-pointer hover:ring-1 hover:ring-[#72A5EE] ${getLevelColor(day.level)}`}
                                                            />
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="text-[10px] py-1 px-2 border-primary/20 bg-card">
                                                            <span className="font-medium">{day.count} interactions</span> on {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                ))}
                                            </div>
                                        ))}
                                    </TooltipProvider>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 text-[10px] text-muted-foreground">
                        <div className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                            How we calculate your reach
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/40 px-3 py-1.5 rounded-full border border-border/30">
                            <span className="opacity-60">Quiet</span>
                            <div className="flex gap-[3px]">
                                <div className="w-[10px] h-[10px] rounded-[2px] bg-slate-100 dark:bg-slate-800/50" />
                                <div className="w-[10px] h-[10px] rounded-[2px] bg-[#72A5EE]/20" />
                                <div className="w-[10px] h-[10px] rounded-[2px] bg-[#72A5EE]/40" />
                                <div className="w-[10px] h-[10px] rounded-[2px] bg-[#72A5EE]/70" />
                                <div className="w-[10px] h-[10px] rounded-[2px] bg-[#72A5EE]" />
                            </div>
                            <span className="opacity-60">Active</span>
                        </div>
                    </div>
                </div>
            </CardContent>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(114, 165, 238, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(114, 165, 238, 0.2);
        }
      `}</style>
        </Card>
    )
}
