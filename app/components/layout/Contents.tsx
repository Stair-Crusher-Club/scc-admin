import { cn } from "@/lib/utils"

// 기본 <Contents />는 아무 스타일도 입히지 않는다
function Contents({ children }: { children: React.ReactNode }) {
  return children
}

Contents.Normal = function ContentsNormal({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <main className={cn("w-full p-8", className)}>
      {children}
    </main>
  )
}

Contents.Columns = function ContentsColumns({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <main className={cn("flex h-full", className)}>
      {children}
    </main>
  )
}

export default Contents
