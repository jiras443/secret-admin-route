import { memo, useMemo } from "react"
import { CartesianGrid, Area, AreaChart, XAxis, YAxis, Legend } from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { formatTickLabel, getTickInterval } from "./utils/dataProcessing"

interface ConnectionsChartProps {
  data: Array<{
    index: number
    elapsedSeconds: number
    timeLabel: string
    fullTime: string
    conn: number
  }>
  timeScale?: 'auto' | 'minutes' | 'hours' | 'days'
}

const chartConfig = {
  conn: {
    label: "Connections",
    color: "#dc2626",
  },
} satisfies ChartConfig

export const ConnectionsChart = memo(function ConnectionsChart({ 
  data, 
  timeScale = 'auto' 
}: ConnectionsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center border rounded">
        <p className="text-gray-500">No connection data to display</p>
      </div>
    )
  }

  const { formattedData, tickInterval } = useMemo(() => {
    const totalSeconds = data[data.length - 1]?.elapsedSeconds || 0
    const interval = getTickInterval(data.length, totalSeconds, 10)
    
    const formatted = data.map((item) => ({
      ...item,
      timeTickLabel: formatTickLabel(item.elapsedSeconds, totalSeconds)
    }))
    
    return {
      formattedData: formatted,
      tickInterval: interval
    }
  }, [data])
  
  return (
    <ChartContainer config={chartConfig} className="w-full h-[400px]">
      <AreaChart
        data={formattedData}
        margin={{
          left: 30,
          right: 30,
          top: 60,
          bottom: 70,
        }}
      >
        <defs>
          <linearGradient id="colorConn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#dc2626" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        
        <CartesianGrid strokeDasharray="3 3" />
        
        <Legend 
          verticalAlign="top"
          align="center"
          height={50}
          iconType="line"
          wrapperStyle={{
            paddingBottom: "30px",
            fontSize: "15px",
          }}
        />
        
        <XAxis
          dataKey="timeTickLabel"
          label={{ 
            value: 'Time (elapsed)', 
            position: 'insideBottom', 
            offset: -15 
          }}
          angle={-45}
          textAnchor="end"
          height={80}
          interval={tickInterval}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          label={{ value: 'Connections', angle: -90, position: 'insideLeft' }}
        />
        <ChartTooltip 
          content={<ChartTooltipContent />}
          labelFormatter={(value, payload) => {
            if (payload && payload[0]) {
              const dataPoint = payload[0].payload
              return `Time: ${dataPoint.fullTime}`
            }
            return value
          }}
        />
        
        <Area
          type="monotone"
          dataKey="conn"
          stroke="#dc2626"
          strokeWidth={2}
          fill="url(#colorConn)"
          name="Connections"
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  )
})