"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useRef, useState } from "react"

interface NotionDatabaseProps {
  databaseId: string
  title: string
}

const notionSelectColors: Record<string, { bg: string; text: string }> = {
  default: { bg: "#E3E2E0", text: "#373530" },
  gray: { bg: "#E3E2E0", text: "#373530" },
  brown: { bg: "#EEE0DA", text: "#603B2C" },
  orange: { bg: "#FADEC9", text: "#854C1D" },
  yellow: { bg: "#FDECC8", text: "#7C5C00" },
  green: { bg: "#DBEDDB", text: "#2B593F" },
  blue: { bg: "#D3E5EF", text: "#28456C" },
  purple: { bg: "#E8DEEE", text: "#492F64" },
  pink: { bg: "#F5E0E9", text: "#69314C" },
  red: { bg: "#FFE2DD", text: "#93291A" },
}

function getPropertyValue(property: any): React.ReactNode {
  if (!property) return null

  switch (property.type) {
    case "title":
      return (property.title ?? []).map((t: any) => t.plain_text).join("")

    case "rich_text":
      return (property.rich_text ?? []).map((t: any) => t.plain_text).join("")

    case "checkbox":
      return null

    case "number":
      return property.number?.toString() ?? ""

    case "select": {
      const select = property.select
      if (!select) return null
      const colors = notionSelectColors[select.color] ?? notionSelectColors.default
      return (
        <span
          className="inline-block rounded px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {select.name}
        </span>
      )
    }

    case "multi_select":
      return (
        <div className="flex flex-wrap gap-1">
          {(property.multi_select ?? []).map((select: any) => {
            const colors = notionSelectColors[select.color] ?? notionSelectColors.default
            return (
              <span
                key={select.id ?? select.name}
                className="inline-block rounded px-2 py-0.5 text-xs font-medium"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {select.name}
              </span>
            )
          })}
        </div>
      )

    case "date": {
      const date = property.date
      if (!date) return null
      if (date.end) return `${date.start} ~ ${date.end}`
      return date.start
    }

    case "url": {
      const url = property.url
      if (!url) return null
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
          {url.length > 30 ? url.slice(0, 30) + "..." : url}
        </a>
      )
    }

    case "email":
      return property.email ?? ""

    case "phone_number":
      return property.phone_number ?? ""

    case "status": {
      const status = property.status
      if (!status) return null
      const colors = notionSelectColors[status.color] ?? notionSelectColors.default
      return (
        <span
          className="inline-block rounded px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {status.name}
        </span>
      )
    }

    default:
      return JSON.stringify(property[property.type] ?? "")
  }
}

export function NotionDatabase({ databaseId, title }: NotionDatabaseProps) {
  const queryClient = useQueryClient()
  const queryKey = ["notion-database", databaseId]
  const inflightRef = useRef(0)
  const [isUpdating, setIsUpdating] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/notion/database/${databaseId}`)
      if (!res.ok) throw new Error("Failed to fetch database")
      return res.json()
    },
    // Pause polling while an update is in-flight to avoid race conditions
    refetchInterval: isUpdating ? false : 5000,
  })

  const handleCheckboxToggle = useCallback(
    async (pageId: string, propertyName: string, currentValue: boolean) => {
      const newValue = !currentValue

      // 1. Increment in-flight counter, stop polling
      inflightRef.current += 1
      setIsUpdating(true)

      // 2. Optimistic update: directly mutate cached data
      const previousData = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old
        return {
          ...old,
          rows: old.rows.map((row: any) =>
            row.id === pageId
              ? {
                  ...row,
                  properties: {
                    ...row.properties,
                    [propertyName]: {
                      ...row.properties[propertyName],
                      checkbox: newValue,
                    },
                  },
                }
              : row,
          ),
        }
      })

      try {
        // 3. Write to Notion (no refetch — optimistic update is sufficient)
        const res = await fetch(`/notion/pages/${pageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            properties: {
              [propertyName]: { checkbox: newValue },
            },
            databaseId,
          }),
        })

        if (!res.ok) throw new Error("Failed to update")
      } catch {
        // Rollback on failure
        queryClient.setQueryData(queryKey, previousData)
      } finally {
        // 4. Decrement counter, resume polling only when all in-flight done
        inflightRef.current -= 1
        if (inflightRef.current === 0) {
          setIsUpdating(false)
          // Refetch once to reconcile with server, then polling resumes
          queryClient.refetchQueries({ queryKey })
        }
      }
    },
    [databaseId, queryClient],
  )

  if (isLoading) {
    return (
      <div className="my-4">
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <div className="animate-pulse rounded border border-gray-200 p-8 text-center text-gray-400">
          데이터를 불러오는 중...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="my-4">
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">
          데이터를 불러올 수 없습니다.
        </div>
      </div>
    )
  }

  const database = data?.database
  const rows = data?.rows ?? []
  const serverColumnOrder: string[] | undefined = data?.columnOrder

  const properties = database?.properties ?? {}
  const allColumns: { name: string; type: string }[] = []

  for (const [name, prop] of Object.entries(properties) as [string, any][]) {
    allColumns.push({ name, type: prop.type })
  }

  // 서버에서 view config의 column order가 오면 그 순서 사용
  // 없으면 fallback: title 첫 번째 + schema 순서
  let orderedColumns: { name: string; type: string }[]
  if (serverColumnOrder && serverColumnOrder.length > 0) {
    orderedColumns = serverColumnOrder
      .map((name) => allColumns.find((c) => c.name === name))
      .filter((c): c is { name: string; type: string } => c != null)
    // view에 없는 컬럼은 추가하지 않음 (hidden)
  } else {
    orderedColumns = [
      ...allColumns.filter((c) => c.type === "title"),
      ...allColumns.filter((c) => c.type !== "title"),
    ]
  }

  return (
    <div className="my-4">
      {title && <h3 className="mb-2 text-lg font-semibold">{title}</h3>}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse whitespace-nowrap text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {orderedColumns.map((col) => (
                <th
                  key={col.name}
                  className="whitespace-nowrap bg-gray-50 px-4 py-2 text-left font-medium text-gray-600"
                >
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any) => {
              const pageId = row.id
              const rowProperties = row.properties ?? {}

              return (
                <tr
                  key={pageId}
                  className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                >
                  {orderedColumns.map((col) => {
                    const prop = rowProperties[col.name]
                    if (!prop) {
                      return <td key={col.name} className="px-4 py-2" />
                    }

                    if (prop.type === "checkbox") {
                      return (
                        <td
                          key={col.name}
                          className="px-4 py-2 text-center"
                        >
                          <input
                            type="checkbox"
                            checked={prop.checkbox ?? false}
                            onChange={() =>
                              handleCheckboxToggle(
                                pageId,
                                col.name,
                                prop.checkbox ?? false,
                              )
                            }
                            className="h-4 w-4 cursor-pointer accent-blue-600"
                          />
                        </td>
                      )
                    }

                    return (
                      <td key={col.name} className="px-4 py-2">
                        {getPropertyValue(prop)}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={orderedColumns.length}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
