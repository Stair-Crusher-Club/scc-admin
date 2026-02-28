import notion from "@/lib/notion"

export const dynamic = "force-dynamic"

/** 하드코딩된 정렬: 조 asc → created_time asc */
const DEFAULT_SORTS = [
  { property: "조", direction: "ascending" as const },
  { timestamp: "created_time", direction: "ascending" as const },
]

async function queryDatabase(
  databaseId: string,
  startCursor?: string,
) {
  const body: Record<string, unknown> = { sorts: DEFAULT_SORTS }
  if (startCursor) body.start_cursor = startCursor

  const res = await fetch(
    `https://api.notion.com/v1/databases/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_ATTENDANCE_API_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  )

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw {
      status: res.status,
      message: error.message ?? "Failed to query database",
    }
  }

  return res.json()
}

export async function GET(
  request: Request,
  { params }: { params: { databaseId: string } },
) {
  const { databaseId } = params

  try {
    const database = await notion.databases.retrieve({ database_id: databaseId })

    const firstBatch = await queryDatabase(databaseId)
    const rows = [...firstBatch.results]
    let cursor = firstBatch.next_cursor

    while (cursor) {
      const next = await queryDatabase(databaseId, cursor)
      rows.push(...next.results)
      cursor = next.next_cursor
    }

    return Response.json({ database, rows })
  } catch (error: any) {
    const status = error?.status ?? 500
    const message = error?.message ?? "Failed to fetch Notion database"
    return new Response(message, { status })
  }
}
