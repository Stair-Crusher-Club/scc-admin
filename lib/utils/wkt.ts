import { BoundaryPoint } from "@/components/NaverMapBoundaryEditor/types"

/**
 * Convert array of points to WKT POLYGON format
 * Example output: "POLYGON((127.001 37.001, 127.002 37.001, 127.002 37.002, 127.001 37.001))"
 *
 * @param points - Array of boundary points
 * @returns WKT POLYGON string
 * @throws Error if points array has less than 3 points
 */
export function pointsToWkt(points: BoundaryPoint[]): string {
  if (points.length < 3) {
    throw new Error("Polygon must have at least 3 points")
  }

  // WKT format requires first point to equal last point (closed polygon)
  const coordinates = [...points, points[0]]
    .map((p) => `${p.lng} ${p.lat}`)
    .join(", ")

  return `POLYGON((${coordinates}))`
}

/**
 * Parse WKT POLYGON string to array of points
 * Example input: "POLYGON((127.001 37.001, 127.002 37.001, 127.002 37.002, 127.001 37.001))"
 *
 * @param wkt - WKT POLYGON string
 * @returns Array of boundary points (excluding the closing duplicate point)
 * @throws Error if WKT format is invalid
 */
export function wktToPoints(wkt: string): BoundaryPoint[] {
  const match = wkt.match(/POLYGON\(\((.*?)\)\)/)
  if (!match) {
    throw new Error("Invalid WKT format. Expected: POLYGON((lng lat, lng lat, ...))")
  }

  const coordString = match[1]
  const points = coordString.split(",").map((coord) => {
    const [lng, lat] = coord.trim().split(" ").map(Number)

    if (isNaN(lng) || isNaN(lat)) {
      throw new Error("Invalid coordinates in WKT string")
    }

    return { lng, lat }
  })

  if (points.length < 4) {
    throw new Error("WKT polygon must have at least 3 points (plus closing point)")
  }

  // Remove the last point (duplicate of first for closure)
  return points.slice(0, -1)
}

/**
 * Validate WKT polygon string
 *
 * @param wkt - WKT POLYGON string to validate
 * @returns true if WKT is valid, false otherwise
 */
export function isValidWkt(wkt: string): boolean {
  try {
    const points = wktToPoints(wkt)
    return points.length >= 3
  } catch {
    return false
  }
}
