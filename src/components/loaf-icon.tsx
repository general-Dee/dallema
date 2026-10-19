import { createLucideIcon } from "lucide-react";

/**
 * Bread loaf in lucide's 24px, round-cap stroke style, so it sits beside ShoppingBasket,
 * Armchair and BookOpen. It stands in for the bakery everywhere (logo mark, department icon).
 */
export const Loaf = createLucideIcon("loaf", [
  ["path", { d: "M4 19v-6.5C4 8.4 7.6 5 12 5s8 3.4 8 7.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z", key: "loaf-body" }],
  ["path", { d: "m8 11 2-2.5", key: "loaf-score-1" }],
  ["path", { d: "m11 12 2.5-3", key: "loaf-score-2" }],
  ["path", { d: "m14.5 12.5 2-2.5", key: "loaf-score-3" }],
]);
