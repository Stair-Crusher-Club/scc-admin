"use client"

import { AdminAccessibilityDTO } from "@/lib/generated-sources/openapi"
import { Badge } from "@/components/ui/badge"

interface AccessibilityDetailRowProps {
  accessibility: AdminAccessibilityDTO
}

export function AccessibilityDetailRow({ accessibility }: AccessibilityDetailRowProps) {
  const { placeAccessibility, buildingAccessibility } = accessibility

  const stairInfoMap: Record<string, string> = {
    NONE: "없음",
    ONE: "1개",
    TWO_TO_FIVE: "2~5개",
    OVER_SIX: "6개 이상",
  }

  const stairHeightLevelMap: Record<string, string> = {
    THUMB: "엄지 높이",
    HALF_PALM: "반손바닥 높이",
    FULL_PALM: "한손바닥 높이",
  }

  const entranceDoorTypeMap: Record<string, string> = {
    AUTOMATIC: "자동문",
    SLIDING: "미닫이",
    HINGED: "여닫이",
    REVOLVING: "회전문",
    BARRIER_FREE: "무장벽",
  }

  return (
    <div className="p-6 bg-muted/30">
      <div className="grid gap-6">
        {/* 장소 정보 */}
        <div>
          <h3 className="text-lg font-semibold mb-4">장소 정보</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">장소 ID</p>
              <p className="text-sm font-mono">{placeAccessibility.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">장소명</p>
              <p className="text-sm">{placeAccessibility.placeName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">촬영자</p>
              <p className="text-sm">{placeAccessibility.registeredUserName || "익명"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">1층 여부</p>
              <Badge variant={placeAccessibility.isFirstFloor ? "default" : "secondary"}>
                {placeAccessibility.isFirstFloor ? "1층" : "1층 아님"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">계단 정보</p>
              <p className="text-sm">{stairInfoMap[placeAccessibility.stairInfo] || placeAccessibility.stairInfo}</p>
            </div>
            {placeAccessibility.stairHeightLevel && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">계단 높이</p>
                <p className="text-sm">{stairHeightLevelMap[placeAccessibility.stairHeightLevel] || placeAccessibility.stairHeightLevel}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1">경사로</p>
              <Badge variant={placeAccessibility.hasSlope ? "default" : "secondary"}>
                {placeAccessibility.hasSlope ? "있음" : "없음"}
              </Badge>
            </div>
            {placeAccessibility.entranceDoorTypes && placeAccessibility.entranceDoorTypes.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">출입문 유형</p>
                <div className="flex gap-1 flex-wrap">
                  {placeAccessibility.entranceDoorTypes.map((type, idx) => (
                    <Badge key={idx} variant="outline">
                      {entranceDoorTypeMap[type] || type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {placeAccessibility.floors && placeAccessibility.floors.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">층 정보</p>
                <p className="text-sm">{placeAccessibility.floors.join(", ")}층</p>
              </div>
            )}
          </div>

          {/* 장소 사진 */}
          {placeAccessibility.images.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">장소 사진 ({placeAccessibility.images.length}장)</p>
              <div className="grid grid-cols-4 gap-2">
                {placeAccessibility.images.map((image, idx) => (
                  <a
                    key={idx}
                    href={image.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square overflow-hidden rounded-md border hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={image.thumbnailUrl || image.imageUrl}
                      alt={`장소 사진 ${idx + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 건물 정보 */}
        {buildingAccessibility && (
          <div>
            <h3 className="text-lg font-semibold mb-4">건물 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">건물 ID</p>
                <p className="text-sm font-mono">{buildingAccessibility.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">엘리베이터</p>
                <Badge variant={buildingAccessibility.hasElevator ? "default" : "secondary"}>
                  {buildingAccessibility.hasElevator ? "있음" : "없음"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">입구 계단 정보</p>
                <p className="text-sm">{stairInfoMap[buildingAccessibility.entranceStairInfo] || buildingAccessibility.entranceStairInfo}</p>
              </div>
              {buildingAccessibility.entranceStairHeightLevel && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">입구 계단 높이</p>
                  <p className="text-sm">{stairHeightLevelMap[buildingAccessibility.entranceStairHeightLevel] || buildingAccessibility.entranceStairHeightLevel}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">입구 경사로</p>
                <Badge variant={buildingAccessibility.hasSlope ? "default" : "secondary"}>
                  {buildingAccessibility.hasSlope ? "있음" : "없음"}
                </Badge>
              </div>
              {buildingAccessibility.entranceDoorTypes && buildingAccessibility.entranceDoorTypes.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">입구 문 유형</p>
                  <div className="flex gap-1 flex-wrap">
                    {buildingAccessibility.entranceDoorTypes.map((type, idx) => (
                      <Badge key={idx} variant="outline">
                        {entranceDoorTypeMap[type] || type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">엘리베이터 계단 정보</p>
                <p className="text-sm">{stairInfoMap[buildingAccessibility.elevatorStairInfo] || buildingAccessibility.elevatorStairInfo}</p>
              </div>
            </div>

            {/* 건물 입구 사진 */}
            {buildingAccessibility.entranceImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">건물 입구 사진 ({buildingAccessibility.entranceImages.length}장)</p>
                <div className="grid grid-cols-4 gap-2">
                  {buildingAccessibility.entranceImages.map((image, idx) => (
                    <a
                      key={idx}
                      href={image.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-square overflow-hidden rounded-md border hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={image.thumbnailUrl || image.imageUrl}
                        alt={`건물 입구 사진 ${idx + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 엘리베이터 사진 */}
            {buildingAccessibility.elevatorImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">엘리베이터 사진 ({buildingAccessibility.elevatorImages.length}장)</p>
                <div className="grid grid-cols-4 gap-2">
                  {buildingAccessibility.elevatorImages.map((image, idx) => (
                    <a
                      key={idx}
                      href={image.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-square overflow-hidden rounded-md border hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={image.thumbnailUrl || image.imageUrl}
                        alt={`엘리베이터 사진 ${idx + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
