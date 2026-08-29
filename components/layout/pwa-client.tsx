"use client";

import { Download, WifiOff, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { mobileShellClassName } from "@/components/layout/mobile-shell";

type PwaMode = "online" | "offline" | "installable";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
};

let registrationPromise: Promise<void> | null = null;

export function PwaClient() {
  const [mode, setMode] = useState<PwaMode>("online");
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const isProduction = process.env.NODE_ENV === "production";

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator && !isProduction) {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .then(() => {
          if (navigator.serviceWorker.controller && !sessionStorage.getItem("hp-sw-cleared")) {
            sessionStorage.setItem("hp-sw-cleared", "1");
            window.location.reload();
          }
        })
        .catch(() => undefined);
      return;
    }

    if ("serviceWorker" in navigator && !registrationPromise) {
      registrationPromise = navigator.serviceWorker.register("/sw.js").then(() => undefined).catch(() => undefined);
    }

    const updateOnlineState = () => setMode(navigator.onLine ? "online" : "offline");
    updateOnlineState();

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) setDismissed(true);

    const onBeforeInstallPrompt = (event: Event) => {
      if (!isProduction) return;
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setMode((current) => (current === "offline" ? current : "installable"));
    };

    const onInstalled = () => {
      setInstallPrompt(null);
      setDismissed(true);
      setMode(navigator.onLine ? "online" : "offline");
    };

    window.addEventListener("online", updateOnlineState);
    window.addEventListener("offline", updateOnlineState);
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("online", updateOnlineState);
      window.removeEventListener("offline", updateOnlineState);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const banner = useMemo(() => {
    if (dismissed) return null;
    if (mode === "offline") {
      return {
        icon: <WifiOff size={16} aria-hidden="true" />,
        text: "当前离线，正在显示已缓存内容。",
        action: null,
      };
    }
    if (mode === "installable" && installPrompt) {
      return {
        icon: <Download size={16} aria-hidden="true" />,
        text: "可安装到手机，获得更像 App 的体验。",
        action: (
          <button
            type="button"
            onClick={async () => {
              await installPrompt.prompt();
              setInstallPrompt(null);
              setMode(navigator.onLine ? "online" : "offline");
            }}
            className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-white"
          >
            安装
          </button>
        ),
      };
    }
    return null;
  }, [dismissed, installPrompt, mode]);

  if (!banner) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 px-4">
      <div className={`${mobileShellClassName}`}>
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-panel">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-brand">{banner.icon}</div>
          <p className="min-w-0 flex-1 text-xs leading-5 text-muted">{banner.text}</p>
          {banner.action}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface"
            aria-label="关闭提示"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
