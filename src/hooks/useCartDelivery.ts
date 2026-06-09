'use client';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import api from '@/lib/api';
import { useLocationStore } from '@/stores/locationStore';
import { useCustomerAuthStore } from '@/stores/customerAuthStore';
import type { CustomerSubscription } from '@/types';

/**
 * Phase 5: a single hook the cart drawer + cart page share so the
 * delivery summary they show is bit-for-bit consistent with what the
 * checkout page (and the order create endpoint) will resolve. The
 * backend `/checkout/calculate-delivery` endpoint is the only fee
 * calculator — this hook just shapes what the cart needs out of it.
 *
 *   • `freeDeliveryThreshold` and `minimumOrderAmount` come from the
 *     Branch & Coverage admin (single source of truth, Phase 4).
 *   • `deliveryFee` is whatever the backend quoted for the current
 *     subtotal + location + subscription — never a hardcoded number.
 *   • `subscriptionApplied` reflects the backend's decision; the cart
 *     does not re-derive subscription behaviour client-side.
 *   • `belowMinimum` powers the cart's checkout CTA disable.
 */

interface DeliverySettings {
  freeDeliveryEnabled?: boolean | null;
  freeDeliveryThreshold?: number | string | null;
}

interface MinimumOrder {
  enabled: boolean;
  minimumAmount: number | string;
}

interface BackendQuote {
  deliveryFee: number;
  pricingRuleApplied: string;
  reason: string;
  deliveryAvailable: boolean;
  distanceKm: number | null;
  message?: string;
}

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

export interface CartDeliveryStatus {
  // Free-delivery threshold UI inputs
  freeThresholdEnabled: boolean;
  freeThreshold: number | null;
  freeThresholdMet: boolean;
  amountToFreeDelivery: number;

  // Minimum-order UI inputs
  minimumEnabled: boolean;
  minimumAmount: number;
  belowMinimum: boolean;

  // Backend-resolved delivery fee for the current cart
  deliveryFee: number;
  /**
   * Distance from the configured branch to the customer's current
   * location, multiplied through the admin's road-distance multiplier.
   * Null until the customer has set a location (the backend returns
   * NO_LOCATION) and during loading.
   */
  distanceKm: number | null;
  subscriptionApplied: boolean;
  thresholdApplied: boolean;
  /**
   * True only when the backend says delivery is available AND the fee
   * it returned is zero. This is what the UI should check before
   * labelling the row "Free" — a 0 returned alongside
   * `deliveryAvailable: false` (e.g. NO_RULES / NO_LOCATION /
   * OUT_OF_RANGE) means "unavailable", not "free".
   */
  genuinelyFree: boolean;
  deliveryAvailable: boolean | null;
  reason: string | null;
  quoteLoaded: boolean;
  /**
   * True while a fresh quote is in flight after a customer-facing input
   * changed (location, subtotal, subscription). The UI shows a subtle
   * spinner / dot so the customer can see the fee is being recalculated
   * for their new location.
   */
  recalculating: boolean;
}

export function useCartDelivery(opts: { subtotal: number; enabled: boolean }): CartDeliveryStatus {
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const locLat = useLocationStore((s) => s.latitude);
  const locLng = useLocationStore((s) => s.longitude);

  const { data: settings } = useSWR<DeliverySettings | null>(
    opts.enabled ? '/delivery/settings' : null,
    fetcher,
  );
  const { data: minimum } = useSWR<MinimumOrder | null>(
    opts.enabled ? '/delivery/minimum-order' : null,
    fetcher,
  );
  const { data: subscription } = useSWR<CustomerSubscription | null>(
    opts.enabled && isAuthenticated ? '/subscriptions/my' : null,
    fetcher,
  );

  const [quote, setQuote] = useState<BackendQuote | null>(null);
  const [recalculating, setRecalculating] = useState(false);
  useEffect(() => {
    if (!opts.enabled) {
      setQuote(null);
      setRecalculating(false);
      return;
    }
    // The effect's dependency list includes locLat + locLng, so changing
    // the customer's saved location automatically fires a fresh quote
    // request. We keep the previously-displayed fee visible while the
    // new one is in flight (less flicker) and surface `recalculating`
    // so the UI can show a small spinner.
    let active = true;
    setRecalculating(true);
    api
      .post<{ data: BackendQuote }>('/checkout/calculate-delivery', {
        customerLatitude: locLat ?? null,
        customerLongitude: locLng ?? null,
        customerSubscriptionStatus: subscription?.status ?? 'NONE',
        // The cart always quotes the DELIVERY semantics. PICKUP=0 is
        // resolved at checkout once the customer picks a fulfillment.
        selectedFulfillmentType: 'DELIVERY',
        cartSubtotal: opts.subtotal,
      })
      .then((res) => {
        if (active) {
          setQuote(res.data.data);
          setRecalculating(false);
        }
      })
      .catch(() => {
        if (active) {
          setQuote(null);
          setRecalculating(false);
        }
      });
    return () => {
      active = false;
    };
  }, [opts.enabled, opts.subtotal, locLat, locLng, subscription?.status]);

  // Free-delivery threshold (admin-managed, Branch & Coverage)
  const freeThresholdEnabled = Boolean(settings?.freeDeliveryEnabled);
  const freeThresholdRaw =
    settings?.freeDeliveryThreshold != null ? Number(settings.freeDeliveryThreshold) : null;
  const freeThreshold =
    freeThresholdEnabled && freeThresholdRaw != null && freeThresholdRaw > 0
      ? freeThresholdRaw
      : null;
  const freeThresholdMet = Boolean(freeThreshold != null && opts.subtotal >= freeThreshold);
  const amountToFreeDelivery = freeThreshold != null ? Math.max(0, freeThreshold - opts.subtotal) : 0;

  // Minimum order (admin-managed, Branch & Coverage)
  const minimumEnabled = Boolean(minimum?.enabled);
  const minimumAmount =
    minimum?.minimumAmount != null ? Number(minimum.minimumAmount) : 0;
  const belowMinimum =
    minimumEnabled && minimumAmount > 0 && opts.subtotal < minimumAmount;

  const deliveryFee = quote?.deliveryFee ?? 0;
  const subscriptionApplied = quote?.pricingRuleApplied === 'SUBSCRIPTION';
  const thresholdApplied = quote?.pricingRuleApplied === 'THRESHOLD';
  const deliveryAvailable = quote ? quote.deliveryAvailable : null;
  // Genuine "free" requires the backend to confirm delivery is available
  // AND fee is zero. A zero with `deliveryAvailable: false` means the
  // backend bailed out (no rules, no coords, out of range) — that's not
  // free delivery, that's unpriced delivery.
  const genuinelyFree = deliveryAvailable === true && deliveryFee === 0;

  return {
    freeThresholdEnabled,
    freeThreshold,
    freeThresholdMet,
    amountToFreeDelivery,
    minimumEnabled,
    minimumAmount,
    belowMinimum,
    deliveryFee,
    distanceKm: quote?.distanceKm ?? null,
    subscriptionApplied,
    thresholdApplied,
    genuinelyFree,
    deliveryAvailable,
    reason: quote?.reason ?? null,
    quoteLoaded: quote != null,
    recalculating,
  };
}
