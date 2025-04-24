import { BasicModalProps } from "@reactleaf/modal"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"

import { deleteRegion, useRegions } from "@/lib/apis/api"
import { AccessibilityAllowedRegionDTO } from "@/lib/generated-sources/openapi"

import { FIXED_REGIONS } from "@/(private)/region/data"
import RightSheet from "@/modals/_template/RightSheet"

import * as S from "./RegionList.style"

interface Props extends BasicModalProps {}
export default function RegionList({ visible, close }: Props) {
  const { data } = useRegions()
  const regions = data ? [...FIXED_REGIONS, ...data] : FIXED_REGIONS
  const queryClient = useQueryClient()

  async function _deleteRegion(region: AccessibilityAllowedRegionDTO) {
    await deleteRegion({ id: region.id })
    queryClient.invalidateQueries({ queryKey: ["@regions"], exact: true })
    toast.success("오픈 지역에서 삭제되었습니다.")
  }

  return (
    <RightSheet title="오픈 지역 목록" close={close} visible={visible}>
      <S.List>
        {regions.map((r) => (
          <S.RegionItem key={r.id}>
            <S.RegionName>{r.name}</S.RegionName>
            {r.id.startsWith("_") ? null : <S.DeleteButton onClick={() => _deleteRegion(r)}>삭제</S.DeleteButton>}
          </S.RegionItem>
        ))}
      </S.List>
      <div></div>
    </RightSheet>
  )
}
