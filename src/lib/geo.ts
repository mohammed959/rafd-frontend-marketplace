/**
 * Lightweight client-side geometry helpers for the delivery-area editor.
 * Mirrors the backend ray-casting test in backend/src/lib/geo.ts — the
 * backend remains the source of truth; this only gives the admin instant
 * feedback while drawing.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export type Polygon = LatLng[];

export function isValidPolygon(poly: LatLng[] | null | undefined): poly is Polygon {
  return Array.isArray(poly) && poly.length >= 3;
}

/** Ray-casting point-in-polygon test. */
export function pointInPolygon(point: LatLng, polygon: Polygon): boolean {
  const x = point.lng;
  const y = point.lat;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function pointInAnyPolygon(point: LatLng, polygons: Polygon[]): boolean {
  return polygons.some((poly) => pointInPolygon(point, poly));
}

/** Every vertex of `inner` must sit inside `outer`. */
export function isPolygonInsidePolygon(inner: Polygon, outer: Polygon): boolean {
  return inner.every((vertex) => pointInPolygon(vertex, outer));
}
