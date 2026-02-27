import notion from "@/lib/notion"
import { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: { blockId: string } },
) {
  const { blockId } = params

  try {
    // pages.retrieve only works for page IDs, not arbitrary block IDs.
    // For toggle blocks etc., page will be null.
    const [page, firstBatch] = await Promise.all([
      notion.pages.retrieve({ page_id: blockId }).catch(() => null),
      notion.blocks.children.list({ block_id: blockId }),
    ])

    const blocks: BlockObjectResponse[] = [
      ...(firstBatch.results as BlockObjectResponse[]),
    ]
    let cursor = firstBatch.next_cursor

    while (cursor) {
      const next = await notion.blocks.children.list({
        block_id: blockId,
        start_cursor: cursor,
      })
      blocks.push(...(next.results as BlockObjectResponse[]))
      cursor = next.next_cursor
    }

    return Response.json({ page, blocks })
  } catch (error: any) {
    const status = error?.status ?? 500
    const message = error?.message ?? "Failed to fetch Notion blocks"
    return new Response(message, { status })
  }
}
