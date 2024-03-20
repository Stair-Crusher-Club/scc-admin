import { Combobox } from "@reactleaf/input"
import { BasicModalProps } from "@reactleaf/modal"
import { useState } from "react"

import { sigunguOptions } from "@/(private)/challenge/create/regionOptions"

interface Props extends BasicModalProps {
  onSelect: (region: string) => void
}
export default function RegionSelector({ onSelect, close }: Props) {
  const [region, setRegion] = useState<string | null>(null)
  function handleSelect(_option: unknown) {
    const option = _option as (typeof sigunguOptions)[number]
    setRegion(String(option.value).slice(0, 5))
  }
  function handleConfirm() {
    if (!region) return
    onSelect(region)
    close()
  }
  return (
    <div style={{ background: "white", padding: 24 }}>
      <p>시군구 단위로 선택해주세요. 도서 지역은 포함되지 않을 수 있습니다.</p>
      <Combobox name="region" options={sigunguOptions} label="시군구 단위를 선택해주세요" onChange={handleSelect} />
      <button disabled={!region} onClick={handleConfirm}>
        확인
      </button>
    </div>
  )
}
