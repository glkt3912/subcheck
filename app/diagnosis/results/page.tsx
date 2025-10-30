'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { calculateDiagnosis } from '@/lib/calculations/CalculationService';
import { SUBSCRIPTION_DATA } from '@/lib/data/subscriptions';
import { UserSubscription, DiagnosisResult, Subscription } from '@/types';

export default function ResultsPage() {
  const router = useRouter();
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [subscriptionDetails, setSubscriptionDetails] = useState<Record<string, Subscription>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAndCalculate = async () => {
      try {
        // Load user subscriptions from previous step
        const saved = localStorage.getItem('subcheck_user_subscriptions');
        if (!saved) {
          router.push('/diagnosis/select');
          return;
        }

        const userSubs: UserSubscription[] = JSON.parse(saved);
        setUserSubscriptions(userSubs);

        // Create subscription details lookup
        const details: Record<string, Subscription> = {};
        SUBSCRIPTION_DATA.forEach(sub => {
          details[sub.id] = sub;
        });
        setSubscriptionDetails(details);

        // Calculate diagnosis result
        const result = calculateDiagnosis(userSubs);
        setDiagnosisResult(result);

        // Save result to localStorage
        localStorage.setItem('subcheck_diagnosis_result', JSON.stringify(result));
      } catch (error) {
        console.error('Failed to calculate diagnosis:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAndCalculate();
  }, [router]);

  const getWasteRateColor = (wasteRate: number) => {
    if (wasteRate < 20) return 'text-green-600';
    if (wasteRate < 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWasteRateMessage = (wasteRate: number) => {
    if (wasteRate < 20) return 'とても効率的にサブスクを活用できています！👏';
    if (wasteRate < 50) return 'まずまずですが、まだ改善の余地がありそうです。📊';
    return 'かなりの無駄が発生しています。見直しをおすすめします！⚠️';
  };

  const handleRestart = () => {
    localStorage.removeItem('subcheck_selected_services');
    localStorage.removeItem('subcheck_user_subscriptions');
    localStorage.removeItem('subcheck_diagnosis_result');
    router.push('/diagnosis/select');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">診断結果を計算中...</p>
        </div>
      </div>
    );
  }

  if (!diagnosisResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">診断結果の計算に失敗しました</h2>
          <Button onClick={() => router.push('/diagnosis/select')}>
            最初からやり直す
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-xl font-bold text-blue-600">💳</div>
              <span className="text-lg font-bold text-gray-900">SubCheck</span>
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

      {/* Progress */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">ステップ 3/3</span>
            <span className="text-sm text-gray-500">診断結果</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              あなたの診断結果
            </h1>
            <p className="text-lg text-gray-600">
              サブスクリプションの使用状況を分析しました
            </p>
          </div>

          {/* Main Result */}
          <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className={`text-6xl font-bold mb-2 ${getWasteRateColor(diagnosisResult.wasteRate)}`}>
                  {diagnosisResult.wasteRate}%
                </div>
                <div className="text-xl text-gray-700">無駄率</div>
              </div>
              <div className="mb-6">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  ¥{diagnosisResult.totals.unusedYearly.toLocaleString()}
                </div>
                <div className="text-lg text-gray-700">年間浪費額</div>
              </div>
              <p className="text-lg text-gray-700">
                {getWasteRateMessage(diagnosisResult.wasteRate)}
              </p>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  ¥{diagnosisResult.totals.monthly.toLocaleString()}
                </div>
                <div className="text-gray-600">月額合計</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-gray-800 mb-2">
                  ¥{diagnosisResult.totals.yearly.toLocaleString()}
                </div>
                <div className="text-gray-600">年額合計</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-red-600 mb-2">
                  ¥{diagnosisResult.totals.unusedYearly.toLocaleString()}
                </div>
                <div className="text-gray-600">年間無駄額</div>
              </CardContent>
            </Card>
          </div>

          {/* Service Breakdown */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>サービス別詳細</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userSubscriptions.map((userSub) => {
                  const service = subscriptionDetails[userSub.subscriptionId];
                  if (!service) return null;

                  const wasteMultiplier = {
                    daily: 0,
                    weekly: 0.25,
                    monthly: 0.6,
                    unused: 1.0
                  }[userSub.usageFrequency];

                  const monthlyWaste = service.monthlyPrice * wasteMultiplier;
                  const yearlyWaste = monthlyWaste * 12;

                  return (
                    <div key={userSub.subscriptionId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {service.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-600">
                            {userSub.usageFrequency === 'daily' && '毎日使用'}
                            {userSub.usageFrequency === 'weekly' && '週1-2回使用'}
                            {userSub.usageFrequency === 'monthly' && '月1-2回使用'}
                            {userSub.usageFrequency === 'unused' && '未使用'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          ¥{service.monthlyPrice.toLocaleString()}/月
                        </div>
                        {yearlyWaste > 0 && (
                          <div className="text-sm text-red-600">
                            年間無駄: ¥{yearlyWaste.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Comparison Examples */}
          {diagnosisResult.comparisonItems.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>無駄額で買えるもの</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  年間 ¥{diagnosisResult.totals.unusedYearly.toLocaleString()} があれば、こんなものが買えます：
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {diagnosisResult.comparisonItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{item.description}</div>
                        <div className="text-sm text-gray-600">¥{item.amount.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {diagnosisResult.recommendations.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>改善提案</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {diagnosisResult.recommendations.map((rec, index) => {
                    const service = subscriptionDetails[rec.subscriptionId];
                    if (!service) return null;

                    return (
                      <div key={index} className={`p-4 rounded-lg border-l-4 ${
                        rec.priority === 'high' ? 'border-red-500 bg-red-50' :
                        rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{service.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {rec.priority === 'high' ? '高優先度' :
                             rec.priority === 'medium' ? '中優先度' : '低優先度'}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{rec.reason}</p>
                        <div className="text-sm text-gray-600">
                          節約可能額: 年間 ¥{rec.potentialSaving.yearly.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleRestart}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              🔄 もう一度診断する
            </Button>
            <Button 
              onClick={() => router.push('/')}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
            >
              🏠 ホームに戻る
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}