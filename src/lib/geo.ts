export type Coords = { lat: number; lng: number };

/**
 * Great-circle distance in kilometres between two coordinates.
 * Uses the haversine formula. Accurate enough for sorting purposes.
 */
export function haversineKm(a: Coords, b: Coords): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Returns a new array of items sorted by distance from `origin` ascending.
 * Items without coordinates are pushed to the end in stable order.
 */
export function sortByDistance<T extends { lat: number | null; lng: number | null }>(
  items: T[],
  origin: Coords,
): T[] {
  const withDist = items.map((item, index) => ({
    item,
    index,
    distance:
      item.lat != null && item.lng != null
        ? haversineKm(origin, { lat: item.lat, lng: item.lng })
        : Infinity,
  }));
  withDist.sort((a, b) => {
    if (a.distance !== b.distance) return a.distance - b.distance;
    return a.index - b.index;
  });
  return withDist.map((x) => x.item);
}
