import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export const THEME_STORAGE_KEY = "dallema-theme";

export const themeBootScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var dark=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",dark);}catch(e){}})();`;

export function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
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

  return (
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
  );
}
