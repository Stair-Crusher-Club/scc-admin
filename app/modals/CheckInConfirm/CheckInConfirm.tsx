import { BasicModalProps } from "@reactleaf/modal"

import * as S from "./CheckInConfirm.style"

interface CheckInConfirmProps extends BasicModalProps {
  onConfirm: () => void
}

export default function CheckInConfirm({ close, onConfirm }: CheckInConfirmProps) {
  function handleConfirm() {
    onConfirm()
    close()
  }

  return (
    <S.Modal>
      <S.Description>출석체크를 하시겠어요?<br />[출석하기] 버튼을 누르면 앱에서 출석체크가 완료됩니다.</S.Description>
      <S.ButtonWrapper>
        <S.CancelButton onClick={close}>닫기</S.CancelButton>
        <S.ConfirmButton onClick={handleConfirm}>출석하기</S.ConfirmButton>
      </S.ButtonWrapper>
    </S.Modal>
  )
}
