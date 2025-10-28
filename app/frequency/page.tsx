'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getSubscriptionById } from '@/lib/subscriptions';
import { getSelectedSubscriptions, saveUserSubscriptions } from '@/lib/storage';
import type { FrequencyType, UserSubscription } from '@/types';

const FREQUENCY_OPTIONS: Array<{
  value: FrequencyType;
  label: string;
  description: string;
  icon: string;
  color: string;
}> = [
  {
    value: 'daily',
    label: '毎日使う',
    description: 'ほぼ毎日利用している',
    icon: '📅',
    color: 'bg-green-50 border-green-200 text-green-700'
  },
  {
    value: 'weekly',
    label: '週に1-2回',
    description: '週に数回は利用している',
    icon: '📆',
    color: 'bg-blue-50 border-blue-200 text-blue-700'
  },
  {
    value: 'monthly',
    label: '月に1-2回',
    description: '月に数回程度の利用',
    icon: '📌',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700'
  },
  {
    value: 'unused',
    label: 'ほとんど使ってない',
    description: '契約はしているが利用頻度が低い',
    icon: '❌',
    color: 'bg-red-50 border-red-200 text-red-700'
  }
];

export default function FrequencyPage() {
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);
  const [frequencies, setFrequencies] = useState<Record<string, FrequencyType>>({});

  useEffect(() => {
    const saved = getSelectedSubscriptions();
    setSelectedSubscriptions(saved);
  }, []);

  const setFrequency = (subscriptionId: string, frequency: FrequencyType) => {
    setFrequencies(prev => ({
      ...prev,
      [subscriptionId]: frequency
    }));
  };

  const isAllFrequenciesSet = selectedSubscriptions.every(id => frequencies[id]);

  const saveAndProceed = () => {
    const userSubscriptions: UserSubscription[] = selectedSubscriptions.map(id => ({
      subscriptionId: id,
      frequency: frequencies[id],
      selectedAt: new Date()
    }));
    saveUserSubscriptions(userSubscriptions);
  };

  if (selectedSubscriptions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            サービスが選択されていません
          </h1>
          <Link href="/select">
            <Button>サービス選択に戻る</Button>
          </Link>
        </div>
      </div>
    );
  }

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
            <span className="text-sm font-medium text-gray-600">Step 2 / 3</span>
            <span className="text-sm font-medium text-gray-600">67%</span>
          </div>
          <Progress value={67} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              使用頻度を選択
            </h1>
            <p className="text-lg text-gray-600">
              各サービスをどのくらいの頻度で利用していますか？
            </p>
          </div>

          {/* Subscription Frequency Selection */}
          <div className="space-y-8">
            {selectedSubscriptions.map(subscriptionId => {
              const subscription = getSubscriptionById(subscriptionId);
              if (!subscription) return null;

              return (
                <Card key={subscriptionId} className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="text-2xl mr-3">
                        {subscription.category === 'video' && '📺'}
                        {subscription.category === 'music' && '🎵'}
                        {subscription.category === 'digital' && '💻'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {subscription.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ¥{subscription.price.toLocaleString()}/月
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {FREQUENCY_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          onClick={() => setFrequency(subscriptionId, option.value)}
                          className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                            frequencies[subscriptionId] === option.value
                              ? option.color + ' ring-2 ring-offset-2 ring-blue-500'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="text-2xl mb-2">{option.icon}</div>
                          <div className="font-medium text-sm mb-1">{option.label}</div>
                          <div className="text-xs text-gray-600">{option.description}</div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Progress Summary */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">
                進捗: {Object.keys(frequencies).length} / {selectedSubscriptions.length} 完了
              </span>
              <div className="w-32">
                <Progress 
                  value={(Object.keys(frequencies).length / selectedSubscriptions.length) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12">
            <Link href="/select">
              <Button variant="outline" size="lg">
                戻る
              </Button>
            </Link>
            
            <Link 
              href="/result"
              onClick={saveAndProceed}
            >
              <Button 
                size="lg" 
                disabled={!isAllFrequenciesSet}
                className="bg-blue-600 hover:bg-blue-700"
              >
                診断結果を見る
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}