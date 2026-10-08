import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEMO_STAFF, DEPT_ORDER } from "./catalog";
import {
  addDays,
  atLagos,
  furnitureSlots,
  grocerySlots,
  lagosDateString,
  sameLagosDay,
  tierFor,
  uid,
} from "./format";
import { breakdownOf, buildQuote, resolveLines, stockError } from "./pricing";
import { createSeed, type SeedData } from "./seed";
import type {
  BakeryJob,
  CartLine,
  Customer,
  DeliveryJob,
  DeptId,
  GroceryMethod,
  Order,
  OrderLine,
  OrderStatus,
  Product,
  Promotion,
  PromoType,
  PurchaseOrder,
  Result,
  Settings,
  StaffSession,
  StockReason,
  Tag,
  Unit,
} from "./types";

const memory = new Map<string, string>();
const safeStorage = {
  getItem: (key: string) =>
    typeof window === "undefined" ? (memory.get(key) ?? null) : localStorage.getItem(key),
  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") memory.set(key, value);
    else localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") memory.delete(key);
    else localStorage.removeItem(key);
  },
};

export interface PlaceOrderInput {
  name: string;
  phone: string;
  email: string;
  customerId: string | null;
  groceryMethod: GroceryMethod;
  zoneId: string;
  address: string;
  slotId: string;
  furnitureSlotId: string;
  notes: string;
  redeemPoints: number;
}

export interface PosInput {
  lines: { productId: string; qty: number }[];
  customerId: string | null;
}

