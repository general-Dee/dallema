import type { ReactNode } from "react";
import type { DeptId } from "@/lib/types";

export function ProductMark({ id, departmentId }: { id: string; departmentId: DeptId }) {
  return (
    <svg viewBox="0 0 200 160" className="w-[78%] max-w-[280px]" aria-hidden="true">
      <circle cx="100" cy="82" r="64" fill="#f7f3ea" opacity="0.72" />
      <ellipse cx="100" cy="146" rx="52" ry="6" fill="#1c1915" opacity="0.16" />
      {draw(id, departmentId)}
    </svg>
  );
}

function draw(id: string, departmentId: DeptId): ReactNode {
  switch (id) {
    case "ofada-rice-5kg":
      return <Sack fill="#1f4d3a" tie="#c9862a" label="5kg" grains="#efe8d8" />;
    case "ijebu-garri":
      return <Sack fill="#c9862a" tie="#8a5a16" label="2kg" grains="#f8ecd9" />;
    case "bread-flour":
      return <Sack fill="#f4efe6" tie="#1f4d3a" label="Flour" grains="#c9862a" />;
    case "sugar":
      return <Sack fill="#f7f3ea" tie="#6b4f3a" label="Sugar" grains="#ffffff" />;
    case "palm-oil":
      return <Bottle liquid="#b8432f" cap="#6b4f3a" />;
    case "yogurt":
      return <Bottle liquid="#f3d7a4" cap="#1f4d3a" />;
    case "peak-milk":
      return <Tin body="#2c4c6e" lid="#d7e4f2" label="Milk" />;
    case "tin-tomatoes":
      return <Tin body="#a33b32" lid="#f4efe6" label="Tin" />;
    case "farm-eggs":
      return <EggCrate />;
    case "tomatoes":
      return <Tomatoes />;
    case "onions":
      return <Onions />;
    case "plantain":
      return <Plantain />;
    case "bottled-water":
      return <WaterPack />;
    case "detergent":
      return <Box fill="#1f4d3a" face="#e5f0ea" label="Wash" />;
    case "tissue":
      return <Tissue />;
    case "spaghetti":
      return <Pasta />;
    case "salt":
      return <Shaker />;
    case "chicken":
      return <Chicken />;
    case "groundnut":
      return <NutCone />;
    case "seasoning":
      return <Cubes />;
    case "agege-loaf":
      return <Loaf fill="#e7c27a" crust="#c9862a" scores={4} />;
    case "wheat-bread":
      return <Loaf fill="#c4a574" crust="#6b4f3a" scores={3} sliced />;
    case "meat-pie":
      return <Pie />;
    case "doughnut":
      return <Doughnut />;
    case "chin-chin":
      return <Chinchin />;
    case "sausage-roll":
      return <Roll />;
    case "vanilla-cupcake":
      return <Cupcake />;
    case "birthday-cake":
      return <Cake />;
    case "croissants":
      return <Croissants />;
    case "meat-samosa":
      return <Samosa />;
    case "sofa-3":
      return <Sofa />;
    case "dining-4":
      return <Dining />;
    case "office-chair":
      return <Chair />;
    case "wardrobe":
      return <Wardrobe />;
    case "coffee-table":
      return <CoffeeTable />;
    case "bed-frame":
      return <Bed />;
    case "bookshelf":
      return <Shelf />;
    case "tv-stand":
      return <TvStand />;
    case "childrens-reader":
      return <OpenBook left="#f8ecd9" right="#e5f0ea" title="Amaka" />;
    case "atlas":
      return <OpenBook left="#d7e4f2" right="#e7f0e4" title="Atlas" />;
    case "waec":
      return <BookStack />;
    case "novel-lagos":
      return <StandingBook cover="#243044" title="Kaita" />;
    case "cookbook":
      return <StandingBook cover="#8c3a2f" title="Pots" />;
    case "notebook-set":
      return <Notebooks />;
    case "coloring-book":
      return <StandingBook cover="#c9862a" title="Kaduna" pencil />;
    case "business-pb":
      return <StandingBook cover="#1f4d3a" title="Shop" />;
    case "exercise-books":
      return <ExerciseBooks />;
    case "staff-novel":
      return <StandingBook cover="#16382a" title="Rain" />;
    default:
      if (departmentId === "bakery") return <Loaf fill="#e7c27a" crust="#c9862a" scores={3} />;
      if (departmentId === "furniture") return <Sofa />;
      if (departmentId === "bookstore") return <StandingBook cover="#243044" title="Book" />;
      return <Sack fill="#1f4d3a" tie="#c9862a" label="Shop" grains="#efe8d8" />;
  }
}

