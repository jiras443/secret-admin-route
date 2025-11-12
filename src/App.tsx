"use client"
import { useState } from "react"
import { TrendingUp } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { InputView } from "./InputView"
import { PerformanceChart } from "./PerformanceChart"

export const description = "System Performance Monitoring"

const initialData = [
  { index: 0, cpu: 0, mem: 0, conn: 0 }
]

function App() {
  const [chartData, setChartData] = useState(initialData)
  const [fileName, setFileName] = useState<string>("")

  const handleDataLoaded = (data: any[]) => {
    setChartData(data)
    setFileName("data.csv")
  }

  const peakCPU = Math.max(...chartData.map(d => d.cpu)).toFixed(2)
  const maxConn = Math.max(...chartData.map(d => d.conn))

  return (
    <div className="p-4 space-y-4">
      {/* Card สำหรับ Input */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Data</CardTitle>
          <CardDescription>Upload CSV file to visualize performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <InputView 
            onDataLoaded={handleDataLoaded}
            fileName={fileName}
            recordCount={chartData.length}
          />
        </CardContent>
      </Card>
      
      {/* Card สำหรับ Chart */}
      <Card>
        <CardHeader>
          <CardTitle>System Performance</CardTitle>
          <CardDescription>Real-time Monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <PerformanceChart data={chartData} />
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 leading-none font-medium">
                Peak CPU: {peakCPU}% | Max Connections: {maxConn} <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-muted-foreground flex items-center gap-2 leading-none">
                Showing system performance metrics (CPU, Memory, Connections)
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default App