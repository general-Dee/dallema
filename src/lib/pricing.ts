import { earliestMadeDate, formatDay, naira } from "./format";
import type { CartLine, Customer, Product, Promotion, Settings } from "./types";

export interface PricedLine {
  line: CartLine;
  product: Product;
  unitPrice: number;
  lineTotal: number;
}

export interface Quote {
  lines: PricedLine[];
  subtotal: number;
  promoDiscount: number;
  deliveryFee: number;
  loyaltyDiscount: number;
  discount: number;
  total: number;
  promo: Promotion | null;
  promoError: string | null;
  loyaltyError: string | null;
  redeemPoints: number;
  hasFurniture: boolean;
  hasCounter: boolean;
}

export function resolveLines(cart: CartLine[], products: Product[]): PricedLine[] {
  const out: PricedLine[] = [];
  for (const line of cart) {
    const product = products.find((p) => p.id === line.productId);
    if (!product || !product.active) continue;
    out.push({
      line,
      product,
      unitPrice: product.price,
      lineTotal: product.price * line.qty,
    });
  }
  return out;
}

export function findPromo(promotions: Promotion[], code: string | null | undefined, now = new Date()) {
  if (!code?.trim()) return null;
  const hit = promotions.find((p) => p.code.toLowerCase() === code.trim().toLowerCase());
  if (!hit || !hit.active) return null;
  if (new Date(hit.startsAt).getTime() > now.getTime()) return null;
  if (new Date(hit.endsAt).getTime() < now.getTime()) return null;
  return hit;
}

export function deliveryFeeFor(opts: {
  hasFurniture: boolean;
  groceryDelivery: boolean;
  zoneFee: number;
  furnitureFlat: number;
}) {
  if (opts.hasFurniture) return Math.max(opts.furnitureFlat, opts.zoneFee);
  if (opts.groceryDelivery) return opts.zoneFee;
  return 0;
}

export function stockError(product: Product, qty: number, cakeDate?: string, now = new Date()) {
  if (!product.active) return `${product.name} is not on sale right now.`;
  if (qty < 1) return "Quantity has to be at least 1.";
  if (product.isMadeToOrder) {
    if (!cakeDate) return `Choose the date you need ${product.name}.`;
    const earliest = earliestMadeDate(product.leadTimeHours, now);
    if (cakeDate < earliest) {
      return `${product.name} needs ${product.leadTimeHours} hours. The earliest date is ${formatDay(earliest)}.`;
    }
    return null;
  }
  if (qty > product.stockOnHand) {
    if (product.stockOnHand <= 0) return `${product.name} is out of stock.`;
    return `Only ${product.stockOnHand} ${product.unit} of ${product.name} left.`;
  }
  return null;
}

export function buildQuote(args: {
  cart: CartLine[];
  products: Product[];
  promotions: Promotion[];
  settings: Settings;
  promoCode: string | null;
  groceryDelivery: boolean;
  zoneFee: number;
  redeemPoints: number;
  customer: Customer | null;
  now?: Date;
}): Quote {
  const lines = resolveLines(args.cart, args.products);
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const hasFurniture = lines.some((line) => line.product.departmentId === "furniture");
  const hasCounter = lines.some((line) => line.product.departmentId !== "furniture");
  const deliveryFee = deliveryFeeFor({
    hasFurniture,
    groceryDelivery: args.groceryDelivery,
    zoneFee: args.zoneFee,
    furnitureFlat: args.settings.furnitureDeliveryFee,
  });

  let promo: Promotion | null = null;
  let promoError: string | null = null;
  let promoDiscount = 0;
  if (args.promoCode?.trim()) {
    promo = findPromo(args.promotions, args.promoCode, args.now);
    if (!promo) {
      promoError = "That code isn’t active.";
    } else {
      const eligible = promo.departmentIds.length
        ? lines.filter((line) => promo?.departmentIds.includes(line.product.departmentId))
        : lines;
      const basis = eligible.reduce((sum, line) => sum + line.lineTotal, 0);
      if (eligible.length === 0) {
        promoError = `${promo.code} doesn’t cover anything in this basket.`;
      } else if (basis < promo.minSpend) {
        promoError = `${promo.code} needs ${naira(promo.minSpend)} on eligible items. This basket has ${naira(basis)}.`;
      } else if (promo.type === "percent") {
        promoDiscount = Math.round((basis * promo.value) / 100);
      } else {
        promoDiscount = Math.min(promo.value, basis);
      }
    }
  }

  const due = Math.max(0, subtotal - promoDiscount + deliveryFee);
  let loyaltyDiscount = 0;
  let loyaltyError: string | null = null;
  let redeemPoints = 0;
  if (args.redeemPoints > 0) {
    if (!args.customer) {
      loyaltyError = "Choose a household profile before using points.";
    } else if (args.redeemPoints > args.customer.loyaltyPoints) {
      loyaltyError = "That is more points than this profile has.";
    } else if (args.redeemPoints < args.settings.minRedeemPoints) {
      loyaltyError = `Redeem at least ${args.settings.minRedeemPoints} points.`;
    } else if (args.redeemPoints % 100 !== 0) {
      loyaltyError = "Redeem points in steps of 100.";
    } else {
      const amount = (args.redeemPoints / 100) * args.settings.nairaPer100Points;
      if (amount > due) {
        loyaltyError = "That’s more points than this order can use.";
      } else {
        loyaltyDiscount = amount;
        redeemPoints = args.redeemPoints;
      }
    }
  }

  const discount = promoDiscount + loyaltyDiscount;
  const total = Math.max(0, subtotal + deliveryFee - discount);
  return {
    lines,
    subtotal,
    promoDiscount,
    deliveryFee,
    loyaltyDiscount,
    discount,
    total,
    promo,
    promoError,
    loyaltyError,
    redeemPoints,
    hasFurniture,
    hasCounter,
  };
}

export function breakdownOf(lines: { departmentId: Product["departmentId"]; qty: number; unitPrice: number }[]) {
  const map = new Map<Product["departmentId"], { subtotal: number; qty: number }>();
  for (const line of lines) {
    const current = map.get(line.departmentId) ?? { subtotal: 0, qty: 0 };
    current.subtotal += line.unitPrice * line.qty;
    current.qty += line.qty;
    map.set(line.departmentId, current);
  }
  return [...map.entries()].map(([departmentId, value]) => ({
    departmentId,
    subtotal: value.subtotal,
    qty: value.qty,
  }));
}
