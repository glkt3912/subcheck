'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const DiagnosisChart = dynamic(() => import('@/components/DiagnosisChart'), {
  loading: () => <div className="h-80 flex items-center justify-center"><LoadingSpinner size="lg" /></div>
});
import { calculateDiagnosis, getWasteRateMessage, getWasteRateColors } from '@/lib/calculator';
import { getSubscriptionById } from '@/lib/subscriptions';
import { getUserSubscriptions, saveDiagnosisResult } from '@/lib/storage';
import type { UserSubscription, DiagnosisResult } from '@/types';

const COLORS = {
  daily: '#10B981',    // Green
  weekly: '#3B82F6',   // Blue  
  monthly: '#F59E0B',  // Orange
  unused: '#EF4444'    // Red
};

const FREQUENCY_LABELS = {
  daily: '毎日使用',
  weekly: '週1-2回',
  monthly: '月1-2回', 
  unused: '未使用'
};

export default function ResultPage() {
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);

  useEffect(() => {
    const loadDataAndCalculate = () => {
      const subs = getUserSubscriptions();
      if (subs.length > 0) {
        setUserSubscriptions(subs);
        const diagnosis = calculateDiagnosis(subs);
        setResult(diagnosis);
        saveDiagnosisResult(diagnosis);
      }
    };
    loadDataAndCalculate();
  }, []);

  if (!result || userSubscriptions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            診断データが見つかりません
          </h1>
          <Link href="/select">
            <Button>最初から診断する</Button>
          </Link>
        </div>
      </div>
    );
  }

  const chartData = Object.entries(result.frequencyBreakdown)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: FREQUENCY_LABELS[key as keyof typeof FREQUENCY_LABELS],
      value: value,
      color: COLORS[key as keyof typeof COLORS]
    }));

  const wasteColors = getWasteRateColors(result.wasteRate);

  const shareToTwitter = () => {
    const text = `私のサブスク無駄率は${result.wasteRate}%でした😱 年間${result.totals.unusedYearly.toLocaleString()}円も無駄にしてた...！ #サブチェック #サブスク診断`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareToLine = () => {
    const text = `私のサブスク無駄率は${result.wasteRate}%でした😱 年間${result.totals.unusedYearly.toLocaleString()}円も無駄にしてた...！`;
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-600">💳</div>
            <span className="text-xl font-bold text-gray-900">SubCheck</span>
          </Link>
        </div>
      </header>

      {/* Progress */}
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step 3 / 3</span>
            <span className="text-sm font-medium text-gray-600">100%</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              診断結果
            </h1>
            <p className="text-lg text-gray-600">
              あなたのサブスク利用状況を分析しました
            </p>
          </div>

          {/* Waste Rate Card */}
          <Card className="mb-8" style={{ backgroundColor: wasteColors.background }}>
            <CardContent className="p-8 text-center">
              <div className="text-6xl font-bold mb-4" style={{ color: wasteColors.primary }}>
                {result.wasteRate}%
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                無駄率
              </div>
              <div className="text-lg text-gray-600 mb-4">
                {getWasteRateMessage(result.wasteRate)}
              </div>
              <div className="text-xl font-semibold text-gray-800">
                年間 <span className="text-red-600">¥{result.totals.unusedYearly.toLocaleString()}</span> の無駄
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle>使用頻度別内訳</CardTitle>
              </CardHeader>
              <CardContent>
                <DiagnosisChart data={chartData} />
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>支出サマリー</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">月額合計</span>
                  <span className="font-bold text-lg">¥{result.totals.monthly.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">年額合計</span>
                  <span className="font-bold text-lg">¥{result.totals.yearly.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-red-600">
                  <span>年間無駄額</span>
                  <span className="font-bold text-lg">¥{result.totals.unusedYearly.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600 mb-2">契約サービス数</div>
                  <div className="font-bold">{userSubscriptions.length}件</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Examples */}
          {result.comparisonItems.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>年間無駄額でできること</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {result.comparisonItems.map((item, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl mb-2">{item.icon}</div>
                      <div className="font-semibold text-gray-900">{item.description}</div>
                      <div className="text-sm text-gray-600">¥{item.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>改善提案</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.recommendations.map((rec, index) => {
                    const subscription = getSubscriptionById(rec.subscriptionId);
                    return (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold">{subscription?.name}</div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {rec.priority === 'high' ? '高優先度' : 
                             rec.priority === 'medium' ? '中優先度' : '低優先度'}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{rec.reason}</p>
                        <div className="text-sm text-green-600">
                          節約可能額: 年間¥{rec.potentialSaving.yearly.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Share Buttons */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-6">結果をシェア</h3>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={shareToTwitter}
                className="bg-sky-500 hover:bg-sky-600 text-white"
              >
                🐦 Twitterでシェア
              </Button>
              <Button 
                onClick={shareToLine}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                💬 LINEでシェア
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center mt-12">
            <Link href="/">
              <Button variant="outline" size="lg">
                最初からやり直す
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}