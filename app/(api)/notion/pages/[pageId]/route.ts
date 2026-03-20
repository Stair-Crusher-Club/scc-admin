import { markDirty, updateCachedRows } from "@/lib/notion-cache"
import notion from "@/lib/notion"

export async function PATCH(
  request: Request,
  { params }: { params: { pageId: string } },
) {
  const { pageId } = params

  try {
    const body = await request.json()
    const { properties, databaseId } = body

    if (!properties) {
      return new Response("Missing 'properties' in request body", {
        status: 400,
      })
    }

    // 1. Notion API 즉시 호출 (rate limiter 없음)
    const updatedPage = await notion.pages.update({
      page_id: pageId,
      properties,
    })

    // 2. Dirty flag 마킹 (sync가 이 값을 덮어쓰지 못하게 보호)
    if (databaseId) {
      await markDirty(databaseId, pageId, properties)
    }

    // 3. 캐시 직접 수정 (무효화 아님!)
    if (databaseId) {
      await updateCachedRows(databaseId, pageId, properties)
    }

    return Response.json(updatedPage)
  } catch (error: any) {
    const status = error?.status ?? 500
    const message = error?.message ?? "Failed to update Notion page"
    return new Response(message, { status })
  }
}
