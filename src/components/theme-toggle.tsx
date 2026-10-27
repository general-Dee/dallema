import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { HoverTip } from "@/components/hover-tip";
import { cn } from "@/lib/cn";

export const THEME_STORAGE_KEY = "dalema-theme";
const LEGACY_THEME_KEY = "dallema-theme";

// Runs in <head> before first paint. Reads the new key; if it is empty, takes a
// saved choice from the old misspelled key ("dark" or "light" only) and copies it over.
export const themeBootScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t===null||t===""){var o=localStorage.getItem("${LEGACY_THEME_KEY}");if(o==="dark"||o==="light"){t=o;try{localStorage.setItem("${THEME_STORAGE_KEY}",o);}catch(e){}}}var dark=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",dark);}catch(e){}})();`;

export function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
  } catch {
    // Blocked or full storage: the theme still changes for this visit.
  }
  window.dispatchEvent(new Event("dallema-theme"));
}

export function ThemeToggle({ onForest = false }: { onForest?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const sync = () => setDark(document.documentElement.classList.contains("dark"));
    sync();
    window.addEventListener("dallema-theme", sync);
    return () => window.removeEventListener("dallema-theme", sync);
  }, []);

  const label = dark ? "Light mode" : "Dark mode";
  return (
    <HoverTip label={label} side={onForest ? "bottom" : "top"}>
      <button
        type="button"
        aria-pressed={dark}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={() => {
          const next = !document.documentElement.classList.contains("dark");
          applyTheme(next);
          setDark(next);
        }}
        className={cn(
          "inline-flex size-12 shrink-0 items-center justify-center rounded-card",
          onForest ? "text-cream hover:bg-forest-deep" : "text-forest-ink hover:bg-forest-soft",
        )}
      >
        {dark ? <Sun className="size-5" aria-hidden="true" /> : <Moon className="size-5" aria-hidden="true" />}
      </button>
    </HoverTip>
  );
}
