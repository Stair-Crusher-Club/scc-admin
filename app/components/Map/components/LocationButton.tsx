import { LocateFixed } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { TrackingMode } from "@/hooks/useLocationTracking"

interface Props {
  trackingMode: TrackingMode
  onClick: () => void
}

export default function LocationButton({ trackingMode, onClick }: Props) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className="rounded-full h-10 w-10 bg-white shadow-md border-gray-200"
    >
      <LocateFixed
        className={`h-5 w-5 ${trackingMode === "TRACKING" ? "text-blue-500" : "text-muted-foreground"}`}
      />
    </Button>
  )
}
