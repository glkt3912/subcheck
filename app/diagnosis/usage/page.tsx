'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import UsageFrequencySelector from '@/components/forms/UsageFrequencySelector';
import { useDiagnosisSession } from '@/lib/hooks/useDiagnosisSession';
import { SubscriptionService } from '@/lib/services/SubscriptionService';
import { Subscription } from '@/types';

export default function UsagePage() {
  const router = useRouter();
  const {
    selectedServices,
    usageFrequencies,
    setUsageFrequency,
    createUserSubscriptions,
    hasAllFrequencies,
    isLoading
  } = useDiagnosisSession();
  
  const [availableServices, setAvailableServices] = useState<Subscription[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const subscriptionService = new SubscriptionService();

  useEffect(() => {
    // Redirect if no services selected
    if (!isLoading && selectedServices.length === 0) {
      router.push('/diagnosis/select');
      return;
    }

    const loadServices = async () => {
      try {
        const services = await subscriptionService.getAllSubscriptions();
        setAvailableServices(services);
      } catch (error) {
        console.error('Failed to load services:', error);
        setAvailableServices([]);
      } finally {
        setServicesLoading(false);
      }
    };

    loadServices();
  }, [isLoading, selectedServices.length, router]);

  const handleNext = async () => {
    if (!hasAllFrequencies) return;

    // Create user subscriptions and navigate
    await createUserSubscriptions();
    router.push('/diagnosis/results');
  };

  if (isLoading || servicesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingState text="データを読み込み中..." size="xl" />
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
            <span className="text-sm font-medium text-gray-700">ステップ 2/3</span>
            <span className="text-sm text-gray-500">使用頻度入力</span>
          </div>
          <Progress value={66} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              使用頻度を教えてください
            </h1>
            <p className="text-lg text-gray-600">
              選択したサービスの利用頻度を正直に選んでください
            </p>
          </div>

          {/* Usage Frequency Selector */}
          <UsageFrequencySelector
            services={availableServices}
            selectedServices={selectedServices}
            usageFrequencies={usageFrequencies}
            onFrequencyChange={setUsageFrequency}
          />

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={() => router.push('/diagnosis/select')}
            >
              戻る
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!hasAllFrequencies}
              className="bg-blue-600 hover:bg-blue-700"
            >
              診断結果を見る
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}