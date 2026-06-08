'use client';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { ExternalLink, Loader2, MapPin, Navigation2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_LIBRARIES,
  buildDirectionsUrl,
  buildViewUrl,
} from '@/lib/maps';

interface Props {
  lat: number;
  lng: number;
  height?: number;
  showDirections?: boolean;
  showView?: boolean;
  language?: 'ar' | 'en';
  zoom?: number;
}

export function LocationPreviewMap({
  lat, lng,
  height = 220,
  showDirections = false,
  showView = true,
  language = 'en',
  zoom = 16,
}: Props) {
  const t = useTranslations();
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
    language,
    region: 'SA',
  });

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4 text-center text-xs text-amber-800"
        style={{ height }}
      >
        <MapPin className="h-5 w-5 mb-1" />
        Maps key not configured
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" style={{ height }}>
        Failed to load map
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
    <div className="relative overflow-hidden rounded-2xl border border-gray-100" style={{ height }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={{ lat, lng }}
        zoom={zoom}
        options={{
          disableDefaultUI: true,
          zoomControl: false,
          gestureHandling: 'cooperative',
          clickableIcons: false,
        }}
      >
        <Marker
          position={{ lat, lng }}
          icon={{
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z',
            fillColor: '#0fbea0',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 1.8,
            anchor: new google.maps.Point(12, 22),
          }}
        />
      </GoogleMap>

      {/* Action bar */}
      <div className="absolute bottom-2 inset-x-2 z-10 flex gap-2">
        {showView && (
          <a
            href={buildViewUrl(lat, lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-gray-800 shadow-soft hover:bg-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t('orders.viewOnMap')}
          </a>
        )}
        {showDirections && (
          <a
            href={buildDirectionsUrl(lat, lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-3 py-2 text-xs font-semibold text-white shadow-pop hover:bg-brand-600"
          >
            <Navigation2 className="h-3.5 w-3.5" />
            {t('driver.navigate')}
          </a>
        )}
      </div>
    </div>
  );
}
