export interface Option {
  label: string
  value: string
}

export interface DeepLinkOption extends Option {
  isArgumentRequired: boolean
}

export interface WebviewOption extends Option {
  fixedTitle: string
  headerVariant: string
}

export const deepLinkOptions: DeepLinkOption[] = [
  { label: "홈", value: "stair-crusher://", isArgumentRequired: false },
  { label: "프로필", value: "stair-crusher://profile", isArgumentRequired: false },
  { label: "설정", value: "stair-crusher://setting", isArgumentRequired: false },
  { label: "장소", value: "stair-crusher://place", isArgumentRequired: true },
  { label: "챌린지", value: "stair-crusher://challenge", isArgumentRequired: true },
  { label: "웹뷰", value: "stair-crusher://webview", isArgumentRequired: false },
]

export const headerVariantOptions: Option[] = [
  { label: "브라우저처럼 열리도록 (상단에 X 버튼이 있다)", value: "appbar" },
  { label: "앱 내부처럼 보이도록 (상단에 뒤로가기 버튼이 있다)", value: "navigation" },
]

export const predefinedWebviews: WebviewOption[] = [
  {
    label: "정보 등록 가이드",
    value: "https://admin.staircrusher.club/public/guide?tab=register",
    fixedTitle: "정보 등록/조회 가이드",
    headerVariant: "navigation",
  },
  {
    label: "정보 조회 가이드",
    value: "https://admin.staircrusher.club/public/guide?tab=search",
    fixedTitle: "정보 등록/조회 가이드",
    headerVariant: "navigation",
  },
]
