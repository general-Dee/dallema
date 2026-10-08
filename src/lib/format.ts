export function naira(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  return `${sign}₦${Math.abs(rounded).toLocaleString("en-NG")}`;
}

export function lagosDateString(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

export function lagosHour(date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Number(parts.find((p) => p.type === "hour")?.value ?? "0");
}

export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const utc = new Date(Date.UTC(y, (m ?? 1) - 1, (d ?? 1) + days));
  return utc.toISOString().slice(0, 10);
}

export function atLagos(isoDate: string, time: string): string {
  return `${isoDate}T${time}+01:00`;
}

export function formatDay(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const utc = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(utc);
}

export function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

export function sameLagosDay(iso: string, day: string): boolean {
  return lagosDateString(new Date(iso)) === day;
}

export function earliestMadeDate(leadHours: number, now = new Date()): string {
  return lagosDateString(new Date(now.getTime() + leadHours * 60 * 60 * 1000));
}

export interface SlotOption {
  id: string;
  label: string;
  date: string;
}

export function grocerySlots(now = new Date()): SlotOption[] {
  const today = lagosDateString(now);
  const tomorrow = addDays(today, 1);
  const hour = lagosHour(now);
  const slots: SlotOption[] = [];
  if (hour < 11) {
    slots.push({ id: `${today}-am`, label: `Today · morning (9–12)`, date: today });
  }
  if (hour < 16) {
    slots.push({ id: `${today}-pm`, label: `Today · afternoon (12–5)`, date: today });
  }
  slots.push({ id: `${tomorrow}-am`, label: `Tomorrow · morning (9–12)`, date: tomorrow });
  slots.push({ id: `${tomorrow}-pm`, label: `Tomorrow · afternoon (12–5)`, date: tomorrow });
  return slots;
}

export function furnitureSlots(now = new Date()): SlotOption[] {
  const today = lagosDateString(now);
  const slots: SlotOption[] = [];
  for (let i = 2; i <= 6; i += 1) {
    const date = addDays(today, i);
    const pretty = formatDay(date);
    slots.push({ id: `${date}-am`, label: `${pretty} · morning (9–12)`, date });
    slots.push({ id: `${date}-pm`, label: `${pretty} · afternoon (12–5)`, date });
  }
  return slots;
}

export function tierFor(points: number): "Seed" | "Sprout" | "Harvest" {
  if (points >= 1500) return "Harvest";
  if (points >= 500) return "Sprout";
  return "Seed";
}

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function whatsappHref(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return "";
  const international = digits.startsWith("234") ? digits : digits.replace(/^0/, "234");
  return `https://wa.me/${international}?text=${encodeURIComponent(text)}`;
}

export function orderWhatsAppText(order: {
  number: string;
  contactName: string;
  total: number;
  fulfillment: string;
  address: string | null;
  lines: { qty: number; name: string }[];
}): string {
  const lines = order.lines.map((line) => `${line.qty} × ${line.name}`).join("\n");
  const how =
    order.fulfillment === "pickup" || !order.address
      ? "I will collect it at the shop."
      : `Please deliver to ${order.address}.`;
  return `Hello Dalema, this is ${order.contactName}. I placed ${order.number}.\n${lines}\nTotal ${naira(order.total)}.\n${how}`;
}
