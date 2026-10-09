import { addDays, atLagos, lagosDateString, tierFor } from "./format";
import type {
  BakeryJob,
  Customer,
  DeliveryJob,
  LoyaltyLedger,
  Order,
  OrderLine,
  Product,
  Promotion,
  PurchaseOrder,
  SchoolList,
  Settings,
  StockMovement,
  Supplier,
  Unit,
} from "./types";

function item(
  partial: Pick<Product, "id" | "name" | "departmentId" | "categoryId" | "price" | "sku"> &
    Partial<Product>,
): Product {
  return {
    slug: partial.slug ?? partial.id,
    shortDescription: partial.shortDescription ?? partial.name,
    longDescription: partial.longDescription ?? partial.shortDescription ?? partial.name,
    imageLabel: partial.imageLabel ?? partial.name,
    barcode: partial.barcode ?? `615${partial.sku.replace(/\W/g, "").padEnd(10, "0").slice(0, 10)}`,
    costPrice: partial.costPrice ?? Math.round(partial.price * 0.7),
    compareAtPrice: partial.compareAtPrice,
    unit: partial.unit ?? "piece",
    taxRate: partial.taxRate ?? 0,
    stockOnHand: partial.stockOnHand ?? 12,
    reorderLevel: partial.reorderLevel ?? 4,
    trackExpiry: partial.trackExpiry ?? false,
    shelfLifeDays: partial.shelfLifeDays,
    isMadeToOrder: partial.isMadeToOrder ?? false,
    leadTimeHours: partial.leadTimeHours ?? 0,
    weightKg: partial.weightKg ?? 0.5,
    tags: partial.tags ?? [],
    supplierId: partial.supplierId,
    active: partial.active ?? true,
    featured: partial.featured ?? false,
    assemblyRequired: partial.assemblyRequired ?? false,
    id: partial.id,
    name: partial.name,
    departmentId: partial.departmentId,
    categoryId: partial.categoryId,
    price: partial.price,
    sku: partial.sku,
  };
}

