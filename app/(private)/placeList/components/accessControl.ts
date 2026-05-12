import { AdminPlaceListAccessControlDto } from "@/lib/generated-sources/openapi"

export const ACCESS_CONTROL_LABELS: Record<AdminPlaceListAccessControlDto, string> = {
  [AdminPlaceListAccessControlDto.Private]: "비공개",
  [AdminPlaceListAccessControlDto.Public]: "공개",
  [AdminPlaceListAccessControlDto.LinkOnly]: "링크 있는 사람만",
}

export const ACCESS_CONTROL_OPTIONS: AdminPlaceListAccessControlDto[] = [
  AdminPlaceListAccessControlDto.Public,
  AdminPlaceListAccessControlDto.LinkOnly,
  AdminPlaceListAccessControlDto.Private,
]

export function getAccessControlBadgeVariant(
  accessControl: AdminPlaceListAccessControlDto,
): "default" | "secondary" | "outline" {
  switch (accessControl) {
    case AdminPlaceListAccessControlDto.Public:
      return "default"
    case AdminPlaceListAccessControlDto.LinkOnly:
      return "secondary"
    case AdminPlaceListAccessControlDto.Private:
      return "outline"
  }
}
