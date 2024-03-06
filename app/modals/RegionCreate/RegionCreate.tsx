import { BasicModalProps } from "@reactleaf/modal"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

import RightSheet from "@/modals/_template/RightSheet"

import * as S from "./RegionCreate.style"

interface Props extends BasicModalProps {}
export default function RegionCreate({ visible, close }: Props) {
  const router = useRouter()

  function openRegionSelector() {
    return toast.error("준비중인 기능입니다.")
  }

  const goToDraw = (type: "circle" | "polygon") => () => {
    router.push(`/region/draw?type=${type}`)
    close()
  }

  return (
    <RightSheet title="오픈 지역 추가" visible={visible} close={close}>
      <S.ButtonsWrapper>
        <S.Button onClick={openRegionSelector}>행정구역 단위로 추가</S.Button>
        <S.Button onClick={goToDraw("circle")}>원형 그리기</S.Button>
        <S.Button onClick={goToDraw("polygon")}>폴리곤 그리기</S.Button>
      </S.ButtonsWrapper>
    </RightSheet>
  )
}
