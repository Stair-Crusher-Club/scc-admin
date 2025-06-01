import dynamic from "next/dynamic"
import { Suspense } from "react"

const GuideContent = dynamic(() => import("@/components/Guide/GuideContent"), {
  ssr: false,
})

export default function GuidePage() {
  return (
    <Suspense>
      <GuideContent />
    </Suspense>
  )
}
