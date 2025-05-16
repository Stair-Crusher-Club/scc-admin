"use client"

import { useState } from "react"

import GuideLayout, { GuideTab } from "@/components/Guide/GuideLayout"
import RegisterGuideView from "@/components/Guide/GuideView/RegisterGuideView"
import SearchGuideView from "@/components/Guide/GuideView/SearchGuideView"

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<GuideTab>("register")

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

  return (
    <GuideLayout activeTab={activeTab} changeActiveTab={setActiveTab}>
      {renderView()}
    </GuideLayout>
  )
}
