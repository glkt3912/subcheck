"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi, CloudOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfflineIndicatorProps {
  className?: string;
}

export default function OfflineIndicator({
  className = "",
}: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(() =>
    typeof window !== "undefined" ? navigator.onLine : true
  );
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleOnline = () => {
        setIsOnline(true);
        // Show "back online" message briefly
        setShowIndicator(true);
        setTimeout(() => setShowIndicator(false), 3000);
      };

      const handleOffline = () => {
        setIsOnline(false);
        setShowIndicator(true);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  // Show indicator when offline, or briefly when coming back online
  if (!showIndicator && isOnline) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-sm font-medium transition-all duration-300",
        isOnline ? "bg-green-600 text-white" : "bg-red-600 text-white",
        className
      )}
    >
      <div className="flex items-center justify-center space-x-2">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>インターネット接続が復旧しました</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>オフライン - 一部機能が制限されます</span>
            <CloudOff className="w-4 h-4 ml-2" />
          </>
        )}
      </div>
    </div>
  );
}
