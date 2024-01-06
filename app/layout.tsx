import "@reactleaf/input/style"
import type { Metadata } from "next"
import { Noto_Sans_KR } from "next/font/google"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import "./globals.css"
import * as S from "./layout.style"
import Header from "./layout/Header"
import Providers from "./layout/Providers"
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
        <Providers>
          <S.Layout>
            <Sidebar />
            <S.Body>
              <Header />
              {children}
              <ToastContainer />
            </S.Body>
          </S.Layout>
        </Providers>
      </body>
    </html>
  )
}
