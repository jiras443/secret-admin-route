import { memo } from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip } from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { type AggregatedData } from "./utils/aggregation"

interface AggregatedPerformanceChartProps {
  data: AggregatedData[]
  showMax?: boolean
}

const chartConfig = {
  cpuAvg: {
    label: "CPU Avg %",
    color: "#2563eb",
  },
  cpuMax: {
    label: "CPU Max %",
    color: "#93c5fd",
  },
  memAvg: {
    label: "Memory Avg MB",
    color: "#16a34a",
  },
  memMax: {
    label: "Memory Max MB",
    color: "#86efac",
  },
} satisfies ChartConfig

export const AggregatedPerformanceChart = memo(function AggregatedPerformanceChart({ 
  data, 
  showMax = true 
}: AggregatedPerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center border rounded">
        <p className="text-gray-500">No data to display</p>
      </div>
    )
  }

  const maxTicks = 15
  const tickInterval = Math.max(1, Math.floor(data.length / maxTicks))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload as AggregatedData
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold mb-2">Time: {dataPoint.startTime} - {dataPoint.endTime}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div>
              <p className="text-blue-600">CPU:</p>
              <p className="ml-2">Avg: {dataPoint.cpuAvg}%</p>
              {showMax && <p className="ml-2">Max: {dataPoint.cpuMax}%</p>}
              <p className="ml-2">Min: {dataPoint.cpuMin}%</p>
            </div>
            <div>
              <p className="text-green-600">Memory:</p>
              <p className="ml-2">Avg: {dataPoint.memAvg} MB</p>
              {showMax && <p className="ml-2">Max: {dataPoint.memMax} MB</p>}
              <p className="ml-2">Min: {dataPoint.memMin} MB</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Data points: {dataPoint.dataPoints}</p>
        </div>
      )
    }
    return null
  }

  return (
    <ChartContainer config={chartConfig} className="w-full h-[500px]">
      <LineChart
        data={data}
        margin={{
          left: 30,
          right: 70,
          top: 60,
          bottom: 70,
        }}
      >
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
          dataKey="timeLabel"
          label={{ 
            value: 'Time Interval', 
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
          yAxisId="left"
          label={{ value: 'CPU %', angle: -90, position: 'insideLeft' }}
          stroke="#2563eb"
          domain={[0, 'auto']}
        />
        
        <YAxis 
          yAxisId="right"
          orientation="right"
          label={{ value: 'Memory MB', angle: 90, position: 'insideRight' }}
          stroke="#16a34a"
        />
        
        <Tooltip content={<CustomTooltip />} />
        
        <Line
          yAxisId="left"
          dataKey="cpuAvg"
          type="monotone"
          stroke="#2563eb"
          strokeWidth={2}
          dot={false}
          name="CPU Avg %"
          activeDot={false}
        />
        
        {showMax && (
          <Line
            yAxisId="left"
            dataKey="cpuMax"
            type="monotone"
            stroke="#93c5fd"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={false}
            name="CPU Max %"
          />
        )}
        
        <Line
          yAxisId="right"
          dataKey="memAvg"
          type="monotone"
          stroke="#16a34a"
          strokeWidth={2}
          dot={false}
          name="Memory Avg MB"
          activeDot={false}
        />
        
        {showMax && (
          <Line
            yAxisId="right"
            dataKey="memMax"
            type="monotone"
            stroke="#86efac"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={false}
            name="Memory Max MB"
          />
        )}
      </LineChart>
    </ChartContainer>
  )
})