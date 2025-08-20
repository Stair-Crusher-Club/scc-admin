import { format } from "date-fns"
import React from "react"

import { AdminPushNotificationScheduleDTO } from "@/lib/generated-sources/openapi"

import CsvDownloadButton from "@/components/CsvDownload/CsvDownloadButton"

interface NotificationCsvDownloadButtonProps {
  schedule: AdminPushNotificationScheduleDTO
  disabled?: boolean
}

export function NotificationCsvDownloadButton({ schedule, disabled = false }: NotificationCsvDownloadButtonProps) {
  const generateCsvData = () => ({
    headers: ["user_id"],
    rows: schedule.targetUserIds?.map((id) => [id.toString()]) || [],
  })

  const generateFilename = () => {
    const scheduleDate = schedule.scheduledAt?.value
      ? format(new Date(schedule.scheduledAt.value), "yyyy-MM-dd_HH-mm")
      : "unknown"
    const scheduleTitle = schedule.title ? schedule.title.replace(/[^a-zA-Z0-9가-힣]/g, "_") : "untitled"
    return `target_users_${scheduleTitle}_${scheduleDate}`
  }

  return (
    <CsvDownloadButton
      data={generateCsvData}
      filename={generateFilename()}
      disabled={disabled || !schedule.targetUserIds?.length}
      buttonText="유저 명단 다운로드"
      emptyDataMessage="다운로드할 사용자 ID가 없습니다."
      successMessage={(rowCount) => `CSV 파일이 다운로드되었습니다. (${rowCount}개 사용자 ID)`}
      errorMessage="CSV 다운로드에 실패했습니다."
    />
  )
}
