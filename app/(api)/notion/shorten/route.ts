export const dynamic = "force-dynamic"

function getAdminApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_DEPLOY_TYPE === "live") {
    return "https://api.staircrusher.club/admin"
  }
  if (process.env.NEXT_PUBLIC_DEPLOY_TYPE === "local") {
    return "http://localhost:8082/admin"
  }
  return "https://api.dev.staircrusher.club/admin"
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    if (!url || typeof url !== "string") {
      return new Response("Missing 'url' in request body", { status: 400 })
    }

    const baseUrl = getAdminApiBaseUrl()
    const res = await fetch(`${baseUrl}/shortenUrl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      return new Response(text || "Shortening failed", { status: res.status })
    }

    const data = await res.json()
    return Response.json({ shortUrl: data.shortUrl })
  } catch {
    return new Response("Failed to shorten URL", { status: 500 })
  }
}
