export type Role = 'CUSTOMER' | 'SUPER_ADMIN' | 'PICKER' | 'DRIVER';
export type VariantType = 'PIECE' | 'CARTON' | 'DOZEN' | 'BUNDLE';
export type OrderStatus =
  | 'NEW' | 'PAYMENT_VERIFIED' | 'ASSIGNED_TO_PICKER' | 'PICKING_IN_PROGRESS'
  | 'READY_FOR_DELIVERY' | 'READY_FOR_PICKUP'
  | 'ASSIGNED_TO_DRIVER' | 'OUT_FOR_DELIVERY'
  | 'DELIVERED' | 'PICKED_UP_BY_CUSTOMER' | 'COMPLETED'
  | 'CONFIRMED' | 'CANCELLED' | 'REJECTED';
export type FulfillmentType = 'DELIVERY' | 'PICKUP';
export type PaymentMethod = 'CASH_ON_DELIVERY' | 'BANK_TRANSFER' | 'PAY_AT_BRANCH';
export type PaymentStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type NotificationType =
  | 'ORDER_STATUS_CHANGED' | 'ORDER_ASSIGNED'
  | 'SUBSCRIPTION_ACTIVATED' | 'SUBSCRIPTION_EXPIRING' | 'PROMOTION_ACTIVATED';

export interface User {
  id: string;
  mobile: string | null;
  email: string | null;
  username: string | null;
  name: string | null;
  nameAr: string | null;
  role: Role;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  nameAr: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  type: VariantType;
  sku: string;
  barcode: string | null;
  price: number;
  stock: number;
  reserved: number;
  isActive: boolean;
  available?: boolean;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  description: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
  hideFromHome?: boolean;
  category: { id: string; name: string; nameAr: string };
  subcategory: { id: string; name: string; nameAr: string } | null;
  variants: ProductVariant[];
  available?: boolean;
}

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  productImage: string | null;
  variantType: VariantType;
  price: number;
  quantity: number;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  isFreeItem: boolean;
  status?: OrderItemStatus;
  replacedByItemId?: string | null;
  notes?: string | null;
  variant: {
    id: string;
    type: VariantType;
    sku: string;
    price: number;
    product: { id: string; name: string; nameAr: string; imageUrl: string | null };
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  fulfillmentType: FulfillmentType;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subscriptionApplied?: boolean;
  paymentProofUrl: string | null;
  subtotal: number;
  discountTotal: number;
  deliveryFee: number;
  total: number;
  notes: string | null;
  replacementPreference: string | null;
  deliveryLat: number | null;
  deliveryLng: number | null;
  distanceKm: number | null;
  pickupType?: 'ASAP' | 'SCHEDULED' | null;
  scheduledPickupDate?: string | null;
  scheduledPickupStartTime?: string | null;
  scheduledPickupEndTime?: string | null;
  scheduledPickupSlotId?: string | null;
  pickupSlot?: { id: string; label: string; startTime: string; endTime: string } | null;
  carPlateNumber?: string | null;
  carBrand?: string | null;
  carColor?: string | null;
  pickupCustomerNote?: string | null;
  createdAt: string;
  customer?: { id: string; name: string | null; mobile: string };
  driver?: { id: string; name: string | null; mobile?: string } | null;
  picker?: { id: string; name: string | null; mobile?: string } | null;
  address?: CustomerAddress | null;
  items: OrderItem[];
  statusHistory: { id: string; status: OrderStatus; note: string | null; createdAt: string }[];
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  label: string;
  addressLine: string | null;
  city: string | null;
  deliveryNotes?: string | null;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  orderId: string | null;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface ReorderResult {
  items: Array<{
    variantId: string;
    productId: string;
    productName: string;
    productImage: string | null;
    variantType: VariantType;
    price: number;
    quantity: number;
    priceChanged: boolean;
    originalPrice: number;
  }>;
  skipped: Array<{
    productName: string;
    variantType: VariantType;
    quantity: number;
    reason: string;
  }>;
}

export interface BuyAgainEntry {
  product: Product;
  suggestedVariantId: string;
  orderCount: number;
}

export interface SearchResult {
  products: Product[];
  matchedVariantId: string | null;
  pagination?: Pagination;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  durationDays: number;
  benefitType: 'FREE_DELIVERY' | 'DISCOUNTED_DELIVERY' | 'CAPPED_DELIVERY';
  discountValue: number | null;
  cappedFee: number | null;
  maxFreeDeliveries: number | null;
}

export interface CustomerSubscription {
  id: string;
  status: 'PENDING_PAYMENT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  expiryDate: string;
  deliveriesUsed: number;
  plan: SubscriptionPlan;
}

export interface Banner {
  id: string;
  title: string;
  titleAr: string;
  imageUrl: string;
  linkType: string | null;
  linkValue: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface FeaturedSectionItem {
  id: string;
  sectionId: string;
  productId: string;
  sortOrder: number;
  product: Product;
}

export interface FeaturedSection {
  id: string;
  name: string;
  nameAr: string;
  sortOrder: number;
  isActive: boolean;
  items: FeaturedSectionItem[];
}

export type OrderItemStatus = 'PENDING' | 'PICKED' | 'UNAVAILABLE' | 'REPLACED' | 'REMOVED';

export type PromotionType =
  | 'BUY_X_GET_Y'
  | 'VARIANT_DISCOUNT'
  | 'PRODUCT_DISCOUNT'
  | 'CATEGORY_DISCOUNT'
  | 'FREE_DELIVERY_THRESHOLD'
  | 'SUBSCRIPTION_BASED_DISCOUNT';

export type TargetScope =
  | 'ALL'
  | 'PRODUCT'
  | 'VARIANT'
  | 'CATEGORY'
  | 'SUBCATEGORY';

export interface Promotion {
  id: string;
  name: string;
  nameAr: string;
  description: string | null;
  descriptionAr: string | null;
  type: PromotionType;
  isActive: boolean;
  isStackable: boolean;
  priority: number;
  startDate: string;
  endDate: string | null;
  minimumCartValue: number | string | null;
  usageLimit: number | null;
  usageLimitPerCustomer: number | null;
  usageCount: number;
  requiresSubscription: boolean;
  targetScope: TargetScope;
  config: Record<string, unknown>;
  archivedAt: string | null;
  targetProducts?: { id: string; name: string }[];
  targetCategories?: { id: string; name: string }[];
  targetVariants?: { id: string; sku: string }[];
  targetSubcategories?: { id: string; name: string }[];
}

export interface AuditLog {
  id: string;
  actorId: string | null;
  actorRole: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  changes: unknown;
  createdAt: string;
  actor: { id: string; name: string | null; mobile: string; role: Role } | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  // New ninja-style fields exposed alongside the legacy keys above.
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
