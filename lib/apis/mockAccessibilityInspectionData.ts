import {
  AccessibilityTypeDTO,
  AdminAccessibilityInspectionResultDTO,
  InspectorTypeDTO,
  ResultTypeDTO,
} from "@/lib/generated-sources/openapi"

const now = Date.now()
const dayMs = 24 * 60 * 60 * 1000

// Sample image URLs
const sampleImages = [
  "https://picsum.photos/seed/1/400/300",
  "https://picsum.photos/seed/2/400/300",
  "https://picsum.photos/seed/3/400/300",
  "https://picsum.photos/seed/4/400/300",
  "https://picsum.photos/seed/5/400/300",
]

// Sample place names
const placeNames = [
  "스타벅스 강남점",
  "올리브영 홍대점",
  "CGV 영등포",
  "신세계백화점 본점",
  "코엑스몰",
  "롯데월드타워",
  "서울시립미술관",
  "국립중앙박물관",
  "63빌딩",
  "N서울타워",
  "서울대학교 중앙도서관",
  "여의도공원 화장실",
  "강남역 지하도",
  "이마트 월계점",
  "이케아 기흥점",
  "카페베네 명동점",
  "투썸플레이스 잠실점",
  "파리바게뜨 역삼점",
  "배스킨라빈스 신촌점",
  "맥도날드 종로점",
]

// Sample reason codes
const reasonCodes = [
  "IMAGE_QUALITY_ISSUE",
  "BLUR_DETECTED",
  "INSUFFICIENT_LIGHTING",
  "OBSTRUCTION_DETECTED",
  "ANGLE_ISSUE",
  "IRRELEVANT_CONTENT",
  "DUPLICATE_IMAGE",
  "LOW_RESOLUTION",
  "PRIVACY_CONCERN",
  "ACCESSIBILITY_NOT_VISIBLE",
]

// Sample descriptions
const descriptions = [
  "이미지 품질이 낮아 접근성 정보를 정확히 판단하기 어렵습니다.",
  "조명이 불충분하여 계단 및 경사로가 명확하게 보이지 않습니다.",
  "입구가 가려져 있어 출입문 유형을 확인할 수 없습니다.",
  "이미지가 흐릿하여 접근성 검증이 불가능합니다.",
  "접근성 정보가 명확히 확인되며 검수가 완료되었습니다.",
  "계단 높이 정보가 부정확하게 기록되어 있습니다.",
  "엘리베이터 유무를 확인할 수 없는 각도로 촬영되었습니다.",
  "경사로가 존재하지만 촬영되지 않았습니다.",
  "출입문 유형이 여러 개 있으나 일부만 기록되었습니다.",
  "화장실 접근성 정보가 부족합니다.",
  "장애인 전용 주차 공간 정보가 필요합니다.",
  "자동문이 있으나 작동 여부를 알 수 없습니다.",
  "계단 난간 정보가 누락되었습니다.",
  "실내 경사로의 각도가 기준을 초과합니다.",
  "접근성 정보가 모두 확인되어 승인되었습니다.",
]

function generateMockItem(index: number): AdminAccessibilityInspectionResultDTO {
  const accessibilityTypes: AccessibilityTypeDTO[] = ["Place", "Building", "PlaceReview", "ToiletReview", "UNKNOWN"]
  const inspectorTypes: InspectorTypeDTO[] = ["HUMAN", "AI", "UNKNOWN"]
  const resultTypes: ResultTypeDTO[] = ["OK", "MODIFY", "DELETE", "UNKNOWN"]

  const accessibilityType = accessibilityTypes[index % accessibilityTypes.length]
  const inspectorType = inspectorTypes[index % inspectorTypes.length]
  const resultType = resultTypes[index % resultTypes.length]
  const isHandled = index % 3 === 0

  const imageCount = (index % 4) + 1
  const images = Array.from({ length: imageCount }, (_, imgIdx) => ({
    id: `img-${index}-${imgIdx}`,
    imageUrl: sampleImages[imgIdx % sampleImages.length],
    thumbnailUrl: sampleImages[imgIdx % sampleImages.length],
  }))

  const imageDetails = images.map((img, imgIdx) => ({
    url: img.imageUrl,
    reasonCodes: Array.from(
      { length: (imgIdx % 3) + 1 },
      (_, codeIdx) => reasonCodes[(index + imgIdx + codeIdx) % reasonCodes.length],
    ),
  }))

  const overallCodes = Array.from(
    { length: (index % 4) + 1 },
    (_, codeIdx) => reasonCodes[(index + codeIdx) % reasonCodes.length],
  )

  const contents = JSON.stringify({
    description: descriptions[index % descriptions.length],
    overallCodes,
    images: imageDetails,
  })

  return {
    id: `inspection-${index + 1}`,
    accessibilityId: `accessibility-${1000 + index}`,
    accessibilityType,
    accessibilityName: placeNames[index % placeNames.length],
    resultType,
    inspectorId: `inspector-${(index % 10) + 1}`,
    inspectorType,
    handledAtMillis: isHandled ? now - index * dayMs * 0.2 : null,
    createdAtMillis: now - index * dayMs * 0.5,
    updatedAtMillis: now - index * dayMs * 0.3,
    images,
    contents,
  }
}

// Generate 100 mock items
export const mockAccessibilityInspectionResults: AdminAccessibilityInspectionResultDTO[] = Array.from(
  { length: 100 },
  (_, i) => generateMockItem(i),
)

export function getMockAccessibilityInspectionResults({
  accessibilityType,
  inspectorType,
  resultType,
  isHandled,
  createdAtFromLocalDate,
  createdAtToLocalDate,
  page = 1,
  pageSize = 20,
}: {
  accessibilityType?: AccessibilityTypeDTO
  inspectorType?: InspectorTypeDTO
  resultType?: ResultTypeDTO
  isHandled?: boolean
  createdAtFromLocalDate?: string
  createdAtToLocalDate?: string
  page?: number
  pageSize?: number
}) {
  // Filter the mock data
  let filtered = mockAccessibilityInspectionResults

  if (accessibilityType) {
    filtered = filtered.filter((item) => item.accessibilityType === accessibilityType)
  }

  if (inspectorType) {
    filtered = filtered.filter((item) => item.inspectorType === inspectorType)
  }

  if (resultType) {
    filtered = filtered.filter((item) => item.resultType === resultType)
  }

  if (typeof isHandled === "boolean") {
    filtered = filtered.filter((item) => {
      const itemIsHandled = item.handledAtMillis !== null && item.handledAtMillis !== undefined
      return itemIsHandled === isHandled
    })
  }

  if (createdAtFromLocalDate) {
    const fromDate = new Date(createdAtFromLocalDate).getTime()
    filtered = filtered.filter((item) => item.createdAtMillis >= fromDate)
  }

  if (createdAtToLocalDate) {
    const toDate = new Date(createdAtToLocalDate).getTime() + dayMs // Include the entire day
    filtered = filtered.filter((item) => item.createdAtMillis <= toDate)
  }

  // Paginate
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const items = filtered.slice(startIndex, endIndex)
  const hasNextPage = endIndex < filtered.length
  const totalPages = Math.ceil(filtered.length / pageSize)

  return {
    items,
    hasNextPage,
    totalPages,
    currentPage: page,
    pageSize,
    cursor: hasNextPage ? `cursor-page-${page + 1}` : undefined,
  }
}
