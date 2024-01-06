"use client"

import { useAtom, useSetAtom } from "jotai"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useMediaQuery } from "react-responsive"

import { AppState } from "@/lib/globalAtoms"
import { storage } from "@/lib/storage"

import { Spacer } from "@/styles/jsx"

import * as S from "./Sidebar.style"
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
      <S.Sidebar size={isMobile ? "mobile" : "desktop"} opened={opened}>
        <S.Title>
          <Image
            src={kongal}
            alt="콩알이"
            style={{ width: 60, height: 40, objectFit: "contain", objectPosition: "left" }}
          />
          <h1>계단뿌셔클럽</h1>
        </S.Title>
        <S.Menu>
          <MenuItem href="/quest">퀘스트 관리</MenuItem>
          <MenuItem href="/challenge">챌린지 관리</MenuItem>
          <MenuItem href="/region">오픈 지역 관리</MenuItem>
        </S.Menu>
        <Spacer />
        <S.LogoutButton onClick={logout}>로그아웃</S.LogoutButton>
      </S.Sidebar>
      {isMobile && <S.SidebarDim opened={opened} onClick={toggleSidebar} />}
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
      <S.MenuItem isActive={isActive}>{children}</S.MenuItem>
    </Link>
  )
}
