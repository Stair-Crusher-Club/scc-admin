"use client"

import { useAtom, useSetAtom } from "jotai"
import {
  Building2,
  ClipboardList,
  Flag,
  Home,
  LogOut,
  Map,
  MapPin,
  Megaphone,
  Search,
  ShieldCheck,
  Tag,
  Trophy,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useMediaQuery } from "react-responsive"

import { AppState } from "@/lib/globalAtoms"
import { storage } from "@/lib/storage"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import Logo from "@/icons/Logo"

import kongal from "./character_astronut.png"

const menuItems = [
  { href: "/chunks", label: "장소 청크 관리", icon: MapPin },
  { href: "/quest", label: "퀘스트 관리", icon: ClipboardList },
  { href: "/challenge", label: "챌린지 관리", icon: Trophy },
  { href: "/region", label: "오픈 지역 관리", icon: Flag },
  { href: "/accessibility", label: "등록된 정보 관리", icon: Home },
  { href: "/closedPlace", label: "폐업 추정 장소 관리", icon: Building2 },
  { href: "/banner", label: "배너 관리", icon: Tag },
  { href: "/bbucleRoad", label: "뿌클로드 관리", icon: Map },
  { href: "/notification", label: "푸시 알림 관리", icon: Megaphone },
  { href: "/searchPreset", label: "추천 검색어 관리", icon: Search },
  { href: "/accessibilityInspectionResult", label: "접근성 검증 결과", icon: ShieldCheck },
]

export default function Sidebar() {
  const router = useRouter()
  const isMobile = useMediaQuery({ maxWidth: 800 })
  const [appState, setAppState] = useAtom(AppState)

  // 윈도우 사이즈가 변할 때마다 열림 상태 초기화
  useEffect(() => {
    setAppState((s) => ({ ...s, isSidebarOpened: !isMobile }))
  }, [isMobile, setAppState])

  const opened = appState.isSidebarOpened
  function toggleSidebar() {
    setAppState((s) => ({ ...s, isSidebarOpened: !s.isSidebarOpened }))
  }

  function logout() {
    storage.remove("token")
    if (isMobile) {
      setAppState((s) => ({ ...s, isSidebarOpened: false }))
    }
    router.replace("/account/login")
  }

  return (
    <>
      <aside
        className={cn(
          "flex flex-col border-r bg-sidebar shadow-md transition-transform duration-300 ease-in-out",
          isMobile ? "absolute top-0 left-0 z-10 h-full w-64" : "relative flex-[280px_0_0]",
          opened ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-6 cursor-pointer group" onClick={() => router.push("/")}>
          <Image
            src={kongal}
            alt="콩알이"
            style={{ width: 48, height: 32, objectFit: "contain" }}
            className="transition-transform group-hover:scale-110"
          />
          <Logo color="white" height={32} />
        </div>

        <Separator className="bg-sidebar-foreground/20" />

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <MenuItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                onClose={() => {
                  if (isMobile) {
                    setAppState((s) => ({ ...s, isSidebarOpened: false }))
                  }
                }}
              />
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4">
          <Separator className="mb-4 bg-sidebar-foreground/20" />
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-active hover:text-sidebar-foreground"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </Button>
        </div>
      </aside>
      {isMobile && (
        <div
          className={cn(
            "fixed top-0 left-0 z-[9] h-full w-full bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out",
            opened ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={toggleSidebar}
        />
      )}
    </>
  )
}

interface MenuItemProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClose: () => void
}

function MenuItem({ href, icon: Icon, label, onClose }: MenuItemProps) {
  const path = usePathname()
  const isActive = path === href || path.startsWith(`${href}/`)

  return (
    <Link href={href} onClick={onClose} className="block">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-hover hover:text-sidebar-foreground",
          isActive && "bg-sidebar-active font-semibold text-sidebar-foreground shadow-sm hover:bg-sidebar-active",
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <span className="text-sm">{label}</span>
      </Button>
    </Link>
  )
}
