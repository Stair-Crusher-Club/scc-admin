"use client"

import { useAtom, useSetAtom } from "jotai"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useMediaQuery } from "react-responsive"

import { AppState } from "@/lib/globalAtoms"
import { storage } from "@/lib/storage"
import { cn } from "@/lib/utils"

import Logo from "@/icons/Logo"

import kongal from "./character_astronut.png"

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
          "relative flex flex-col transition-transform duration-300 ease-in-out",
          isMobile
            ? "absolute top-0 left-0 z-10 w-60 h-full"
            : "relative flex-[240px_0_0]",
          "bg-[oklch(62.84%_0.202_256.31)]",
          opened ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div
          className="flex items-center p-3 text-2xl text-white cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image
            src={kongal}
            alt="콩알이"
            style={{ width: 60, height: 40, objectFit: "contain", objectPosition: "left" }}
          />
          <Logo color="white" height={40} />
        </div>
        <ul className="py-4">
          <MenuItem href="/chunks">장소 청크 관리</MenuItem>
          <MenuItem href="/quest">퀘스트 관리</MenuItem>
          <MenuItem href="/challenge">챌린지 관리</MenuItem>
          <MenuItem href="/region">오픈 지역 관리</MenuItem>
          <MenuItem href="/accessibility">등록된 정보 관리</MenuItem>
          <MenuItem href="/closedPlace">폐업 추정 장소 관리</MenuItem>
          <MenuItem href="/banner">배너 관리</MenuItem>
          <MenuItem href="/notification">푸시 알림 관리</MenuItem>
          <MenuItem href="/searchPreset">추천 검색어 관리</MenuItem>
          <MenuItem href="/accessibilityInspectionResult">접근성 검증 결과</MenuItem>
        </ul>
        <div className="flex-1" />
        <button
          className="flex items-center px-4 py-2 text-xs text-white cursor-pointer hover:bg-white/10"
          onClick={logout}
        >
          로그아웃
        </button>
      </aside>
      {isMobile && (
        <div
          className={cn(
            "fixed top-0 left-0 z-[9] w-full h-full bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out",
            opened ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={toggleSidebar}
        />
      )}
    </>
  )
}

function MenuItem({ href, children }: { href: string; children: React.ReactNode }) {
  const isMobile = useMediaQuery({ maxWidth: 800 })
  const path = usePathname()
  const isActive = path.startsWith(href)
  const setAppState = useSetAtom(AppState)

  function closeSidebar() {
    if (isMobile) {
      setAppState((s) => ({ ...s, isSidebarOpened: false }))
    }
  }

  return (
    <Link href={href} onClick={closeSidebar}>
      <li
        className={cn(
          "flex items-center px-4 py-2 text-base text-white cursor-pointer hover:bg-white/10",
          isActive && "bg-[oklch(50%_0.202_256.31)]"
        )}
      >
        {children}
      </li>
    </Link>
  )
}
