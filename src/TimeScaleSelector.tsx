import { Clock } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface TimeScaleSelectorProps {
  totalSeconds: number
  onScaleChange: (scale: 'auto' | 'minutes' | 'hours' | 'days') => void
  currentScale?: 'auto' | 'minutes' | 'hours' | 'days'
}

export function TimeScaleSelector({ 
  totalSeconds, 
  onScaleChange, 
  currentScale = 'auto' 
}: TimeScaleSelectorProps) {
  
  const availableScales = (() => {
    const scales: Array<{ value: string; label: string; disabled: boolean }> = [
      { value: 'auto', label: 'Auto', disabled: false }
    ]
    
    scales.push({ value: 'minutes', label: 'Minutes', disabled: false })
    
    if (totalSeconds >= 1800) {
      scales.push({ value: 'hours', label: 'Hours', disabled: false })
    }
    
    if (totalSeconds >= 43200) {
      scales.push({ value: 'days', label: 'Days', disabled: false })
    }
    
    return scales
  })()
  
  const formatDuration = (seconds: number): string => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    const parts = []
    if (days > 0) parts.push(`${days}d`)
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)
    
    return parts.join(' ')
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onScaleChange(e.target.value as 'auto' | 'minutes' | 'hours' | 'days')
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Scale Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Total Duration: <span className="font-medium">{formatDuration(totalSeconds)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <label htmlFor="time-scale" className="text-sm font-medium">
              Time Scale:
            </label>
            <select
              id="time-scale"
              value={currentScale}
              onChange={handleChange}
              className="w-[140px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {availableScales.map((scale) => (
                <option 
                  key={scale.value} 
                  value={scale.value}
                  disabled={scale.disabled}
                >
                  {scale.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}