"use client"

import { useAtom } from "jotai"

import { AppState } from "@/lib/globalAtoms"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Props {
  title: React.ReactNode
  hidden?: boolean
  children?: React.ReactNode
}

export function PublicHeader({ title, hidden, children }: Props) {
  const [appState] = useAtom(AppState)

  return (
    <header
      className={cn(
        "fixed z-10 top-0 flex items-center justify-between w-full h-12 px-4 bg-background border-b transition-transform duration-300",
        appState.isHeaderHidden || hidden ? "-translate-y-full" : "translate-y-0"
      )}
    >
      <h2 className="text-lg font-bold leading-tight">{title}</h2>
      <div className="flex-1" />
      {children}
    </header>
  )
}

PublicHeader.ActionButton = function ActionButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button className={cn("ml-1", className)} size="sm" {...props}>
      {children}
    </Button>
  )
}

PublicHeader.ActionButtonWrapper = function ActionButtonWrapper({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("min-w-fit flex gap-1.5", className)}>
      {children}
    </div>
  )
}
