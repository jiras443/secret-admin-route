export interface AggregatedData {
  index: number
  startTime: string
  endTime: string
  timeLabel: string
  elapsedSeconds: number
  
  cpuAvg: number
  cpuMax: number
  cpuMin: number
  
  memAvg: number
  memMax: number
  memMin: number
  
  connAvg: number
  connMax: number
  connMin: number
  
  dataPoints: number
}

export type AggregationInterval = '1min' | '5min' | '10min' | '15min' | '30min' | '1hour' | '2hour' | '4hour'

export function getIntervalSeconds(interval: AggregationInterval): number {
  const intervals: Record<AggregationInterval, number> = {
    '1min': 60,
    '5min': 300,
    '10min': 600,
    '15min': 900,
    '30min': 1800,
    '1hour': 3600,
    '2hour': 7200,
    '4hour': 14400
  }
  return intervals[interval]
}

export function getIntervalLabel(interval: AggregationInterval): string {
  const labels: Record<AggregationInterval, string> = {
    '1min': '1 Minute',
    '5min': '5 Minutes',
    '10min': '10 Minutes',
    '15min': '15 Minutes',
    '30min': '30 Minutes',
    '1hour': '1 Hour',
    '2hour': '2 Hours',
    '4hour': '4 Hours'
  }
  return labels[interval]
}

export function getAvailableIntervals(totalSeconds: number): AggregationInterval[] {
  const allIntervals: AggregationInterval[] = ['1min', '5min', '10min', '15min', '30min', '1hour', '2hour', '4hour']
  
  // Filter intervals based on total duration
  // We want at least 5 data points and no more than 500
  return allIntervals.filter(interval => {
    const intervalSeconds = getIntervalSeconds(interval)
    const dataPoints = Math.ceil(totalSeconds / intervalSeconds)
    return dataPoints >= 5 && dataPoints <= 500
  })
}

export function aggregateData(
  data: Array<{
    index: number
    timestamp: number
    elapsedSeconds: number
    time: string
    timeLabel: string
    fullTime: string
    cpu: number
    mem: number
    conn: number
  }>,
  interval: AggregationInterval
): AggregatedData[] {
  if (data.length === 0) return []
  
  const intervalSeconds = getIntervalSeconds(interval)
  const aggregated: AggregatedData[] = []
  
  // Group data by interval
  let currentBucket: typeof data = []
  let bucketStartSeconds = 0
  let bucketIndex = 0
  
  for (const point of data) {
    const bucketNumber = Math.floor(point.elapsedSeconds / intervalSeconds)
    const expectedBucketStart = bucketNumber * intervalSeconds
    
    // If we've moved to a new bucket, process the current one
    if (expectedBucketStart !== bucketStartSeconds && currentBucket.length > 0) {
      const aggregatedPoint = processBucket(
        currentBucket, 
        bucketStartSeconds, 
        intervalSeconds, 
        bucketIndex
      )
      aggregated.push(aggregatedPoint)
      
      // Start new bucket
      currentBucket = [point]
      bucketStartSeconds = expectedBucketStart
      bucketIndex++
    } else {
      currentBucket.push(point)
      if (currentBucket.length === 1) {
        bucketStartSeconds = expectedBucketStart
      }
    }
  }
  
  // Process the last bucket
  if (currentBucket.length > 0) {
    const aggregatedPoint = processBucket(
      currentBucket, 
      bucketStartSeconds, 
      intervalSeconds, 
      bucketIndex
    )
    aggregated.push(aggregatedPoint)
  }
  
  return aggregated
}

function processBucket(
  bucket: Array<{
    index: number
    timestamp: number
    elapsedSeconds: number
    time: string
    timeLabel: string
    fullTime: string
    cpu: number
    mem: number
    conn: number
  }>,
  startSeconds: number,
  intervalSeconds: number,
  bucketIndex: number
): AggregatedData {
  const cpuValues = bucket.map(p => p.cpu)
  const memValues = bucket.map(p => p.mem)
  const connValues = bucket.map(p => p.conn)
  
  const startTime = formatTime(startSeconds)
  const endTime = formatTime(startSeconds + intervalSeconds)
  const timeLabel = formatTimeRange(startSeconds, startSeconds + intervalSeconds)
  
  return {
    index: bucketIndex,
    startTime,
    endTime,
    timeLabel,
    elapsedSeconds: startSeconds,
    
    cpuAvg: parseFloat((cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length).toFixed(2)),
    cpuMax: parseFloat(Math.max(...cpuValues).toFixed(2)),
    cpuMin: parseFloat(Math.min(...cpuValues).toFixed(2)),
    
    memAvg: parseFloat((memValues.reduce((a, b) => a + b, 0) / memValues.length).toFixed(2)),
    memMax: Math.round(Math.max(...memValues)),
    memMin: Math.round(Math.min(...memValues)),
    
    connAvg: parseFloat((connValues.reduce((a, b) => a + b, 0) / connValues.length).toFixed(2)),
    connMax: Math.round(Math.max(...connValues)),
    connMin: Math.round(Math.min(...connValues)),
    
    dataPoints: bucket.length
  }
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

function formatTimeRange(startSeconds: number, endSeconds: number): string {
  const totalHours = Math.floor(startSeconds / 3600)
  const totalMinutes = Math.floor((startSeconds % 3600) / 60)
  
  if (totalHours > 0) {
    return `${totalHours}h${totalMinutes > 0 ? `:${totalMinutes.toString().padStart(2, '0')}` : ''}`
  }
  return `${totalMinutes}m`
}