import { useAtom } from "jotai"
import { useEffect } from "react"

import { AppState } from "@/lib/globalAtoms"

export function useTitle(title?: string) {
  const [_, setAppState] = useAtom(AppState)

  useEffect(() => {
    setAppState((s) => ({ ...s, headerTitle: title }))
    return () => {
      setAppState((s) => ({ ...s, headerTitle: "" }))
    }
  }, [title])
}
