import {
  Bell,
  Bookmark,
  Building2,
  ClipboardList,
  Copy,
  Flag,
  FolderTree,
  Home,
  type LucideIcon,
  Map,
  MapPin,
  Megaphone,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Trophy,
} from "lucide-react"

export interface MenuItem {
  title: string
  url: string
  icon: LucideIcon
}

export const menuItems: MenuItem[] = [
  { title: "장소 청크 관리", url: "/chunks", icon: MapPin },
  { title: "퀘스트 관리", url: "/quest", icon: ClipboardList },
  { title: "챌린지 관리", url: "/challenge", icon: Trophy },
  { title: "오픈 지역 관리", url: "/region", icon: Flag },
  { title: "등록된 정보 관리", url: "/accessibility", icon: Home },
  { title: "폐업 추정 장소 관리", url: "/closedPlace", icon: Building2 },
  { title: "건물 중복 제거 후보", url: "/buildingDeduplication", icon: Copy },
  { title: "배너 관리", url: "/banner", icon: Tag },
  { title: "공지사항 관리", url: "/announcement", icon: Bell },
  { title: "추천 컨텐츠 관리", url: "/recommendedContent", icon: Sparkles },
  { title: "뿌클로드 관리", url: "/bbucleRoad", icon: Map },
  { title: "푸시 알림 관리", url: "/notification", icon: Megaphone },
  { title: "추천 검색어 관리", url: "/searchPreset", icon: Search },
  { title: "접근성 검증 결과", url: "/accessibilityInspectionResult", icon: ShieldCheck },
  { title: "장소 카테고리 관리", url: "/placeCategoryCache", icon: FolderTree },
  { title: "저장 리스트 관리", url: "/placeList", icon: Bookmark },
]

export function getMenuItemByPath(pathname: string): MenuItem | undefined {
  return menuItems.find((item) => pathname === item.url || pathname.startsWith(`${item.url}/`))
}
