"use client"

import { format } from "date-fns"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { deletePushSchedule, sendPushNotification, updatePushSchedule, usePushSchedules } from "@/lib/apis/api"
import {
  AdminPushNotificationScheduleDTO,
  AdminSendPushNotificationRequestDTO,
  AdminUpdatePushNotificationScheduleRequestDTO,
} from "@/lib/generated-sources/openapi"

import { Contents, Header } from "@/components/layout"

import { NotificationCsvDownloadButton } from "./components/NotificationCsvDownloadButton"
import { NotificationScheduleUpdateForm, UpdateScheduleFormValues } from "./components/NotificationScheduleUpdateForm"
import { NotificationSendForm, SendPushNotificationFormValues, ParsedSendPushNotificationFormValues } from "./components/NotificationSendForm"
import { Option, DeepLinkOption, deepLinkOptions, headerVariantOptions } from "./components/constants"
import { buildDeepLinkFromFormValues } from "./components/deepLinkUtils"
import * as S from "./page.style"

function createWebviewDeepLink(url: string, fixedTitle: string, headerVariant: string): string {
  return `stair-crusher://webview?url=${encodeURIComponent(url)}&fixedTitle=${encodeURIComponent(fixedTitle)}&headerVariant=${encodeURIComponent(headerVariant)}`
}

interface ParsedDeepLinkData {
  selectedDeepLinkOption?: DeepLinkOption
  deepLinkArgument: string
  queryParams: { [key: string]: string }
  customDeepLink: string
  webviewUrl: string
  webviewFixedTitle: string
  webviewHeaderVariant: Option | undefined
}

function parseDeepLink(deepLinkUrl?: string): ParsedDeepLinkData {
  let selectedDeepLinkOption: DeepLinkOption | undefined = undefined
  let deepLinkArgument = ""
  let queryParams: { [key: string]: string } = {}
  let customDeepLink = ""
  let webviewUrl = ""
  let webviewFixedTitle = ""
  let webviewHeaderVariant: Option | undefined = undefined

  if (!deepLinkUrl) {
    return {
      selectedDeepLinkOption,
      deepLinkArgument,
      queryParams,
      customDeepLink,
      webviewUrl,
      webviewFixedTitle,
      webviewHeaderVariant,
    }
  }

  // Check if it's a search deeplink
  if (deepLinkUrl.startsWith("stair-crusher://search")) {
    selectedDeepLinkOption = deepLinkOptions.find((opt) => opt.value === "stair-crusher://search") || deepLinkOptions[0]
    const urlParts = deepLinkUrl.split("?")
    if (urlParts.length > 1) {
      const params = new URLSearchParams(urlParts[1])
      params.forEach((value, key) => {
        queryParams[key] = value
      })
    }
  } else if (deepLinkUrl.startsWith("stair-crusher://webview")) {
    selectedDeepLinkOption = deepLinkOptions.find((opt) => opt.value === "stair-crusher://webview") || deepLinkOptions[0]
    const params = new URLSearchParams(deepLinkUrl.split("?")[1] || "")
    webviewUrl = params.get("url") || ""
    webviewFixedTitle = params.get("fixedTitle") || ""
    const headerVariantValue = params.get("headerVariant") || undefined
    webviewHeaderVariant = headerVariantOptions.find((opt) => opt.value === headerVariantValue)
  } else {
    // Try to find exact match first
    const exactMatch = deepLinkOptions.find((opt) => opt.value === (deepLinkUrl.split("?")[0] || deepLinkUrl))
    
    if (exactMatch) {
      selectedDeepLinkOption = exactMatch
    } else {
      // Check for argument-required options
      const baseUrl = deepLinkUrl.split("/").slice(0, 3).join("/")
      const baseMatch = deepLinkOptions.find((opt) => opt.value === baseUrl)
      
      if (baseMatch && baseMatch.isArgumentRequired) {
        selectedDeepLinkOption = baseMatch
        // e.g. stair-crusher://place/1234
        const parts = deepLinkUrl.split("/") || []
        deepLinkArgument = parts.length > 3 ? parts.slice(3).join("/") : ""
      } else {
        // If still not found, treat as custom
        selectedDeepLinkOption = deepLinkOptions.find((opt) => opt.value === "custom") || deepLinkOptions[0]
        customDeepLink = deepLinkUrl
      }
    }
  }

  return {
    selectedDeepLinkOption,
    deepLinkArgument,
    queryParams,
    customDeepLink,
    webviewUrl,
    webviewFixedTitle,
    webviewHeaderVariant,
  }
}

function truncateToNearest10Minutes(date: string): Date {
  const parsedDate = new Date(date)
  const ms = parsedDate.getTime()
  const tenMinutes = 10 * 60 * 1000
  return new Date(Math.floor(ms / tenMinutes) * tenMinutes)
}

