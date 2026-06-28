export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export const DEFAULT_MAP_CENTER = {
  lat: Number(process.env.NEXT_PUBLIC_DEFAULT_MAP_CENTER_LAT ?? 24.7136),
  lng: Number(process.env.NEXT_PUBLIC_DEFAULT_MAP_CENTER_LNG ?? 46.6753),
};

// Note: we intentionally do NOT load the `drawing` library. Google removed
// the DrawingManager class in Maps JS API v3.65, so the admin delivery-area
// tool draws polygons via manual map clicks instead (see PolygonDrawerMap).
export const GOOGLE_MAPS_LIBRARIES: ('places' | 'geocoding')[] = ['places'];

export function buildDirectionsUrl(lat: number | string, lng: number | string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
}

export function buildViewUrl(lat: number | string, lng: number | string, zoom = 17) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&zoom=${zoom}`;
}

export function staticMapPreviewUrl(lat: number | string, lng: number | string, opts?: { zoom?: number; size?: string }) {
  const zoom = opts?.zoom ?? 16;
  const size = opts?.size ?? '640x320';
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&scale=2&markers=color:0x0fbea0%7C${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
}

export type ReverseGeocodeResult = {
  formattedAddress: string;
  city: string | null;
  country: string | null;
};

export async function reverseGeocode(lat: number, lng: number, language: 'ar' | 'en' = 'en'): Promise<ReverseGeocodeResult | null> {
  if (typeof window === 'undefined' || !window.google?.maps?.Geocoder) return null;
  const geocoder = new window.google.maps.Geocoder();
  try {
    const res = await geocoder.geocode({ location: { lat, lng }, language });
    const first = res.results[0];
    if (!first) return null;
    const components = first.address_components ?? [];
    const cityComp = components.find((c) => c.types.includes('locality')) ?? components.find((c) => c.types.includes('administrative_area_level_2'));
    const countryComp = components.find((c) => c.types.includes('country'));
    return {
      formattedAddress: first.formatted_address,
      city: cityComp?.long_name ?? null,
      country: countryComp?.long_name ?? null,
    };
  } catch {
    return null;
  }
}