function buildProducts(): Product[] {
  const sm = "sup_mill";
  const fresh = "sup_fresh";
  const bake = "sup_bake";
  const walnut = "sup_walnut";
  const ink = "sup_ink";
  const row = (
    id: string,
    name: string,
    categoryId: string,
    price: number,
    unit: Unit,
    stock: number,
    extra: Partial<Product> = {},
  ) =>
    item({
      id,
      name,
      departmentId:
        ["bread", "pastries", "cakes", "snacks"].includes(categoryId)
          ? "bakery"
          : ["living", "dining", "bedroom", "work"].includes(categoryId)
            ? "furniture"
            : ["school", "fiction", "reference", "stationery"].includes(categoryId)
              ? "bookstore"
              : "supermarket",
      categoryId,
      price,
      sku: id.toUpperCase().slice(0, 12),
      unit,
      stockOnHand: stock,
      ...extra,
    });

  return [
    row("ofada-rice-5kg", "Ofada Rice 5kg", "staples", 8500, "kg", 24, {
      sku: "SM-RICE-5",
      costPrice: 6900,
      compareAtPrice: 9200,
      shortDescription: "Local ofada, five kilos, washed and bagged this week.",
      longDescription:
        "Stone-milled ofada, packed in a 5kg sack for this counter. It cooks into that short, fragrant grain that wants palm oil and a proper stew. We keep it off the floor and sell it by the sack.",
      featured: true,
      tags: ["bestseller"],
      supplierId: sm,
      reorderLevel: 8,
      weightKg: 5,
    }),
    row("ijebu-garri", "Ijebu Garri 2kg", "staples", 1800, "kg", 30, {
      sku: "SM-GARRI-2",
      costPrice: 1200,
      shortDescription: "Crisp Ijebu garri, sour the way the regulars like it.",
      longDescription:
        "Fine, dry Ijebu garri in a 2kg bag. Soak it cold with groundnut, or turn it into eba. It keeps if the bag stays closed.",
      supplierId: sm,
      weightKg: 2,
    }),
    row("palm-oil", "Palm Oil 1 litre", "pantry", 3200, "piece", 18, {
      sku: "SM-OIL-1L",
      costPrice: 2500,
      shortDescription: "Red palm oil in a sealed litre, for stew and frying.",
      longDescription:
        "Unrefined red palm oil, one litre. The colour is deep and the smell is clean — not the bitter tins. Use it for banga, ofada stew, or plantain.",
      supplierId: sm,
      featured: true,
      weightKg: 1,
    }),
    row("peak-milk", "Peak Milk 400g", "dairy", 2800, "piece", 22, {
      sku: "SM-MILK-400",
      costPrice: 2100,
      compareAtPrice: 3100,
      shortDescription: "Filled milk powder, 400g tin, for tea and pap.",
      longDescription:
        "The 400g tin most kitchens already know. It keeps on the shelf until you open it. We chill nothing here — this one is dry.",
      supplierId: sm,
      tags: ["bestseller"],
      weightKg: 0.4,
    }),
    row("farm-eggs", "Farm Eggs (crate of 30)", "dairy", 4500, "set", 14, {
      sku: "SM-EGG-30",
      costPrice: 3600,
      shortDescription: "Thirty farm eggs, checked the morning they arrive.",
      longDescription:
        "A full crate from the poultry we use on Zaria Road. Cracked eggs are replaced at the counter. Keep them cool if the house is hot.",
      supplierId: fresh,
      tags: ["chilled", "bestseller"],
      trackExpiry: true,
      shelfLifeDays: 14,
      featured: true,
      reorderLevel: 6,
      weightKg: 2,
    }),
    row("tomatoes", "Fresh Tomatoes (about 1kg)", "fresh", 1200, "kg", 16, {
      sku: "SM-TOM-1",
      costPrice: 700,
      shortDescription: "Ripe tomatoes, sold by the rough kilo.",
      longDescription:
        "Market tomatoes, not the hard greenhouse kind. Best the day you buy them. We don’t weigh to the gram — a basket is about a kilo.",
      supplierId: fresh,
      tags: ["fresh"],
      trackExpiry: true,
      shelfLifeDays: 4,
      weightKg: 1,
    }),
    row("onions", "Onions 1kg", "fresh", 800, "kg", 28, {
      sku: "SM-ONI-1",
      costPrice: 450,
      shortDescription: "Dry onions, a kilo net, for the daily pot.",
      longDescription:
        "Firm onions with the papery skin still on. They sit well for a week in a basket, not in a sealed bag.",
      supplierId: fresh,
      tags: ["fresh"],
      weightKg: 1,
    }),
    row("bottled-water", "Bottled Water 75cl × 12", "household", 2400, "set", 40, {
      sku: "SM-H2O-12",
      costPrice: 1700,
      shortDescription: "A shrink of twelve 75cl bottles.",
      longDescription:
        "Drinking water for the house or a delivery run. The shrink stays together until you ask us to split it, which we won’t — it’s sold as a set.",
      supplierId: sm,
      tags: ["bestseller"],
      featured: true,
      reorderLevel: 12,
      weightKg: 9,
    }),
    row("detergent", "Detergent Powder 900g", "household", 1650, "piece", 16, {
      sku: "SM-DET-900",
      costPrice: 1100,
      compareAtPrice: 1900,
      shortDescription: "900g powder for hand wash or the machine.",
      longDescription:
        "A familiar 900g pack. It handles the school uniforms and the market towels. Store it dry, away from the rice.",
      supplierId: sm,
      weightKg: 0.9,
    }),
    row("spaghetti", "Spaghetti 500g", "pantry", 650, "piece", 36, {
      sku: "SM-SPA-500",
      costPrice: 420,
      compareAtPrice: 800,
      shortDescription: "500g spaghetti, the everyday pack.",
      longDescription:
        "Long pasta in a 500g wrap. It boils in salted water and takes stew or a simple tomato sauce from the tin.",
      supplierId: sm,
      weightKg: 0.5,
    }),
    row("tin-tomatoes", "Tin Tomatoes 400g", "pantry", 900, "piece", 28, {
      sku: "SM-TIN-400",
      costPrice: 620,
      shortDescription: "400g tomato mix, for stew when the fresh ones are soft.",
      longDescription:
        "A 400g tin of tomato mix. Useful when the fresh basket is tired, or when you want stew on a Sunday night without another market run.",
      supplierId: sm,
      weightKg: 0.4,
    }),
    row("bread-flour", "Bread Flour 2kg", "pantry", 2200, "kg", 14, {
      sku: "SM-FLR-2",
      costPrice: 1600,
      shortDescription: "Strong bread flour, 2kg, for home bakers.",
      longDescription:
        "High-protein flour in a 2kg bag. The bakehouse uses the same mill. Fine for Agege-style loaves if you have the time and the yeast.",
      supplierId: bake,
      weightKg: 2,
    }),
    row("sugar", "Granulated Sugar 1kg", "pantry", 1400, "kg", 25, {
      sku: "SM-SUG-1",
      costPrice: 1000,
      shortDescription: "A kilo of white sugar for tea, pap, and cakes.",
      longDescription:
        "Dry granulated sugar, 1kg. We keep it off the floor. If the bag is open, fold it down so it doesn’t cake.",
      supplierId: sm,
      weightKg: 1,
    }),
    row("salt", "Iodised Salt 500g", "pantry", 250, "piece", 4, {
      sku: "SM-SLT-500",
      costPrice: 140,
      shortDescription: "Iodised salt, 500g. The shelf is low — ask if you need a case.",
      longDescription:
        "Fine iodised salt for the pot. Stock is thin this week; the next sack is on a draft purchase order.",
      supplierId: sm,
      reorderLevel: 12,
      weightKg: 0.5,
    }),
    row("plantain", "Ripe Plantain (bunch)", "fresh", 1500, "set", 10, {
      sku: "SM-PLT-BN",
      costPrice: 900,
      shortDescription: "A bunch of ripe plantain, ready to fry.",
      longDescription:
        "Yellow plantain, sweet enough for dodo. A bunch is what you see on the shelf — we don’t split fingers unless the bunch is bruised.",
      supplierId: fresh,
      tags: ["fresh"],
      trackExpiry: true,
      shelfLifeDays: 3,
      weightKg: 1.5,
    }),
    row("chicken", "Whole Chicken ~1.2kg", "dairy", 6500, "kg", 8, {
      sku: "SM-CHK-1",
      costPrice: 4900,
      shortDescription: "A whole dressed chicken, about 1.2kg, kept cold.",
      longDescription:
        "Dressed whole chicken from the cold room. Cook it the day you take it, or freeze it the same evening. We don’t refreeze thawed birds.",
      supplierId: fresh,
      tags: ["chilled"],
      trackExpiry: true,
      shelfLifeDays: 2,
      reorderLevel: 4,
      weightKg: 1.2,
    }),
    row("yogurt", "Drinkable Yogurt 500ml", "dairy", 1100, "piece", 18, {
      sku: "SM-YOG-500",
      costPrice: 720,
      compareAtPrice: 1300,
      shortDescription: "500ml sweet yogurt, kept in the chiller.",
      longDescription:
        "A 500ml bottle from the chiller. Check the date on the cap. It is sweet, not tart, and fine with chin-chin after school.",
      supplierId: fresh,
      tags: ["chilled"],
      trackExpiry: true,
      shelfLifeDays: 10,
      weightKg: 0.5,
    }),
    row("groundnut", "Roasted Groundnut 500g", "pantry", 1300, "set", 20, {
      sku: "SM-GNT-500",
      costPrice: 850,
      shortDescription: "Dry-roasted groundnut, 500g, no sugar added.",
      longDescription:
        "Roasted groundnut in a 500g pack. Salty enough to eat by the handful, or to soak with garri. It is vegan.",
      supplierId: sm,
      tags: ["vegan"],
      weightKg: 0.5,
    }),
    row("seasoning", "Seasoning Cubes (12)", "pantry", 450, "set", 32, {
      sku: "SM-SEA-12",
      costPrice: 280,
      shortDescription: "A strip of twelve seasoning cubes.",
      longDescription:
        "Twelve cubes in a strip. One is usually enough for a pot of rice. Keep the rest wrapped so they don’t go soft.",
      supplierId: sm,
      weightKg: 0.1,
    }),
    row("tissue", "Family Tissue (8 rolls)", "household", 2100, "set", 2, {
      sku: "SM-TIS-8",
      costPrice: 1400,
      shortDescription: "Eight rolls. We are down to the last packs.",
      longDescription:
        "An 8-roll family pack. Stock is below the reorder line — the draft purchase order covers the next delivery.",
      supplierId: sm,
      reorderLevel: 10,
      weightKg: 0.8,
    }),
    row("agege-loaf", "Agege-style Loaf", "bread", 900, "loaf", 16, {
      sku: "BK-AGEGE",
      costPrice: 420,
      shortDescription: "The soft, tall loaf. Baked this morning.",
      longDescription:
        "Our Agege-style loaf: soft crumb, thin crust, sliced only if you ask. It is the soft loaf most Kaduna kitchens mean by bread. Best the day it is baked.",
      supplierId: bake,
      tags: ["bestseller"],
      featured: true,
      trackExpiry: true,
      shelfLifeDays: 2,
      weightKg: 0.7,
    }),
    row("wheat-bread", "Wheat Bread", "bread", 1200, "loaf", 12, {
      sku: "BK-WHEAT",
      costPrice: 640,
      shortDescription: "A closer crumb, less sugar, still soft enough for breakfast.",
      longDescription:
        "Wheat loaf from the same oven as the Agege. It toasts well and holds an egg. We bake it every morning except Sunday, when the first tray is smaller.",
      supplierId: bake,
      featured: true,
      trackExpiry: true,
      shelfLifeDays: 3,
      weightKg: 0.65,
    }),
    row("meat-pie", "Meat Pie", "pastries", 700, "piece", 24, {
      sku: "BK-PIE",
      costPrice: 340,
      shortDescription: "Beef and potato in a short crust, sold warm until 2pm.",
      longDescription:
        "A hand pie with minced beef, potato, and a little pepper. The crust is short, not puff. After 2pm we sell what’s left at the same price — we don’t pretend it’s just out of the oven.",
      supplierId: bake,
      tags: ["bestseller"],
      featured: true,
      trackExpiry: true,
      shelfLifeDays: 1,
      weightKg: 0.18,
    }),
    row("doughnut", "Sugar Doughnut", "pastries", 400, "piece", 20, {
      sku: "BK-DOUGH",
      costPrice: 160,
      shortDescription: "A yeast doughnut rolled in sugar.",
      longDescription:
        "Fried in the morning, coated in sugar while warm. Fine with tea. They go soft by evening, which is honest.",
      supplierId: bake,
      trackExpiry: true,
      shelfLifeDays: 1,
      weightKg: 0.08,
    }),
    row("chin-chin", "Chin-chin 250g", "snacks", 800, "set", 18, {
      sku: "BK-CHIN",
      costPrice: 380,
      shortDescription: "Crunchy chin-chin, a 250g pack from our fryer.",
      longDescription:
        "Small, dry chin-chin in a 250g bag. It keeps better than the pies. Good in a lunch box or beside a cold yogurt.",
      supplierId: bake,
      tags: ["bestseller"],
      weightKg: 0.25,
    }),
    row("sausage-roll", "Sausage Roll", "pastries", 600, "piece", 22, {
      sku: "BK-SAUS",
      costPrice: 280,
      shortDescription: "A seasoned sausage wrapped in our short crust.",
      longDescription:
        "Not a frank from a packet alone — the filling is seasoned in the bakehouse. Best warm. We bake a second tray if the morning one sells through.",
      supplierId: bake,
      trackExpiry: true,
      shelfLifeDays: 1,
      weightKg: 0.15,
    }),
    row("vanilla-cupcake", "Vanilla Cupcake", "cakes", 500, "piece", 14, {
      sku: "BK-CUP",
      costPrice: 210,
      shortDescription: "A small vanilla sponge with a cap of buttercream.",
      longDescription:
        "One cupcake, vanilla sponge, not too sweet. The buttercream is plain — tell us if you need it without, and we’ll sell the sponge on its own when we can.",
      supplierId: bake,
      trackExpiry: true,
      shelfLifeDays: 2,
      weightKg: 0.09,
    }),
    row("birthday-cake", "Birthday Cake 8-inch", "cakes", 18000, "piece", 0, {
      sku: "BK-CAKE-8",
      costPrice: 9000,
      shortDescription: "An 8-inch butter sponge, made to order, one day ahead.",
      longDescription:
        "Eight-inch round, two layers of vanilla butter sponge, buttercream outside. Tell us the name and the date you need it. We need 24 hours, and orders for the next morning close in spirit at 4pm — the oven plan is written then. We don’t keep these on the shelf.",
      supplierId: bake,
      isMadeToOrder: true,
      leadTimeHours: 24,
      featured: true,
      reorderLevel: 0,
      weightKg: 1.4,
    }),
    row("croissants", "Butter Croissants (pair)", "pastries", 1500, "set", 10, {
      sku: "BK-CRO-2",
      costPrice: 700,
      shortDescription: "Two laminated croissants, baked before the shop opens.",
      longDescription:
        "A pair of butter croissants. The lamination is done the day before, the bake is early. They are flaky while they’re warm and still good by noon.",
      supplierId: bake,
      trackExpiry: true,
      shelfLifeDays: 1,
      weightKg: 0.16,
    }),
    row("meat-samosa", "Meat Samosa (3)", "snacks", 900, "set", 15, {
      sku: "BK-SAM-3",
      costPrice: 420,
      shortDescription: "Three spiced beef samosas.",
      longDescription:
        "A set of three baked samosas with minced beef, onion, and a little curry. They travel better than the pies if you’re taking them across town.",
      supplierId: bake,
      trackExpiry: true,
      shelfLifeDays: 1,
      weightKg: 0.2,
    }),
    row("sofa-3", "3-seater Sofa", "living", 185000, "piece", 2, {
      sku: "FN-SOFA-3",
      costPrice: 128000,
      shortDescription: "A firm three-seater in walnut-brown cloth.",
      longDescription:
        "Three seats, wooden legs, washable covers on request before we order the next one. Delivery is by our furniture van, not with the grocery bike. Assembly is not required — it arrives as one piece. Lead time on the road is from two days.",
      supplierId: walnut,
      featured: true,
      taxRate: 7.5,
      reorderLevel: 0,
      weightKg: 42,
      assemblyRequired: false,
    }),
    row("dining-4", "Dining Table for 4", "dining", 145000, "set", 1, {
      sku: "FN-DIN-4",
      costPrice: 98000,
      shortDescription: "A rectangular table and four chairs. Assembly on delivery.",
      longDescription:
        "Solid-look table for four, with chairs that stack if the room is small. The legs come off for the van. Tick assembly at checkout and the delivery team will fit them. We book furniture from two days out.",
      supplierId: walnut,
      taxRate: 7.5,
      assemblyRequired: true,
      reorderLevel: 0,
      weightKg: 38,
    }),
    row("office-chair", "Office Chair", "work", 48000, "piece", 4, {
      sku: "FN-CHAIR",
      costPrice: 31000,
      shortDescription: "A padded task chair with a walnut-tone base.",
      longDescription:
        "Height adjust, a simple tilt, and a base that matches the rest of the floor. It arrives in a box. Assembly is a few bolts — we can do it in the room.",
      supplierId: walnut,
      taxRate: 7.5,
      assemblyRequired: true,
      reorderLevel: 1,
      weightKg: 12,
    }),
    row("wardrobe", "Two-door Wardrobe", "bedroom", 210000, "piece", 1, {
      sku: "FN-WARD",
      costPrice: 146000,
      shortDescription: "A two-door wardrobe with a hanging rail and one shelf.",
      longDescription:
        "Tall wardrobe for a Kaduna bedroom that doesn’t have a walk-in. Doors are hinged, not sliding. It must be assembled in the room. Measure the doorway before you order — the panels are long.",
      supplierId: walnut,
      taxRate: 7.5,
      assemblyRequired: true,
      featured: true,
      reorderLevel: 0,
      weightKg: 55,
    }),
    row("coffee-table", "Coffee Table", "living", 42000, "piece", 3, {
      sku: "FN-COFFEE",
      costPrice: 26000,
      shortDescription: "A low table in a walnut finish, for the front of the sofa.",
      longDescription:
        "Rectangular coffee table, lower shelf for books. Legs bolt on. It pairs with the staff-pick novels more often than you’d think — people read in the parlour.",
      supplierId: walnut,
      taxRate: 7.5,
      assemblyRequired: true,
      featured: true,
      reorderLevel: 1,
      weightKg: 14,
    }),
    row("bed-frame", "Queen Bed Frame", "bedroom", 165000, "piece", 1, {
      sku: "FN-BED-Q",
      costPrice: 112000,
      shortDescription: "A queen frame in walnut tone. Mattress not included.",
      longDescription:
        "Queen slatted frame. We don’t sell mattresses. Assembly is required and is worth ticking — the slats need to be square or the mattress sags. Delivery from two days out.",
      supplierId: walnut,
      taxRate: 7.5,
      assemblyRequired: true,
      reorderLevel: 0,
      weightKg: 34,
    }),
    row("bookshelf", "Bookshelf", "living", 38000, "piece", 2, {
      sku: "FN-SHELF",
      costPrice: 23000,
      shortDescription: "Five open shelves, tall enough for novels and school books.",
      longDescription:
        "A slim bookshelf that fits beside a chair. It arrives flat. Assembly is straightforward. The bookstore staff will tell you it is the right width for paperbacks standing up.",
      supplierId: walnut,
      taxRate: 7.5,
      assemblyRequired: true,
      featured: true,
      reorderLevel: 0,
      weightKg: 18,
    }),
    row("tv-stand", "TV Stand", "living", 55000, "piece", 2, {
      sku: "FN-TV",
      costPrice: 34000,
      shortDescription: "A low stand for a modest television, with a closed shelf.",
      longDescription:
        "Low media stand, cable gap at the back, one closed cupboard. Assembly required. It is not a wall mount — the set sits on top.",
      supplierId: walnut,
      taxRate: 7.5,
      assemblyRequired: true,
      reorderLevel: 0,
      weightKg: 20,
    }),
    row("childrens-reader", "Children’s Reader: Amaka Goes to Market", "school", 2500, "piece", 11, {
      sku: "BK-READ-1",
      costPrice: 1400,
      shortDescription: "A picture reader for early primary, set on a Kaduna market day.",
      longDescription:
        "Short sentences, big type, and a story about a child sent to buy tomatoes and coming home with the right change. Teachers in Kaduna North use it for Primary 1 and 2.",
      supplierId: ink,
      tags: ["school"],
      featured: true,
      weightKg: 0.3,
    }),
    row("waec", "WAEC Past Questions", "school", 3500, "set", 9, {
      sku: "BK-WAEC",
      costPrice: 2100,
      shortDescription: "A bound set of recent WAEC papers with answer notes.",
      longDescription:
        "Past questions across the core papers, with short worked answers at the back. Not a promise of the next paper — a way to practise the timing.",
      supplierId: ink,
      tags: ["school", "bestseller"],
      weightKg: 0.7,
    }),
    row("novel-lagos", "Novel: The Light on Isa Kaita Road", "fiction", 4200, "piece", 7, {
      sku: "BK-KAITA",
      costPrice: 2400,
      shortDescription: "A Kaduna neighbourhood novel. Staff pick this month.",
      longDescription:
        "A quiet novel about a street that looks like ours: a shop, a church, a generator, and a family deciding whether to stay. The bookstore desk keeps a copy face-out.",
      supplierId: ink,
      tags: ["bestseller"],
      featured: true,
      weightKg: 0.35,
    }),
    row("cookbook", "Cookbook: Pots from Isa Kaita", "reference", 6800, "piece", 6, {
      sku: "BK-POTS",
      costPrice: 3900,
      shortDescription: "Stews and small chops, written for the ingredients we actually sell.",
      longDescription:
        "Recipes that start from ofada, palm oil, plantain, and the pies if you are tired. Measurements are in cups and mudus, not only grams. It sits well on the coffee table.",
      supplierId: ink,
      featured: true,
      weightKg: 0.6,
    }),
    row("notebook-set", "Notebook Set (5)", "stationery", 1800, "set", 20, {
      sku: "BK-NOTE-5",
      costPrice: 980,
      shortDescription: "Five ruled notebooks, A5, for class or the shop.",
      longDescription:
        "Five A5 ruled books with a stiff cover. They are on the Primary 4 list and they are also what we use at the till for the day’s notes.",
      supplierId: ink,
      tags: ["school"],
      weightKg: 0.7,
    }),
    row("atlas", "Student Atlas", "reference", 5500, "piece", 5, {
      sku: "BK-ATLAS",
      costPrice: 3200,
      shortDescription: "A school atlas with Nigeria and the world, current enough for class.",
      longDescription:
        "Maps a secondary student can actually read. Nigeria is given proper pages, not a corner. It is on several school lists even when the title changes slightly.",
      supplierId: ink,
      tags: ["school"],
      weightKg: 0.5,
    }),
    row("coloring-book", "Colouring Book: Kaduna Streets", "school", 2200, "piece", 13, {
      sku: "BK-COLOUR",
      costPrice: 1100,
      shortDescription: "Line drawings of keke, market stalls, and compound gates.",
      longDescription:
        "A colouring book for children who already know these streets. Paper is thick enough for pencil. Crayons are not included.",
      supplierId: ink,
      tags: ["school"],
      weightKg: 0.25,
    }),
    row("business-pb", "Business Paperback: Keep the Shop Open", "fiction", 3900, "piece", 8, {
      sku: "BK-SHOP",
      costPrice: 2100,
      shortDescription: "A plain-spoken paperback about running one shop, not a chain.",
      longDescription:
        "Cash, credit, and the neighbour who wants goods until Friday. It is filed under fiction because the author insists the characters are invented. The advice is still useful.",
      supplierId: ink,
      weightKg: 0.32,
    }),
    row("exercise-books", "Exercise Books (pack of 10)", "stationery", 1500, "set", 26, {
      sku: "BK-EX-10",
      costPrice: 820,
      shortDescription: "Ten 40-leaf exercise books, the blue covers schools expect.",
      longDescription:
        "A pack of ten. Primary 4 Term 1 on our list asks for two packs. The ruling is the standard school ruling, not graph.",
      supplierId: ink,
      tags: ["school", "bestseller"],
      featured: true,
      reorderLevel: 8,
      weightKg: 0.9,
    }),
    row("staff-novel", "Staff pick: Rain over the Kaduna River", "fiction", 4500, "piece", 6, {
      sku: "BK-RAIN",
      costPrice: 2600,
      shortDescription: "The other novel on the desk this month. A drive, a storm, a decision.",
      longDescription:
        "Shorter than Isa Kaita Road, and wetter. If you only want one book, the desk will still talk you into this one when it is raining. We keep a handful face-out.",
      supplierId: ink,
      featured: true,
      weightKg: 0.3,
    }),
  ];
}

