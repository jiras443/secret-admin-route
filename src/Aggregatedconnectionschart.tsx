import { memo } from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip } from "recharts"
import {
  type ChartConfig,
  ChartContainer,
} from "@/components/ui/chart"
import { type AggregatedData } from "./utils/aggregation"

interface AggregatedConnectionsChartProps {
  data: AggregatedData[]
  showMax?: boolean
}

const chartConfig = {
  connAvg: {
    label: "Connections Avg",
    color: "#dc2626",
  },
  connMax: {
    label: "Connections Max",
    color: "#fca5a5",
  },
} satisfies ChartConfig

export const AggregatedConnectionsChart = memo(function AggregatedConnectionsChart({ 
  data, 
  showMax = true 
}: AggregatedConnectionsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center border rounded">
        <p className="text-gray-500">No connection data to display</p>
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
          <div className="text-sm">
            <p className="text-red-600">Connections:</p>
            <p className="ml-2">Avg: {dataPoint.connAvg}</p>
            {showMax && <p className="ml-2">Max: {dataPoint.connMax}</p>}
            <p className="ml-2">Min: {dataPoint.connMin}</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">Data points: {dataPoint.dataPoints}</p>
        </div>
      )
    }
    return null
  }

  return (
    <ChartContainer config={chartConfig} className="w-full h-[400px]">
      <LineChart
        data={data}
        margin={{
          left: 30,
          right: 30,
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
          label={{ value: 'Connections', angle: -90, position: 'insideLeft' }}
        />
        
        <Tooltip content={<CustomTooltip />} />
        
        <Line
          type="monotone"
          dataKey="connAvg"
          stroke="#dc2626"
          strokeWidth={2}
          dot={{ r: 3 }}
          name="Average"
          activeDot={{ r: 5 }}
        />
        
        {showMax && (
          <Line
            type="monotone"
            dataKey="connMax"
            stroke="#fca5a5"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={false}
            name="Maximum"
          />
        )}
      </LineChart>
    </ChartContainer>
  )
})