"use client"

import { useAtom } from "jotai"
import { useMediaQuery } from "react-responsive"

import { AppState } from "@/lib/globalAtoms"

import Hamburger from "@/icons/Hamburger"

import * as S from "./Header.style"

export default function Header() {
  const isMobile = useMediaQuery({ maxWidth: 800 })
  const [_, setAppState] = useAtom(AppState)

  function openSidebar() {
    setAppState((s) => ({ ...s, isSidebarOpened: true }))
  }

  return (
    <S.Header size={isMobile ? "mobile" : "desktop"}>
      {isMobile && (
        <button onClick={openSidebar}>
          <Hamburger size={24} color="black" />
        </button>
      )}
    </S.Header>
  )
}
