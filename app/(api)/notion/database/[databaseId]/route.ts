import { cachedFetch, setCache, triggerSyncIfNeeded } from "@/lib/notion-cache"
import notion from "@/lib/notion"
import redis from "@/lib/redis"

export const dynamic = "force-dynamic"

async function queryDatabase(databaseId: string, startCursor?: string) {
  const body: Record<string, unknown> = {}
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

async function fetchAllRows(databaseId: string) {
  const firstBatch = await queryDatabase(databaseId)
  const allRows = [...firstBatch.results]
  let cursor = firstBatch.next_cursor

  while (cursor) {
    const next = await queryDatabase(databaseId, cursor)
    allRows.push(...next.results)
    cursor = next.next_cursor
  }
  return allRows
}

export async function GET(
  request: Request,
  { params }: { params: { databaseId: string } },
) {
  const { databaseId } = params

  try {
    // DB 스키마 (컬럼 정의) — 이벤트 중 안 변함, 5분 캐싱
    const database = await cachedFetch(
      `notion:db-schema:${databaseId}`,
      () => notion.databases.retrieve({ database_id: databaseId }),
      300,
    )

    // DB 로우: Redis에서 즉시 반환, background sync로 갱신
    const key = `notion:db-rows:${databaseId}`
    const raw = await redis.get(key).catch(() => null)
    let rows: unknown[]

    if (raw) {
      const cached = JSON.parse(raw)
      rows = cached.data
      // Background sync trigger (non-blocking)
      triggerSyncIfNeeded(databaseId, () => fetchAllRows(databaseId))
    } else {
      // Cache miss (첫 로드) — Notion에서 fetch
      rows = await fetchAllRows(databaseId)
      await setCache(key, rows, 60)
      await redis
        .set(`notion:last-sync:${databaseId}`, String(Date.now()))
        .catch(() => {})
    }

    return Response.json({ database, rows })
  } catch (error: any) {
    const status = error?.status ?? 500
    const message = error?.message ?? "Failed to fetch Notion database"
    return new Response(message, { status })
  }
}
