"use client"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

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
  // Convert the data format to what recharts expects
  const chartData = data[0].data.map((point, index) => {
    const result: any = { date: point.date }

    data.forEach((series) => {
      result[series.name] = series.data[index]?.value || 0
    })

    return result
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Analytics Overview</CardTitle>
        <CardDescription>Performance metrics across platforms</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            ...data.reduce(
              (acc, series) => ({
                ...acc,
                [series.name]: {
                  label: series.name,
                  color: series.color,
                },
              }),
              {},
            ),
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              {data.map((series) => (
                <Line
                  key={series.name}
                  type="monotone"
                  dataKey={series.name}
                  stroke={`var(--color-${series.name.toLowerCase().replace(/\s+/g, "-")})`}
                  name={series.name}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
