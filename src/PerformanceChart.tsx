import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface PerformanceChartProps {
  data: Array<{
    index: number
    cpu: number
    mem: number
    conn: number
  }>
}

const chartConfig = {
  cpu: {
    label: "CPU %",
    color: "#2563eb",
  },
  mem: {
    label: "Memory (MB)",
    color: "#16a34a",
  },
  conn: {
    label: "Connections",
    color: "#dc2626",
  },
} satisfies ChartConfig

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[400px]">
      <LineChart
        data={data}
        margin={{
          left: 20,
          right: 20,
          top: 20,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="index"
          label={{ value: 'Time', position: 'insideBottom', offset: -10 }}
        />
        <YAxis 
          label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        
        <Line
          dataKey="cpu"
          type="monotone"
          stroke="#2563eb"
          strokeWidth={2}
          dot={false}
          name="CPU %"
        />
        
        <Line
          dataKey="mem"
          type="monotone"
          stroke="#16a34a"
          strokeWidth={2}
          dot={false}
          name="Memory (MB)"
        />
        
        <Line
          dataKey="conn"
          type="monotone"
          stroke="#dc2626"
          strokeWidth={2}
          dot={false}
          name="Connections"
        />
      </LineChart>
    </ChartContainer>
  )
}