function Label({ y = 96, children, fill = "#1c1915" }: { y?: number; children: string; fill?: string }) {
  return (
    <text
      x="100"
      y={y}
      textAnchor="middle"
      fill={fill}
      fontFamily="Outfit, sans-serif"
      fontSize="12"
      fontWeight="700"
    >
      {children}
    </text>
  );
}

function Sack({ fill, tie, label, grains }: { fill: string; tie: string; label: string; grains: string }) {
  return (
    <g>
      <path d="M70 54c2-18 16-26 30-26s28 8 30 26l12 70c0 12-16 18-42 18s-42-6-42-18z" fill={fill} />
      <path d="M78 52c8-10 36-10 44 0" fill="none" stroke={tie} strokeWidth="5" strokeLinecap="round" />
      <path d="M88 34c4-8 20-8 24 0" fill="none" stroke={tie} strokeWidth="4" strokeLinecap="round" />
      <rect x="76" y="82" width="48" height="22" rx="4" fill="#f7f3ea" />
      <Label y={97}>{label}</Label>
      <circle cx="78" cy="128" r="3" fill={grains} />
      <circle cx="92" cy="132" r="2.5" fill={grains} />
      <circle cx="108" cy="128" r="3" fill={grains} />
      <circle cx="122" cy="132" r="2.5" fill={grains} />
    </g>
  );
}

function Bottle({ liquid, cap }: { liquid: string; cap: string }) {
  return (
    <g>
      <rect x="88" y="28" width="24" height="16" rx="3" fill={cap} />
      <path d="M84 44h32l6 16v62c0 10-10 14-22 14s-22-4-22-14V60z" fill="#fffdf8" stroke="#1c1915" strokeWidth="2" />
      <path d="M78 78h44v44c0 10-10 14-22 14s-22-4-22-14z" fill={liquid} />
      <path d="M90 52h8" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    </g>
  );
}

function Tin({ body, lid, label }: { body: string; lid: string; label: string }) {
  return (
    <g>
      <path d="M64 52v64c0 12 16 18 36 18s36-6 36-18V52" fill={body} />
      <ellipse cx="100" cy="52" rx="36" ry="12" fill={lid} />
      <ellipse cx="100" cy="52" rx="20" ry="6" fill="#ffffff" opacity="0.45" />
      <rect x="76" y="84" width="48" height="20" rx="3" fill="#f7f3ea" />
      <Label y={98}>{label}</Label>
    </g>
  );
}

function EggCrate() {
  return (
    <g>
      <path d="M42 70h116l-8 48c-1 6-8 10-16 10H66c-8 0-15-4-16-10z" fill="#c9862a" />
      <path d="M48 78h104l-6 36H54z" fill="#f8ecd9" />
      {[0, 1, 2].map((col) =>
        [0, 1].map((row) => (
          <ellipse key={`${col}-${row}`} cx={70 + col * 30} cy={92 + row * 22} rx="11" ry="8" fill="#f4efe6" stroke="#e7c27a" />
        )),
      )}
    </g>
  );
}

