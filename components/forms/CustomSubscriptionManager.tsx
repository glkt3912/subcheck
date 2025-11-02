'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomSubscriptionForm from './CustomSubscriptionForm';
import { CustomSubscriptionInput } from '@/lib/utils/validation';
import { Subscription, SubscriptionCategory } from '@/types';

interface CustomSubscriptionManagerProps {
  customSubscriptions: Subscription[];
  allSubscriptions: Subscription[];
  onAddCustomSubscription: (customSubscription: CustomSubscriptionInput) => Promise<void>;
  onRemoveCustomSubscription: (subscriptionId: string) => Promise<void>;
  onEditCustomSubscription?: (subscriptionId: string, updatedData: CustomSubscriptionInput) => Promise<void>;
  isLoading?: boolean;
}

type ViewMode = 'list' | 'add' | 'edit';

export default function CustomSubscriptionManager({
  customSubscriptions,
  allSubscriptions,
  onAddCustomSubscription,
  onRemoveCustomSubscription,
  onEditCustomSubscription,
  isLoading = false
}: CustomSubscriptionManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAddSubmit = async (customSubscription: CustomSubscriptionInput) => {
    setActionLoading('add');
    try {
      await onAddCustomSubscription(customSubscription);
      setViewMode('list');
    } catch (error) {
      console.error('Failed to add custom subscription:', error);
      // Error handling could be improved with toast notifications
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditSubmit = async (customSubscription: CustomSubscriptionInput) => {
    if (!editingSubscription || !onEditCustomSubscription) return;
    
    setActionLoading('edit');
    try {
      await onEditCustomSubscription(editingSubscription.id, customSubscription);
      setViewMode('list');
      setEditingSubscription(null);
    } catch (error) {
      console.error('Failed to edit custom subscription:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (subscriptionId: string) => {
    if (!confirm('このカスタムサービスを削除しますか？')) return;
    
    setActionLoading(subscriptionId);
    try {
      await onRemoveCustomSubscription(subscriptionId);
    } catch (error) {
      console.error('Failed to remove custom subscription:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setViewMode('edit');
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingSubscription(null);
  };

  const getCategoryLabel = (category: SubscriptionCategory): string => {
    const labels = {
      [SubscriptionCategory.VIDEO]: '📺 動画配信',
      [SubscriptionCategory.MUSIC]: '🎵 音楽配信',
      [SubscriptionCategory.GAMING]: '🎮 ゲーム',
      [SubscriptionCategory.READING]: '📚 読書',
      [SubscriptionCategory.UTILITY]: '🛠️ ユーティリティ',
      [SubscriptionCategory.OTHER]: '📱 その他'
    };
    return labels[category] || '📱 その他';
  };

  if (viewMode === 'add') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">カスタムサービス追加</h3>
          <Button variant="outline" onClick={handleCancel} disabled={actionLoading === 'add'}>
            一覧に戻る
          </Button>
        </div>
        <CustomSubscriptionForm
          onSubmit={handleAddSubmit}
          onCancel={handleCancel}
          existingServices={allSubscriptions}
          isLoading={actionLoading === 'add'}
        />
      </div>
    );
  }

  if (viewMode === 'edit' && editingSubscription) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">カスタムサービス編集</h3>
          <Button variant="outline" onClick={handleCancel} disabled={actionLoading === 'edit'}>
            一覧に戻る
          </Button>
        </div>
        <CustomSubscriptionForm
          onSubmit={handleEditSubmit}
          onCancel={handleCancel}
          existingServices={allSubscriptions.filter(sub => sub.id !== editingSubscription.id)}
          isLoading={actionLoading === 'edit'}
          initialData={{
            name: editingSubscription.name,
            monthlyPrice: editingSubscription.monthlyPrice,
            category: editingSubscription.category
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">カスタムサービス管理</h3>
          <p className="text-sm text-gray-600">
            追加したカスタムサービス: {customSubscriptions.length}個
          </p>
        </div>
        <Button
          onClick={() => setViewMode('add')}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新しいサービス追加
        </Button>
      </div>

      {/* Custom Subscriptions List */}
      {customSubscriptions.length === 0 ? (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              カスタムサービスがありません
            </h3>
            <p className="text-gray-500 mb-4">
              リストにないサブスクリプションサービスを追加して、より正確な診断を受けましょう
            </p>
            <Button
              onClick={() => setViewMode('add')}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              最初のサービスを追加
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customSubscriptions.map((subscription) => (
            <Card key={subscription.id} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {subscription.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold text-gray-900 line-clamp-1">
                        {subscription.name}
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-1">
                        {getCategoryLabel(subscription.category)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {onEditCustomSubscription && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(subscription)}
                        disabled={isLoading || actionLoading !== null}
                        className="h-8 w-8 p-0 touch-manipulation"
                        title="編集"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(subscription.id)}
                      disabled={isLoading || actionLoading === subscription.id}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 touch-manipulation"
                      title="削除"
                    >
                      {actionLoading === subscription.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">月額料金</span>
                    <span className="font-semibold text-gray-900">
                      ¥{subscription.monthlyPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">年額</span>
                    <span className="text-sm text-gray-700">
                      ¥{(subscription.monthlyPrice * 12).toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                      カスタム
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {customSubscriptions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">カスタムサービス合計</h4>
                <p className="text-sm text-blue-700">
                  {customSubscriptions.length}個のサービス
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-900">
                  ¥{customSubscriptions.reduce((total, sub) => total + sub.monthlyPrice, 0).toLocaleString()}/月
                </div>
                <div className="text-sm text-blue-700">
                  年額 ¥{customSubscriptions.reduce((total, sub) => total + sub.monthlyPrice * 12, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}