import notion from "@/lib/notion"

export async function PATCH(
  request: Request,
  { params }: { params: { pageId: string } },
) {
  const { pageId } = params

  try {
    const body = await request.json()
    const { properties } = body

    if (!properties) {
      return new Response("Missing 'properties' in request body", {
        status: 400,
      })
    }

    const updatedPage = await notion.pages.update({
      page_id: pageId,
      properties,
    })

    return Response.json(updatedPage)
  } catch (error: any) {
    const status = error?.status ?? 500
    const message = error?.message ?? "Failed to update Notion page"
    return new Response(message, { status })
  }
}
