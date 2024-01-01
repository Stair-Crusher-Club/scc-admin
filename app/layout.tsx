import "@reactleaf/input/style"
import type { Metadata } from "next"
import { Noto_Sans_KR } from "next/font/google"

import "./globals.css"
import * as S from "./layout.style"
import Header from "./layout/Header"
import Sidebar from "./layout/Sidebar"

const fonts = Noto_Sans_KR({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "계단뿌셔클럽",
  description: "계단뿌셔클럽 어드민",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={fonts.className}>
        <S.Layout>
          <Sidebar />
          <S.Body>
            <Header />
            {children}
          </S.Body>
        </S.Layout>
      </body>
    </html>
  )
}
