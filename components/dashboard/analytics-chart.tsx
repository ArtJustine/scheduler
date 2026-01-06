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
} from "recharts"

interface ChartData {
  date: string
  instagram?: number
  youtube?: number
  tiktok?: number
  [key: string]: any
}

interface LineChartProps {
  data: ChartData[]
  dataKey?: string
  color?: string
}

export function LineChart({ data, dataKey = "value", color = "#3b82f6" }: LineChartProps) {

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        {/* Support legacy multi-line charts if needed, but primary use is now single dynamic platform */}
        {data[0]?.instagram !== undefined && dataKey === "value" && (
          <>
            <Line type="monotone" dataKey="instagram" stroke="#E1306C" strokeWidth={2} />
            <Line type="monotone" dataKey="youtube" stroke="#FF0000" strokeWidth={2} />
            <Line type="monotone" dataKey="tiktok" stroke="#69C9D0" strokeWidth={2} />
          </>
        )}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

interface BarChartProps {
  data: ChartData[]
  dataKey?: string
  color?: string
}

export function BarChart({ data, dataKey = "value", color = "#3b82f6" }: BarChartProps) {

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        {/* Support legacy multi-bar charts if needed */}
        {data[0]?.instagram !== undefined && dataKey === "value" && (
          <>
            <Bar dataKey="instagram" fill="#E1306C" />
            <Bar dataKey="youtube" fill="#FF0000" />
            <Bar dataKey="tiktok" fill="#69C9D0" />
          </>
        )}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
