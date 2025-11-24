import { TrendingUp, LineChart, Clock } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { type AggregationInterval, getIntervalLabel, getAvailableIntervals } from "./utils/aggregation"

interface ChartViewSelectorProps {
  viewMode: 'detailed' | 'aggregated'
  onViewModeChange: (mode: 'detailed' | 'aggregated') => void
  aggregationInterval: AggregationInterval
  onIntervalChange: (interval: AggregationInterval) => void
  totalSeconds: number
  showMaxValues: boolean
  onShowMaxChange: (show: boolean) => void
}

export function ChartViewSelector({ 
  viewMode,
  onViewModeChange,
  aggregationInterval,
  onIntervalChange,
  totalSeconds,
  showMaxValues,
  onShowMaxChange
}: ChartViewSelectorProps) {
  
  const availableIntervals = getAvailableIntervals(totalSeconds)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Chart View Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">View Mode:</label>
            <div className="flex rounded-lg border border-gray-200">
              <button
                onClick={() => onViewModeChange('detailed')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors flex items-center gap-2 ${
                  viewMode === 'detailed'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LineChart className="h-4 w-4" />
                Detailed (All Points)
              </button>
              <button
                onClick={() => onViewModeChange('aggregated')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors flex items-center gap-2 ${
                  viewMode === 'aggregated'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Aggregated (Averaged)
              </button>
            </div>
          </div>

          {/* Aggregation Settings - Only show when in aggregated mode */}
          {viewMode === 'aggregated' && (
            <>
              <div className="flex items-center gap-4">
                <label htmlFor="aggregation-interval" className="text-sm font-medium">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Aggregation Interval:
                </label>
                <select
                  id="aggregation-interval"
                  value={aggregationInterval}
                  onChange={(e) => onIntervalChange(e.target.value as AggregationInterval)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {availableIntervals.map((interval) => (
                    <option key={interval} value={interval}>
                      {getIntervalLabel(interval)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Display Options:</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMaxValues}
                    onChange={(e) => onShowMaxChange(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">Show Max Values</span>
                </label>
              </div>

              <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                💡 Aggregated view shows average values with optional maximum lines for each time interval, 
                making it easier to identify patterns in large datasets.
              </div>
            </>
          )}

          {/* Info for detailed mode */}
          {viewMode === 'detailed' && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              ℹ️ Detailed view shows all data points. For large datasets, consider using 
              aggregated view for better performance and readability.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}