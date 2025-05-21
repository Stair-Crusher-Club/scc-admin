"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import GuideLayout, { GuideTab } from "@/components/Guide/GuideLayout"
import RegisterGuideView from "@/components/Guide/GuideView/RegisterGuideView"
import SearchGuideView from "@/components/Guide/GuideView/SearchGuideView"

export default function GuideContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryString = searchParams.get("tab")

  const [activeTab, setActiveTab] = useState<GuideTab>(
    queryString === "register" || queryString === "search" ? queryString : "register",
  )

  const renderView = () => {
    switch (activeTab) {
      case "register":
        return <RegisterGuideView />
      case "search":
        return <SearchGuideView />
      default:
        return null
    }
  }

  useEffect(() => {
    router.replace(`?tab=${activeTab}`, { scroll: false })
  }, [activeTab])

  return (
    <GuideLayout activeTab={activeTab} changeActiveTab={setActiveTab}>
      {renderView()}
    </GuideLayout>
  )
}
