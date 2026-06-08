'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Crosshair, Loader2, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_LIBRARIES,
  DEFAULT_MAP_CENTER,
  reverseGeocode,
} from '@/lib/maps';

interface Props {
  lat: number | null;
  lng: number | null;
  onChange: (loc: { lat: number; lng: number; address?: string; city?: string | null }) => void;
  language?: 'ar' | 'en';
  height?: number;
}

export function LocationPickerMap({ lat, lng, onChange, language = 'en', height = 340 }: Props) {
  const t = useTranslations();
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
    language,
    region: 'SA',
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [locating, setLocating] = useState(false);
  const [resolving, setResolving] = useState(false);

  const center = lat != null && lng != null ? { lat, lng } : DEFAULT_MAP_CENTER;

  const resolveAddress = useCallback(async (nextLat: number, nextLng: number) => {
    setResolving(true);
    const res = await reverseGeocode(nextLat, nextLng, language);
    setResolving(false);
    onChange({ lat: nextLat, lng: nextLng, address: res?.formattedAddress, city: res?.city ?? null });
  }, [language, onChange]);

  const handleDragEnd = useCallback(() => {
    if (!mapRef.current) return;
    const c = mapRef.current.getCenter();
    if (!c) return;
    resolveAddress(c.lat(), c.lng());
  }, [resolveAddress]);

  const useCurrentLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const nextLat = pos.coords.latitude;
        const nextLng = pos.coords.longitude;
        mapRef.current?.panTo({ lat: nextLat, lng: nextLng });
        mapRef.current?.setZoom(17);
        resolveAddress(nextLat, nextLng);
      },
      () => { setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [resolveAddress]);

  useEffect(() => {
    if (isLoaded && (lat == null || lng == null)) {
      useCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-6 text-center text-sm text-amber-800"
        style={{ height }}
      >
        <MapPin className="h-6 w-6 mb-2" />
        <p className="font-semibold">Google Maps API key not configured</p>
        <p className="text-xs mt-1">Set <span className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</span> in <span className="font-mono">.env.local</span>.</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700" style={{ height }}>
        Failed to load Google Maps.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center rounded-2xl bg-gray-100 animate-pulse" style={{ height }}>
        <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-soft" style={{ height }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={lat != null && lng != null ? 17 : 13}
        onLoad={(map) => { mapRef.current = map; }}
        onUnmount={() => { mapRef.current = null; }}
        onDragEnd={handleDragEnd}
        onZoomChanged={() => {
          // keep marker center synced — handled by center binding
        }}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          clickableIcons: false,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        }}
      />

      {/* Fixed center pin overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative -translate-y-3">
          <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 rounded-full bg-black/30 blur-sm" />
          <MapPin className="h-10 w-10 text-brand-500 drop-shadow-lg" strokeWidth={2.5} fill="#0fbea0" stroke="#fff" />
        </div>
      </div>

      {/* Current-location FAB */}
      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={locating}
        className="absolute bottom-3 end-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-card hover:bg-brand-50 disabled:opacity-60"
        aria-label={t('checkout.useCurrentLocation')}
      >
        {locating ? <Loader2 className="h-5 w-5 text-brand-600 animate-spin" /> : <Crosshair className="h-5 w-5 text-brand-600" />}
      </button>

      {/* Resolving badge */}
      {resolving && (
        <div className="absolute top-3 start-3 z-10 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-soft backdrop-blur">
          <Loader2 className="h-3 w-3 animate-spin" /> {t('common.loading')}
        </div>
      )}

      {/* Drag hint */}
      <div className="pointer-events-none absolute bottom-3 start-3 z-10 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur">
        {t('checkout.dragMapToAdjust')}
      </div>
    </div>
  );
}
