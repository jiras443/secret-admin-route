import { Upload, X } from "lucide-react"
import { formatElapsedTime, formatTimeLabel } from "./utils/dataProcessing"

interface FileUploadProps {
  onDataLoaded: (data: any[]) => void
  onClear: () => void
  fileName: string
  recordCount: number
}

export function InputView({ onDataLoaded, onClear, fileName, recordCount }: FileUploadProps) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        
        if (!text) {
          alert('File is empty')
          return
        }

        const lines = text.split('\n')

        const rawData = lines
          .slice(1)
          .filter(line => line.trim())
          .map((line) => {
            const parts = line.split(',').map(s => s.trim())
            
            if (parts.length < 4) {
              return null
            }

            const [ts, cpu, mem, conn] = parts
            
            const cpuNum = parseFloat(cpu)
            const memNum = parseFloat(mem)
            const connNum = parseFloat(conn)

            if (isNaN(cpuNum) || isNaN(memNum) || isNaN(connNum)) {
              return null
            }

            return {
              timestamp: parseInt(ts),
              cpu: cpuNum,
              mem: memNum,
              conn: connNum
            }
          })
          .filter(item => item !== null)

        const startTime = rawData[0]?.timestamp || 0
        
        const data = rawData.map((item, index) => {
          const elapsedNano = item.timestamp - startTime
          const elapsedSeconds = Math.floor(elapsedNano / 1000000000)
          
          return {
            index: index,
            timestamp: item.timestamp,
            elapsedSeconds: elapsedSeconds,
            time: formatElapsedTime(elapsedSeconds),
            timeLabel: formatTimeLabel(elapsedSeconds),
            fullTime: formatElapsedTime(elapsedSeconds),
            cpu: item.cpu,
            mem: item.mem,
            conn: item.conn
          }
        })

        onDataLoaded(data)
        
      } catch (error) {
        console.error('Error parsing file:', error)
        alert('Error parsing file. Please check the file format.')
      }
    }

    reader.onerror = () => {
      console.error('Error reading file')
      alert('Error reading file')
    }

    reader.readAsText(file)
  }

  const handleClear = () => {
    const input = document.getElementById('csv-upload') as HTMLInputElement
    if (input) {
      input.value = ''
    }
    onClear()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => document.getElementById('csv-upload')?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          <Upload className="h-4 w-4" />
          Upload CSV
        </button>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        {fileName && (
          <>
            <span className="text-sm text-gray-500">
              {fileName} ({recordCount.toLocaleString()} records)
            </span>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1 px-3 py-2 border border-red-300 rounded-md bg-white hover:bg-red-50 text-sm font-medium text-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </>
        )}
      </div>
      
      {!fileName && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 mb-1">
            Click "Upload CSV" to select a file
          </p>
          <p className="text-xs text-gray-500">
            Expected format: TS, CPU_%, MEM_MB, CONN
          </p>
        </div>
      )}
    </div>
  )
}