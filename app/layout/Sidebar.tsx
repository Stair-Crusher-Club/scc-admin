"use client"

import { useAtom } from "jotai"
import { useMediaQuery } from "react-responsive"

import { AppState } from "@/lib/globalAtoms"

import * as S from "./Sidebar.style"

export default function Sidebar() {
  const isMobile = useMediaQuery({ maxWidth: 800 })
  const [appState, setAppState] = useAtom(AppState)

  const opened = appState.isSidebarOpened
  function toggleSidebar() {
    setAppState((s) => ({ ...s, isSidebarOpened: !s.isSidebarOpened }))
  }

  return (
    <>
      <S.Sidebar size={isMobile ? "mobile" : "desktop"} opened={opened} />
      {isMobile && <S.SidebarDim opened={opened} onClick={toggleSidebar} />}
    </>
  )
}
