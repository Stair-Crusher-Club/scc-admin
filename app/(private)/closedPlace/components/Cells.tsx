import { toast } from "react-toastify"

import { AdminClosedPlaceCandidateDTO } from "@/lib/generated-sources/openapi"

import { acceptClosedPlaceCandidate, ignoreClosedPlaceCandidate } from "../query"
import * as S from "./Cells.style"

export function ActionsCell({ closedPlaceCandidate }: { closedPlaceCandidate: AdminClosedPlaceCandidateDTO }) {
  async function handleAcceptClosedPlaceCandidate() {
    const { id, name } = closedPlaceCandidate
    if (
      !confirm(
        `정말 [${name}] 장소를 폐업 처리하겠습니까?\n접근성 정보가 등록되어 있는 경우 폐업 처리와 함께 접근성 정보가 삭제됩니다.`,
      )
    )
      return
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
      <S.AcceptButton
        disabled={closedPlaceCandidate.acceptedAt !== undefined}
        onClick={handleAcceptClosedPlaceCandidate}
      >
        폐업 처리
      </S.AcceptButton>
      <S.IgnoreButton
        disabled={closedPlaceCandidate.ignoredAt !== undefined}
        onClick={handleIgnoreClosedPlaceCandidate}
      >
        무시하기
      </S.IgnoreButton>
    </S.Actions>
  )
}
