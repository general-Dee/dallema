import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { themeBootScript } from "@/components/theme-toggle";
import { AuthProvider } from "@/lib/auth/provider";
import { loadShopCatalog } from "@/lib/shop.functions";
import { useDallema } from "@/lib/store";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dalema" },
      { name: "description", content: "Shop food, fresh bakes, furniture, and books from Dalema, No. 70 Isa Kaita Road, Ungwan Munchi, Kaduna North." },
      { name: "theme-color", content: "#1F4D3A" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,650&family=Outfit:wght@400;500;600;700&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: Root,
});

function ThemeToaster() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const sync = () => setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    sync();
    window.addEventListener("dallema-theme", sync);
    return () => window.removeEventListener("dallema-theme", sync);
  }, []);
  return <Toaster position="top-center" richColors theme={theme} />;
}

function Root() {
  useEffect(() => {
    let stop = false;
    async function pullCatalog() {
      const result = await loadShopCatalog({ data: {} });
      if (!stop && result.ok && result.catalog) useDallema.getState().applyRemoteShop({ catalog: result.catalog });
    }
    void (async () => {
      await Promise.resolve(useDallema.persist.rehydrate());
      try {
        await pullCatalog();
      } catch {
        // The shop still opens from this browser if the database is briefly unreachable.
      }
      if (!stop) useDallema.setState({ hydrated: true });
    })();
    const timer = window.setInterval(() => {
      void pullCatalog().catch(() => undefined);
    }, 15000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, []);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
          <ThemeToaster />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
