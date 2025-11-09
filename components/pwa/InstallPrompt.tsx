"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS] = useState(() =>
    typeof window !== "undefined"
      ? /iPad|iPhone|iPod/.test(navigator.userAgent)
      : false
  );
  const [isStandalone] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(display-mode: standalone)").matches
      : false
  );

  useEffect(() => {
    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show install prompt after a delay if not dismissed before
      setTimeout(() => {
        const dismissedBefore = localStorage.getItem("pwa-install-dismissed");
        const lastDismissed = dismissedBefore ? parseInt(dismissedBefore) : 0;
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

        if (lastDismissed < oneDayAgo) {
          setShowInstallPrompt(true);
        }
      }, 5000); // Show after 5 seconds
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setShowInstallPrompt(false);
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("[PWA] User accepted the install prompt");
    } else {
      console.log("[PWA] User dismissed the install prompt");
      localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  // Don't show if app is already installed or conditions not met
  if (isStandalone || (!showInstallPrompt && !isIOS)) {
    return null;
  }

  // iOS install instructions
  if (isIOS && !isStandalone) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm mx-auto">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <Smartphone className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">
              アプリをインストール
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-gray-600 mb-3">
          SubCheckをホーム画面に追加して、より便利にご利用ください。
        </p>

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            1. 下部の共有ボタン{" "}
            <span className="inline-block w-4 h-3 bg-blue-500 rounded-sm mx-1"></span>{" "}
            をタップ
          </p>
          <p>2. 「ホーム画面に追加」を選択</p>
          <p>3. 「追加」をタップして完了</p>
        </div>
      </div>
    );
  }

  // Android/Chrome install prompt
  if (showInstallPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm mx-auto">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <Download className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">
              アプリをインストール
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          SubCheckをデバイスにインストールして、オフラインでもご利用ください。
        </p>

        <div className="flex space-x-2">
          <Button onClick={handleInstallClick} className="flex-1" size="sm">
            インストール
          </Button>
          <Button variant="outline" onClick={handleDismiss} size="sm">
            後で
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