export default function NotificationPage() {
  const sendPushForm = useForm<SendPushNotificationFormValues>({
    defaultValues: {
      userIds: "",
      title: "",
      body: "",
      deepLink: deepLinkOptions[0],
      deepLinkArgument: "",
      queryParams: {},
      customDeepLink: "",
      webviewUrl: "",
      webviewFixedTitle: "",
      webviewHeaderVariant: undefined,
      scheduleDate: undefined,
    },
  })

  const updateScheduleForm = useForm<UpdateScheduleFormValues>({
    defaultValues: {
      title: "",
      body: "",
      deepLink: deepLinkOptions[0],
      deepLinkArgument: "",
      queryParams: {},
      customDeepLink: "",
      webviewUrl: "",
      webviewFixedTitle: "",
      webviewHeaderVariant: undefined,
      scheduleDate: undefined,
    },
  })

  const [activeTab, setActiveTab] = useState<"send" | "schedule">("send")
  const [editingId, setEditingId] = useState<string | null>(null)
  const { data, isLoading, refetch } = usePushSchedules()
  const schedules = data?.pages.flatMap((s) => s.list) ?? []

  function validateAndExtractForm(formValues: SendPushNotificationFormValues | ParsedSendPushNotificationFormValues | UpdateScheduleFormValues) {
    let titleToUse
    if (formValues.title && formValues.title?.length > 0) {
      titleToUse = formValues.title
    } else {
      titleToUse = undefined
    }

    const deepLinkToUse = buildDeepLinkFromFormValues(formValues)
    
    // Validate deeplink
    if (formValues.deepLink && formValues.deepLink.value.length > 0) {
      if (!deepLinkToUse) {
        if (formValues.deepLink.value === "custom") {
          toast.error("커스텀 딥링크 URL을 입력하세요.")
        } else if (formValues.deepLink.value === "stair-crusher://webview") {
          toast.error("웹뷰 URL, 고정 제목, 헤더 타입을 모두 입력하세요.")
        } else if (formValues.deepLink.isArgumentRequired) {
          toast.error("딥링크 상세 정보를 입력하세요.")
        }
        return
      }
    }

    return {
      title: titleToUse,
      body: formValues.body,
      deepLink: deepLinkToUse,
    }
  }

  async function handleSendPushNotification(formValues: ParsedSendPushNotificationFormValues) {
    try {
      const extractedValues = validateAndExtractForm(formValues)
      if (!extractedValues) return
      const { title, body, deepLink } = extractedValues

      if (formValues.parsedUserIds.length === 0) {
        toast.error("유효한 유저 ID를 입력하세요.")
        return
      }

      const truncatedDate = formValues.scheduleDate ? truncateToNearest10Minutes(formValues.scheduleDate) : undefined
      const payload: AdminSendPushNotificationRequestDTO = {
        userIds: formValues.parsedUserIds,
        title: title,
        body: body,
        deepLink: deepLink,
        scheduledAt: truncatedDate ? { value: truncatedDate.getTime() } : undefined,
      }

      const res = await sendPushNotification(payload)
      if (res.status != 200) {
        throw new Error("Failed to send notification")
      }

      toast.success(`푸시 알림을 ${formValues.parsedUserIds.length}명에게 발송했습니다.`)
      sendPushForm.reset()
    } catch (error) {
      console.error("Failed to send notification:", error)
      toast.error("푸시 알림 발송에 실패했습니다.")
    }
  }

  const handleUpdateSchedule = async (formValues: UpdateScheduleFormValues) => {
    if (!editingId) return
    try {
      const extractedValues = validateAndExtractForm(formValues)
      if (!extractedValues) return
      const { title, body, deepLink } = extractedValues

      if (!formValues.scheduleDate) {
        toast.error("스케줄 날짜를 선택하세요.")
        return
      }

      const truncatedDate = truncateToNearest10Minutes(formValues.scheduleDate)
      const payload: AdminUpdatePushNotificationScheduleRequestDTO = {
        scheduledAt: { value: truncatedDate.getTime() },
        title: title,
        body: body,
        deepLink: deepLink,
      }

      const res = await updatePushSchedule({ id: editingId, payload: payload })
      if (res.status != 204) {
        throw new Error("Failed to update schedule")
      }
      toast.success("스케줄이 수정되었습니다.")
      setEditingId(null)
      setActiveTab("schedule")
      refetch()
    } catch {
      toast.error("스케줄 수정에 실패했습니다.")
    }
  }

  const handleDeleteSchedule = async (schedule: AdminPushNotificationScheduleDTO) => {
    if (schedule.scheduledAt === undefined) return
    if (!window.confirm("정말 삭제하시겠습니까?")) return

    try {
      const res = await deletePushSchedule({ id: schedule.id })
      if (res.status != 204) {
        throw new Error("Failed to delete schedule")
      }
      toast.success("스케줄이 삭제되었습니다.")
      refetch()
    } catch {
      toast.error("스케줄 삭제에 실패했습니다.")
    }
  }

  const handleEditButtonClick = (schedule: AdminPushNotificationScheduleDTO) => {
    if (schedule.scheduledAt === undefined) return

    const parsedData = parseDeepLink(schedule.deepLink)

    updateScheduleForm.reset({
      title: schedule.title || "",
      body: schedule.body || "",
      deepLink: parsedData.selectedDeepLinkOption,
      deepLinkArgument: parsedData.deepLinkArgument,
      queryParams: parsedData.queryParams,
      customDeepLink: parsedData.customDeepLink,
      webviewUrl: parsedData.webviewUrl,
      webviewFixedTitle: parsedData.webviewFixedTitle,
      webviewHeaderVariant: parsedData.webviewHeaderVariant,
      scheduleDate: format(new Date(schedule.scheduledAt.value), "yyyy-MM-dd HH:mm"),
    })
    setEditingId(schedule.id)
  }

  return (
    <>
      <Header title="푸시 알림" />
      <Contents.Normal style={{ width: "100%" }}>
        <S.TabContainer>
          <S.Tab type="button" active={activeTab === "send"} onClick={() => setActiveTab("send")}>
            푸시 알림 발송
          </S.Tab>
          <S.Tab type="button" active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")}>
            푸시 알림 스케줄 확인
          </S.Tab>
        </S.TabContainer>
        {activeTab === "send" ? (
          <NotificationSendForm form={sendPushForm} onSubmit={handleSendPushNotification} />
        ) : (
          <>
            {isLoading ? (
              <div style={{ textAlign: "center", marginTop: 32 }}>로딩 중...</div>
            ) : (
              <S.TableWrapper>
                <div>
                  <S.ScheduleTable>
                    <thead>
                      <S.ScheduleTheadTr>
                        <S.ScheduleTh>발송 예정 시각</S.ScheduleTh>
                        <S.ScheduleTh>발송 시각</S.ScheduleTh>
                        <S.ScheduleTh>제목</S.ScheduleTh>
                        <S.ScheduleTh>내용</S.ScheduleTh>
                        <S.ScheduleTh>딥링크</S.ScheduleTh>
                        <S.ScheduleTh>타겟 유저 수</S.ScheduleTh>
                        <S.ScheduleTh>액션</S.ScheduleTh>
                      </S.ScheduleTheadTr>
                    </thead>
                    <tbody>
                      {schedules.map((schedule: any, idx: number) => (
                        <S.ScheduleTbodyTr key={schedule.id} striped={idx % 2 === 1}>
                          <S.ScheduleTd>
                            {schedule.scheduledAt?.value
                              ? format(new Date(schedule.scheduledAt.value), "yyyy-MM-dd HH:mm")
                              : "즉시 발송"}
                          </S.ScheduleTd>
                          <S.ScheduleTd>
                            {schedule.sentAt?.value
                              ? format(new Date(schedule.sentAt.value), "yyyy-MM-dd HH:mm")
                              : "아직 발송 안됨"}
                          </S.ScheduleTd>
                          <S.ScheduleTd>{schedule.title}</S.ScheduleTd>
                          <S.ScheduleTd>{schedule.body}</S.ScheduleTd>
                          <S.ScheduleTd>{schedule.deepLink}</S.ScheduleTd>
                          <S.ScheduleTd>{schedule.targetUserIds.length}</S.ScheduleTd>
                          <S.ScheduleTd>
                            <S.EditButton
                              onClick={() => handleEditButtonClick(schedule)}
                              disabled={schedule.scheduledAt === undefined}
                            >
                              수정
                            </S.EditButton>
                            <S.DeleteButton
                              onClick={() => handleDeleteSchedule(schedule)}
                              disabled={schedule.scheduledAt === undefined}
                            >
                              삭제
                            </S.DeleteButton>
                            <NotificationCsvDownloadButton
                              schedule={schedule}
                              disabled={schedule.scheduledAt === undefined}
                            />
                          </S.ScheduleTd>
                        </S.ScheduleTbodyTr>
                      ))}
                    </tbody>
                  </S.ScheduleTable>
                  {editingId && (
                    <S.ModalOverlay onClick={() => setEditingId(null)}>
                      <S.ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <S.CloseButton
                          onClick={() => setEditingId(null)}
                          style={{ position: "absolute", top: 8, right: 8 }}
                        >
                          x
                        </S.CloseButton>
                        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                          <NotificationScheduleUpdateForm
                            id={editingId}
                            form={updateScheduleForm}
                            onSubmit={handleUpdateSchedule}
                            onCancel={() => setEditingId(null)}
                          />
                        </div>
                      </S.ModalContent>
                    </S.ModalOverlay>
                  )}
                </div>
              </S.TableWrapper>
            )}
          </>
        )}
      </Contents.Normal>
    </>
  )
}
