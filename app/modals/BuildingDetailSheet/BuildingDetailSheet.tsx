import { BasicModalProps } from "@reactleaf/modal"
import { useAtom } from "jotai"
import { useEffect } from "react"

import { AppState } from "@/lib/globalAtoms"
import { QuestBuilding, QuestPlace } from "@/lib/models/quest"

import BottomSheet from "@/modals/_template/BottomSheet"

interface Props extends BasicModalProps {
  building: QuestBuilding
}
export default function BuildingDetailSheet({ building, visible, close }: Props) {
  const [appState, setAppState] = useAtom(AppState)

  useEffect(() => {
    setAppState((prev) => ({ ...prev, isHeaderHidden: true }))
    return () => {
      setAppState((prev) => ({ ...prev, isHeaderHidden: false }))
    }
  }, [])

  return (
    <BottomSheet visible={visible} close={close} title={building.name}>
      <div style={{ height: "calc(100vh - 300px - 64px)", background: "white" }}>
        {building.places.map((place) => (
          <PlaceRow place={place} key={place.placeId} />
        ))}
      </div>
    </BottomSheet>
  )
}

function PlaceRow({ place }: { place: QuestPlace }) {
  return (
    <div>
      {place.name}
      <label>
        <input type="checkbox" checked={place.isClosed} />
        Closed
      </label>
      <label>
        <input type="checkbox" checked={place.isConquered} />
        Conquered
      </label>
      <label>
        <input type="checkbox" checked={place.isNotAccessible} />
        Not Accessible
      </label>
    </div>
  )
}
