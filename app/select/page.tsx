'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getAllSubscriptions, SUBSCRIPTION_CATEGORIES } from '@/lib/subscriptions';
import { saveSelectedSubscriptions } from '@/lib/storage';
import type { Subscription } from '@/types';

export default function SelectPage() {
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);
  const subscriptions = getAllSubscriptions();

  const toggleSubscription = (id: string) => {
    setSelectedSubscriptions(prev => 
      prev.includes(id) 
        ? prev.filter(sub => sub !== id)
        : [...prev, id]
    );
  };

  const groupedSubscriptions = subscriptions.reduce((acc, sub) => {
    if (!acc[sub.category]) {
      acc[sub.category] = [];
    }
    acc[sub.category].push(sub);
    return acc;
  }, {} as Record<string, Subscription[]>);

  const saveSelections = () => {
    saveSelectedSubscriptions(selectedSubscriptions);
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
            <span className="text-sm font-medium text-gray-600">Step 1 / 3</span>
            <span className="text-sm font-medium text-gray-600">33%</span>
          </div>
          <Progress value={33} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              契約中のサービスを選択
            </h1>
            <p className="text-lg text-gray-600">
              現在契約しているサブスクリプションサービスを選んでください
            </p>
          </div>

          {/* Category Sections */}
          {Object.entries(groupedSubscriptions).map(([category, subs]) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {SUBSCRIPTION_CATEGORIES[category as keyof typeof SUBSCRIPTION_CATEGORIES]}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subs.map((subscription) => (
                  <Card 
                    key={subscription.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedSubscriptions.includes(subscription.id)
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleSubscription(subscription.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl">
                          {subscription.category === 'video' && '📺'}
                          {subscription.category === 'music' && '🎵'}
                          {subscription.category === 'digital' && '💻'}
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedSubscriptions.includes(subscription.id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedSubscriptions.includes(subscription.id) && (
                            <div className="w-3 h-3 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {subscription.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {subscription.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-blue-600">
                          ¥{subscription.price.toLocaleString()}/月
                        </div>
                        {subscription.marketShare && (
                          <div className="text-xs text-gray-500">
                            シェア {subscription.marketShare}
                          </div>
                        )}
                      </div>
                      {subscription.priceRange.min !== subscription.priceRange.max && (
                        <div className="text-xs text-gray-500 mt-1">
                          ¥{subscription.priceRange.min.toLocaleString()} - ¥{subscription.priceRange.max.toLocaleString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {/* Selection Summary */}
          {selectedSubscriptions.length > 0 && (
            <div className="bg-white rounded-lg border-2 border-blue-200 p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                選択済み ({selectedSubscriptions.length}件)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {selectedSubscriptions.map(id => {
                  const sub = subscriptions.find(s => s.id === id);
                  return sub ? (
                    <div key={id} className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {sub.name}
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Link href="/">
              <Button variant="outline" size="lg">
                戻る
              </Button>
            </Link>
            
            <Link 
              href="/frequency"
              onClick={saveSelections}
            >
              <Button 
                size="lg" 
                disabled={selectedSubscriptions.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                次へ (使用頻度入力)
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}