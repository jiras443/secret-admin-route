import { useState } from "react"

interface TimeRangeSelectorProps {
  data: Array<{
    index: number
    elapsedSeconds: number
    timeLabel: string
  }>
  onRangeChange: (startIndex: number, endIndex: number) => void
}

export function TimeRangeSelectorByHours({ data, onRangeChange }: TimeRangeSelectorProps) {
  if (!data || data.length === 0) return null

  const maxSeconds = data[data.length - 1].elapsedSeconds
  const maxHours = Math.ceil(maxSeconds / 3600)

  const [startHour, setStartHour] = useState(0)
  const [endHour, setEndHour] = useState(maxHours)

  const findIndexBySeconds = (targetSeconds: number): number => {
    let closestIndex = 0
    let minDiff = Math.abs(data[0].elapsedSeconds - targetSeconds)

    for (let i = 1; i < data.length; i++) {
      const diff = Math.abs(data[i].elapsedSeconds - targetSeconds)
      if (diff < minDiff) {
        minDiff = diff
        closestIndex = i
      }
      if (data[i].elapsedSeconds >= targetSeconds) {
        return i
      }
    }

    return closestIndex
  }

  const handleStartChange = (value: number) => {
    if (value <= endHour) {
      setStartHour(value)
      const startSeconds = value * 3600
      const endSeconds = endHour * 3600
      const startIndex = findIndexBySeconds(startSeconds)
      const endIndex = findIndexBySeconds(endSeconds)
      onRangeChange(startIndex, endIndex)
    }
  }

  const handleEndChange = (value: number) => {
    if (value >= startHour) {
      setEndHour(value)
      const startSeconds = startHour * 3600
      const endSeconds = value * 3600
      const startIndex = findIndexBySeconds(startSeconds)
      const endIndex = findIndexBySeconds(endSeconds)
      onRangeChange(startIndex, endIndex)
    }
  }

  const handleReset = () => {
    setStartHour(0)
    setEndHour(maxHours)
    onRangeChange(0, data.length - 1)
  }

  const handleQuickSelect = (hours: number) => {
    setStartHour(0)
    setEndHour(Math.min(hours, maxHours))
    const endSeconds = Math.min(hours, maxHours) * 3600
    const endIndex = findIndexBySeconds(endSeconds)
    onRangeChange(0, endIndex)
  }

  const durationHours = endHour - startHour
  const percentage = ((durationHours / maxHours) * 100).toFixed(1)

  const formatDuration = (hours: number): string => {
    if (hours === 0) return "0h"
    const mins = Math.round((hours % 1) * 60)
    const wholeHours = Math.floor(hours)
    
    if (mins > 0) {
      return `${wholeHours}h ${mins}m`
    }
    return `${wholeHours}h`
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Time Range Selector</h3>
        <span className="text-xs text-gray-500">
          Duration: {formatDuration(durationHours)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start (hours)</label>
          <input
            type="number"
            min={0}
            max={maxHours}
            step={1}
            value={startHour}
            onChange={(e) => handleStartChange(parseInt(e.target.value) || 0)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
          <div className="text-xs text-gray-500 mt-1">
            {startHour}h from start
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">End (hours)</label>
          <input
            type="number"
            min={0}
            max={maxHours}
            step={1}
            value={endHour}
            onChange={(e) => handleEndChange(parseInt(e.target.value) || maxHours)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
          <div className="text-xs text-gray-500 mt-1">
            {endHour}h from start
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Select Duration:</label>
        <input
          type="range"
          min={0}
          max={maxHours}
          step={1}
          value={endHour}
          onChange={(e) => {
            const value = parseInt(e.target.value)
            setStartHour(0)
            handleEndChange(value)
          }}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0h</span>
          <span>{maxHours}h (all data)</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-600">Quick Select:</div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleQuickSelect(1)}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-xs font-medium"
          >
            1 Hour
          </button>
          <button
            onClick={() => handleQuickSelect(2)}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-xs font-medium"
          >
            2 Hours
          </button>
          <button
            onClick={() => handleQuickSelect(6)}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-xs font-medium"
          >
            6 Hours
          </button>
          <button
            onClick={() => handleQuickSelect(12)}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-xs font-medium"
          >
            12 Hours
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-medium"
          >
            Show All
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500 bg-white p-2 rounded border">
        📊 Displaying from <strong>{startHour}h</strong> to <strong>{endHour}h</strong>
        {" "}({percentage}% of total time range)
      </div>
    </div>
  )
}