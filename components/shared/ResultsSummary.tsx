'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DiagnosisResult, UserSubscription, Subscription } from '@/types';

interface ResultsSummaryProps {
  diagnosisResult: DiagnosisResult;
  userSubscriptions: UserSubscription[];
  subscriptionDetails: Record<string, Subscription>;
  onRestart?: () => void;
  onShare?: () => void;
  showActions?: boolean;
}

export default function ResultsSummary({
  diagnosisResult,
  userSubscriptions,
  subscriptionDetails,
  onRestart,
  onShare,
  showActions = true
}: ResultsSummaryProps) {
  const getWasteRateColor = (wasteRate: number) => {
    if (wasteRate < 20) return 'text-green-600';
    if (wasteRate < 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWasteRateBgColor = (wasteRate: number) => {
    if (wasteRate < 20) return 'from-green-50 to-emerald-50 border-green-200';
    if (wasteRate < 50) return 'from-yellow-50 to-amber-50 border-yellow-200';
    return 'from-red-50 to-pink-50 border-red-200';
  };

  const getWasteRateMessage = (wasteRate: number) => {
    if (wasteRate < 20) return 'とても効率的にサブスクを活用できています！👏';
    if (wasteRate < 50) return 'まずまずですが、まだ改善の余地がありそうです。📊';
    return 'かなりの無駄が発生しています。見直しをおすすめします！⚠️';
  };

  const getUsageFrequencyLabel = (frequency: string) => {
    const labels = {
      daily: '毎日使用',
      weekly: '週1-2回使用',
      monthly: '月1-2回使用',
      unused: '未使用'
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  return (
    <div className="space-y-8">
      {/* Main Result Card */}
      <Card className={`bg-gradient-to-br ${getWasteRateBgColor(diagnosisResult.wasteRate)}`}>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      <Card>
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
                        {getUsageFrequencyLabel(userSub.usageFrequency)}
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
                    {yearlyWaste === 0 && (
                      <div className="text-sm text-green-600">
                        効率的利用 ✓
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
        <Card>
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
        <Card>
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

      {/* Quick Stats */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">
                {userSubscriptions.filter(sub => sub.usageFrequency === 'daily').length}
              </div>
              <div className="text-sm text-gray-600">毎日使用</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-600">
                {userSubscriptions.filter(sub => sub.usageFrequency === 'weekly').length}
              </div>
              <div className="text-sm text-gray-600">週1-2回</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {userSubscriptions.filter(sub => sub.usageFrequency === 'monthly').length}
              </div>
              <div className="text-sm text-gray-600">月1-2回</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">
                {userSubscriptions.filter(sub => sub.usageFrequency === 'unused').length}
              </div>
              <div className="text-sm text-gray-600">未使用</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {onRestart && (
            <Button 
              onClick={onRestart}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              🔄 もう一度診断する
            </Button>
          )}
          {onShare && (
            <Button 
              onClick={onShare}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              📤 結果をシェア
            </Button>
          )}
        </div>
      )}
    </div>
  );
}