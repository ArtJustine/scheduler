"use client"

import { useEffect, useRef } from "react"

interface DataPoint {
  date: string
  value: number
}

interface ChartSeries {
  name: string
  data: DataPoint[]
  color: string
}

interface AnalyticsChartProps {
  data: ChartSeries[]
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Chart dimensions
    const padding = 40
    const chartWidth = rect.width - padding * 2
    const chartHeight = rect.height - padding * 2

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Find max value for scaling
    const allValues = data.flatMap((series) => series.data.map((d) => d.value))
    const maxValue = Math.max(...allValues) * 1.1 // Add 10% padding

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 1
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, rect.height - padding)
    ctx.lineTo(rect.width - padding, rect.height - padding)
    ctx.stroke()

    // Draw x-axis labels
    const xLabels = data[0].data.map((d) => d.date)
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillStyle = "#64748b"
    ctx.font = "12px Inter, sans-serif"

    xLabels.forEach((label, i) => {
      const x = padding + (i * chartWidth) / (xLabels.length - 1)
      ctx.fillText(label, x, rect.height - padding + 10)
    })

    // Draw y-axis labels
    const yLabelCount = 5
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"

    for (let i = 0; i <= yLabelCount; i++) {
      const value = (maxValue * i) / yLabelCount
      const y = rect.height - padding - (i * chartHeight) / yLabelCount
      ctx.fillText(Math.round(value).toLocaleString(), padding - 10, y)

      // Draw horizontal grid lines
      ctx.beginPath()
      ctx.strokeStyle = "#e2e8f0"
      ctx.lineWidth = 0.5
      ctx.moveTo(padding, y)
      ctx.lineTo(rect.width - padding, y)
      ctx.stroke()
    }

    // Draw data series
    data.forEach((series) => {
      ctx.beginPath()
      ctx.strokeStyle = series.color
      ctx.lineWidth = 2

      series.data.forEach((point, i) => {
        const x = padding + (i * chartWidth) / (series.data.length - 1)
        const y = rect.height - padding - (point.value / maxValue) * chartHeight

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // Draw points
      series.data.forEach((point, i) => {
        const x = padding + (i * chartWidth) / (series.data.length - 1)
        const y = rect.height - padding - (point.value / maxValue) * chartHeight

        ctx.beginPath()
        ctx.fillStyle = "white"
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = series.color
        ctx.lineWidth = 2
        ctx.stroke()
      })
    })

    // Draw legend
    const legendX = padding
    const legendY = padding - 15
    const legendItemWidth = 80

    data.forEach((series, i) => {
      const x = legendX + i * legendItemWidth

      // Draw color box
      ctx.fillStyle = series.color
      ctx.fillRect(x, legendY, 12, 12)

      // Draw series name
      ctx.fillStyle = "#64748b"
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      ctx.fillText(series.name, x + 16, legendY + 6)
    })
  }, [data])

  return (
    <div className="w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
