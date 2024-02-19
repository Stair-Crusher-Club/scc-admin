import { BasicModalProps } from "@reactleaf/modal"

import * as S from "./QuestGuide.style"

export default function QuestGuide({ close }: BasicModalProps) {
  return (
    <S.Modal>
      <S.List>
        <li>건물 마커를 클릭해 남은 장소를 확인하세요.</li>
        <li>앱에서 정복 완료시, 정복란이 자동으로 체크됩니다.</li>
        <li>정복이 완료된 건물은 회색으로 표시됩니다.</li>
        <li>
          폐업여부는 <b>네이버지도</b>로 확인하면 더 정확합니다.
        </li>
      </S.List>
      <S.Button onClick={close}>확인했어요</S.Button>
    </S.Modal>
  )
}