interface ShopState extends SeedData {
  cart: CartLine[];
  promoCode: string | null;
  activeCustomerId: string | null;
  guestWishlist: string[];
  staff: StaffSession | null;
  hydrated: boolean;
  addToCart: (input: {
    productId: string;
    qty: number;
    specialInstructions?: string;
    cakeDate?: string;
    assembly?: boolean;
    furnitureSlotId?: string;
  }) => Result<{ name: string }>;
  setQty: (key: string, qty: number) => Result<{ name: string }>;
  removeLine: (key: string) => void;
  clearCart: () => void;
  setPromoCode: (code: string | null) => void;
  placeOrder: (input: PlaceOrderInput) => Result<{ number: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Result<{ number: string }>;
  posCheckout: (input: PosInput) => Result<{ number: string }>;
  adjustStock: (productId: string, delta: number, reason: StockReason, note: string) => Result<null>;
  saveProduct: (product: Product, isNew: boolean) => Result<null>;
  deleteProduct: (productId: string) => Result<null>;
  saveBakery: (jobId: string, patch: Partial<Pick<BakeryJob, "qtyPlanned" | "qtyBaked" | "qtyWaste">>) => void;
  createBakeryJobs: (date: string) => Result<{ count: number }>;
  markDelivery: (jobId: string, status: DeliveryJob["status"]) => Result<null>;
  createSchoolOrder: (listId: string, customerId: string) => Result<{ number: string; skipped: string[] }>;
  adjustPoints: (customerId: string, delta: number, reason: string) => Result<null>;
  savePromo: (promo: Promotion, isNew: boolean) => Result<null>;
  draftLowStockPos: () => Result<{ count: number }>;
  setPoStatus: (id: string, status: PurchaseOrder["status"]) => Result<null>;
  updateSettings: (settings: Settings) => void;
  toggleWishlist: (productId: string) => void;
  setActiveCustomer: (id: string | null) => void;
  saveAddress: (customerId: string, line: string, area: string, zoneId: string) => void;
  reorder: (orderId: string) => Result<{ added: number; skipped: string[] }>;
  login: (email: string, password: string) => Result<null>;
  logout: () => void;
  resetDemo: () => void;
}

function cartKey(input: {
  productId: string;
  cakeDate?: string;
  specialInstructions?: string;
  assembly?: boolean;
}) {
  return [input.productId, input.cakeDate ?? "", input.specialInstructions ?? "", input.assembly ? "1" : "0"].join("|");
}

function applyStock(products: Product[], lines: OrderLine[], direction: 1 | -1) {
  return products.map((product) => {
    const qty = lines
      .filter((line) => line.productId === product.id)
      .reduce((sum, line) => sum + line.qty, 0);
    if (!qty || product.isMadeToOrder) return product;
    return { ...product, stockOnHand: Math.max(0, product.stockOnHand + direction * qty) };
  });
}

function shortStock(products: Product[], lines: OrderLine[]) {
  const shortages: string[] = [];
  for (const line of lines) {
    const product = products.find((entry) => entry.id === line.productId);
    if (!product || product.isMadeToOrder) continue;
    if (product.stockOnHand < line.qty) shortages.push(product.name);
  }
  return shortages;
}

function awardPoints(state: ShopState, order: Order, when: string) {
  if (!order.customerId || order.pointsAwarded || order.total <= 0) {
    return { customers: state.customers, ledger: state.ledger, pointsAwarded: order.pointsAwarded };
  }
  const points = Math.floor(order.total / state.settings.earnNairaPerPoint);
  if (points <= 0) return { customers: state.customers, ledger: state.ledger, pointsAwarded: true };
  const customers = state.customers.map((customer) => {
    if (customer.id !== order.customerId) return customer;
    const loyaltyPoints = customer.loyaltyPoints + points;
    return { ...customer, loyaltyPoints, tier: tierFor(loyaltyPoints) };
  });
  const ledger = [
    {
      id: uid("led"),
      customerId: order.customerId,
      points,
      reason: `Points from ${order.number}`,
      orderId: order.id,
      createdAt: when,
    },
    ...state.ledger,
  ];
  return { customers, ledger, pointsAwarded: true };
}

function reversePoints(state: ShopState, order: Order, when: string) {
  let customers = state.customers;
  let ledger = state.ledger;
  if (order.customerId && order.pointsAwarded) {
    const earned = Math.floor(order.total / state.settings.earnNairaPerPoint);
    if (earned > 0) {
      customers = customers.map((customer) => {
        if (customer.id !== order.customerId) return customer;
        const loyaltyPoints = Math.max(0, customer.loyaltyPoints - earned);
        return { ...customer, loyaltyPoints, tier: tierFor(loyaltyPoints) };
      });
      ledger = [
        {
          id: uid("led"),
          customerId: order.customerId,
          points: -earned,
          reason: `Reversed points from cancelled ${order.number}`,
          orderId: order.id,
          createdAt: when,
        },
        ...ledger,
      ];
    }
  }
  if (order.customerId && order.pointsRedeemed > 0) {
    customers = customers.map((customer) => {
      if (customer.id !== order.customerId) return customer;
      const loyaltyPoints = customer.loyaltyPoints + order.pointsRedeemed;
      return { ...customer, loyaltyPoints, tier: tierFor(loyaltyPoints) };
    });
    ledger = [
      {
        id: uid("led"),
        customerId: order.customerId,
        points: order.pointsRedeemed,
        reason: `Returned redeemed points from cancelled ${order.number}`,
        orderId: order.id,
        createdAt: when,
      },
      ...ledger,
    ];
  }
  return { customers, ledger };
}

function jobsForOrder(order: Order): DeliveryJob[] {
  const jobs: DeliveryJob[] = [];
  const counter = order.lines.some((line) => line.departmentId !== "furniture");
  const furniture = order.lines.some((line) => line.departmentId === "furniture");
  if (counter && order.groceryMethod === "delivery" && order.address && order.slot) {
    jobs.push({
      id: uid("dj"),
      orderId: order.id,
      type: "grocery",
      window: order.slot,
      address: order.address,
      status: "scheduled",
      assemblyRequired: false,
    });
  }
  if (furniture && order.address && order.furnitureSlot) {
    jobs.push({
      id: uid("dj"),
      orderId: order.id,
      type: "furniture",
      window: order.furnitureSlot,
      address: order.address,
      status: "scheduled",
      assemblyRequired: order.assemblyRequired,
    });
  }
  return jobs;
}

export const useDallema = create<ShopState>()(
  persist(
    (set, get) => ({
      ...createSeed(),
      cart: [],
      promoCode: null,
      activeCustomerId: "cus_amaka",
      guestWishlist: [],
      staff: null,
      hydrated: false,
      addToCart: (input) => {
        const product = get().products.find((entry) => entry.id === input.productId);
        if (!product) return { ok: false, message: "That item is no longer on the shelf." };
        const existing = get().cart.find(
          (line) =>
            line.productId === input.productId &&
            (line.cakeDate ?? "") === (input.cakeDate ?? "") &&
            (line.specialInstructions ?? "") === (input.specialInstructions ?? ""),
        );
        const nextQty = (existing?.qty ?? 0) + input.qty;
        const error = stockError(product, nextQty, input.cakeDate);
        if (error) return { ok: false, message: error };
        const key = existing?.key ?? cartKey({ ...input, assembly: input.assembly });
        const line: CartLine = {
          key,
          productId: product.id,
          qty: nextQty,
          specialInstructions: input.specialInstructions?.trim() || undefined,
          cakeDate: input.cakeDate,
          assembly: product.departmentId === "furniture" ? Boolean(input.assembly) : undefined,
          furnitureSlotId: input.furnitureSlotId,
        };
        set({
          cart: existing
            ? get().cart.map((entry) => (entry.key === existing.key ? line : entry))
            : [...get().cart, line],
        });
        return { ok: true, data: { name: product.name } };
      },
      setQty: (key, qty) => {
        const current = get().cart.find((line) => line.key === key);
        const product = get().products.find((entry) => entry.id === current?.productId);
        if (!current || !product) return { ok: false, message: "That line is already gone." };
        if (qty <= 0) {
          set({ cart: get().cart.filter((line) => line.key !== key) });
          return { ok: true, data: { name: product.name } };
        }
        const error = stockError(product, qty, current.cakeDate);
        if (error) return { ok: false, message: error };
        set({
          cart: get().cart.map((line) => (line.key === key ? { ...line, qty } : line)),
        });
        return { ok: true, data: { name: product.name } };
      },
      removeLine: (key) => set({ cart: get().cart.filter((line) => line.key !== key) }),
      clearCart: () => set({ cart: [], promoCode: null }),
      setPromoCode: (code) => set({ promoCode: code?.trim() ? code.trim().toUpperCase() : null }),
      placeOrder: (input) => {
        const state = get();
        const resolved = resolveLines(state.cart, state.products);
        if (resolved.length === 0) return { ok: false, message: "Your basket is empty." };
        if (!input.name.trim()) return { ok: false, message: "Tell us the name for this order." };
        const phone = input.phone.replace(/\s/g, "");
        if (phone.length < 10) return { ok: false, message: "A phone number is required so we can reach you." };
        if (input.email.trim() && !input.email.includes("@")) {
          return { ok: false, message: "That email doesn’t look right." };
        }
        for (const line of resolved) {
          const error = stockError(line.product, line.line.qty, line.line.cakeDate);
          if (error) return { ok: false, message: error };
        }
        const hasFurniture = resolved.some((line) => line.product.departmentId === "furniture");
        const hasCounter = resolved.some((line) => line.product.departmentId !== "furniture");
        const slots = grocerySlots();
        const furnSlots = furnitureSlots();
        const slot = slots.find((entry) => entry.id === input.slotId);
        const furnitureSlot = furnSlots.find((entry) => entry.id === input.furnitureSlotId);
        if (hasCounter && !slot) return { ok: false, message: "Choose a pickup or delivery time." };
        if (hasFurniture && !furnitureSlot) {
          return { ok: false, message: "Choose a furniture delivery window. We book from two days out." };
        }
        const needsAddress = input.groceryMethod === "delivery" || hasFurniture;
        if (needsAddress && input.address.trim().length < 6) {
          return { ok: false, message: "Add the address for delivery." };
        }
        if (needsAddress && !input.zoneId) {
          return { ok: false, message: "Choose a delivery zone so we can price the trip." };
        }
        const zone = state.settings.zones.find((entry) => entry.id === input.zoneId) ?? null;
        if (input.groceryMethod === "delivery" && hasCounter && zone) {
          const counterSub = resolved
            .filter((line) => line.product.departmentId !== "furniture")
            .reduce((sum, line) => sum + line.lineTotal, 0);
          if (counterSub < zone.minimum) {
            return {
              ok: false,
              message: `Delivery in ${zone.name} starts from ₦${zone.minimum.toLocaleString("en-NG")} of groceries, bakes, and books.`,
            };
          }
        }
        const customer = state.customers.find((entry) => entry.id === input.customerId) ?? null;
        const quote = buildQuote({
          cart: state.cart,
          products: state.products,
          promotions: state.promotions,
          settings: state.settings,
          promoCode: state.promoCode,
          groceryDelivery: input.groceryMethod === "delivery" && hasCounter,
          zoneFee: zone?.fee ?? 0,
          redeemPoints: input.redeemPoints,
          customer,
        });
        if (state.promoCode && quote.promoError) return { ok: false, message: quote.promoError };
        if (quote.loyaltyError) return { ok: false, message: quote.loyaltyError };

        const lines: OrderLine[] = quote.lines.map((line) => ({
          productId: line.product.id,
          name: line.product.name,
          qty: line.line.qty,
          unitPrice: line.unitPrice,
          departmentId: line.product.departmentId,
          specialInstructions: line.line.specialInstructions,
          cakeDate: line.line.cakeDate,
          assembly: line.line.assembly,
        }));
        const number = `DL-${state.nextOrderSeq}`;
        const fulfillment = !hasCounter && hasFurniture
          ? "furniture_delivery"
          : input.groceryMethod === "delivery"
            ? "delivery"
            : hasFurniture
              ? "furniture_delivery"
              : "pickup";
        const order: Order = {
          id: uid("ord"),
          number,
          customerId: customer?.id ?? null,
          contactName: input.name.trim(),
          contactPhone: input.phone.trim(),
          contactEmail: input.email.trim(),
          channel: "web",
          status: "pending",
          fulfillment,
          groceryMethod: hasCounter ? input.groceryMethod : null,
          slot: slot ? `${slot.date} · ${slot.label}` : null,
          furnitureSlot: furnitureSlot ? `${furnitureSlot.date} · ${furnitureSlot.label}` : null,
          address: needsAddress ? input.address.trim() : null,
          zoneId: needsAddress ? input.zoneId : null,
          breakdown: breakdownOf(lines),
          lines,
          subtotal: quote.subtotal,
          deliveryFee: quote.deliveryFee,
          discount: quote.discount,
          promoDiscount: quote.promoDiscount,
          loyaltyDiscount: quote.loyaltyDiscount,
          total: quote.total,
          paymentStatus: "paid_demo",
          notes: input.notes.trim(),
          promoCode: quote.promo?.code ?? null,
          pointsRedeemed: quote.redeemPoints,
          stockDeducted: false,
          pointsAwarded: false,
          assemblyRequired: lines.some((line) => line.assembly),
          createdAt: new Date().toISOString(),
        };
        let customers = state.customers;
        let ledger = state.ledger;
        if (customer && quote.redeemPoints > 0) {
          customers = customers.map((entry) => {
            if (entry.id !== customer.id) return entry;
            const loyaltyPoints = entry.loyaltyPoints - quote.redeemPoints;
            return { ...entry, loyaltyPoints, tier: tierFor(loyaltyPoints) };
          });
          ledger = [
            {
              id: uid("led"),
              customerId: customer.id,
              points: -quote.redeemPoints,
              reason: `Redeemed on ${number}`,
              orderId: order.id,
              createdAt: order.createdAt,
            },
            ...ledger,
          ];
        }
        set({
          orders: [order, ...state.orders],
          customers,
          ledger,
          deliveryJobs: [...jobsForOrder(order), ...state.deliveryJobs],
          nextOrderSeq: state.nextOrderSeq + 1,
          cart: [],
          promoCode: null,
        });
        return { ok: true, data: { number } };
      },
      updateOrderStatus: (orderId, status) => {
        const state = get();
        const order = state.orders.find((entry) => entry.id === orderId);
        if (!order) return { ok: false, message: "Order not found." };
        if (order.status === status) return { ok: true, data: { number: order.number } };
        if (order.status === "completed" || order.status === "cancelled") {
          return { ok: false, message: "That order is already closed." };
        }
        if (status === "out_for_delivery" && order.fulfillment === "pickup" && !order.furnitureSlot) {
          return { ok: false, message: "Pickup orders stay in the shop until they’re collected." };
        }
        const when = new Date().toISOString();
        let products = state.products;
        let stockDeducted = order.stockDeducted;
        let customers = state.customers;
        let ledger = state.ledger;
        let pointsAwarded = order.pointsAwarded;
        let deliveryJobs = state.deliveryJobs;
        if ((status === "confirmed" || status === "completed") && !stockDeducted) {
          const short = shortStock(products, order.lines);
          if (short.length) {
            return { ok: false, message: `Not enough stock for ${short.join(", ")}.` };
          }
          products = applyStock(products, order.lines, -1);
          stockDeducted = true;
        }
        if (status === "completed") {
          const awarded = awardPoints({ ...state, customers, ledger }, { ...order, pointsAwarded }, when);
          customers = awarded.customers;
          ledger = awarded.ledger;
          pointsAwarded = awarded.pointsAwarded;
          deliveryJobs = deliveryJobs.map((job) =>
            job.orderId === order.id ? { ...job, status: "delivered" } : job,
          );
        }
        if (status === "cancelled") {
          if (stockDeducted) products = applyStock(products, order.lines, 1);
          const reversed = reversePoints({ ...state, customers, ledger }, { ...order, pointsAwarded }, when);
          customers = reversed.customers;
          ledger = reversed.ledger;
          pointsAwarded = false;
          deliveryJobs = deliveryJobs.filter((job) => job.orderId !== order.id);
        }
        set({
          products,
          customers,
          ledger,
          deliveryJobs,
          orders: state.orders.map((entry) =>
            entry.id === order.id ? { ...entry, status, stockDeducted, pointsAwarded } : entry,
          ),
        });
        return { ok: true, data: { number: order.number } };
      },
      posCheckout: (input) => {
        const state = get();
        if (input.lines.length === 0) return { ok: false, message: "Add at least one item to the ticket." };
        const lines: OrderLine[] = [];
        for (const entry of input.lines) {
          const product = state.products.find((item) => item.id === entry.productId);
          if (!product || !product.active) return { ok: false, message: "An item on the ticket is not for sale." };
          if (product.isMadeToOrder) {
            return { ok: false, message: `${product.name} is made to order. Take it on the shop site, not the till.` };
          }
          const error = stockError(product, entry.qty);
          if (error) return { ok: false, message: error };
          lines.push({
            productId: product.id,
            name: product.name,
            qty: entry.qty,
            unitPrice: product.price,
            departmentId: product.departmentId,
          });
        }
        const customer = state.customers.find((entry) => entry.id === input.customerId) ?? null;
        const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
        const number = `DL-${state.nextOrderSeq}`;
        const createdAt = new Date().toISOString();
        const order: Order = {
          id: uid("ord"),
          number,
          customerId: customer?.id ?? null,
          contactName: customer?.name ?? "Walk-in",
          contactPhone: customer?.phone ?? "",
          contactEmail: customer?.email ?? "",
          channel: "pos",
          status: "completed",
          fulfillment: "pickup",
          groceryMethod: "pickup",
          slot: "Walk-in till",
          furnitureSlot: null,
          address: null,
          zoneId: null,
          breakdown: breakdownOf(lines),
          lines,
          subtotal,
          deliveryFee: 0,
          discount: 0,
          promoDiscount: 0,
          loyaltyDiscount: 0,
          total: subtotal,
          paymentStatus: "paid_demo",
          notes: "Walk-in till",
          promoCode: null,
          pointsRedeemed: 0,
          stockDeducted: true,
          pointsAwarded: false,
          assemblyRequired: false,
          createdAt,
        };
        let products = applyStock(state.products, lines, -1);
        const awarded = awardPoints(state, order, createdAt);
        order.pointsAwarded = awarded.pointsAwarded;
        const movements = lines.map((line) => ({
          id: uid("mv"),
          productId: line.productId,
          delta: -line.qty,
          reason: "sold" as const,
          note: number,
          createdAt,
        }));
        set({
          products,
          customers: awarded.customers,
          ledger: awarded.ledger,
          orders: [order, ...state.orders],
          nextOrderSeq: state.nextOrderSeq + 1,
          stockLog: [...movements, ...state.stockLog].slice(0, 80),
        });
        return { ok: true, data: { number } };
      },
      adjustStock: (productId, delta, reason, note) => {
        if (!note.trim()) return { ok: false, message: "Add a short reason for the count." };
        if (!Number.isFinite(delta) || delta === 0) return { ok: false, message: "Enter a quantity change." };
        const product = get().products.find((entry) => entry.id === productId);
        if (!product) return { ok: false, message: "Product not found." };
        const next = product.stockOnHand + delta;
        if (next < 0) return { ok: false, message: "Stock can’t go below zero." };
        const createdAt = new Date().toISOString();
        set({
          products: get().products.map((entry) =>
            entry.id === productId ? { ...entry, stockOnHand: next } : entry,
          ),
          stockLog: [
            { id: uid("mv"), productId, delta, reason, note: note.trim(), createdAt },
            ...get().stockLog,
          ].slice(0, 80),
        });
        return { ok: true, data: null };
      },
      saveProduct: (product, isNew) => {
        if (!product.name.trim()) return { ok: false, message: "Name the product." };
        if (!product.sku.trim()) return { ok: false, message: "Add a SKU." };
        if (product.price < 0 || product.costPrice < 0) return { ok: false, message: "Prices can’t be negative." };
        const clash = get().products.find(
          (entry) => entry.sku.toLowerCase() === product.sku.trim().toLowerCase() && entry.id !== product.id,
        );
        if (clash) return { ok: false, message: "That SKU is already used." };
        const slug = product.slug.trim();
        const slugClash = get().products.find((entry) => entry.slug === slug && entry.id !== product.id);
        if (slug && slugClash) return { ok: false, message: "Another item already uses that name." };
        const next = { ...product, name: product.name.trim(), sku: product.sku.trim(), slug };
        set({
          products: isNew
            ? [next, ...get().products]
            : get().products.map((entry) => (entry.id === product.id ? next : entry)),
        });
        return { ok: true, data: null };
      },
      deleteProduct: (productId) => {
        const product = get().products.find((entry) => entry.id === productId);
        if (!product) return { ok: false, message: "That item is already gone." };
        set({
          products: get().products.filter((entry) => entry.id !== productId),
          cart: get().cart.filter((line) => line.productId !== productId),
          guestWishlist: get().guestWishlist.filter((id) => id !== productId),
          customers: get().customers.map((customer) => ({
            ...customer,
            wishlist: customer.wishlist.filter((id) => id !== productId),
          })),
          bakeryJobs: get().bakeryJobs.filter((job) => job.productId !== productId),
          schoolLists: get().schoolLists.map((list) => ({
            ...list,
            items: list.items.filter((item) => item.productId !== productId),
          })),
        });
        return { ok: true, data: null };
      },
      saveBakery: (jobId, patch) => {
        set({
          bakeryJobs: get().bakeryJobs.map((job) => (job.id === jobId ? { ...job, ...patch } : job)),
        });
      },
      createBakeryJobs: (date) => {
        const state = get();
        const previous = addDays(date, -1);
        const bakery = state.products.filter((product) => product.departmentId === "bakery" && product.active);
        const additions: BakeryJob[] = [];
        for (const product of bakery) {
          const preorderQty = state.orders
            .filter((order) => order.status !== "cancelled")
            .reduce((sum, order) => {
              const onSlot = (order.slot ?? "").startsWith(date) || (order.furnitureSlot ?? "").startsWith(date);
              return (
                sum +
                order.lines
                  .filter((line) => {
                    if (line.productId !== product.id) return false;
                    if (line.cakeDate) return line.cakeDate === date;
                    return onSlot;
                  })
                  .reduce((inner, line) => inner + line.qty, 0)
              );
            }, 0);
          if (preorderQty > 0) {
            const existing = state.bakeryJobs.find(
              (job) => job.date === date && job.productId === product.id && job.source === "preorder",
            );
            if (existing) {
              additions.push({ ...existing, qtyPlanned: preorderQty });
            } else {
              additions.push({
                id: uid("job"),
                date,
                productId: product.id,
                qtyPlanned: preorderQty,
                qtyBaked: 0,
                qtyWaste: 0,
                source: "preorder",
              });
            }
          }
          if (!product.isMadeToOrder) {
            const forecastQty = state.orders
              .filter((order) => order.status !== "cancelled" && sameLagosDay(order.createdAt, previous))
              .reduce(
                (sum, order) =>
                  sum +
                  order.lines
                    .filter((line) => line.productId === product.id)
                    .reduce((inner, line) => inner + line.qty, 0),
                0,
              );
            const existing = state.bakeryJobs.find(
              (job) => job.date === date && job.productId === product.id && job.source === "forecast",
            );
            if (forecastQty > 0 || existing) {
              if (existing) additions.push(existing);
              else if (forecastQty > 0) {
                additions.push({
                  id: uid("job"),
                  date,
                  productId: product.id,
                  qtyPlanned: forecastQty,
                  qtyBaked: 0,
                  qtyWaste: 0,
                  source: "forecast",
                });
              }
            }
          }
        }
        const kept = state.bakeryJobs.filter(
          (job) =>
            !(
              job.date === date &&
              additions.some((next) => next.productId === job.productId && next.source === job.source)
            ),
        );
        set({ bakeryJobs: [...additions, ...kept] });
        return { ok: true, data: { count: additions.length } };
      },
      markDelivery: (jobId, status) => {
        const state = get();
        const job = state.deliveryJobs.find((entry) => entry.id === jobId);
        if (!job) return { ok: false, message: "Delivery not found." };
        let deliveryJobs = state.deliveryJobs.map((entry) =>
          entry.id === jobId ? { ...entry, status } : entry,
        );
        let orders = state.orders;
        let products = state.products;
        let customers = state.customers;
        let ledger = state.ledger;
        if (status === "delivered") {
          const siblings = deliveryJobs.filter((entry) => entry.orderId === job.orderId);
          const order = orders.find((entry) => entry.id === job.orderId);
          if (order && siblings.every((entry) => entry.status === "delivered") && order.status !== "completed" && order.status !== "cancelled") {
            const result = get().updateOrderStatus(order.id, "completed");
            if (!result.ok) return result;
            deliveryJobs = get().deliveryJobs.map((entry) =>
              entry.id === jobId ? { ...entry, status: "delivered" } : entry,
            );
            set({ deliveryJobs });
            return { ok: true, data: null };
          }
        }
        set({ deliveryJobs, orders, products, customers, ledger });
        return { ok: true, data: null };
      },
      createSchoolOrder: (listId, customerId) => {
        const state = get();
        const list = state.schoolLists.find((entry) => entry.id === listId);
        const customer = state.customers.find((entry) => entry.id === customerId);
        if (!list || !customer) return { ok: false, message: "Choose a list and a customer." };
        const lines: OrderLine[] = [];
        const skipped: string[] = [];
        let products = state.products;
        for (const item of list.items) {
          const product = products.find((entry) => entry.id === item.productId);
          if (!product) {
            skipped.push(item.productId);
            continue;
          }
          if (product.isMadeToOrder || product.stockOnHand < item.qty) {
            skipped.push(product.name);
            continue;
          }
          lines.push({
            productId: product.id,
            name: product.name,
            qty: item.qty,
            unitPrice: product.price,
            departmentId: product.departmentId,
          });
          products = products.map((entry) =>
            entry.id === product.id ? { ...entry, stockOnHand: entry.stockOnHand - item.qty } : entry,
          );
        }
        if (lines.length === 0) {
          return { ok: false, message: "Nothing on that list is in stock right now." };
        }
        const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
        const number = `DL-${state.nextOrderSeq}`;
        const createdAt = new Date().toISOString();
        const tomorrow = addDays(lagosDateString(), 1);
        const order: Order = {
          id: uid("ord"),
          number,
          customerId: customer.id,
          contactName: customer.name,
          contactPhone: customer.phone,
          contactEmail: customer.email,
          channel: "web",
          status: "confirmed",
          fulfillment: "pickup",
          groceryMethod: "pickup",
          slot: `${tomorrow} · morning (9–12)`,
          furnitureSlot: null,
          address: null,
          zoneId: null,
          breakdown: breakdownOf(lines),
          lines,
          subtotal,
          deliveryFee: 0,
          discount: 0,
          promoDiscount: 0,
          loyaltyDiscount: 0,
          total: subtotal,
          paymentStatus: "paid_demo",
          notes: `School list: ${list.name}`,
          promoCode: null,
          pointsRedeemed: 0,
          stockDeducted: true,
          pointsAwarded: false,
          assemblyRequired: false,
          createdAt,
        };
        set({
          products,
          orders: [order, ...state.orders],
          nextOrderSeq: state.nextOrderSeq + 1,
        });
        return { ok: true, data: { number, skipped } };
      },
      adjustPoints: (customerId, delta, reason) => {
        if (!reason.trim()) return { ok: false, message: "Say why the points changed." };
        if (!Number.isFinite(delta) || delta === 0) return { ok: false, message: "Enter a points change." };
        const customer = get().customers.find((entry) => entry.id === customerId);
        if (!customer) return { ok: false, message: "Customer not found." };
        const loyaltyPoints = Math.max(0, customer.loyaltyPoints + Math.round(delta));
        const applied = loyaltyPoints - customer.loyaltyPoints;
        set({
          customers: get().customers.map((entry) =>
            entry.id === customerId ? { ...entry, loyaltyPoints, tier: tierFor(loyaltyPoints) } : entry,
          ),
          ledger: [
            {
              id: uid("led"),
              customerId,
              points: applied,
              reason: reason.trim(),
              createdAt: new Date().toISOString(),
            },
            ...get().ledger,
          ],
        });
        return { ok: true, data: null };
      },
      savePromo: (promo, isNew) => {
        const code = promo.code.trim().toUpperCase();
        if (!/^[A-Z0-9]{3,16}$/.test(code)) {
          return { ok: false, message: "Use 3–16 letters or numbers for the code." };
        }
        if (promo.value <= 0) return { ok: false, message: "Set a value above zero." };
        const clash = get().promotions.find(
          (entry) => entry.code.toLowerCase() === code.toLowerCase() && entry.id !== promo.id,
        );
        if (clash) return { ok: false, message: "That code already exists." };
        const next = { ...promo, code };
        set({
          promotions: isNew
            ? [next, ...get().promotions]
            : get().promotions.map((entry) => (entry.id === promo.id ? next : entry)),
        });
        return { ok: true, data: null };
      },
      draftLowStockPos: () => {
        const state = get();
        const low = state.products.filter(
          (product) => product.active && !product.isMadeToOrder && product.stockOnHand <= product.reorderLevel && product.supplierId,
        );
        if (low.length === 0) return { ok: false, message: "Nothing is under its reorder level." };
        const groups = new Map<string, Product[]>();
        for (const product of low) {
          const id = product.supplierId ?? "";
          groups.set(id, [...(groups.get(id) ?? []), product]);
        }
        let purchaseOrders = state.purchaseOrders;
        let nextPoSeq = state.nextPoSeq;
        let count = 0;
        for (const [supplierId, products] of groups) {
          const open = purchaseOrders.find((po) => po.supplierId === supplierId && po.status === "draft");
          if (open) continue;
          const createdAt = new Date().toISOString();
          purchaseOrders = [
            {
              id: uid("po"),
              number: `PO-${nextPoSeq}`,
              supplierId,
              status: "draft",
              lines: products.map((product) => ({
                productId: product.id,
                name: product.name,
                qty: Math.max(product.reorderLevel * 2 - product.stockOnHand, product.reorderLevel || 1),
                cost: product.costPrice,
              })),
              expectedDate: addDays(
                lagosDateString(),
                state.suppliers.find((supplier) => supplier.id === supplierId)?.leadDays ?? 3,
              ),
              createdAt,
            },
            ...purchaseOrders,
          ];
          nextPoSeq += 1;
          count += 1;
        }
        if (count === 0) return { ok: false, message: "Draft orders already cover the low stock." };
        set({ purchaseOrders, nextPoSeq });
        return { ok: true, data: { count } };
      },
      setPoStatus: (id, status) => {
        const state = get();
        const po = state.purchaseOrders.find((entry) => entry.id === id);
        if (!po) return { ok: false, message: "Purchase order not found." };
        if (po.status === "received") return { ok: false, message: "That delivery is already received." };
        let products = state.products;
        let stockLog = state.stockLog;
        if (status === "received") {
          const when = new Date().toISOString();
          for (const line of po.lines) {
            products = products.map((product) =>
              product.id === line.productId
                ? { ...product, stockOnHand: product.stockOnHand + line.qty }
                : product,
            );
            stockLog = [
              {
                id: uid("mv"),
                productId: line.productId,
                delta: line.qty,
                reason: "received",
                note: po.number,
                createdAt: when,
              },
              ...stockLog,
            ];
          }
        }
        set({
          products,
          stockLog: stockLog.slice(0, 80),
          purchaseOrders: state.purchaseOrders.map((entry) =>
            entry.id === id ? { ...entry, status } : entry,
          ),
        });
        return { ok: true, data: null };
      },
      updateSettings: (settings) => set({ settings }),
      toggleWishlist: (productId) => {
        const state = get();
        if (!state.activeCustomerId) {
          const has = state.guestWishlist.includes(productId);
          set({
            guestWishlist: has
              ? state.guestWishlist.filter((id) => id !== productId)
              : [...state.guestWishlist, productId],
          });
          return;
        }
        set({
          customers: state.customers.map((customer) => {
            if (customer.id !== state.activeCustomerId) return customer;
            const has = customer.wishlist.includes(productId);
            return {
              ...customer,
              wishlist: has
                ? customer.wishlist.filter((id) => id !== productId)
                : [...customer.wishlist, productId],
            };
          }),
        });
      },
      setActiveCustomer: (id) => set({ activeCustomerId: id }),
      saveAddress: (customerId, line, area, zoneId) => {
        if (!line.trim() || !area.trim() || !zoneId) return;
        set({
          customers: get().customers.map((customer) => {
            if (customer.id !== customerId) return customer;
            const address = {
              id: customer.addresses[0]?.id ?? uid("ad"),
              label: "Home",
              line: line.trim(),
              area: area.trim(),
              zoneId,
            };
            return { ...customer, addresses: [address, ...customer.addresses.slice(1)] };
          }),
        });
      },
      reorder: (orderId) => {
        const order = get().orders.find((entry) => entry.id === orderId);
        if (!order) return { ok: false, message: "Order not found." };
        const skipped: string[] = [];
        let added = 0;
        for (const line of order.lines) {
          const product = get().products.find((entry) => entry.id === line.productId);
          if (!product) {
            skipped.push(line.name);
            continue;
          }
          if (product.isMadeToOrder) {
            skipped.push(`${product.name} (needs a new date)`);
            continue;
          }
          const result = get().addToCart({
            productId: product.id,
            qty: line.qty,
            assembly: line.assembly,
          });
          if (!result.ok) skipped.push(product.name);
          else added += 1;
        }
        return { ok: true, data: { added, skipped } };
      },
      login: (email, password) => {
        if (email.trim().toLowerCase() !== DEMO_STAFF.email || password !== DEMO_STAFF.password) {
          return { ok: false, message: "Those details don’t match the owner login." };
        }
        set({
          staff: { email: DEMO_STAFF.email, name: DEMO_STAFF.name, role: DEMO_STAFF.role },
        });
        return { ok: true, data: null };
      },
      logout: () => set({ staff: null }),
      resetDemo: () => {
        const staff = get().staff;
        set({
          ...createSeed(),
          cart: [],
          promoCode: null,
          activeCustomerId: "cus_amaka",
          guestWishlist: [],
          staff,
        });
      },
    }),
    {
      name: "dallema-store-v1",
      version: 4,
      migrate: (persisted, version) => {
        if (version >= 4 || !persisted || typeof persisted !== "object") return persisted;
        const seed = createSeed();
        const previous = persisted as {
          cart?: unknown;
          promoCode?: unknown;
          activeCustomerId?: unknown;
          guestWishlist?: unknown;
          staff?: { email?: string; name?: string; role?: string } | null;
        };
        const staff = previous.staff
          ? { ...previous.staff, name: "Dalema owner", email: "owner@dalema.store" }
          : previous.staff;
        return {
          ...previous,
          products: seed.products,
          customers: seed.customers,
          orders: seed.orders,
          suppliers: seed.suppliers,
          deliveryJobs: seed.deliveryJobs,
          settings: seed.settings,
          staff,
        };
      },
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
      partialize: (state) => ({
        products: state.products,
        customers: state.customers,
        orders: state.orders,
        promotions: state.promotions,
        ledger: state.ledger,
        suppliers: state.suppliers,
        purchaseOrders: state.purchaseOrders,
        bakeryJobs: state.bakeryJobs,
        deliveryJobs: state.deliveryJobs,
        schoolLists: state.schoolLists,
        settings: state.settings,
        stockLog: state.stockLog,
        nextOrderSeq: state.nextOrderSeq,
        nextPoSeq: state.nextPoSeq,
        cart: state.cart,
        promoCode: state.promoCode,
        activeCustomerId: state.activeCustomerId,
        guestWishlist: state.guestWishlist,
        staff: state.staff,
      }),
    },
  ),
);

export function useCustomer() {
  return useDallema((state) =>
    state.customers.find((customer) => customer.id === state.activeCustomerId) ?? null,
  );
}

export function wishlistIds(state: Pick<ShopState, "activeCustomerId" | "customers" | "guestWishlist">) {
  if (!state.activeCustomerId) return state.guestWishlist;
  return state.customers.find((customer) => customer.id === state.activeCustomerId)?.wishlist ?? [];
}

export function lowStockProducts(products: Product[]) {
  return products.filter(
    (product) => product.active && !product.isMadeToOrder && product.stockOnHand <= product.reorderLevel,
  );
}

export function deptSort(a: DeptId, b: DeptId) {
  return DEPT_ORDER.indexOf(a) - DEPT_ORDER.indexOf(b);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export function blankProduct(departmentId: DeptId = "supermarket"): Product {
  const id = uid("prd");
  return {
    id,
    departmentId,
    categoryId: "staples",
    name: "",
    slug: id,
    shortDescription: "",
    longDescription: "",
    imageLabel: "",
    sku: "",
    barcode: "",
    costPrice: 0,
    price: 0,
    unit: "piece" as Unit,
    taxRate: 0,
    stockOnHand: 0,
    reorderLevel: 4,
    trackExpiry: false,
    isMadeToOrder: false,
    leadTimeHours: 0,
    weightKg: 0.5,
    tags: [] as Tag[],
    active: true,
    featured: false,
    assemblyRequired: false,
  };
}

export function blankPromo(): Promotion {
  const year = lagosDateString().slice(0, 4);
  return {
    id: uid("promo"),
    code: "",
    type: "percent" as PromoType,
    value: 10,
    minSpend: 0,
    departmentIds: [],
    startsAt: atLagos(`${year}-01-01`, "00:00:00"),
    endsAt: atLagos(`${year}-12-31`, "23:59:00"),
    active: true,
    label: "",
  };
}
