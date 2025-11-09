"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AlertsContainer from "@/components/shared/AlertsContainer";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import { getDiagnosisHistory } from "@/lib/storage/StorageService";
// import { AlertService } from '@/lib/services/AlertService'; // Currently unused
import { AlertNotification } from "@/types";

export default function Home() {
  const [homeAlerts, setHomeAlerts] = useState<AlertNotification[]>([]);
  const [showReturningUserSection, setShowReturningUserSection] =
    useState(false);

  useEffect(() => {
    // Check for existing diagnosis history and generate alerts for returning users
    const checkForReturningUserAlerts = () => {
      try {
        const history = getDiagnosisHistory();

        if (history.length > 0) {
          const lastDiagnosis = history[0];
          const daysSinceLastDiagnosis = Math.floor(
            (Date.now() - new Date(lastDiagnosis.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          );

          setShowReturningUserSection(true);

          const alerts: AlertNotification[] = [];

          // Weekly reminder alert
          if (daysSinceLastDiagnosis >= 7) {
            alerts.push({
              id: `weekly-reminder-${Date.now()}`,
              conditionId: "weekly-reminder",
              type: "usage_decline",
              severity: "info",
              title: "週次診断のお時間です",
              message: `前回の診断から${daysSinceLastDiagnosis}日が経過しました。サブスクの使用状況に変化はありませんか？`,
              actions: [
                {
                  type: "navigate",
                  label: "新しい診断を開始",
                  url: "/diagnosis/select",
                },
                { type: "dismiss", label: "今はしない" },
              ],
              createdAt: new Date(),
              acknowledged: false,
              autoHide: false,
              priority: 5,
            });
          }

          // High waste rate persistent alert
          if (lastDiagnosis.wasteRate > 50) {
            alerts.push({
              id: `persistent-waste-${Date.now()}`,
              conditionId: "persistent-high-waste",
              type: "waste_rate",
              severity: "warning",
              title: "高い無駄率が継続中です",
              message: `前回診断の無駄率${lastDiagnosis.wasteRate}%から改善されていません。見直しを検討しませんか？`,
              actions: [
                {
                  type: "navigate",
                  label: "前回結果を確認",
                  url: "/diagnosis/results",
                },
                {
                  type: "navigate",
                  label: "新しい診断",
                  url: "/diagnosis/select",
                },
                { type: "dismiss", label: "後で" },
              ],
              suggestedSavings: {
                monthly: Math.round(lastDiagnosis.totals.unusedYearly / 12),
                yearly: lastDiagnosis.totals.unusedYearly,
              },
              createdAt: new Date(),
              acknowledged: false,
              autoHide: false,
              priority: 7,
            });
          }

          // Monthly deep check reminder
          if (daysSinceLastDiagnosis >= 30) {
            alerts.push({
              id: `monthly-check-${Date.now()}`,
              conditionId: "monthly-deep-check",
              type: "budget_exceeded",
              severity: "info",
              title: "月次見直しのタイミングです",
              message:
                "新しいサービスの追加や料金変更がある可能性があります。包括的な見直しを行いましょう。",
              actions: [
                {
                  type: "navigate",
                  label: "包括的診断を開始",
                  url: "/diagnosis/select",
                },
                { type: "dismiss", label: "スキップ" },
              ],
              createdAt: new Date(),
              acknowledged: false,
              autoHide: true,
              priority: 6,
            });
          }

          setHomeAlerts(alerts);
        }
      } catch (error) {
        console.warn("Failed to check returning user alerts:", error);
      }
    };

    checkForReturningUserAlerts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-600">💳</div>
            <span className="text-xl font-bold text-gray-900">SubCheck</span>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/settings">
              <Button variant="outline" size="sm">
                ⚙️ 設定
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Returning User Alerts Section */}
      {homeAlerts.length > 0 && (
        <section className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <AlertsContainer
              alerts={homeAlerts}
              displayMode="card"
              maxVisible={2}
              onAlertsChange={setHomeAlerts}
              className="mb-4"
            />
          </div>
        </section>
      )}

      {/* Returning User Dashboard */}
      {showReturningUserSection && (
        <section className="container mx-auto px-4 py-8 border-b bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              おかえりなさい！前回の診断結果
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-blue-200">
                <CardContent className="p-6 text-center">
                  <Link href="/diagnosis/results">
                    <Button variant="outline" className="w-full">
                      📊 前回の結果を確認
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="border border-green-200">
                <CardContent className="p-6 text-center">
                  <Link href="/diagnosis/select">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      🔄 新しい診断を開始
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            そのサブスク、本当に使ってる？
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            あなたのサブスクリプション利用状況を診断して、
            <br />
            年間の無駄遣いを可視化します
          </p>
          <div className="mb-12">
            <Link href="/diagnosis/select">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700"
              >
                📊 診断開始
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  3万円
                </div>
                <div className="text-gray-600">平均年間浪費額</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  45%
                </div>
                <div className="text-gray-600">平均無駄率</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  3分
                </div>
                <div className="text-gray-600">診断完了時間</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            SubCheckでできること
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-8">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-bold mb-3">主要サービス対応</h3>
                <p className="text-gray-600">
                  Netflix、Spotify、Amazon
                  Prime等、日本で人気の主要10サービスに対応
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold mb-3">視覚的な診断結果</h3>
                <p className="text-gray-600">
                  使用頻度別の内訳を円グラフで表示。無駄遣いが一目で分かる
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-bold mb-3">具体的な換算例</h3>
                <p className="text-gray-600">
                  年間浪費額を「国内旅行○回分」など身近な例で表示
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-Bold mb-3">プライバシー保護</h3>
                <p className="text-gray-600">
                  すべてのデータはあなたのブラウザ内のみで処理。外部送信なし
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            今すぐサブスクの無駄をチェック！
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            わずか3分で、あなたの年間浪費額が分かります
          </p>
          <Link href="/diagnosis/select">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100"
            >
              📊 無料で診断開始
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="text-xl text-blue-600">💳</div>
            <span className="text-lg font-bold text-gray-900">SubCheck</span>
          </div>
          <p className="text-gray-600 text-sm">
            サブスクリプション使用状況診断サービス
          </p>
        </div>
      </footer>

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}
