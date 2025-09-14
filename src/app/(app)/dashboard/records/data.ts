
export type Record = {
  id: string
  fileName: string
  fileType: "PDF" | "Excel" | "CSV"
  uploadDate: string
  fileSize: number // in bytes
  status: "pending" | "processing" | "completed" | "failed"
  riskLevel?: "High" | "Medium" | "Low"
}
