"use client"

import * as React from "react"

interface PageActionsContextType {
  actions: React.ReactNode
  setActions: (actions: React.ReactNode) => void
}

const PageActionsContext = React.createContext<PageActionsContextType | null>(null)

export function PageActionsProvider({ children }: { children: React.ReactNode }) {
  const [actions, setActions] = React.useState<React.ReactNode>(null)

  return (
    <PageActionsContext.Provider value={{ actions, setActions }}>
      {children}
    </PageActionsContext.Provider>
  )
}

export function usePageActions() {
  const context = React.useContext(PageActionsContext)
  if (!context) {
    throw new Error("usePageActions must be used within a PageActionsProvider")
  }
  return context
}

/**
 * Component to register page actions in the header.
 * Place this at the top of your page component.
 *
 * @example
 * ```tsx
 * <PageActions>
 *   <Button onClick={() => router.push("/create")}>Create New</Button>
 * </PageActions>
 * ```
 */
export function PageActions({ children }: { children: React.ReactNode }) {
  const { setActions } = usePageActions()

  React.useEffect(() => {
    setActions(children)
    return () => setActions(null)
  }, [children, setActions])

  return null
}