function Tomatoes() {
  return (
    <g>
      <circle cx="78" cy="96" r="26" fill="#c4533a" />
      <circle cx="118" cy="100" r="28" fill="#a33b32" />
      <circle cx="100" cy="74" r="22" fill="#d4654e" />
      <path d="M92 58c6 6 12 6 18 0" fill="none" stroke="#1f4d3a" strokeWidth="4" strokeLinecap="round" />
      <path d="M100 58v10" stroke="#1f4d3a" strokeWidth="3" />
    </g>
  );
}

function Onions() {
  return (
    <g>
      <ellipse cx="78" cy="100" rx="26" ry="32" fill="#d7a07a" />
      <ellipse cx="118" cy="104" rx="28" ry="30" fill="#c9862a" />
      <path d="M74 72c8-16 20-10 16 4M114 76c10-18 22-8 12 6" fill="none" stroke="#6b4f3a" strokeWidth="3" />
      <path d="M70 96h16M108 102h18" stroke="#f7f3ea" strokeWidth="2" opacity="0.7" />
    </g>
  );
}

function Plantain() {
  return (
    <g>
      <path d="M70 40c18 10 28 36 24 78-10-6-28-20-36-48 2-12 6-24 12-30z" fill="#e6b325" />
      <path d="M96 44c16 8 26 34 22 74-12-4-30-20-36-50 4-10 8-18 14-24z" fill="#c9862a" />
      <path d="M118 50c14 10 18 36 10 66-10-8-24-22-28-46 4-8 10-16 18-20z" fill="#f3d36b" />
      <path d="M86 48c10 16 14 40 8 62M108 54c8 16 10 36 4 54" fill="none" stroke="#8a5a16" strokeWidth="2" opacity="0.45" />
    </g>
  );
}

function WaterPack() {
  return (
    <g>
      <rect x="46" y="78" width="108" height="48" rx="6" fill="#7eb6d6" opacity="0.85" />
      {[0, 1, 2].map((index) => (
        <g key={index} transform={`translate(${index * 34} 0)`}>
          <rect x="58" y="36" width="16" height="10" rx="2" fill="#2c4c6e" />
          <rect x="54" y="46" width="24" height="70" rx="6" fill="#f7fbff" stroke="#2c4c6e" strokeWidth="2" />
          <rect x="58" y="70" width="16" height="28" rx="2" fill="#7eb6d6" />
        </g>
      ))}
    </g>
  );
}

function Box({ fill, face, label }: { fill: string; face: string; label: string }) {
  return (
    <g>
      <path d="M48 64l52-22 52 22v58l-52 18-52-18z" fill={fill} />
      <path d="M48 64l52 20 52-20-52-22z" fill={face} />
      <path d="M100 84v56" stroke="#1c1915" strokeWidth="2" opacity="0.25" />
      <Label y={78} fill="#1c1915">
        {label}
      </Label>
      <circle cx="78" cy="108" r="6" fill="#ffffff" opacity="0.35" />
      <circle cx="96" cy="116" r="8" fill="#ffffff" opacity="0.28" />
      <circle cx="118" cy="108" r="5" fill="#ffffff" opacity="0.35" />
    </g>
  );
}

