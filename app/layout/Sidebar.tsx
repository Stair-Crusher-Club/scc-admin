"use client"

import { useAtom } from "jotai"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMediaQuery } from "react-responsive"

import { AppState } from "@/lib/globalAtoms"

import { Spacer } from "@/styles/jsx"

import * as S from "./Sidebar.style"
import kongal from "./character_astronut.png"

export default function Sidebar() {
  const isMobile = useMediaQuery({ maxWidth: 800 })
  const [appState, setAppState] = useAtom(AppState)

  const opened = appState.isSidebarOpened
  function toggleSidebar() {
    setAppState((s) => ({ ...s, isSidebarOpened: !s.isSidebarOpened }))
  }

  return (
    <>
      <S.Sidebar size={isMobile ? "mobile" : "desktop"} opened={opened}>
        <S.Title>
          <Image
            {...kongal}
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
        <S.LogoutButton>로그아웃</S.LogoutButton>
      </S.Sidebar>
      {isMobile && <S.SidebarDim opened={opened} onClick={toggleSidebar} />}
    </>
  )
}

function MenuItem({ href, children }: { href: string; children: React.ReactNode }) {
  const path = usePathname()
  const isActive = path.startsWith(href)
  return (
    <Link href={href}>
      <S.MenuItem isActive={isActive}>{children}</S.MenuItem>
    </Link>
  )
}
