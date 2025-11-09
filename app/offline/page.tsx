"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw, Home, Smartphone } from "lucide-react";

export default function OfflinePage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(() =>
    typeof window !== "undefined" ? navigator.onLine : false
  );

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-redirect when back online
      setTimeout(() => {
        router.back();
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [router]);

  const handleRetry = () => {
    if (navigator.onLine) {
      router.back();
    } else {
      // Try to refresh the page
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            {isOnline ? (
              <RefreshCw className="w-12 h-12 text-green-500 animate-spin" />
            ) : (
              <WifiOff className="w-12 h-12 text-gray-500" />
            )}
          </div>
        </div>

        {/* Status Message */}
        {isOnline ? (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-green-600 mb-4">
              接続が復旧しました！
            </h1>
            <p className="text-gray-600">
              自動的にページを読み込み直しています...
            </p>
          </div>
        ) : (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              オフラインモード
            </h1>
            <p className="text-gray-600 mb-6">
              インターネット接続が利用できません。
              <br />
              以下の機能は引き続き利用できます：
            </p>

            {/* Available offline features */}
            <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                オフラインで利用可能
              </h2>
              <ul className="text-left text-gray-600 space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  過去の診断結果の閲覧
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  保存済みのサブスクデータ
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  基本的な診断機能
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  新しい診断結果は接続復旧時に同期
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={handleRetry} className="w-full" disabled={isOnline}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {isOnline ? "接続中..." : "もう一度試す"}
          </Button>

          <Button variant="outline" onClick={handleGoHome} className="w-full">
            <Home className="w-4 h-4 mr-2" />
            ホームに戻る
          </Button>
        </div>

        {/* Connection Tips */}
        {!isOnline && (
          <div className="mt-8 text-xs text-gray-500">
            <details>
              <summary className="cursor-pointer hover:text-gray-700">
                接続のトラブルシューティング
              </summary>
              <div className="mt-3 text-left">
                <ul className="space-y-1">
                  <li>• Wi-Fi接続を確認してください</li>
                  <li>• 機内モードがオフになっているか確認</li>
                  <li>• モバイルデータ通信の設定を確認</li>
                  <li>• ルーターの再起動を試してみてください</li>
                </ul>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
