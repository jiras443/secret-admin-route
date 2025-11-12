import { Upload } from "lucide-react"

interface FileUploadProps {
  onDataLoaded: (data: any[]) => void
  fileName: string
  recordCount: number
}

export function InputView({ onDataLoaded, fileName, recordCount }: FileUploadProps) {
    
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      
      const data = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const [ts, cpu, mem, conn] = line.split(',')
          return {
            index: index,
            cpu: parseFloat(cpu) || 0,
            mem: parseFloat(mem) || 0,
            conn: parseFloat(conn) || 0
          }
        })

      onDataLoaded(data)
    }

    reader.readAsText(file)
  }

  return (
    <div className="mb-4 flex items-center gap-4">
      <button
        onClick={() => document.getElementById('csv-upload')?.click()}
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm font-medium"
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
        <span className="text-sm text-gray-500">
          {fileName} ({recordCount} records)
        </span>
      )}
    </div>
  )
}