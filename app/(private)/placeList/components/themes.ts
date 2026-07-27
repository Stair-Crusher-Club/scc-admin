import { AdminUserInterestedThemeDto } from "@/lib/generated-sources/openapi"

// 앱 InterestedRegionAndThemesFormScreen/constants.ts의 THEME_LABEL_BY_VALUE와 동일 문구
export const THEME_LABELS: Record<AdminUserInterestedThemeDto, string> = {
  [AdminUserInterestedThemeDto.WheelchairReview]: "🧑‍🦽 휠체어 찐방문기",
  [AdminUserInterestedThemeDto.MediaHotspot]: "🔥 방송·SNS 핫플",
  [AdminUserInterestedThemeDto.FoodCafeTour]: "🍕 맛집·카페 투어",
  [AdminUserInterestedThemeDto.EmotionalView]: "📸 감성·뷰 맛집",
  [AdminUserInterestedThemeDto.Sports]: "⚾ 야구장·스포츠",
  [AdminUserInterestedThemeDto.Culture]: "🎭 공연·전시·영화",
  [AdminUserInterestedThemeDto.Travel]: "✈️ 훌쩍 떠나는 여행",
  [AdminUserInterestedThemeDto.Nature]: "🌳 자연·공원 힐링",
}

export const THEME_OPTIONS: AdminUserInterestedThemeDto[] = [
  AdminUserInterestedThemeDto.WheelchairReview,
  AdminUserInterestedThemeDto.MediaHotspot,
  AdminUserInterestedThemeDto.FoodCafeTour,
  AdminUserInterestedThemeDto.EmotionalView,
  AdminUserInterestedThemeDto.Sports,
  AdminUserInterestedThemeDto.Culture,
  AdminUserInterestedThemeDto.Travel,
  AdminUserInterestedThemeDto.Nature,
]
