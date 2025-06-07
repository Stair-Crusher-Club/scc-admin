import { PropsWithChildren, useRef } from "react"

import * as S from "./GuideLayout.style"

export type GuideTab = "register" | "search"

interface GuideLayoutProps extends PropsWithChildren {
  activeTab: GuideTab
  changeActiveTab: (tab: GuideTab) => void
}

export default function GuideLayout({ activeTab, changeActiveTab, children }: GuideLayoutProps) {
  const mainRef = useRef<HTMLElement | null>(null)
  return (
    <>
      <S.Header>
        <S.Nav>
          <S.MenuButton
            active={activeTab === "register"}
            onClick={() => {
              mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })
              changeActiveTab("register")
            }}
          >
            정보 등록하기
          </S.MenuButton>
          <S.MenuButton
            active={activeTab === "search"}
            onClick={() => {
              mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })
              changeActiveTab("search")
            }}
          >
            정보 조회하기
          </S.MenuButton>
        </S.Nav>
      </S.Header>

      <S.Main ref={mainRef}>{children}</S.Main>
    </>
  )
}
