import data from "./sgg.json"

export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id") ?? ""

  const geoData = data as { [key: string]: any }
  return Response.json(geoData[id])
}
