"use client"

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart as RechartsBarChart,
  Bar,
  AreaChart as RechartsAreaChart,
  Area,
} from "recharts"

interface ChartData {
  date: string
  instagram?: number
  youtube?: number
  tiktok?: number
  value?: number
  [key: string]: any
}

interface ChartProps {
  data: ChartData[]
  dataKey?: string
  color?: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-xl">
        <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div 
              className="h-2 w-2 rounded-full" 
              style={{ backgroundColor: entry.color || entry.fill }} 
            />
            <span className="text-sm font-bold capitalize">
              {entry.name}: {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function LineChart({ data, dataKey = "value", color = "hsl(var(--primary))" }: ChartProps) {
  if (!data?.length) return null

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          fontSize={10} 
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          minTickGap={30}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          fontSize={10} 
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          name="Total"
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          strokeWidth={3} 
          dot={false}
          activeDot={{ r: 6, strokeWidth: 0, fill: color }} 
        />
        {data[0]?.tiktok !== undefined && dataKey === "value" && (
          <>
            <Line name="TikTok" type="monotone" dataKey="tiktok" stroke="#69C9D0" strokeWidth={2} dot={false} />
            <Line name="Instagram" type="monotone" dataKey="instagram" stroke="#E1306C" strokeWidth={2} dot={false} />
            <Line name="YouTube" type="monotone" dataKey="youtube" stroke="#FF0000" strokeWidth={2} dot={false} />
          </>
        )}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

export function AreaChart({ data, dataKey = "value", color = "hsl(var(--primary))" }: ChartProps) {
  if (!data?.length) return null

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          fontSize={10} 
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          minTickGap={30}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          fontSize={10} 
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          name="Total"
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          fillOpacity={1} 
          fill="url(#areaGradient)" 
          strokeWidth={2}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}

export function BarChart({ data, dataKey = "value", color = "hsl(var(--primary))" }: ChartProps) {
  if (!data?.length) return null

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          fontSize={10} 
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          minTickGap={30}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          fontSize={10} 
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          name="Total"
          dataKey={dataKey} 
          fill={color} 
          radius={[4, 4, 0, 0]} 
          maxBarSize={40}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

