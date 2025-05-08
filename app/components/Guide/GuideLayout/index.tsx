import { PropsWithChildren } from "react"

import * as S from "./GuideLayout.style"

interface GuideLayoutProps extends PropsWithChildren {
  active: "register" | "search"
}

export default function GuideLayout({ children, active }: GuideLayoutProps) {
  return (
    <>
      <S.Header>
        <S.Nav>
          <S.Menu active={active === "register"} href="/public/guide/register">
            정보 등록하기
          </S.Menu>
          <S.Menu active={active === "search"} href="/public/guide/search">
            정보 조회하기
          </S.Menu>
        </S.Nav>
      </S.Header>

      <S.Main>{children}</S.Main>
    </>
  )
}
