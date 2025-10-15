"use client"

import { useAtom } from "jotai"
import { useMediaQuery } from "react-responsive"

import { AppState } from "@/lib/globalAtoms"

import Hamburger from "@/icons/Hamburger"
import { Flex } from "@/styles/jsx"

import * as S from "./Header.style"

interface Props {
  title: React.ReactNode | undefined
  hidden?: boolean
  hideMenu?: boolean
}
export default function Header({ title, hidden, hideMenu, children }: React.PropsWithChildren<Props>) {
  const isMobile = useMediaQuery({ maxWidth: 800 })
  const [appState, setAppState] = useAtom(AppState)

  function openSidebar() {
    setAppState((s) => ({ ...s, isSidebarOpened: true }))
  }

  if (!isMobile)
    return (
      <S.DesktopHeader>
        <S.Title>{title}</S.Title>
        {children}
      </S.DesktopHeader>
    )

  return (
    <S.MobileHeader hidden={appState.isHeaderHidden || hidden}>
      {isMobile && !hideMenu && (
        <button onClick={openSidebar}>
          <Hamburger size={24} color="black" />
        </button>
      )}
      <S.Title>{title}</S.Title>
      <Flex flex={1} />
      {children}
    </S.MobileHeader>
  )
}

Header.ActionButton = S.ActionButton
Header.ActionButtonWrapper = S.ActionButtonWrapper
