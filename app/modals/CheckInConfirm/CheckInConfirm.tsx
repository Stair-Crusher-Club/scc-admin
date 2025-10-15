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
      <S.Description>출석체크를 진행하시겠습니까?<br />확인 후에는 출석 상태가 저장됩니다.</S.Description>
      <S.ButtonWrapper>
        <S.CancelButton onClick={close}>닫기</S.CancelButton>
        <S.ConfirmButton onClick={handleConfirm}>확인</S.ConfirmButton>
      </S.ButtonWrapper>
    </S.Modal>
  )
}
