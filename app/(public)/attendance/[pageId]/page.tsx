"use client"

import { useQuery } from "@tanstack/react-query"

import { NotionRenderer } from "@/components/notion/NotionRenderer"

function getPageTitle(page: any): string {
  if (!page?.properties) return ""
  for (const prop of Object.values(page.properties) as any[]) {
    if (prop.type === "title") {
      return (prop.title ?? []).map((t: any) => t.plain_text).join("")
    }
  }
  return ""
}

export default function AttendancePage({
  params,
}: {
  params: { pageId: string }
}) {
  const { pageId } = params

  const { data, isLoading, error } = useQuery({
    queryKey: ["notion-page", pageId],
    queryFn: async () => {
      const res = await fetch(`/notion/blocks/${pageId}`)
      if (!res.ok) throw new Error("Failed to fetch page")
      return res.json()
    },
    refetchInterval: 5000,
  })

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[900px] px-4 py-10 sm:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-2/3 rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-100" />
          <div className="h-4 w-5/6 rounded bg-gray-100" />
          <div className="h-4 w-4/6 rounded bg-gray-100" />
          <div className="h-32 w-full rounded bg-gray-100" />
          <div className="h-4 w-3/6 rounded bg-gray-100" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-[900px] px-4 py-10 sm:px-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-lg font-medium text-red-600">
            페이지를 불러올 수 없습니다
          </p>
          <p className="mt-1 text-sm text-red-500">
            페이지가 존재하지 않거나 접근 권한이 없습니다.
          </p>
        </div>
      </div>
    )
  }

  const page = data?.page
  const blocks = data?.blocks ?? []
  const title = getPageTitle(page)

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-10 sm:px-6">
      {title && (
        <h1 className="mb-6 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
          {title}
        </h1>
      )}
      <NotionRenderer blocks={blocks} />
    </div>
  )
}
