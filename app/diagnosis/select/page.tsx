'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import SubscriptionSelector from '@/components/forms/SubscriptionSelector';
import { useDiagnosisSession } from '@/lib/hooks/useDiagnosisSession';
import { SubscriptionService } from '@/lib/services/SubscriptionService';
import { Subscription } from '@/types';

export default function SelectPage() {
  const router = useRouter();
  const {
    selectedServices,
    setSelectedServices,
    isLoading,
    clearSession
  } = useDiagnosisSession();
  
  const [availableServices, setAvailableServices] = useState<Subscription[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const subscriptionService = new SubscriptionService();

  useEffect(() => {
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
  }, []);

  const handleSelectionChange = (serviceIds: string[]) => {
    setSelectedServices(serviceIds);
  };

  const handleNext = () => {
    if (selectedServices.length === 0) return;
    router.push('/diagnosis/usage');
  };

  const handleRestart = () => {
    clearSession();
  };

  if (isLoading || servicesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">サービスを読み込み中...</p>
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
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleRestart}
                size="sm"
              >
                リセット
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/')}
              >
                ホームに戻る
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">ステップ 1/3</span>
            <span className="text-sm text-gray-500">サブスク選択</span>
          </div>
          <Progress value={33} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              利用中のサブスクを選択
            </h1>
            <p className="text-lg text-gray-600">
              現在契約しているサブスクリプションサービスを選んでください
            </p>
          </div>

          {/* Subscription Selector */}
          <SubscriptionSelector
            services={availableServices}
            selectedServices={selectedServices}
            onSelectionChange={handleSelectionChange}
          />

          {/* Navigation */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
            >
              戻る
            </Button>
            <Button 
              onClick={handleNext}
              disabled={selectedServices.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              次へ ({selectedServices.length}個選択中)
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}