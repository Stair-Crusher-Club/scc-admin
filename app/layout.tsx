import "@reactleaf/input/style"
import type { Metadata } from "next"
import { Noto_Sans_KR } from "next/font/google"
import "react-toastify/dist/ReactToastify.css"

import "./globals.css"
import Providers from "./layout/Providers"

const fonts = Noto_Sans_KR({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "계단뿌셔클럽",
  description: "계단뿌셔클럽 어드민",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={fonts.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
