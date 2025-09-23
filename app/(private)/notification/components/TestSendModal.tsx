import React, { useState } from "react"

import { Flex } from "@/styles/jsx"

import * as S from "../page.style"
import { SendPushNotificationFormValues } from "./NotificationSendForm"

export interface TestUser {
  id: string
  name: string
}

// 하드코딩된 테스트 유저 목록
const TEST_USERS: TestUser[] = [
  { id: "740289a3-7c16-4673-b204-58a8aef0e242", name: "이대호 (버기)" },
  { id: "b68b714e-40a3-4e52-aff4-c8734181e1bb", name: "유회성 (제이슨)" },
  { id: "121e0c88-d29f-4572-9d35-5805e78972a9", name: "백은하 (양념치킨)" },
  { id: "ccf5b8b8-810f-46e7-9569-07979ce196b8", name: "주성희 (성치)" },
  { id: "8f90b73a-0c60-4d24-969a-7127e6fc3ddd", name: "서한비 (서무개)" },
  { id: "5cd204fe-57fa-42ff-8f77-d4b558c6761f", name: "지수환 (Swann)" },
  { id: "1c8a528c-0b5f-4885-a9b3-b81309c364df", name: "박수빈 (모브)" },
  { id: "baf04e8e-0597-4926-b3b3-c3ecf9e3544e", name: "박원 (원더)" },
  { id: "19ef11a0-bc2e-4262-a55f-943aad394004", name: "김상민 (Sanggggg)" },
]


interface TestSendModalProps {
  isOpen: boolean
  onClose: () => void
  formValues: SendPushNotificationFormValues
  onTestSend: (selectedUsers: TestUser[]) => void
}

export function TestSendModal({ isOpen, onClose, formValues, onTestSend }: TestSendModalProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  if (!isOpen) return null

  const handleUserToggle = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUserIds.length === TEST_USERS.length) {
      setSelectedUserIds([])
    } else {
      setSelectedUserIds(TEST_USERS.map(user => user.id))
    }
  }

  const handleTestSend = () => {
    const selectedUsers = TEST_USERS.filter(user => selectedUserIds.includes(user.id))
    if (selectedUsers.length === 0) {
      alert("테스트 발송할 유저를 선택해주세요.")
      return
    }
    onTestSend(selectedUsers)
  }

  const titlePreview = formValues.title ? `[테스트] ${formValues.title}` : '[테스트] 푸시 알림'
  const bodyPreview = formValues.body

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.TestModalContent onClick={e => e.stopPropagation()}>
        <S.CloseButton onClick={onClose}>×</S.CloseButton>

        <h2 style={{ marginTop: 0, marginBottom: "16px" }}>푸시 알림 테스트 발송</h2>

        <S.TestInfoBox>
          <strong>테스트 발송 안내:</strong>
          <br />
          • 실서버에서만 동작합니다 (테스트 서버 user ID를 구할 수 없음)
          <br />
          • 제목 앞에 &ldquo;[테스트]&rdquo;가 자동으로 붙습니다
          <br />
          • {"{{"}nickname{"}}"} 템플릿은 각 유저의 닉네임으로 자동 변환됩니다
          <br />
          • 즉시 발송됩니다 (예약 발송 무시)
        </S.TestInfoBox>

        <Flex direction="column" gap={2}>
          <div>
            <S.InputTitle>발송 예정 내용</S.InputTitle>
            <S.PreviewBox>
              <S.PreviewLabel>제목:</S.PreviewLabel>
              <S.PreviewContent>{titlePreview}</S.PreviewContent>
              <S.PreviewLabel style={{ marginTop: "8px" }}>본문:</S.PreviewLabel>
              <S.PreviewContent>{bodyPreview}</S.PreviewContent>
            </S.PreviewBox>
          </div>

          <div>
            <Flex align="center" justify="space-between" style={{ marginBottom: "8px" }}>
              <S.InputTitle>테스트 유저 선택 ({selectedUserIds.length}/{TEST_USERS.length}명 선택)</S.InputTitle>
              <S.AddButton onClick={handleSelectAll}>
                {selectedUserIds.length === TEST_USERS.length ? "전체 해제" : "전체 선택"}
              </S.AddButton>
            </Flex>

            <S.UserListContainer>
              {TEST_USERS.map(user => (
                <S.UserItem
                  key={user.id}
                  selected={selectedUserIds.includes(user.id)}
                  onClick={() => handleUserToggle(user.id)}
                >
                  <S.UserCheckbox
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => handleUserToggle(user.id)}
                    onClick={e => e.stopPropagation()}
                  />
                  <S.UserInfo>
                    <S.UserName>{user.name}</S.UserName>
                    <S.UserId>ID: {user.id}</S.UserId>
                  </S.UserInfo>
                </S.UserItem>
              ))}
            </S.UserListContainer>
          </div>
        </Flex>

        <S.ModalActions>
          <S.SecondaryButton onClick={onClose}>취소</S.SecondaryButton>
          <S.Button
            onClick={handleTestSend}
            disabled={selectedUserIds.length === 0}
          >
            테스트 발송 ({selectedUserIds.length}명)
          </S.Button>
        </S.ModalActions>
      </S.TestModalContent>
    </S.ModalOverlay>
  )
}