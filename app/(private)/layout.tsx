"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { storage } from "@/lib/storage"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authenticated, setAuthenticated] = useState<boolean>()

  useEffect(() => {
    const token = storage.get("token")
    // TODO: token 유효성 검사. 지금은 일단 있으면 오케이.
    if (token) {
      setAuthenticated(true)
    } else {
      setAuthenticated(false)
      router.replace("/account/login?redirect=" + pathname)
    }
  }, [])

  if (authenticated === undefined) return null
  if (!authenticated) return <div>로그인이 필요합니다.</div>
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col overflow-x-hidden">
          <div className="@container/main flex flex-1 flex-col gap-2 overflow-x-hidden">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 overflow-x-hidden">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
