import { BasicModalProps } from "@reactleaf/modal"

import { QuestBuilding } from "@/lib/models/quest"

import RightSheet from "../_template/RightSheet"
import PlaceCard from "./PlaceCard"

interface Props extends BasicModalProps {
  building: QuestBuilding
  questId: string
}

export const defaultOverlayOptions = { closeDelay: 200, dim: false }
export default function BuildingDetailSheet({ building, questId, visible, close }: Props) {
  const conquered = building.places.filter((place) => place.isConquered || place.isClosed || place.isNotAccessible)
  const notConquered = building.places.filter(
    (place) => !place.isConquered && !place.isClosed && !place.isNotAccessible,
  )
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
    <RightSheet visible={visible} close={close} title={title} style={{ width: "360px" }}>
      {[...notConquered, ...conquered].map((place) => (
        <PlaceCard place={place} questId={questId} key={place.placeId} />
      ))}
    </RightSheet>
  )
}
