// Format elapsed seconds to readable time format
export function formatElapsedTime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${secs}s`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

// Format time label for chart axis based on scale
export function formatTimeLabel(seconds: number, scale: 'auto' | 'minutes' | 'hours' | 'days' = 'auto'): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  // Auto-detect best scale based on total duration
  let effectiveScale = scale
  if (scale === 'auto') {
    if (seconds >= 86400 * 2) { // More than 2 days
      effectiveScale = 'days'
    } else if (seconds >= 3600 * 4) { // More than 4 hours
      effectiveScale = 'hours'
    } else {
      effectiveScale = 'minutes'
    }
  }

  switch (effectiveScale) {
    case 'days':
      if (days === 0) return `${hours}h`
      return `${days}d ${hours}h`
    
    case 'hours':
      if (hours === 0 && days === 0) return `${minutes}m`
      const totalHours = days * 24 + hours
      return `${totalHours}h ${minutes}m`
    
    case 'minutes':
    default:
      const totalMinutes = Math.floor(seconds / 60)
      return `${totalMinutes}m`
  }
}

// Get appropriate tick interval based on data duration and desired number of ticks
export function getTickInterval(dataLength: number, totalSeconds: number, maxTicks: number = 10): number {
  // Calculate ideal interval based on time
  const secondsPerTick = totalSeconds / maxTicks
  
  // Round to nice intervals
  let targetInterval: number
  
  if (secondsPerTick >= 86400) { // Days
    targetInterval = Math.ceil(secondsPerTick / 86400) * 86400
  } else if (secondsPerTick >= 3600) { // Hours
    // Round to nearest hour (1, 2, 3, 4, 6, 12, 24)
    const hours = secondsPerTick / 3600
    if (hours <= 1) targetInterval = 3600
    else if (hours <= 2) targetInterval = 2 * 3600
    else if (hours <= 3) targetInterval = 3 * 3600
    else if (hours <= 4) targetInterval = 4 * 3600
    else if (hours <= 6) targetInterval = 6 * 3600
    else if (hours <= 12) targetInterval = 12 * 3600
    else targetInterval = 24 * 3600
  } else if (secondsPerTick >= 60) { // Minutes
    // Round to nice minute intervals (1, 5, 10, 15, 30, 60)
    const minutes = secondsPerTick / 60
    if (minutes <= 1) targetInterval = 60
    else if (minutes <= 5) targetInterval = 5 * 60
    else if (minutes <= 10) targetInterval = 10 * 60
    else if (minutes <= 15) targetInterval = 15 * 60
    else if (minutes <= 30) targetInterval = 30 * 60
    else targetInterval = 60 * 60
  } else { // Seconds
    targetInterval = Math.max(1, Math.ceil(secondsPerTick))
  }
  
  // Convert time interval to data point interval
  const dataPointsPerSecond = dataLength / totalSeconds
  return Math.max(1, Math.round(targetInterval * dataPointsPerSecond))
}

// Format tick label based on position and scale
export function formatTickLabel(seconds: number, totalDuration: number): string {
  // For very long durations, use day/hour format
  if (totalDuration >= 86400 * 2) {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    if (days === 0) return `${hours}h`
    if (hours === 0) return `${days}d`
    return `${days}d ${hours}h`
  }
  
  // For medium durations, use hour:minute format
  if (totalDuration >= 3600 * 2) {
    const totalHours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${totalHours}h${minutes > 0 ? `:${minutes.toString().padStart(2, '0')}m` : ''}`
  }
  
  // For short durations, use minute:second format
  const totalMinutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (totalMinutes === 0) return `${secs}s`
  return `${totalMinutes}m${secs > 0 ? `:${secs}s` : ''}`
}

// Determine the best scale based on the duration
export function determineTimeScale(totalSeconds: number): 'seconds' | 'minutes' | 'hours' | 'days' {
  if (totalSeconds >= 86400 * 2) return 'days'
  if (totalSeconds >= 3600 * 4) return 'hours'
  if (totalSeconds >= 60 * 10) return 'minutes'
  return 'seconds'
}