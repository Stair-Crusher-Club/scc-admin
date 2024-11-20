import { BasicModalProps } from "@reactleaf/modal"
import { useAtom } from "jotai"
import { useEffect } from "react"

import { AppState } from "@/lib/globalAtoms"
import { QuestBuilding } from "@/lib/models/quest"

import BottomSheet from "@/modals/_template/BottomSheet"

import PlaceCard from "./PlaceCard"

interface Props extends BasicModalProps {
  building: QuestBuilding
  questId: string
}

export const defaultOverlayOptions = { closeDelay: 200, dim: false }
export default function BuildingDetailSheet({ building, questId, visible, close }: Props) {
  const [appState, setAppState] = useAtom(AppState)

  useEffect(() => {
    setAppState((prev) => ({ ...prev, isHeaderHidden: true }))
    return () => {
      setAppState((prev) => ({ ...prev, isHeaderHidden: false }))
    }
  }, [])

  const conquered = building.places.filter((place) => place.isConquered)
  const notConquered = building.places.filter((place) => !place.isConquered)
  const title = (
    <>
      {building.name}
      <br />
      <small>
        정복 완료 {conquered.length} / {building.places.length}
      </small>
    </>
  )

  return (
    <BottomSheet visible={visible} close={close} title={title} style={{ height: "calc(100vh - 300px)" }}>
      {[...notConquered, ...conquered].map((place) => (
        <PlaceCard place={place} questId={questId} key={place.placeId} />
      ))}
    </BottomSheet>
  )
}