function Tissue() {
  return (
    <g>
      <rect x="48" y="70" width="104" height="52" rx="8" fill="#f7f3ea" stroke="#6b4f3a" strokeWidth="3" />
      <ellipse cx="100" cy="96" rx="22" ry="16" fill="#efe8d8" stroke="#6b4f3a" strokeWidth="3" />
      <path d="M92 90c6 8 12 8 16-2" fill="none" stroke="#c9862a" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Pasta() {
  return (
    <g>
      {[0, 1, 2, 3, 4, 5, 6].map((index) => (
        <path
          key={index}
          d={`M${62 + index * 12} 40c2 30-2 50 4 84`}
          fill="none"
          stroke="#e6b325"
          strokeWidth="5"
          strokeLinecap="round"
        />
      ))}
      <path d="M58 78h88" stroke="#8c3a2f" strokeWidth="6" strokeLinecap="round" />
    </g>
  );
}

function Shaker() {
  return (
    <g>
      <rect x="78" y="28" width="44" height="12" rx="3" fill="#2c4c6e" />
      <circle cx="90" cy="34" r="1.6" fill="#f7f3ea" />
      <circle cx="100" cy="34" r="1.6" fill="#f7f3ea" />
      <circle cx="110" cy="34" r="1.6" fill="#f7f3ea" />
      <path d="M74 48h52l-6 74c-1 6-8 10-20 10s-19-4-20-10z" fill="#f7f3ea" stroke="#2c4c6e" strokeWidth="3" />
      <Label y={96} fill="#2c4c6e">
        Salt
      </Label>
    </g>
  );
}

function Chicken() {
  return (
    <g>
      <ellipse cx="108" cy="100" rx="40" ry="28" fill="#f4efe6" stroke="#6b4f3a" strokeWidth="3" />
      <circle cx="70" cy="88" r="18" fill="#f4efe6" stroke="#6b4f3a" strokeWidth="3" />
      <path d="M58 80c-8-10-4-18 4-16 2 6 2 12 0 16z" fill="#c4533a" />
      <path d="M54 92h16" stroke="#c9862a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="66" cy="86" r="2" fill="#1c1915" />
      <path d="M96 124c-2 12 6 16 10 8M124 122c2 12 10 12 12 2" fill="none" stroke="#c9862a" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function NutCone() {
  return (
    <g>
      <path d="M70 64h60l-14 62c-2 8-8 12-16 12s-14-4-16-12z" fill="#f8ecd9" stroke="#6b4f3a" strokeWidth="3" />
      <ellipse cx="86" cy="78" rx="7" ry="5" fill="#c9862a" />
      <ellipse cx="104" cy="84" rx="7" ry="5" fill="#8a5a16" />
      <ellipse cx="94" cy="98" rx="7" ry="5" fill="#6b4f3a" />
      <ellipse cx="112" cy="102" rx="6" ry="4" fill="#c9862a" />
      <ellipse cx="100" cy="114" rx="6" ry="4" fill="#8a5a16" />
    </g>
  );
}

function Cubes() {
  return (
    <g>
      {[
        [58, 78],
        [96, 70],
        [78, 104],
        [116, 98],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="28" height="28" rx="3" fill="#e7c27a" stroke="#8a5a16" strokeWidth="2" />
          <path d={`M${x + 6} ${y + 14}h16`} stroke="#8a5a16" strokeWidth="2" />
        </g>
      ))}
    </g>
  );
}

function Loaf({
  fill,
  crust,
  scores,
  sliced = false,
}: {
  fill: string;
  crust: string;
  scores: number;
  sliced?: boolean;
}) {
  return (
    <g>
      <path d="M40 96c0-28 24-46 60-46s60 18 60 46v16c0 12-24 20-60 20s-60-8-60-20z" fill={fill} stroke={crust} strokeWidth="4" />
      {Array.from({ length: scores }, (_, index) => (
        <path
          key={index}
          d={`M${70 + index * 18} 62c4 16 4 28 0 40`}
          fill="none"
          stroke={crust}
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
      {sliced ? <path d="M146 70v48" stroke={crust} strokeWidth="4" /> : null}
    </g>
  );
}

function Pie() {
  return (
    <g>
      <path d="M46 96c8-36 100-36 108 0v10H46z" fill="#e7c27a" stroke="#8a5a16" strokeWidth="3" />
      <path d="M52 78c20-16 76-16 96 0" fill="none" stroke="#8a5a16" strokeWidth="3" />
      <circle cx="78" cy="88" r="4" fill="#8c3a2f" />
      <circle cx="100" cy="80" r="4" fill="#1f4d3a" />
      <circle cx="122" cy="88" r="4" fill="#8c3a2f" />
    </g>
  );
}

function Doughnut() {
  return (
    <g>
      <circle cx="100" cy="90" r="36" fill="#e7c27a" stroke="#c9862a" strokeWidth="4" />
      <circle cx="100" cy="90" r="14" fill="#f7f3ea" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return <circle key={angle} cx={100 + Math.cos(rad) * 26} cy={90 + Math.sin(rad) * 26} r="2.4" fill="#f7f3ea" />;
      })}
    </g>
  );
}

function Chinchin() {
  return (
    <g>
      {[
        [70, 70, 16],
        [96, 60, -8],
        [122, 74, 12],
        [78, 98, -14],
        [108, 96, 8],
        [132, 104, -6],
        [92, 118, 4],
      ].map(([x, y, rot], index) => (
        <rect
          key={index}
          x={x}
          y={y}
          width="22"
          height="14"
          rx="3"
          fill={index % 2 ? "#e7c27a" : "#c9862a"}
          transform={`rotate(${rot} ${Number(x) + 11} ${Number(y) + 7})`}
        />
      ))}
    </g>
  );
}

function Roll() {
  return (
    <g>
      <path d="M42 96c8-30 108-30 116 0 4 16-20 28-58 28s-62-12-58-28z" fill="#e7c27a" stroke="#8a5a16" strokeWidth="3" />
      <path d="M70 84c16 10 44 10 60 0" fill="none" stroke="#8a5a16" strokeWidth="3" />
      <ellipse cx="100" cy="100" rx="16" ry="8" fill="#a33b32" />
    </g>
  );
}

function Cupcake() {
  return (
    <g>
      <path d="M62 96h76l-8 28c-2 8-10 12-30 12s-28-4-30-12z" fill="#f7f3ea" stroke="#c9862a" strokeWidth="3" />
      <path d="M70 96c0-28 60-28 60 0" fill="#f3d7a4" />
      <circle cx="84" cy="78" r="14" fill="#f8ecd9" />
      <circle cx="108" cy="72" r="16" fill="#fffdf8" />
      <circle cx="124" cy="86" r="10" fill="#f3d7a4" />
    </g>
  );
}

function Cake() {
  return (
    <g>
      <rect x="48" y="78" width="104" height="46" rx="8" fill="#f7f3ea" stroke="#c9862a" strokeWidth="3" />
      <rect x="58" y="64" width="84" height="22" rx="6" fill="#f3d7a4" />
      <path d="M48 92h104" stroke="#f8ecd9" strokeWidth="6" />
      <rect x="96" y="40" width="8" height="26" rx="2" fill="#c9862a" />
      <circle cx="100" cy="36" r="6" fill="#c4533a" />
    </g>
  );
}

function Croissants() {
  return (
    <g>
      <path d="M40 108c28-48 70-20 78 8-30 6-58 4-78-8z" fill="#e7c27a" stroke="#8a5a16" strokeWidth="3" />
      <path d="M82 100c24-44 70-16 78 12-32 4-58 0-78-12z" fill="#f3d7a4" stroke="#8a5a16" strokeWidth="3" />
    </g>
  );
}

function Samosa() {
  return (
    <g>
      <path d="M100 40l52 78H48z" fill="#e7c27a" stroke="#8a5a16" strokeWidth="3" />
      <path d="M100 58l28 46H72z" fill="none" stroke="#8a5a16" strokeWidth="2" />
      <circle cx="100" cy="90" r="5" fill="#1f4d3a" />
    </g>
  );
}

function Sofa() {
  return (
    <g>
      <path d="M36 86h128v28c0 8-8 12-16 12H52c-8 0-16-4-16-12z" fill="#6b4f3a" />
      <rect x="50" y="66" width="100" height="32" rx="8" fill="#f7f3ea" />
      <path d="M40 70c-12 2-18 12-16 26h18V80c0-6 0-10-2-10z" fill="#4a3426" />
      <path d="M160 70c12 2 18 12 16 26h-18V80c0-6 0-10 2-10z" fill="#4a3426" />
      <path d="M84 70v26M116 70v26" stroke="#e4dccb" strokeWidth="3" />
      <rect x="52" y="124" width="10" height="12" fill="#1c1915" />
      <rect x="138" y="124" width="10" height="12" fill="#1c1915" />
    </g>
  );
}

function Dining() {
  return (
    <g>
      <rect x="46" y="78" width="108" height="12" rx="3" fill="#6b4f3a" />
      <rect x="62" y="90" width="8" height="36" fill="#4a3426" />
      <rect x="130" y="90" width="8" height="36" fill="#4a3426" />
      <path d="M36 70h18v40H36z" fill="#c4a574" />
      <path d="M146 70h18v40h-18z" fill="#c4a574" />
      <rect x="36" y="64" width="18" height="10" rx="2" fill="#f7f3ea" />
      <rect x="146" y="64" width="18" height="10" rx="2" fill="#f7f3ea" />
    </g>
  );
}

function Chair() {
  return (
    <g>
      <path d="M70 36h46v48H70z" fill="#1f4d3a" />
      <rect x="62" y="80" width="76" height="16" rx="4" fill="#16382a" />
      <rect x="70" y="96" width="8" height="28" fill="#4a3426" />
      <rect x="122" y="96" width="8" height="28" fill="#4a3426" />
      <path d="M58 124h28M114 124h28" stroke="#1c1915" strokeWidth="4" strokeLinecap="round" />
      <circle cx="62" cy="128" r="5" fill="#243044" />
      <circle cx="138" cy="128" r="5" fill="#243044" />
    </g>
  );
}

function Wardrobe() {
  return (
    <g>
      <rect x="48" y="28" width="104" height="108" rx="4" fill="#6b4f3a" />
      <path d="M100 36v92" stroke="#f7f3ea" strokeWidth="3" />
      <circle cx="92" cy="84" r="3" fill="#c9862a" />
      <circle cx="108" cy="84" r="3" fill="#c9862a" />
      <rect x="58" y="40" width="34" height="22" rx="2" fill="#f3ebe3" opacity="0.35" />
    </g>
  );
}

function CoffeeTable() {
  return (
    <g>
      <ellipse cx="100" cy="86" rx="62" ry="22" fill="#c4a574" stroke="#6b4f3a" strokeWidth="4" />
      <path d="M52 96l-8 32M148 96l8 32" stroke="#6b4f3a" strokeWidth="6" strokeLinecap="round" />
      <path d="M48 128h28M124 128h28" stroke="#4a3426" strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}

function Bed() {
  return (
    <g>
      <rect x="36" y="48" width="22" height="72" rx="4" fill="#6b4f3a" />
      <rect x="58" y="70" width="108" height="50" rx="6" fill="#f7f3ea" stroke="#6b4f3a" strokeWidth="3" />
      <rect x="66" y="78" width="36" height="22" rx="4" fill="#e5f0ea" />
      <path d="M58 120h108v8H58z" fill="#4a3426" />
      <rect x="150" y="86" width="10" height="42" fill="#6b4f3a" />
    </g>
  );
}

function Shelf() {
  return (
    <g>
      <rect x="48" y="32" width="104" height="100" rx="3" fill="#6b4f3a" />
      {[0, 1, 2].map((row) => (
        <g key={row}>
          <rect x="56" y={42 + row * 30} width="88" height="4" fill="#f3ebe3" />
          <rect x={60 + (row % 2) * 4} y={48 + row * 30} width="12" height="18" fill="#243044" />
          <rect x="76" y={50 + row * 30} width="10" height="16" fill="#8c3a2f" />
          <rect x="90" y={46 + row * 30} width="14" height="20" fill="#1f4d3a" />
          <rect x="108" y={52 + row * 30} width="10" height="14" fill="#c9862a" />
          <rect x="122" y={48 + row * 30} width="12" height="18" fill="#2c4c6e" />
        </g>
      ))}
    </g>
  );
}

function TvStand() {
  return (
    <g>
      <rect x="58" y="36" width="84" height="52" rx="4" fill="#243044" />
      <rect x="66" y="44" width="68" height="36" rx="2" fill="#7eb6d6" />
      <rect x="46" y="96" width="108" height="28" rx="4" fill="#6b4f3a" />
      <rect x="56" y="102" width="28" height="16" rx="2" fill="#4a3426" />
      <rect x="116" y="102" width="28" height="16" rx="2" fill="#4a3426" />
    </g>
  );
}

function StandingBook({
  cover,
  title,
  pencil = false,
}: {
  cover: string;
  title: string;
  pencil?: boolean;
}) {
  return (
    <g>
      <path d="M62 36h70c8 0 12 6 12 14v74c0 8-6 12-14 12H62c-10 0-16-8-16-16V52c0-10 6-16 16-16z" fill={cover} />
      <path d="M62 36c-10 0-16 6-16 16v68c0 8 6 16 16 16" fill="#1c1915" opacity="0.28" />
      <rect x="78" y="58" width="48" height="36" rx="2" fill="#f7f3ea" opacity="0.9" />
      <Label y={80}>{title}</Label>
      {pencil ? (
        <g>
          <rect x="128" y="96" width="36" height="8" rx="2" fill="#e6b325" transform="rotate(-30 146 100)" />
        </g>
      ) : null}
    </g>
  );
}

function OpenBook({ left, right, title }: { left: string; right: string; title: string }) {
  return (
    <g>
      <path d="M28 52h68c6 18 6 48 0 70H28c-6-18-6-48 0-70z" fill={left} stroke="#6b4f3a" strokeWidth="2" />
      <path d="M172 52h-68c-6 18-6 48 0 70h68c6-18 6-48 0-70z" fill={right} stroke="#6b4f3a" strokeWidth="2" />
      <path d="M96 50v74" stroke="#6b4f3a" strokeWidth="3" />
      <Label y={92}>{title}</Label>
    </g>
  );
}

function BookStack() {
  return (
    <g>
      <rect x="48" y="96" width="104" height="22" rx="2" fill="#243044" />
      <rect x="54" y="74" width="96" height="22" rx="2" fill="#1f4d3a" />
      <rect x="60" y="52" width="86" height="22" rx="2" fill="#8c3a2f" />
      <text x="100" y="68" textAnchor="middle" fill="#f7f3ea" fontFamily="Outfit, sans-serif" fontSize="11" fontWeight="700">
        Past Q
      </text>
    </g>
  );
}

function Notebooks() {
  const colors = ["#c4533a", "#1f4d3a", "#2c4c6e", "#c9862a", "#6b4f3a"];
  return (
    <g>
      {colors.map((color, index) => (
        <g key={color} transform={`translate(${36 + index * 22} ${40 + (index % 2) * 6})`}>
          <rect width="28" height="78" rx="2" fill={color} />
          <path d="M6 8h4M6 16h4M6 24h4" stroke="#f7f3ea" strokeWidth="2" />
        </g>
      ))}
    </g>
  );
}

function ExerciseBooks() {
  return (
    <g>
      <rect x="46" y="48" width="78" height="80" rx="3" fill="#f7f3ea" stroke="#2c4c6e" strokeWidth="3" />
      {[0, 1, 2, 3, 4, 5].map((line) => (
        <path key={line} d={`M56 ${66 + line * 10}h58`} stroke="#7eb6d6" strokeWidth="2" />
      ))}
      <rect x="108" y="58" width="46" height="70" rx="3" fill="#e5f0ea" stroke="#1f4d3a" strokeWidth="3" />
      <path d="M118 74h26M118 86h26M118 98h26" stroke="#1f4d3a" strokeWidth="2" />
    </g>
  );
}
