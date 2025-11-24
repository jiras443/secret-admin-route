"use client"
import { useState, useMemo } from "react"
import { Activity, Network } from "lucide-react"
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
import { ConnectionsChart } from "./ConnectionsChart"
import { AggregatedPerformanceChart } from "./Aggregatedperformancechart"
import { AggregatedConnectionsChart } from "./Aggregatedconnectionschart"
import { TimeRangeSelectorByHours } from "./TimeRangeSelector"
import { TimeScaleSelector } from "./TimeScaleSelector"
import { ChartViewSelector } from "./Chartviewselector"
import { 
  aggregateData, 
  type AggregationInterval, 
  type AggregatedData,
  getAvailableIntervals 
} from "./utils/aggregation"

function App() {
  const [rawData, setRawData] = useState<any[]>([])
  const [fileName, setFileName] = useState<string>("")
  const [timeRange, setTimeRange] = useState({ start: 0, end: 0 })
  const [isProcessing, setIsProcessing] = useState(false)
  const [timeScale, setTimeScale] = useState<'auto' | 'minutes' | 'hours' | 'days'>('auto')
  const [viewMode, setViewMode] = useState<'detailed' | 'aggregated'>('detailed')
  const [aggregationInterval, setAggregationInterval] = useState<AggregationInterval>('1min')
  const [showMaxValues, setShowMaxValues] = useState(true)

  const handleDataLoaded = (data: any[]) => {
    setIsProcessing(true)
    setRawData(data)
    setFileName("data.csv")
    setTimeRange({ start: 0, end: data.length - 1 })
    setTimeScale('auto')
    
    if (data.length > 10000) {
      setViewMode('aggregated')
      const totalSeconds = data[data.length - 1]?.elapsedSeconds || 0
      const intervals = getAvailableIntervals(totalSeconds)
      if (intervals.includes('5min')) {
        setAggregationInterval('5min')
      } else if (intervals.length > 0) {
        setAggregationInterval(intervals[Math.floor(intervals.length / 2)])
      }
    } else {
      setViewMode('detailed')
    }
    
    setTimeout(() => setIsProcessing(false), 100)
  }

  const handleClear = () => {
    setRawData([])
    setFileName("")
    setTimeRange({ start: 0, end: 0 })
    setIsProcessing(false)
    setTimeScale('auto')
    setViewMode('detailed')
    setAggregationInterval('1min')
  }

  const handleTimeRangeChange = (startIndex: number, endIndex: number) => {
    setTimeRange({ start: startIndex, end: endIndex })
  }

  const filteredData = useMemo(() => {
    if (rawData.length === 0) return []
    
    return rawData.filter(
      (d) => d.index >= timeRange.start && d.index <= timeRange.end
    )
  }, [rawData, timeRange])

  const aggregatedData = useMemo((): AggregatedData[] => {
    if (viewMode === 'detailed' || filteredData.length === 0) return []
    
    return aggregateData(filteredData, aggregationInterval)
  }, [filteredData, viewMode, aggregationInterval])

  const totalDuration = useMemo(() => {
    if (filteredData.length === 0) return 0
    return filteredData[filteredData.length - 1]?.elapsedSeconds || 0
  }, [filteredData])

  const stats = useMemo(() => {
    if (viewMode === 'detailed') {
      if (filteredData.length === 0) {
        return { 
          peakCPU: "0.00", minCPU: "0.00", avgCPU: "0.00",
          maxMem: 0, minMem: 0, avgMem: "0.00",
          maxConn: 0, minConn: 0, avgConn: "0.00"
        }
      }

      const cpuValues = filteredData.map(d => d.cpu)
      const memValues = filteredData.map(d => d.mem)
      const connValues = filteredData.map(d => d.conn)

      return {
        peakCPU: Math.max(...cpuValues).toFixed(2),
        minCPU: Math.min(...cpuValues).toFixed(2),
        avgCPU: (cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length).toFixed(2),
        
        maxMem: Math.max(...memValues),
        minMem: Math.min(...memValues),
        avgMem: (memValues.reduce((a, b) => a + b, 0) / memValues.length).toFixed(2),
        
        maxConn: Math.max(...connValues),
        minConn: Math.min(...connValues),
        avgConn: (connValues.reduce((a, b) => a + b, 0) / connValues.length).toFixed(2)
      }
    } else {
      if (aggregatedData.length === 0) {
        return { 
          peakCPU: "0.00", minCPU: "0.00", avgCPU: "0.00",
          maxMem: 0, minMem: 0, avgMem: "0.00",
          maxConn: 0, minConn: 0, avgConn: "0.00"
        }
      }

      const cpuMaxValues = aggregatedData.map(d => d.cpuMax)
      const cpuMinValues = aggregatedData.map(d => d.cpuMin)
      const cpuAvgValues = aggregatedData.map(d => d.cpuAvg)
      
      const memMaxValues = aggregatedData.map(d => d.memMax)
      const memMinValues = aggregatedData.map(d => d.memMin)
      const memAvgValues = aggregatedData.map(d => d.memAvg)
      
      const connMaxValues = aggregatedData.map(d => d.connMax)
      const connMinValues = aggregatedData.map(d => d.connMin)
      const connAvgValues = aggregatedData.map(d => d.connAvg)

      return {
        peakCPU: Math.max(...cpuMaxValues).toFixed(2),
        minCPU: Math.min(...cpuMinValues).toFixed(2),
        avgCPU: (cpuAvgValues.reduce((a, b) => a + b, 0) / cpuAvgValues.length).toFixed(2),
        
        maxMem: Math.max(...memMaxValues),
        minMem: Math.min(...memMinValues),
        avgMem: (memAvgValues.reduce((a, b) => a + b, 0) / memAvgValues.length).toFixed(2),
        
        maxConn: Math.max(...connMaxValues),
        minConn: Math.min(...connMinValues),
        avgConn: (connAvgValues.reduce((a, b) => a + b, 0) / connAvgValues.length).toFixed(2)
      }
    }
  }, [filteredData, aggregatedData, viewMode])

  const hasData = rawData.length > 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Data</CardTitle>
            <CardDescription>Upload CSV file to visualize performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <InputView 
              onDataLoaded={handleDataLoaded}
              onClear={handleClear}
              fileName={fileName}
              recordCount={rawData.length}
            />
          </CardContent>
        </Card>
        
        {hasData && !isProcessing && (
          <>
            <TimeRangeSelectorByHours
              data={rawData}
              onRangeChange={handleTimeRangeChange}
            />

            <ChartViewSelector
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              aggregationInterval={aggregationInterval}
              onIntervalChange={setAggregationInterval}
              totalSeconds={totalDuration}
              showMaxValues={showMaxValues}
              onShowMaxChange={setShowMaxValues}
            />

            {viewMode === 'detailed' && (
              <TimeScaleSelector
                totalSeconds={totalDuration}
                onScaleChange={(scale) => setTimeScale(scale)}
                currentScale={timeScale}
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  CPU & Memory Performance
                  {viewMode === 'aggregated' && (
                    <span className="text-sm font-normal text-gray-500">
                      (Aggregated by {aggregationInterval})
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  System resource utilization over time
                  {viewMode === 'detailed' && filteredData.length > 0 && ` (${filteredData.length.toLocaleString()} points)`}
                  {viewMode === 'aggregated' && aggregatedData.length > 0 && ` (${aggregatedData.length} intervals from ${filteredData.length.toLocaleString()} points)`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {viewMode === 'detailed' ? (
                  <PerformanceChart data={filteredData} timeScale={timeScale} />
                ) : (
                  <AggregatedPerformanceChart data={aggregatedData} showMax={showMaxValues} />
                )}
              </CardContent>
              <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                  <div className="grid gap-2 w-full">
                    <div className="flex items-center gap-2 leading-none font-medium text-blue-600">
                      CPU - Peak: {stats.peakCPU}% | Min: {stats.minCPU}% | Avg: {stats.avgCPU}%
                    </div>
                    <div className="flex items-center gap-2 leading-none font-medium text-green-600">
                      Memory - Max: {stats.maxMem} MB | Min: {stats.minMem} MB | Avg: {stats.avgMem} MB
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-red-600" />
                  Network Connections
                  {viewMode === 'aggregated' && (
                    <span className="text-sm font-normal text-gray-500">
                      (Aggregated by {aggregationInterval})
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Active network connections over time
                  {viewMode === 'detailed' && filteredData.length > 0 && ` (${filteredData.length.toLocaleString()} points)`}
                  {viewMode === 'aggregated' && aggregatedData.length > 0 && ` (${aggregatedData.length} intervals from ${filteredData.length.toLocaleString()} points)`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {viewMode === 'detailed' ? (
                  <ConnectionsChart data={filteredData} timeScale={timeScale} />
                ) : (
                  <AggregatedConnectionsChart data={aggregatedData} showMax={showMaxValues} />
                )}
              </CardContent>
              <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                  <div className="grid gap-2 w-full">
                    <div className="flex items-center gap-2 leading-none font-medium">
                      Max: {stats.maxConn} | Min: {stats.minConn} | Avg: {stats.avgConn}
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </>
        )}

        {hasData && isProcessing && (
          <Card>
            <CardContent className="pt-6">
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-600">Processing data...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default App