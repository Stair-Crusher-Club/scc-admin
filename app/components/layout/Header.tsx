"use client"

import { useAtom } from "jotai"
import { useMediaQuery } from "react-responsive"

import { AppState } from "@/lib/globalAtoms"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import Hamburger from "@/icons/Hamburger"

interface Props {
  title: React.ReactNode | undefined
  hidden?: boolean
  hideMenu?: boolean
}

export default function Header({ title, hidden, hideMenu, children }: React.PropsWithChildren<Props>) {
  const isMobile = useMediaQuery({ maxWidth: 800 })
  const [appState, setAppState] = useAtom(AppState)

  function openSidebar() {
    setAppState((s) => ({ ...s, isSidebarOpened: true }))
  }

  if (!isMobile)
    return (
      <header className="sticky top-0 left-0 z-10 flex w-full min-h-12 items-center justify-between px-4 bg-background border-b shrink-0">
        <h2 className="ml-2 mt-1.5 mb-2 pb-0.5 text-xl font-bold">{title}</h2>
        {children}
      </header>
    )

  return (
    <header
      className={cn(
        "fixed z-10 top-0 flex items-center justify-between w-full px-4 bg-background border-b transition-transform duration-300",
        appState.isHeaderHidden || hidden ? "-translate-y-full" : "translate-y-0"
      )}
    >
      {isMobile && !hideMenu && (
        <Button variant="ghost" size="icon" onClick={openSidebar} className="shrink-0">
          <Hamburger size={24} color="black" />
        </Button>
      )}
      <h2 className="ml-2 mt-1.5 mb-2 pb-0.5 text-xl font-bold">{title}</h2>
      <div className="flex-1" />
      {children}
    </header>
  )
}

// Compound components using shadcn Button
Header.ActionButton = function ActionButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn("ml-1", className)}
      size="sm"
      {...props}
    >
      {children}
    </Button>
  )
}

Header.ActionButtonWrapper = function ActionButtonWrapper({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("min-w-fit flex flex-col gap-1.5", className)}>
      {children}
    </div>
  )
}
