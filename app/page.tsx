'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-600">💳</div>
            <span className="text-xl font-bold text-gray-900">SubCheck</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            そのサブスク、本当に使ってる？
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            あなたのサブスクリプション利用状況を診断して、<br />
            年間の無駄遣いを可視化します
          </p>
          <div className="mb-12">
            <Link href="/diagnosis/select">
              <Button size="lg" className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700">
                📊 診断開始
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">3万円</div>
                <div className="text-gray-600">平均年間浪費額</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">45%</div>
                <div className="text-gray-600">平均無駄率</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">3分</div>
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
                  Netflix、Spotify、Amazon Prime等、日本で人気の主要10サービスに対応
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
    </div>
  );
}
