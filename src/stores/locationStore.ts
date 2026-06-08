import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocationState {
  label: string;
  addressLine: string | null;
  latitude: number | null;
  longitude: number | null;
  addressId: string | null;
  setLocation: (loc: {
    label?: string;
    addressLine?: string | null;
    latitude: number;
    longitude: number;
    addressId?: string | null;
  }) => void;
  clear: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      label: 'Choose location',
      addressLine: null,
      latitude: null,
      longitude: null,
      addressId: null,
      setLocation: (loc) =>
        set({
          label: loc.label ?? 'Home',
          addressLine: loc.addressLine ?? null,
          latitude: loc.latitude,
          longitude: loc.longitude,
          addressId: loc.addressId ?? null,
        }),
      clear: () =>
        set({
          label: 'Choose location',
          addressLine: null,
          latitude: null,
          longitude: null,
          addressId: null,
        }),
    }),
    { name: 'location-storage' }
  )
);
