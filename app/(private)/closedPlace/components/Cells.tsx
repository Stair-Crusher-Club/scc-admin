import { toast } from "react-toastify"

import * as S from "./Cells.style"
import { ClosedPlaceCandidate } from "@/lib/models/place"
import { acceptClosedPlaceCandidate, ignoreClosedPlaceCandidate, ListClosedPlaceCandidatesResult } from "../query"

export function ActionsCell({
  closedPlaceCandidate,
}: {
  closedPlaceCandidate: ClosedPlaceCandidate
}) {
  async function handleAcceptClosedPlaceCandidate() {
    const { id, name } = closedPlaceCandidate
    if (!confirm(`정말 [${name}] 장소를 폐업 처리하겠습니까?`)) return
    await acceptClosedPlaceCandidate({ id })
    toast.success(`[${name}] 장소가 폐업 처리되었습니다.`)
  }

  async function handleIgnoreClosedPlaceCandidate() {
    const { id, name } = closedPlaceCandidate
    if (!confirm(`정말 [${name}]의 폐업 추정을 무시하시겠습니까?`)) return
    await ignoreClosedPlaceCandidate({ id })
    toast.success(`[${name}]의 폐업 추정이 무시되었습니다.`)
  }

  return (
    <S.Actions>
      <S.AcceptButton onClick={handleAcceptClosedPlaceCandidate}>폐업 처리</S.AcceptButton>
      <S.DeleteButton onClick={handleIgnoreClosedPlaceCandidate}>무시하기</S.DeleteButton>
    </S.Actions>
  )
}
