import "@reactleaf/input/style"
import type { Metadata } from "next"
import { Noto_Sans_KR } from "next/font/google"
import Script from "next/script"
import "react-datepicker/dist/react-datepicker.css"
import "react-toastify/dist/ReactToastify.css"

import Providers from "./components/layout/Providers"
import "./globals.css"

const fonts = Noto_Sans_KR({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "계단뿌셔클럽",
  description: "계단뿌셔클럽 어드민",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isDevEnv = process.env.NEXT_PUBLIC_DEPLOY_TYPE !== "live"
  const naverClientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID
  return (
    <html lang="ko" className={isDevEnv ? "env-dev" : undefined}>
      <body className={fonts.className}>
        <Script
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naverClientId}&submodules=geocoder`}
          strategy="beforeInteractive"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
