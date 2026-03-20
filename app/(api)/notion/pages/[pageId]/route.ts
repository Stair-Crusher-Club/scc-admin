import { invalidateCache, rateLimitedWrite } from "@/lib/notion-cache"
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

    // Rate-limited write: 동시 최대 2개, 500ms 간격
    const updatedPage = await rateLimitedWrite(() =>
      notion.pages.update({ page_id: pageId, properties }),
    )

    // 해당 DB 로우 캐시 무효화 (스키마는 유지)
    if (databaseId) {
      await invalidateCache(`notion:db-rows:${databaseId}`)
    }

    return Response.json(updatedPage)
  } catch (error: any) {
    const status = error?.status ?? 500
    const message = error?.message ?? "Failed to update Notion page"
    return new Response(message, { status })
  }
}
