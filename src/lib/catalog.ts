import type { Category, Department, DeptId, OrderStatus, Tag } from "./types";

export const DEPT_ORDER: DeptId[] = ["supermarket", "bakery", "furniture", "bookstore"];

export const DEPARTMENTS: Department[] = [
  {
    id: "supermarket",
    name: "Supermarket",
    slug: "supermarket",
    description: "Rice, oil, fresh food, and the things that run out first.",
    fulfillment: ["pickup", "delivery"],
  },
  {
    id: "bakery",
    name: "Bakery",
    slug: "bakery",
    description: "Agege loaves, pies, and cakes that go in the oven to order.",
    fulfillment: ["pickup", "delivery"],
  },
  {
    id: "furniture",
    name: "Furniture",
    slug: "furniture",
    description: "Sofas, tables, and beds delivered in Lagos, assembled if you want.",
    fulfillment: ["furniture_delivery"],
  },
  {
    id: "bookstore",
    name: "Bookstore",
    slug: "bookstore",
    description: "School lists, readers, and a novel for the weekend.",
    fulfillment: ["pickup", "delivery"],
  },
];

export const CATEGORIES: Category[] = [
  { id: "staples", departmentId: "supermarket", name: "Staples", slug: "staples" },
  { id: "fresh", departmentId: "supermarket", name: "Fresh", slug: "fresh" },
  { id: "dairy", departmentId: "supermarket", name: "Dairy & protein", slug: "dairy" },
  { id: "household", departmentId: "supermarket", name: "Household", slug: "household" },
  { id: "pantry", departmentId: "supermarket", name: "Pantry", slug: "pantry" },
  { id: "bread", departmentId: "bakery", name: "Daily bread", slug: "bread" },
  { id: "pastries", departmentId: "bakery", name: "Pastries", slug: "pastries" },
  { id: "cakes", departmentId: "bakery", name: "Cakes", slug: "cakes" },
  { id: "snacks", departmentId: "bakery", name: "Snacks", slug: "snacks" },
  { id: "living", departmentId: "furniture", name: "Living room", slug: "living" },
  { id: "dining", departmentId: "furniture", name: "Dining", slug: "dining" },
  { id: "bedroom", departmentId: "furniture", name: "Bedroom", slug: "bedroom" },
  { id: "work", departmentId: "furniture", name: "Work", slug: "work" },
  { id: "school", departmentId: "bookstore", name: "School", slug: "school" },
  { id: "fiction", departmentId: "bookstore", name: "Fiction", slug: "fiction" },
  { id: "reference", departmentId: "bookstore", name: "Reference", slug: "reference" },
  { id: "stationery", departmentId: "bookstore", name: "Stationery", slug: "stationery" },
];

export const TAGS: Tag[] = [
  "fresh",
  "chilled",
  "frozen",
  "vegan",
  "gluten-free",
  "school",
  "bestseller",
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "New",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "On the way",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const BOUGHT_TOGETHER: Record<string, string[]> = {
  "agege-loaf": ["farm-eggs", "peak-milk"],
  "wheat-bread": ["yogurt", "peak-milk"],
  bookshelf: ["novel-lagos", "chin-chin"],
  "sofa-3": ["cookbook", "bottled-water"],
  "coffee-table": ["cookbook", "novel-lagos"],
  "ofada-rice-5kg": ["palm-oil", "tin-tomatoes"],
  "meat-pie": ["bottled-water", "yogurt"],
  "childrens-reader": ["exercise-books", "coloring-book"],
  "bed-frame": ["tissue", "novel-lagos"],
  "birthday-cake": ["vanilla-cupcake", "bottled-water"],
  "dining-4": ["cookbook", "wheat-bread"],
  "staff-novel": ["chin-chin", "coffee-table"],
  cookbook: ["palm-oil", "ofada-rice-5kg"],
};

export const BUNDLES = [
  {
    id: "breakfast",
    name: "Breakfast box",
    blurb: "Agege loaf, farm eggs, and milk for a proper morning.",
    productIds: ["agege-loaf", "farm-eggs", "peak-milk"],
  },
  {
    id: "reader",
    name: "New reader pack",
    blurb: "A picture reader, exercise books, and a colouring book for the term.",
    productIds: ["childrens-reader", "exercise-books", "coloring-book"],
  },
  {
    id: "room",
    name: "Room starter",
    blurb: "A coffee table, the Market Road cookbook, and this month’s staff-pick novel.",
    productIds: ["coffee-table", "cookbook", "novel-lagos"],
  },
];

export const DEMO_STAFF = {
  email: "owner@dallema.store",
  password: "dallema",
  name: "Adaeze Dallema",
  role: "owner" as const,
};

export const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  cashier: "Cashier",
  bakery: "Bakery",
  warehouse: "Warehouse",
};

export function departmentBySlug(slug: string) {
  return DEPARTMENTS.find((d) => d.slug === slug);
}

export function categoryName(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.name ?? id;
}

export function tone(id: DeptId) {
  switch (id) {
    case "supermarket":
      return {
        chip: "bg-forest-soft text-forest-ink",
        bar: "bg-forest",
        panel: "bg-forest-soft text-forest-ink",
        solid: "bg-forest text-cream",
      };
    case "bakery":
      return {
        chip: "bg-bake-soft text-bake-ink",
        bar: "bg-bake",
        panel: "bg-bake-soft text-bake-ink",
        solid: "bg-bake text-on-bake",
      };
    case "furniture":
      return {
        chip: "bg-walnut-soft text-walnut-deep",
        bar: "bg-walnut",
        panel: "bg-walnut-soft text-walnut-deep",
        solid: "bg-walnut text-cream",
      };
    default:
      return {
        chip: "bg-ink-soft text-ink",
        bar: "bg-ink-fill",
        panel: "bg-ink-soft text-ink",
        solid: "bg-ink-fill text-cream",
      };
  }
}
