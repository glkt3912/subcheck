'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import WasteChart from '@/components/charts/WasteChart';
import ResultsSummary from '@/components/shared/ResultsSummary';
import SocialShareButtons from '@/components/shared/SocialShareButtons';
import { useDiagnosisSession } from '@/lib/hooks/useDiagnosisSession';
import { SubscriptionService } from '@/lib/services/SubscriptionService';
import { Subscription } from '@/types';

export default function ResultsPage() {
  const router = useRouter();
  const {
    userSubscriptions,
    diagnosisResult,
    calculateResults,
    clearSession,
    isLoading
  } = useDiagnosisSession();
  
  const [subscriptionDetails, setSubscriptionDetails] = useState<Record<string, Subscription>>({});
  const [servicesLoading, setServicesLoading] = useState(true);

  useEffect(() => {
    // Redirect if no user subscriptions
    if (!isLoading && userSubscriptions.length === 0) {
      router.push('/diagnosis/select');
      return;
    }

    const loadData = async () => {
      try {
        // Load subscription details
        const subscriptionService = new SubscriptionService();
        const services = await subscriptionService.getAllSubscriptions();
        const details: Record<string, Subscription> = {};
        services.forEach(sub => {
          details[sub.id] = sub;
        });
        setSubscriptionDetails(details);

        // Calculate diagnosis if we have subscriptions but no result yet
        // Only calculate if we have the expected number of subscriptions
        if (userSubscriptions.length > 0 && !diagnosisResult) {
          await calculateResults();
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setServicesLoading(false);
      }
    };

    loadData();
  }, [isLoading, userSubscriptions.length, diagnosisResult, calculateResults, router]);

  const handleRestart = () => {
    clearSession();
    router.push('/diagnosis/select');
  };

  const [showShareButtons, setShowShareButtons] = useState(false);

  const handleShare = () => {
    setShowShareButtons(!showShareButtons);
  };

  if (isLoading || servicesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingState text="診断結果を計算中..." size="xl" />
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

          {/* Chart Visualization */}
          {diagnosisResult && (
            <div className="mb-8">
              <WasteChart
                diagnosisResult={diagnosisResult}
                subscriptionDetails={subscriptionDetails}
              />
            </div>
          )}

          {/* Detailed Results */}
          {diagnosisResult && (
            <ResultsSummary
              diagnosisResult={diagnosisResult}
              userSubscriptions={userSubscriptions}
              subscriptionDetails={subscriptionDetails}
              onRestart={handleRestart}
              onShare={handleShare}
            />
          )}

          {/* Social Share Section */}
          {diagnosisResult && showShareButtons && (
            <div className="mt-8">
              <SocialShareButtons
                diagnosisResult={diagnosisResult}
                className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}