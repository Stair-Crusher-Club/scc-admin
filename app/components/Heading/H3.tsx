"use client"

import * as S from "./H3.style"

interface Props {
  children: string
}
export default function H3({ children }: React.PropsWithChildren<Props>) {
  return <S.H3>{children}</S.H3>
}
