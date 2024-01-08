import { BasicModalProps } from "@reactleaf/modal"

import BottomSheet from "@/modals/_template/BottomSheet"

interface Props extends BasicModalProps {}
export default function BuildingDetailSheet({ visible, close }: Props) {
  return (
    <BottomSheet visible={visible} close={close} title="Building Detail Sheet">
      <div style={{ height: 400, background: "white" }}></div>
    </BottomSheet>
  )
}
