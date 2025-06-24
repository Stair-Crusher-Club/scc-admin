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

import { NotificationScheduleUpdateForm } from "./components/NotificationScheduleUpdateForm"
import { NotificationSendForm } from "./components/NotificationSendForm"
import * as S from "./page.style"

interface Option {
  label: string
  value: string
}

interface DeepLinkOption extends Option {
  isArgumentRequired: boolean
}

interface WebviewOption extends Option {
  fixedTitle: string
  headerVariant: string
}

export interface SendPushNotificationFormValues {
  userIds: string
  title?: string
  body: string
  deepLink?: DeepLinkOption
  deepLinkArgument?: string
  webviewUrl?: string
  webviewFixedTitle?: string
  webviewHeaderVariant?: Option
  scheduleDate?: string
}

export interface UpdateScheduleFormValues {
  title?: string
  body: string
  deepLink?: DeepLinkOption
  deepLinkArgument?: string
  webviewUrl?: string
  webviewFixedTitle?: string
  webviewHeaderVariant?: Option
  scheduleDate?: string
}

export const deepLinkOptions: DeepLinkOption[] = [
  { label: "홈", value: "stair-crusher://", isArgumentRequired: false },
  { label: "프로필", value: "stair-crusher://profile", isArgumentRequired: false },
  { label: "설정", value: "stair-crusher://setting", isArgumentRequired: false },
  { label: "장소", value: "stair-crusher://place", isArgumentRequired: true },
  { label: "챌린지", value: "stair-crusher://challenge", isArgumentRequired: true },
  { label: "웹뷰", value: "stair-crusher://webview", isArgumentRequired: false },
]

export const headerVariantOptions: Option[] = [
  { label: "브라우저처럼 열리도록 (상단에 X 버튼이 있다)", value: "appbar" },
  { label: "앱 내부처럼 보이도록 (상단에 뒤로가기 버튼이 있다)", value: "navigation" },
]

export const predefinedWebviews: WebviewOption[] = [
  {
    label: "정보 등록 가이드",
    value: "https://admin.staircrusher.club/public/guide?tab=register",
    fixedTitle: "정보 등록/조회 가이드",
    headerVariant: "navigation",
  },
  {
    label: "정보 조회 가이드",
    value: "https://admin.staircrusher.club/public/guide?tab=search",
    fixedTitle: "정보 등록/조회 가이드",
    headerVariant: "navigation",
  },
]

function createWebviewDeepLink(url: string, fixedTitle: string, headerVariant: string): string {
  return `stair-crusher://webview?url=${encodeURIComponent(url)}&fixedTitle=${encodeURIComponent(fixedTitle)}&headerVariant=${encodeURIComponent(headerVariant)}`
}

