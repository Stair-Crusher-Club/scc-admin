import { BasicModalProps } from "@reactleaf/modal"
import { useAtom } from "jotai"
import { useEffect } from "react"

import { AppState } from "@/lib/globalAtoms"

import BottomSheet from "@/modals/_template/BottomSheet"

interface Props extends BasicModalProps {}
export default function BuildingDetailSheet({ visible, close }: Props) {
  const [appState, setAppState] = useAtom(AppState)

  useEffect(() => {
    setAppState((prev) => ({ ...prev, isHeaderHidden: true }))
    return () => {
      setAppState((prev) => ({ ...prev, isHeaderHidden: false }))
    }
  }, [])

  return (
    <BottomSheet visible={visible} close={close} title="Building Detail Sheet">
      <div style={{ height: "calc(100vh - 300px - 64px)", background: "white" }}></div>
    </BottomSheet>
  )
}