function line(
  products: Product[],
  id: string,
  qty: number,
  extra: Partial<OrderLine> = {},
): OrderLine {
  const product = products.find((entry) => entry.id === id);
  if (!product) throw new Error(`Missing product ${id}`);
  return {
    productId: product.id,
    name: product.name,
    qty,
    unitPrice: product.price,
    departmentId: product.departmentId,
    ...extra,
  };
}

function sumLines(lines: OrderLine[]) {
  return lines.reduce((sum, entry) => sum + entry.unitPrice * entry.qty, 0);
}

export interface SeedData {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  promotions: Promotion[];
  ledger: LoyaltyLedger[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  bakeryJobs: BakeryJob[];
  deliveryJobs: DeliveryJob[];
  schoolLists: SchoolList[];
  settings: Settings;
  stockLog: StockMovement[];
  nextOrderSeq: number;
  nextPoSeq: number;
}

export function createSeed(): SeedData {
  const today = lagosDateString();
  const yesterday = addDays(today, -1);
  const twoAgo = addDays(today, -2);
  const tomorrow = addDays(today, 1);
  const products = buildProducts();
  const settings: Settings = {
    storeName: "Dalema",
    address: "No. 70 Isa Kaita Road, Ungwan Munchi, Kaduna North",
    phone: "+234 816 5510 842",
    hours: "Monday to Saturday 8:00–20:00 · Sunday 10:00–16:00 · Bakery counter from 7:00",
    zones: [
      { id: "z-near", name: "Kaduna North", minKm: 0, maxKm: 3, fee: 800, minimum: 3000 },
      { id: "z-mid", name: "Barnawa, Kawo & Sabon Tasha", minKm: 3, maxKm: 7, fee: 1500, minimum: 5000 },
    ],
    earnNairaPerPoint: 100,
    nairaPer100Points: 500,
    minRedeemPoints: 200,
    bannerText: "Loaves are out of the oven. An 8-inch cake needs a full day.",
    furnitureDeliveryFee: 2500,
  };

  const customers: Customer[] = [
    {
      id: "cus_amaka",
      name: "Amaka Obi",
      phone: "0803 441 2290",
      email: "amaka.obi@email.com",
      addresses: [
        {
          id: "ad_amaka",
          label: "Home",
          line: "22 Isa Kaita Road",
          area: "Ungwan Rimi",
          zoneId: "z-near",
        },
      ],
      loyaltyPoints: 640,
      tier: "Sprout",
      referralCode: "AMAKA-DL",
      joinedAt: "2025-11-02T10:00:00+01:00",
      wishlist: ["cookbook", "wheat-bread"],
    },
    {
      id: "cus_chinedu",
      name: "Chinedu Eze",
      phone: "0805 220 1184",
      email: "chinedu.eze@email.com",
      addresses: [
        { id: "ad_chi", label: "Home", line: "8 Umaru Dikko Road", area: "Malali", zoneId: "z-near" },
      ],
      loyaltyPoints: 120,
      tier: "Seed",
      referralCode: "CHIN-DL",
      joinedAt: "2026-01-14T10:00:00+01:00",
      wishlist: ["birthday-cake"],
    },
    {
      id: "cus_fatima",
      name: "Fatima Bello",
      phone: "0816 330 9044",
      email: "fatima.bello@email.com",
      addresses: [
        { id: "ad_fat", label: "Flat", line: "15 Barnawa Close", area: "Barnawa", zoneId: "z-mid" },
      ],
      loyaltyPoints: 1620,
      tier: "Harvest",
      referralCode: "FATI-DL",
      joinedAt: "2025-06-20T10:00:00+01:00",
      wishlist: ["sofa-3"],
    },
    {
      id: "cus_tunde",
      name: "Tunde Adeyemi",
      phone: "0802 776 4510",
      email: "tunde.adeyemi@email.com",
      addresses: [
        { id: "ad_tun", label: "Home", line: "4 Katuru Road", area: "Sabon Tasha", zoneId: "z-mid" },
      ],
      loyaltyPoints: 80,
      tier: "Seed",
      referralCode: "TUND-DL",
      joinedAt: "2026-03-02T10:00:00+01:00",
      wishlist: [],
    },
    {
      id: "cus_ngozi",
      name: "Ngozi Okonkwo",
      phone: "0703 118 6621",
      email: "ngozi.okonkwo@email.com",
      addresses: [
        { id: "ad_ngo", label: "Home", line: "19 Alkali Road", area: "Kabala", zoneId: "z-near" },
      ],
      loyaltyPoints: 450,
      tier: "Seed",
      referralCode: "NGOZ-DL",
      joinedAt: "2026-02-11T10:00:00+01:00",
      wishlist: ["exercise-books", "waec"],
    },
    {
      id: "cus_ibrahim",
      name: "Ibrahim Lawal",
      phone: "0813 900 2275",
      email: "ibrahim.lawal@email.com",
      addresses: [
        { id: "ad_ibr", label: "Shop", line: "3 Constitution Road", area: "Kaduna North", zoneId: "z-near" },
      ],
      loyaltyPoints: 900,
      tier: "Sprout",
      referralCode: "IBRA-DL",
      joinedAt: "2025-09-09T10:00:00+01:00",
      wishlist: [],
    },
    {
      id: "cus_seyi",
      name: "Seyi Balogun",
      phone: "0809 554 7730",
      email: "seyi.balogun@email.com",
      addresses: [
        { id: "ad_sey", label: "Home", line: "27 Ibrahim Taiwo Road", area: "Ungwan Rimi", zoneId: "z-near" },
      ],
      loyaltyPoints: 2100,
      tier: "Harvest",
      referralCode: "SEYI-DL",
      joinedAt: "2025-04-18T10:00:00+01:00",
      wishlist: ["staff-novel"],
    },
    {
      id: "cus_halima",
      name: "Halima Yusuf",
      phone: "0812 667 3408",
      email: "halima.yusuf@email.com",
      addresses: [
        { id: "ad_hal", label: "Home", line: "6 Kachia Road", area: "Kakuri", zoneId: "z-mid" },
      ],
      loyaltyPoints: 40,
      tier: "Seed",
      referralCode: "HALI-DL",
      joinedAt: "2026-08-01T10:00:00+01:00",
      wishlist: [],
    },
  ];

  const l1042 = [
    line(products, "ofada-rice-5kg", 1),
    line(products, "palm-oil", 1),
    line(products, "agege-loaf", 1),
    line(products, "farm-eggs", 1),
  ];
  const l1043 = [
    line(products, "birthday-cake", 1, {
      cakeDate: tomorrow,
      specialInstructions: "Happy birthday Zara — blue writing",
    }),
    line(products, "meat-pie", 6),
  ];
  const l1044 = [line(products, "sofa-3", 1, { assembly: false })];
  const l1045 = [
    line(products, "exercise-books", 2),
    line(products, "childrens-reader", 1),
    line(products, "waec", 1),
  ];
  const l1046 = [
    line(products, "chicken", 1),
    line(products, "tomatoes", 1),
    line(products, "coffee-table", 1, { assembly: true }),
  ];
  const l1047 = [
    line(products, "bottled-water", 1),
    line(products, "agege-loaf", 1),
    line(products, "exercise-books", 1),
  ];

  const pack = (
    partial: Omit<Order, "breakdown" | "subtotal" | "discount" | "total" | "promoDiscount" | "loyaltyDiscount"> & {
      lines: OrderLine[];
      promoDiscount?: number;
      loyaltyDiscount?: number;
    },
  ): Order => {
    const subtotal = sumLines(partial.lines);
    const promoDiscount = partial.promoDiscount ?? 0;
    const loyaltyDiscount = partial.loyaltyDiscount ?? 0;
    const discount = promoDiscount + loyaltyDiscount;
    const total = subtotal + partial.deliveryFee - discount;
    const breakdownMap = new Map<string, { subtotal: number; qty: number }>();
    for (const entry of partial.lines) {
      const current = breakdownMap.get(entry.departmentId) ?? { subtotal: 0, qty: 0 };
      current.subtotal += entry.unitPrice * entry.qty;
      current.qty += entry.qty;
      breakdownMap.set(entry.departmentId, current);
    }
    return {
      ...partial,
      subtotal,
      promoDiscount,
      loyaltyDiscount,
      discount,
      total,
      breakdown: [...breakdownMap.entries()].map(([departmentId, value]) => ({
        departmentId: departmentId as Order["breakdown"][number]["departmentId"],
        subtotal: value.subtotal,
        qty: value.qty,
      })),
    };
  };

  const orders: Order[] = [
    pack({
      id: "ord_1042",
      number: "DL-1042",
      customerId: "cus_amaka",
      contactName: "Amaka Obi",
      contactPhone: "0803 441 2290",
      contactEmail: "amaka.obi@email.com",
      channel: "web",
      status: "completed",
      fulfillment: "delivery",
      groceryMethod: "delivery",
      slot: `${today} · afternoon (12–5)`,
      furnitureSlot: null,
      address: "22 Isa Kaita Road, Ungwan Rimi",
      zoneId: "z-near",
      lines: l1042,
      deliveryFee: 800,
      paymentStatus: "paid_demo",
      notes: "Leave with the gateman if I’m on the school run.",
      promoCode: null,
      pointsRedeemed: 0,
      stockDeducted: true,
      pointsAwarded: true,
      assemblyRequired: false,
      createdAt: atLagos(today, "09:40:00"),
    }),
    pack({
      id: "ord_1043",
      number: "DL-1043",
      customerId: "cus_chinedu",
      contactName: "Chinedu Eze",
      contactPhone: "0805 220 1184",
      contactEmail: "chinedu.eze@email.com",
      channel: "web",
      status: "confirmed",
      fulfillment: "pickup",
      groceryMethod: "pickup",
      slot: `${tomorrow} · morning (9–12)`,
      furnitureSlot: null,
      address: null,
      zoneId: null,
      lines: l1043,
      deliveryFee: 0,
      paymentStatus: "paid_demo",
      notes: "Cake is for tomorrow morning. Pies can come with it.",
      promoCode: null,
      pointsRedeemed: 0,
      stockDeducted: true,
      pointsAwarded: false,
      assemblyRequired: false,
      createdAt: atLagos(today, "11:05:00"),
    }),
    pack({
      id: "ord_1044",
      number: "DL-1044",
      customerId: "cus_fatima",
      contactName: "Fatima Bello",
      contactPhone: "0816 330 9044",
      contactEmail: "fatima.bello@email.com",
      channel: "web",
      status: "out_for_delivery",
      fulfillment: "furniture_delivery",
      groceryMethod: null,
      slot: null,
      furnitureSlot: `${today} · afternoon (12–5)`,
      address: "15 Barnawa Close, Barnawa",
      zoneId: "z-mid",
      lines: l1044,
      deliveryFee: 2500,
      paymentStatus: "paid_demo",
      notes: "Call when the van is ten minutes out. Third floor, no lift.",
      promoCode: null,
      pointsRedeemed: 0,
      stockDeducted: true,
      pointsAwarded: false,
      assemblyRequired: false,
      createdAt: atLagos(today, "08:10:00"),
    }),
    pack({
      id: "ord_1045",
      number: "DL-1045",
      customerId: "cus_ngozi",
      contactName: "Ngozi Okonkwo",
      contactPhone: "0703 118 6621",
      contactEmail: "ngozi.okonkwo@email.com",
      channel: "web",
      status: "pending",
      fulfillment: "pickup",
      groceryMethod: "pickup",
      slot: `${tomorrow} · morning (9–12)`,
      furnitureSlot: null,
      address: null,
      zoneId: null,
      lines: l1045,
      deliveryFee: 0,
      paymentStatus: "unpaid",
      notes: "Primary 4 extras, not the full list.",
      promoCode: null,
      pointsRedeemed: 0,
      stockDeducted: false,
      pointsAwarded: false,
      assemblyRequired: false,
      createdAt: atLagos(yesterday, "16:20:00"),
    }),
    pack({
      id: "ord_1046",
      number: "DL-1046",
      customerId: "cus_tunde",
      contactName: "Tunde Adeyemi",
      contactPhone: "0802 776 4510",
      contactEmail: "tunde.adeyemi@email.com",
      channel: "web",
      status: "completed",
      fulfillment: "delivery",
      groceryMethod: "delivery",
      slot: `${twoAgo} · afternoon (12–5)`,
      furnitureSlot: `${twoAgo} · afternoon (12–5)`,
      address: "4 Katuru Road, Sabon Tasha",
      zoneId: "z-mid",
      lines: l1046,
      deliveryFee: 2500,
      paymentStatus: "paid_demo",
      notes: "Chicken with the groceries. Table came the same window.",
      promoCode: null,
      pointsRedeemed: 0,
      stockDeducted: true,
      pointsAwarded: true,
      assemblyRequired: true,
      createdAt: atLagos(twoAgo, "13:15:00"),
    }),
    pack({
      id: "ord_1047",
      number: "DL-1047",
      customerId: "cus_seyi",
      contactName: "Seyi Balogun",
      contactPhone: "0809 554 7730",
      contactEmail: "seyi.balogun@email.com",
      channel: "pos",
      status: "completed",
      fulfillment: "pickup",
      groceryMethod: "pickup",
      slot: "Walk-in till",
      furnitureSlot: null,
      address: null,
      zoneId: null,
      lines: l1047,
      deliveryFee: 0,
      paymentStatus: "paid_demo",
      notes: "Walk-in till",
      promoCode: null,
      pointsRedeemed: 0,
      stockDeducted: true,
      pointsAwarded: true,
      assemblyRequired: false,
      createdAt: atLagos(today, "12:25:00"),
    }),
  ];

  const suppliers: Supplier[] = [
    {
      id: "sup_mill",
      name: "Kaduna Mill & Staples",
      departmentIds: ["supermarket"],
      phone: "0802 111 2201",
      leadDays: 2,
    },
    {
      id: "sup_fresh",
      name: "Central Market Fresh Desk",
      departmentIds: ["supermarket"],
      phone: "0803 414 7781",
      leadDays: 1,
    },
    {
      id: "sup_bake",
      name: "Bakehouse Ingredients",
      departmentIds: ["bakery"],
      phone: "0806 225 0199",
      leadDays: 1,
    },
    {
      id: "sup_walnut",
      name: "Walnut Yard Workshop",
      departmentIds: ["furniture"],
      phone: "0811 640 3380",
      leadDays: 14,
    },
    {
      id: "sup_ink",
      name: "Ink & Paper Co.",
      departmentIds: ["bookstore"],
      phone: "0809 772 4416",
      leadDays: 5,
    },
  ];

  const promotions: Promotion[] = [
    {
      id: "promo_welcome",
      code: "WELCOME10",
      type: "percent",
      value: 10,
      minSpend: 3000,
      departmentIds: [],
      startsAt: "2026-01-01T00:00:00+01:00",
      endsAt: "2026-12-31T23:59:59+01:00",
      active: true,
      label: "10% off a shop from ₦3,000",
    },
    {
      id: "promo_bake",
      code: "BAKE5",
      type: "fixed",
      value: 500,
      minSpend: 2000,
      departmentIds: ["bakery"],
      startsAt: "2026-01-01T00:00:00+01:00",
      endsAt: "2026-12-31T23:59:59+01:00",
      active: true,
      label: "₦500 off bakery from ₦2,000",
    },
    {
      id: "promo_readers",
      code: "READERS",
      type: "percent",
      value: 10,
      minSpend: 2000,
      departmentIds: ["bookstore"],
      startsAt: "2026-01-01T00:00:00+01:00",
      endsAt: "2026-12-31T23:59:59+01:00",
      active: true,
      label: "10% off books and stationery from ₦2,000",
    },
  ];

  const ledger: LoyaltyLedger[] = [
    {
      id: "led_1",
      customerId: "cus_amaka",
      points: 500,
      reason: "Opening balance when the card started",
      createdAt: "2025-11-02T10:00:00+01:00",
    },
    {
      id: "led_2",
      customerId: "cus_amaka",
      points: 179,
      reason: "Points from DL-1042",
      orderId: "ord_1042",
      createdAt: atLagos(today, "15:10:00"),
    },
    {
      id: "led_3",
      customerId: "cus_seyi",
      points: 48,
      reason: "Points from DL-1047",
      orderId: "ord_1047",
      createdAt: atLagos(today, "12:26:00"),
    },
    {
      id: "led_4",
      customerId: "cus_fatima",
      points: 400,
      reason: "Referral thanks",
      createdAt: "2026-04-02T10:00:00+01:00",
    },
  ];

  const purchaseOrders: PurchaseOrder[] = [
    {
      id: "po_1001",
      number: "PO-1001",
      supplierId: "sup_mill",
      status: "draft",
      lines: [
        { productId: "salt", name: "Iodised Salt 500g", qty: 24, cost: 140 },
        { productId: "tissue", name: "Family Tissue (8 rolls)", qty: 12, cost: 1400 },
      ],
      expectedDate: addDays(today, 2),
      createdAt: atLagos(today, "08:05:00"),
    },
  ];

  const jobs: Array<[string, number, number, number, BakeryJob["source"]]> = [
    ["agege-loaf", 20, 12, 1, "forecast"],
    ["wheat-bread", 10, 4, 0, "forecast"],
    ["meat-pie", 30, 0, 0, "forecast"],
    ["doughnut", 18, 18, 2, "forecast"],
    ["chin-chin", 12, 8, 0, "forecast"],
    ["sausage-roll", 16, 0, 0, "forecast"],
    ["meat-pie", 6, 0, 0, "preorder"],
  ];
  const bakeryJobs: BakeryJob[] = jobs.map(([productId, qtyPlanned, qtyBaked, qtyWaste, source], index) => ({
    id: `job_${index + 1}`,
    date: today,
    productId,
    qtyPlanned,
    qtyBaked,
    qtyWaste,
    source,
  }));

  const deliveryJobs: DeliveryJob[] = [
    {
      id: "dj_1042",
      orderId: "ord_1042",
      type: "grocery",
      window: `${today} · afternoon (12–5)`,
      address: "22 Isa Kaita Road, Ungwan Rimi",
      status: "delivered",
      assemblyRequired: false,
    },
    {
      id: "dj_1044",
      orderId: "ord_1044",
      type: "furniture",
      window: `${today} · afternoon (12–5)`,
      address: "15 Barnawa Close, Barnawa",
      status: "scheduled",
      assemblyRequired: false,
    },
    {
      id: "dj_1046f",
      orderId: "ord_1046",
      type: "furniture",
      window: `${twoAgo} · afternoon (12–5)`,
      address: "4 Katuru Road, Sabon Tasha",
      status: "delivered",
      assemblyRequired: true,
    },
    {
      id: "dj_1046g",
      orderId: "ord_1046",
      type: "grocery",
      window: `${twoAgo} · afternoon (12–5)`,
      address: "4 Katuru Road, Sabon Tasha",
      status: "delivered",
      assemblyRequired: false,
    },
  ];

  const schoolLists: SchoolList[] = [
    {
      id: "sch_p4t1",
      name: "Primary 4 Term 1",
      items: [
        { productId: "exercise-books", qty: 2 },
        { productId: "notebook-set", qty: 1 },
        { productId: "childrens-reader", qty: 1 },
        { productId: "coloring-book", qty: 1 },
        { productId: "atlas", qty: 1 },
      ],
    },
  ];

  const stockLog: StockMovement[] = [
    {
      id: "mv_salt",
      productId: "salt",
      delta: -8,
      reason: "count",
      note: "Saturday count. Shelf is thinner than the book.",
      createdAt: atLagos(yesterday, "19:10:00"),
    },
  ];

  customers.forEach((customer) => {
    customer.tier = tierFor(customer.loyaltyPoints);
  });

  return {
    products,
    customers,
    orders,
    promotions,
    ledger,
    suppliers,
    purchaseOrders,
    bakeryJobs,
    deliveryJobs,
    schoolLists,
    settings,
    stockLog,
    nextOrderSeq: 1048,
    nextPoSeq: 1002,
  };
}
