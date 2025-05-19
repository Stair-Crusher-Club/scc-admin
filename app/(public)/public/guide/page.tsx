import { Suspense } from "react"

import GuideContent from "@/components/Guide/GuideContent"

export default function GuidePage() {
  return (
    <Suspense>
      <GuideContent />
    </Suspense>
  )
}
