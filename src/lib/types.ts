export type DeptId = "supermarket" | "bakery" | "furniture" | "bookstore";

export type Unit = "kg" | "piece" | "loaf" | "set";

export type Tag =
  | "fresh"
  | "chilled"
  | "frozen"
  | "vegan"
  | "gluten-free"
  | "school"
  | "bestseller";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export type Channel = "web" | "pos";

export type Fulfillment = "pickup" | "delivery" | "furniture_delivery";

export type PaymentStatus = "unpaid" | "paid" | "paid_demo";

export type Tier = "Seed" | "Sprout" | "Harvest";

export type Role = "owner" | "manager" | "cashier" | "bakery" | "warehouse";

export type PromoType = "percent" | "fixed" | "bundle";

export type PoStatus = "draft" | "sent" | "received";

export type JobSource = "preorder" | "forecast";

export type DeliveryType = "grocery" | "furniture";

export type DeliveryStatus = "scheduled" | "delivered";

export type StockReason = "received" | "sold" | "waste" | "count" | "cancel";

export type GroceryMethod = "pickup" | "delivery";

export interface Department {
  id: DeptId;
  name: string;
  slug: string;
  description: string;
  fulfillment: Array<"pickup" | "delivery" | "furniture_delivery">;
}

export interface Category {
  id: string;
  departmentId: DeptId;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  departmentId: DeptId;
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  imageLabel: string;
  sku: string;
  barcode: string;
  costPrice: number;
  price: number;
  compareAtPrice?: number;
  unit: Unit;
  taxRate: number;
  stockOnHand: number;
  reorderLevel: number;
  trackExpiry: boolean;
  shelfLifeDays?: number;
  isMadeToOrder: boolean;
  leadTimeHours: number;
  weightKg: number;
  tags: Tag[];
  supplierId?: string;
  active: boolean;
  featured: boolean;
  assemblyRequired?: boolean;
}

export interface Address {
  id: string;
  label: string;
  line: string;
  area: string;
  zoneId: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  addresses: Address[];
  loyaltyPoints: number;
  tier: Tier;
  referralCode: string;
  joinedAt: string;
  wishlist: string[];
}

export interface OrderLine {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  departmentId: DeptId;
  specialInstructions?: string;
  cakeDate?: string;
  assembly?: boolean;
}

export interface DeptBreakdown {
  departmentId: DeptId;
  subtotal: number;
  qty: number;
}

export interface Order {
  id: string;
  number: string;
  customerId: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  channel: Channel;
  status: OrderStatus;
  fulfillment: Fulfillment;
  groceryMethod: GroceryMethod | null;
  slot: string | null;
  furnitureSlot: string | null;
  address: string | null;
  zoneId: string | null;
  breakdown: DeptBreakdown[];
  lines: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  promoDiscount: number;
  loyaltyDiscount: number;
  total: number;
  paymentStatus: PaymentStatus;
  notes: string;
  promoCode: string | null;
  pointsRedeemed: number;
  stockDeducted: boolean;
  pointsAwarded: boolean;
  assemblyRequired: boolean;
  createdAt: string;
}

export interface Promotion {
  id: string;
  code: string;
  type: PromoType;
  value: number;
  minSpend: number;
  departmentIds: DeptId[];
  startsAt: string;
  endsAt: string;
  active: boolean;
  label: string;
}

export interface LoyaltyLedger {
  id: string;
  customerId: string;
  points: number;
  reason: string;
  orderId?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  departmentIds: DeptId[];
  phone: string;
  leadDays: number;
}

export interface PoLine {
  productId: string;
  name: string;
  qty: number;
  cost: number;
}

export interface PurchaseOrder {
  id: string;
  number: string;
  supplierId: string;
  status: PoStatus;
  lines: PoLine[];
  expectedDate: string;
  createdAt: string;
}

export interface BakeryJob {
  id: string;
  date: string;
  productId: string;
  qtyPlanned: number;
  qtyBaked: number;
  qtyWaste: number;
  source: JobSource;
}

export interface DeliveryJob {
  id: string;
  orderId: string;
  type: DeliveryType;
  window: string;
  address: string;
  status: DeliveryStatus;
  assemblyRequired: boolean;
}

export interface SchoolListItem {
  productId: string;
  qty: number;
}

export interface SchoolList {
  id: string;
  name: string;
  items: SchoolListItem[];
}

export interface DeliveryZone {
  id: string;
  name: string;
  minKm: number;
  maxKm: number;
  fee: number;
  minimum: number;
}

export interface Settings {
  storeName: string;
  address: string;
  phone: string;
  hours: string;
  zones: DeliveryZone[];
  earnNairaPerPoint: number;
  nairaPer100Points: number;
  minRedeemPoints: number;
  bannerText: string;
  furnitureDeliveryFee: number;
}

export interface CartLine {
  key: string;
  productId: string;
  qty: number;
  specialInstructions?: string;
  cakeDate?: string;
  assembly?: boolean;
  furnitureSlotId?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  delta: number;
  reason: StockReason;
  note: string;
  createdAt: string;
}

export interface StaffSession {
  email: string;
  name: string;
  role: Role;
}

export type Result<T> = { ok: true; data: T } | { ok: false; message: string };
