"use client"

import { Sidebar } from "@/components/layout"
import { useAuth } from "@/hooks/useAuth"
import { Flex } from "@/styles/jsx"

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated === null) return undefined
  if (!isAuthenticated) return <div>로그인이 필요합니다.</div>
  return (
    <Flex css={{ width: "full", height: "full" }}>
      <Sidebar />
      <Flex direction="column" css={{ width: "full", overflow: "auto" }}>
        {children}
      </Flex>
    </Flex>
  )
}
