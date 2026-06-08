import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, VariantType } from '@/types';
import api from '@/lib/api';

interface DeliveryFeeResult {
  fee: number;
  distanceKm: number | null;
  reason: string;
}

interface CartState {
  items: CartItem[];
  deliveryFee: number;
  deliveryReason: string;
  isOpen: boolean;

  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  setItemsFromReorder: (items: CartItem[]) => void;
  mergeOnLogin: () => Promise<void>;

  subtotal: () => number;
  itemCount: () => number;
  total: () => number;

  fetchDeliveryFee: (lat?: number, lng?: number) => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryFee: 10,
      deliveryReason: 'FLAT',
      isOpen: false,

      addItem: (newItem) => {
        const items = get().items;
        const existing = items.find((i) => i.variantId === newItem.variantId);
        // Coerce price to number — Prisma Decimal serialises as string in JSON
        const price = Number(newItem.price);
        if (existing) {
          set({
            items: items.map((i) =>
              i.variantId === newItem.variantId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...items, { ...newItem, price, quantity: 1 }] });
        }
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      // Replace the cart wholesale (used by reorder flow)
      setItemsFromReorder: (items) => set({ items }),

      // Hook invoked after login. Today the cart is purely client-side, so we
      // just retain the existing guest cart. Hook reserved for future server
      // cart sync / stock re-validation.
      mergeOnLogin: async () => {
        return;
      },

      subtotal: () =>
        get().items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0),

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      total: () => get().subtotal() + Number(get().deliveryFee),

      fetchDeliveryFee: async (lat, lng) => {
        try {
          const res = await api.post<{ data: DeliveryFeeResult }>('/delivery/calculate-fee', {
            cartSubtotal: get().subtotal(),
            customerLat: lat,
            customerLng: lng,
          });
          set({
            deliveryFee: res.data.data.fee,
            deliveryReason: res.data.data.reason,
          });
        } catch {
          // keep current fee
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
