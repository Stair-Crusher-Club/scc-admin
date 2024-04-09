import Image from "next/image"
import { toast } from "react-toastify"

import { deleteBuildingAccessibility, deletePlaceAccessibility } from "@/lib/apis/api"
import { AccessibilitySummary } from "@/lib/models/accessibility"

import { useModal } from "@/hooks/useModal"

import * as S from "./Cells.style"

export function ImagesCell({ images }: { images: string[] }) {
  const { openModal } = useModal()
  function seeDetails(url: string) {
    openModal({ type: "AccessibilityImage", props: { imageUrl: url } })
  }

  if (images.length === 1) {
    const imageUrl = images[0]
    return (
      <S.ImagesGrid>
        <Image
          key={imageUrl}
          src={imageUrl}
          width={200}
          height={200}
          alt=""
          style={{ gridRow: "1/3", gridColumn: "1/3" }}
          onClick={() => seeDetails(imageUrl)}
        />
      </S.ImagesGrid>
    )
  }

  return (
    <S.ImagesGrid>
      {images.map((imageUrl) => (
        <Image key={imageUrl} src={imageUrl} alt="" width={98} height={98} onClick={() => seeDetails(imageUrl)} />
      ))}
      {Array.from({ length: 4 - images.length }).map((_, idx) => (
        <div key={idx} style={{ backgroundColor: "#eee" }} />
      ))}
    </S.ImagesGrid>
  )
}

export function ActionsCell({ accessibility, reload }: { accessibility: AccessibilitySummary; reload?(): void }) {
  async function handleDeletePlaceAccessibility() {
    const { id, placeName } = accessibility.placeAccessibility
    if (!confirm(`정말 [${placeName}]의 장소 정보를 삭제하시겠습니까?`)) return
    await deletePlaceAccessibility({ id })
    toast.success(`[${placeName}]의 장소 정보가 삭제되었습니다.`)
    // TODO: replace with reload
    // setAccessibilitySummaries(accessibilitySummaries.filter((it) => it.placeAccessibility.id !== id))
  }

  async function handleDeleteBuildingAccessibility() {
    const id = accessibility.buildingAccessibility?.id
    const placeName = accessibility.placeAccessibility.placeName
    if (!id) return
    if (!confirm(`정말 [${placeName}]의 건물 정보를 삭제하시겠습니까?`)) return
    await deleteBuildingAccessibility({ id })
    toast.success(`[${placeName}]의 건물 정보가 삭제되었습니다.`)
    // TODO: replace with reload
    // setAccessibilitySummaries(
    //   accessibilitySummaries.map((it) => {
    //     if (it.buildingAccessibility?.id !== id) {
    //       return it
    //     }
    //     return {
    //       id: it.placeAccessibility.id,
    //       placeAccessibility: it.placeAccessibility,
    //       buildingAccessibility: undefined,
    //     }
    //   })
    // );
  }

  return (
    <S.Actions>
      <S.DeleteButton onClick={handleDeletePlaceAccessibility}>장소 정보 삭제</S.DeleteButton>
      <S.DeleteButton disabled={!accessibility.buildingAccessibility} onClick={handleDeleteBuildingAccessibility}>
        {accessibility.buildingAccessibility ? "건물 정보 삭제" : "건물 정보 없음"}
      </S.DeleteButton>
    </S.Actions>
  )
}
