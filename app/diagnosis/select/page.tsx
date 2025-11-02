'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import SubscriptionSelector from '@/components/forms/SubscriptionSelector';
import CustomSubscriptionManager from '@/components/forms/CustomSubscriptionManager';
import { useDiagnosisSession } from '@/lib/hooks/useDiagnosisSession';
import { SubscriptionService } from '@/lib/services/SubscriptionService';
import { CustomSubscriptionInput } from '@/lib/utils/validation';
import { Subscription } from '@/types';

type TabType = 'select' | 'custom';

export default function SelectPage() {
  const router = useRouter();
  const {
    selectedServices,
    setSelectedServices,
    isLoading,
    clearSession
  } = useDiagnosisSession();
  
  const [availableServices, setAvailableServices] = useState<Subscription[]>([]);
  const [customServices, setCustomServices] = useState<Subscription[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('select');
  const subscriptionService = useMemo(() => new SubscriptionService(), []);

  const loadServices = useCallback(async () => {
    setServicesLoading(true);
    try {
      const [allServices, customOnly] = await Promise.all([
        subscriptionService.getAllSubscriptions(),
        subscriptionService.getCustomSubscriptions()
      ]);
      setAvailableServices(allServices);
      setCustomServices(customOnly);
    } catch (error) {
      console.error('Failed to load services:', error);
      setAvailableServices([]);
      setCustomServices([]);
    } finally {
      setServicesLoading(false);
    }
  }, [subscriptionService]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleSelectionChange = (serviceIds: string[]) => {
    setSelectedServices(serviceIds);
  };

  const handleAddCustomSubscription = async (customSubscription: CustomSubscriptionInput) => {
    try {
      await subscriptionService.addCustomSubscription(customSubscription);
      await loadServices(); // Refresh services list
      setActiveTab('select'); // Switch back to selection tab
    } catch (error) {
      console.error('Failed to add custom subscription:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  const handleEditCustomSubscription = async (subscriptionId: string, updatedData: CustomSubscriptionInput) => {
    try {
      await subscriptionService.editCustomSubscription(subscriptionId, updatedData);
      await loadServices(); // Refresh services list
    } catch (error) {
      console.error('Failed to edit custom subscription:', error);
      throw error;
    }
  };

  const handleRemoveCustomSubscription = async (subscriptionId: string) => {
    try {
      const success = await subscriptionService.removeCustomSubscription(subscriptionId);
      if (success) {
        // Remove from selected services if it was selected
        if (selectedServices.includes(subscriptionId)) {
          setSelectedServices(selectedServices.filter(id => id !== subscriptionId));
        }
        await loadServices(); // Refresh services list
      }
    } catch (error) {
      console.error('Failed to remove custom subscription:', error);
      throw error;
    }
  };

  const handleNext = () => {
    if (selectedServices.length === 0) return;
    router.push('/diagnosis/usage');
  };

  const handleRestart = () => {
    clearSession();
  };

  // Keyboard navigation for tabs
  const handleTabKeyDown = (event: React.KeyboardEvent, tab: TabType) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        setActiveTab(tab === 'select' ? 'custom' : 'select');
        break;
      case 'ArrowRight':
        event.preventDefault();
        setActiveTab(tab === 'select' ? 'custom' : 'select');
        break;
      case 'Home':
        event.preventDefault();
        setActiveTab('select');
        break;
      case 'End':
        event.preventDefault();
        setActiveTab('custom');
        break;
    }
  };

  if (isLoading || servicesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingState text="サービスを読み込み中..." size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm" role="banner">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-xl font-bold text-blue-600" role="img" aria-label="SubCheckロゴ">💳</div>
              <span className="text-lg font-bold text-gray-900">SubCheck</span>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleRestart}
                size="sm"
                aria-label="診断をリセットして最初からやり直す"
              >
                リセット
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/')}
                aria-label="ホームページに戻る"
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
          <Progress 
            value={33} 
            className="h-2" 
            aria-label="診断の進行状況"
            aria-valuenow={33}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext="ステップ1の3：サブスク選択"
          />
        </div>
      </div>

      {/* Main Content */}
      <main id="main-content" className="container mx-auto px-4 py-8" role="main">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              利用中のサブスクを選択
            </h1>
            <p className="text-lg text-gray-600">
              現在契約しているサブスクリプションサービスを選んでください
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto" role="tablist" aria-label="サービス選択タブ">
                <button
                  id="select-tab"
                  onClick={() => setActiveTab('select')}
                  onKeyDown={(e) => handleTabKeyDown(e, 'select')}
                  role="tab"
                  aria-selected={activeTab === 'select'}
                  aria-controls="select-panel"
                  tabIndex={activeTab === 'select' ? 0 : -1}
                  className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === 'select'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="hidden sm:inline">サービス選択 ({selectedServices.length}個選択中)</span>
                  <span className="sm:hidden">選択 ({selectedServices.length})</span>
                </button>
                <button
                  id="custom-tab"
                  onClick={() => setActiveTab('custom')}
                  onKeyDown={(e) => handleTabKeyDown(e, 'custom')}
                  role="tab"
                  aria-selected={activeTab === 'custom'}
                  aria-controls="custom-panel"
                  tabIndex={activeTab === 'custom' ? 0 : -1}
                  className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === 'custom'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="hidden sm:inline">カスタムサービス管理 ({customServices.length}個)</span>
                  <span className="sm:hidden">カスタム ({customServices.length})</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mb-8">
            <div 
              id="select-panel" 
              role="tabpanel" 
              aria-labelledby="select-tab"
              hidden={activeTab !== 'select'}
            >
              {activeTab === 'select' && (
                <SubscriptionSelector
                  services={availableServices}
                  selectedServices={selectedServices}
                  onSelectionChange={handleSelectionChange}
                />
              )}
            </div>

            <div 
              id="custom-panel" 
              role="tabpanel" 
              aria-labelledby="custom-tab"
              hidden={activeTab !== 'custom'}
            >
              {activeTab === 'custom' && (
                <CustomSubscriptionManager
                  customSubscriptions={customServices}
                  allSubscriptions={availableServices}
                  onAddCustomSubscription={handleAddCustomSubscription}
                  onEditCustomSubscription={handleEditCustomSubscription}
                  onRemoveCustomSubscription={handleRemoveCustomSubscription}
                  isLoading={servicesLoading}
                />
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between" role="navigation" aria-label="ページナビゲーション">
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              aria-label="ホームページに戻る"
            >
              戻る
            </Button>
            <Button 
              onClick={handleNext}
              disabled={selectedServices.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
              aria-label={`使用頻度入力ページに進む (${selectedServices.length}個のサービスを選択済み)`}
              aria-describedby={selectedServices.length === 0 ? "selection-required" : undefined}
            >
              次へ ({selectedServices.length}個選択中)
            </Button>
            {selectedServices.length === 0 && (
              <div id="selection-required" className="sr-only">
                続行するには、少なくとも1つのサービスを選択してください
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}