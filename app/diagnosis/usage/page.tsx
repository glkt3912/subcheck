'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SUBSCRIPTION_DATA } from '@/lib/data/subscriptions';
import { SubscriptionService } from '@/lib/services/SubscriptionService';
import { Subscription, UsageFrequency, UserSubscription } from '@/types';

const FREQUENCY_OPTIONS = [
  {
    value: UsageFrequency.DAILY,
    label: '毎日',
    description: 'ほぼ毎日使っている',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '🟢'
  },
  {
    value: UsageFrequency.WEEKLY,
    label: '週1-2回',
    description: '週に1〜2回程度使っている',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '🟡'
  },
  {
    value: UsageFrequency.MONTHLY,
    label: '月1-2回',
    description: '月に1〜2回程度使っている',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: '🟠'
  },
  {
    value: UsageFrequency.UNUSED,
    label: '未使用',
    description: 'ほとんど使っていない',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '🔴'
  }
];

export default function UsagePage() {
  const router = useRouter();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [availableServices, setAvailableServices] = useState<Subscription[]>([]);
  const [usageFrequencies, setUsageFrequencies] = useState<Record<string, UsageFrequency>>({});
  const [loading, setLoading] = useState(true);
  const subscriptionService = new SubscriptionService();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load selected services from previous step
        const saved = localStorage.getItem('subcheck_selected_services');
        if (!saved) {
          router.push('/diagnosis/select');
          return;
        }

        const serviceIds = JSON.parse(saved);
        setSelectedServices(serviceIds);

        // Load service details
        const services = await subscriptionService.getAllSubscriptions();
        setAvailableServices(services);
      } catch (error) {
        console.error('Failed to load data:', error);
        setAvailableServices(SUBSCRIPTION_DATA);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleFrequencyChange = (serviceId: string, frequency: UsageFrequency) => {
    setUsageFrequencies(prev => ({
      ...prev,
      [serviceId]: frequency
    }));
  };

  const handleNext = () => {
    const allSelected = selectedServices.every(id => usageFrequencies[id]);
    if (!allSelected) return;

    // Create user subscriptions data
    const userSubscriptions: UserSubscription[] = selectedServices.map(serviceId => ({
      subscriptionId: serviceId,
      usageFrequency: usageFrequencies[serviceId],
      isCustom: false,
      dateAdded: new Date().toISOString()
    }));

    // Save to localStorage
    localStorage.setItem('subcheck_user_subscriptions', JSON.stringify(userSubscriptions));
    router.push('/diagnosis/results');
  };

  const getSelectedServices = () => {
    return selectedServices
      .map(id => availableServices.find(service => service.id === id))
      .filter(Boolean) as Subscription[];
  };

  const allFrequenciesSelected = selectedServices.every(id => usageFrequencies[id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
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

          {/* Service Usage Input */}
          <div className="space-y-6">
            {getSelectedServices().map((service) => (
              <Card key={service.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                      {service.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-gray-600">月額 ¥{service.monthlyPrice.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {FREQUENCY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFrequencyChange(service.id, option.value)}
                        className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                          usageFrequencies[service.id] === option.value
                            ? `${option.color} ring-2 ring-blue-500`
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{option.icon}</span>
                          <span className="font-semibold">{option.label}</span>
                        </div>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Progress Summary */}
          <Card className="mt-8 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">入力状況</h3>
                  <p className="text-gray-700">
                    {Object.keys(usageFrequencies).length} / {selectedServices.length} 完了
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((Object.keys(usageFrequencies).length / selectedServices.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">完了</div>
                </div>
              </div>
            </CardContent>
          </Card>

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
              disabled={!allFrequenciesSelected}
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