// Utility to truncate date to nearest 10 minutes
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

  const handlePredefinedWebviewChange = (form: any, option: any) => {
    const typedOption = option as WebviewOption
    if (!typedOption || !typedOption.value) {
      form.setValue("webviewUrl", "")
      form.setValue("webviewFixedTitle", "")
      form.setValue("webviewHeaderVariant", undefined)
      return
    }
    form.setValue("webviewUrl", typedOption.value)
    form.setValue("webviewFixedTitle", typedOption.fixedTitle)
    form.setValue(
      "webviewHeaderVariant",
      headerVariantOptions.find((option) => option.value === typedOption.headerVariant),
    )
  }

  function validateAndExtractForm(formValues: SendPushNotificationFormValues | UpdateScheduleFormValues) {
    let titleToUse
    if (formValues.title && formValues.title?.length > 0) {
      titleToUse = formValues.title
    } else {
      titleToUse = undefined
    }

    let deepLinkToUse
    if (formValues.deepLink && formValues.deepLink.value.length > 0) {
      if (formValues.deepLink.value === "stair-crusher://webview") {
        // Validate webview fields
        if (!formValues.webviewUrl || !formValues.webviewFixedTitle || !formValues.webviewHeaderVariant) {
          toast.error("웹뷰 URL, 고정 제목, 헤더 타입을 모두 입력하세요.")
          return
        }
        deepLinkToUse = createWebviewDeepLink(
          formValues.webviewUrl,
          formValues.webviewFixedTitle,
          formValues.webviewHeaderVariant.value,
        )
      } else if (formValues.deepLink.isArgumentRequired) {
        if (!formValues.deepLinkArgument || formValues.deepLinkArgument.length === 0) {
          toast.error("딥링크 상세 정보를 입력하세요.")
          return
        } else {
          deepLinkToUse = `${formValues.deepLink.value}/${formValues.deepLinkArgument}`
        }
      } else {
        deepLinkToUse = formValues.deepLink.value
      }
    } else {
      deepLinkToUse = undefined
    }

    return {
      title: titleToUse,
      body: formValues.body,
      deepLink: deepLinkToUse,
    }
  }

  async function handleSendPushNotification(formValues: SendPushNotificationFormValues) {
    try {
      const extractedValues = validateAndExtractForm(formValues)
      if (!extractedValues) return
      const { title, body, deepLink } = extractedValues

      const truncatedDate = formValues.scheduleDate ? truncateToNearest10Minutes(formValues.scheduleDate) : undefined
      const payload: AdminSendPushNotificationRequestDTO = {
        userIds: formValues.userIds.split(",").map((id) => id.trim()),
        title: title,
        body: body,
        deepLink: deepLink,
        scheduledAt: truncatedDate ? { value: truncatedDate.getTime() } : undefined,
      }

      const res = await sendPushNotification(payload)
      if (res.status != 200) {
        throw new Error("Failed to send notification")
      }

      toast.success("푸시 알림을 발송했습니다.")
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

  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return
    try {
      const res = await deletePushSchedule({ id })
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
    const selectedDeepLinkOption =
      deepLinkOptions.find((opt) => opt.value === (schedule.deepLink?.split("?")[0] || schedule.deepLink)) ||
      deepLinkOptions[0]
    let deepLinkArgument = ""
    let webviewUrl = ""
    let webviewFixedTitle = ""
    let webviewHeaderVariant: Option | undefined = undefined

    if (selectedDeepLinkOption.isArgumentRequired) {
      // e.g. stair-crusher://place/1234
      const parts = schedule.deepLink?.split("/") || []
      deepLinkArgument = parts.length > 3 ? parts.slice(3).join("/") : ""
    } else if (selectedDeepLinkOption.value === "stair-crusher://webview") {
      // e.g. stair-crusher://webview?url=...&fixedTitle=...&headerVariant=...
      const params = new URLSearchParams(schedule.deepLink?.split("?")[1] || "")
      webviewUrl = params.get("url") || ""
      webviewFixedTitle = params.get("fixedTitle") || ""
      const headerVariantValue = params.get("headerVariant") || undefined
      webviewHeaderVariant = headerVariantOptions.find((opt) => opt.value === headerVariantValue)
    }

    updateScheduleForm.reset({
      title: schedule.title || "",
      body: schedule.body || "",
      deepLink: selectedDeepLinkOption,
      deepLinkArgument,
      webviewUrl,
      webviewFixedTitle,
      webviewHeaderVariant,
      scheduleDate: format(new Date(schedule.scheduledAt.value), "yyyy-MM-dd HH:mm"),
    })
    setEditingId(schedule.id)
  }

  return (
    <>
      <Header title="푸시 알림" />
      <Contents.Normal>
        <S.TabContainer>
          <S.Tab type="button" active={activeTab === "send"} onClick={() => setActiveTab("send")}>
            푸시 알림 발송
          </S.Tab>
          <S.Tab type="button" active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")}>
            푸시 알림 스케줄 확인
          </S.Tab>
        </S.TabContainer>
        {activeTab === "send" ? (
          <NotificationSendForm
            form={sendPushForm}
            handlePredefinedWebviewChange={handlePredefinedWebviewChange}
            onSubmit={handleSendPushNotification}
          />
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
                              : ""}
                          </S.ScheduleTd>
                          <S.ScheduleTd>{schedule.title}</S.ScheduleTd>
                          <S.ScheduleTd>{schedule.body}</S.ScheduleTd>
                          <S.ScheduleTd>{schedule.deepLink}</S.ScheduleTd>
                          <S.ScheduleTd center>{schedule.targetUsersCount}</S.ScheduleTd>
                          <S.ScheduleTd center>
                            <S.EditButton onClick={() => handleEditButtonClick(schedule)}>수정</S.EditButton>
                            <S.DeleteButton onClick={() => handleDeleteSchedule(schedule.id)}>삭제</S.DeleteButton>
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
                            handlePredefinedWebviewChange={handlePredefinedWebviewChange}
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
