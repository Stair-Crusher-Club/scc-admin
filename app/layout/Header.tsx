"use client"

import { useAtom } from "jotai"
import { useMediaQuery } from "react-responsive"

import { AppState } from "@/lib/globalAtoms"

import Hamburger from "@/icons/Hamburger"

import * as S from "./Header.style"

export default function Header() {
  const isMobile = useMediaQuery({ maxWidth: 800 })
  const [appState, setAppState] = useAtom(AppState)

  function openSidebar() {
    setAppState((s) => ({ ...s, isSidebarOpened: true }))
  }

  return (
    <S.Header size={isMobile ? "mobile" : "desktop"} hidden={appState.isHeaderHidden}>
      {isMobile && (
        <button onClick={openSidebar}>
          <Hamburger size={24} color="black" />
        </button>
      )}
      <S.Title>{appState.headerTitle}</S.Title>
    </S.Header>
  )
}
