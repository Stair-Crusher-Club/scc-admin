import { cachedFetch } from "@/lib/notion-cache"
import notion from "@/lib/notion"
import { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

export async function GET(
  request: Request,
  { params }: { params: { blockId: string } },
) {
  const { blockId } = params

  try {
    // 페이지 메타데이터 (제목 등) — 이벤트 중 안 변함, 5분 캐싱
    const page = await cachedFetch(
      `notion:page-meta:${blockId}`,
      () => notion.pages.retrieve({ page_id: blockId }).catch(() => null),
      300,
    )

    // 블록 목록 — 20초 캐싱
    const blocks = await cachedFetch(
      `notion:blocks:${blockId}`,
      async () => {
        const firstBatch = await notion.blocks.children.list({
          block_id: blockId,
        })
        const allBlocks: BlockObjectResponse[] = [
          ...(firstBatch.results as BlockObjectResponse[]),
        ]
        let cursor = firstBatch.next_cursor

        while (cursor) {
          const next = await notion.blocks.children.list({
            block_id: blockId,
            start_cursor: cursor,
          })
          allBlocks.push(...(next.results as BlockObjectResponse[]))
          cursor = next.next_cursor
        }
        return allBlocks
      },
    )

    return Response.json({ page, blocks })
  } catch (error: any) {
    const status = error?.status ?? 500
    const message = error?.message ?? "Failed to fetch Notion blocks"
    return new Response(message, { status })
  }
}
