import { format } from "date-fns"
import React from "react"

import { Flex } from "@/styles/jsx"

import * as S from "../page.style"
import { ParsedSendPushNotificationFormValues } from "./NotificationSendForm"

interface SendConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  formValues: ParsedSendPushNotificationFormValues
  onConfirm: () => void
}

export function SendConfirmModal({ isOpen, onClose, formValues, onConfirm }: SendConfirmModalProps) {
  if (!isOpen) return null

  const userCount = formValues.parsedUserIds.length
  const titlePreview = formValues.title || "(제목 없음)"
  const bodyPreview = formValues.body

  const scheduleText = formValues.scheduleDate
    ? format(new Date(formValues.scheduleDate), "yyyy-MM-dd HH:mm")
    : "즉시 발송"

  const deepLinkPreview = formValues.deepLink?.value || "(딥링크 없음)"

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.TestModalContent onClick={e => e.stopPropagation()}>
        <S.CloseButton onClick={onClose}>×</S.CloseButton>

        <h2 style={{ marginTop: 0, marginBottom: "16px" }}>푸시 알림 발송 확인</h2>

        <S.TestInfoBox>
          <strong>⚠️ 실제 발송 전 최종 확인</strong>
          <br />
          • 아래 정보를 확인하고 &ldquo;발송하기&rdquo; 버튼을 클릭하세요
          <br />
          • {"{{"}nickname{"}}"} 템플릿은 각 유저의 닉네임으로 자동 변환됩니다
          <br />
          • 발송 후에는 취소할 수 없습니다
        </S.TestInfoBox>

        <Flex direction="column" gap={2}>
          <div>
            <S.InputTitle>발송 대상</S.InputTitle>
            <S.PreviewBox>
              <S.PreviewLabel>총 {userCount}명에게 발송</S.PreviewLabel>
              <S.PreviewContent>
                {formValues.parsedUserIds.slice(0, 5).join(", ")}
                {userCount > 5 && ` ... 외 ${userCount - 5}명`}
              </S.PreviewContent>
            </S.PreviewBox>
          </div>

          <div>
            <S.InputTitle>발송 시간</S.InputTitle>
            <S.PreviewBox>
              <S.PreviewContent>{scheduleText}</S.PreviewContent>
            </S.PreviewBox>
          </div>

          <div>
            <S.InputTitle>발송 내용</S.InputTitle>
            <S.PreviewBox>
              <S.PreviewLabel>제목:</S.PreviewLabel>
              <S.PreviewContent>{titlePreview}</S.PreviewContent>
              <S.PreviewLabel style={{ marginTop: "8px" }}>본문:</S.PreviewLabel>
              <S.PreviewContent>{bodyPreview}</S.PreviewContent>
            </S.PreviewBox>
          </div>

          <div>
            <S.InputTitle>딥링크</S.InputTitle>
            <S.PreviewBox>
              <S.PreviewContent>{deepLinkPreview}</S.PreviewContent>
            </S.PreviewBox>
          </div>
        </Flex>

        <S.ModalActions>
          <S.SecondaryButton onClick={onClose}>취소</S.SecondaryButton>
          <S.Button onClick={onConfirm}>발송하기 ({userCount}명)</S.Button>
        </S.ModalActions>
      </S.TestModalContent>
    </S.ModalOverlay>
  )
}
