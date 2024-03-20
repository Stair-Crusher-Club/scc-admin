import { BasicModalProps } from "@reactleaf/modal"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

import { internal } from "@/lib/http"

import { useModal } from "@/hooks/useModal"

import * as S from "./RegionDraw.style"

interface Point {
  lat: number
  lng: number
}

interface Props extends BasicModalProps {
  onSelect: (name: string | null, vertices: Point[]) => void
}
export default function RegionDraw({ visible, onSelect, close }: Props) {
  const { openModal } = useModal()

  const router = useRouter()

  async function onRegionSelect(region: string) {
    const res = (await (await internal(`/data/geojson?id=${region}`)).json()) as {
      name: string
      boundaryVertices: Point[]
    }
    onSelect(res.name, res.boundaryVertices)
    close()
  }
  function openRegionSelector() {
    openModal({ type: "RegionSelector", props: { onSelect: onRegionSelect } })
  }

  const goToDraw = (type: "circle" | "polygon") => () => {
    toast("준비중인 기능입니다")
    // close()
  }

  return (
    <S.Modal title="오픈 지역 추가">
      <S.ButtonsWrapper>
        <S.Button onClick={openRegionSelector}>행정구역 단위로 추가</S.Button>
        <S.Button onClick={goToDraw("circle")}>원형 그리기</S.Button>
        <S.Button onClick={goToDraw("polygon")}>폴리곤 그리기</S.Button>
      </S.ButtonsWrapper>
    </S.Modal>
  )
}
