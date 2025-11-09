'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AlertSettings from '@/components/shared/AlertSettings';

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-xl font-bold text-blue-600">💳</div>
              <span className="text-lg font-bold text-gray-900">SubCheck</span>
              <span className="text-sm text-gray-500">設定</span>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
            >
              ホームに戻る
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              アラート設定
            </h1>
            <p className="text-lg text-gray-600">
              サブスクリプション最適化のアラート通知をカスタマイズできます
            </p>
          </div>

          <AlertSettings 
            onSettingsChange={(settings) => {
              console.log('Settings updated:', settings);
              // Here you could show a success toast or other feedback
            }}
          />
        </div>
      </main>
    </div>
  );
}