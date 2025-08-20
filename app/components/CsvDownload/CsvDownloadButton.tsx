"use client"
import React from "react"
import { toast } from "react-toastify"

import { DownloadButton } from "./CsvDownloadButton.style"
interface CsvData {
  headers: string[]
  rows: (string | number)[][]
}

interface CsvDownloadButtonProps {
  data: CsvData | (() => CsvData)
  filename: string
  disabled?: boolean
  buttonText?: string
  emptyDataMessage?: string
  successMessage?: string | ((rowCount: number) => string)
  errorMessage?: string
  className?: string
  style?: React.CSSProperties
}

export default function CsvDownloadButton({
  data,
  filename,
  disabled = false,
  buttonText = "CSV",
  emptyDataMessage = "다운로드할 데이터가 없습니다.",
  successMessage = "CSV 파일이 다운로드되었습니다.",
  errorMessage = "CSV 다운로드에 실패했습니다.",
  className,
  style,
}: CsvDownloadButtonProps) {
  const handleDownloadCsv = () => {
    try {
      // Get data (could be static or from a function)
      const csvData = typeof data === "function" ? data() : data

      if (!csvData.rows || csvData.rows.length === 0) {
        toast.error(emptyDataMessage)
        return
      }

      // Create CSV content (escape + guard against formula injection)
      const escapeAndSanitize = (value: string | number): string => {
        const cellStr = String(value ?? "")
        // If trimmed value starts with a formula char, prefix with apostrophe to prevent execution in Excel.
        const trimmed = cellStr.replace(/^\s+/, "")
        const needsFormulaEscape = /^[=+\-@]/.test(trimmed)
        const safe = needsFormulaEscape ? "'" + cellStr : cellStr
        const escaped = safe.replace(/"/g, '""')
        return /[,"\n]/.test(safe) ? `"${escaped}"` : escaped
      }

      const csvHeader = csvData.headers.map(escapeAndSanitize).join(",") + "\r\n"
      const csvContent = csvData.rows
        .map((row) => row.map(escapeAndSanitize).join(","))
        .join("\r\n")

      const csvFileContent = csvHeader + csvContent

      // Create blob and download
      const blob = new Blob([csvFileContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)

        // Add .csv extension if not present
        const finalFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`

        link.setAttribute("download", finalFilename)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Show success message
        const message = typeof successMessage === "function" ? successMessage(csvData.rows.length) : successMessage
        toast.success(message)
      }
    } catch (error) {
      console.error("Failed to download CSV:", error)
      toast.error(errorMessage)
    }
  }

  return (
    <DownloadButton onClick={handleDownloadCsv} disabled={disabled} className={className} style={style}>
      {buttonText}
    </DownloadButton>
  )
}
