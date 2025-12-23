import { BoundaryPoint } from "@/components/NaverMapBoundaryEditor/types"

/**
 * Calculate the centroid (geometric center) of a polygon
 * Uses the formula for centroid of a polygon with vertices based on signed area
 *
 * @param points - Array of boundary points forming the polygon
 * @returns The centroid point {lat, lng}
 * @throws Error if points array is empty
 */
export function calculatePolygonCentroid(points: BoundaryPoint[]): BoundaryPoint {
  if (points.length === 0) {
    throw new Error("Cannot calculate centroid of empty polygon")
  }

  if (points.length === 1) {
    return points[0]
  }

  if (points.length === 2) {
    return {
      lat: (points[0].lat + points[1].lat) / 2,
      lng: (points[0].lng + points[1].lng) / 2,
    }
  }

  // Calculate signed area and centroid using the shoelace formula
  let area = 0
  let centerLat = 0
  let centerLng = 0

  for (let i = 0; i < points.length; i++) {
    const current = points[i]
    const next = points[(i + 1) % points.length]

    const crossProduct = current.lng * next.lat - next.lng * current.lat
    area += crossProduct
    centerLat += (current.lat + next.lat) * crossProduct
    centerLng += (current.lng + next.lng) * crossProduct
  }

  area = area / 2

  // Prevent division by zero for degenerate polygons
  if (Math.abs(area) < 1e-10) {
    return calculateAverageCenter(points)
  }

  const factor = 1 / (6 * area)

  return {
    lat: centerLat * factor,
    lng: centerLng * factor,
  }
}

/**
 * Calculate simple average center (faster but less accurate than centroid)
 * Useful as a fallback for degenerate cases
 *
 * @param points - Array of boundary points
 * @returns The average center point {lat, lng}
 */
export function calculateAverageCenter(points: BoundaryPoint[]): BoundaryPoint {
  if (points.length === 0) {
    throw new Error("Cannot calculate center of empty points array")
  }

  const sum = points.reduce(
    (acc, point) => ({
      lat: acc.lat + point.lat,
      lng: acc.lng + point.lng,
    }),
    { lat: 0, lng: 0 }
  )

  return {
    lat: sum.lat / points.length,
    lng: sum.lng / points.length,
  }
}
