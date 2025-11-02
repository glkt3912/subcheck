'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  DataCleanupService, 
  CleanupResult, 
  CleanupPresets,
  useDataCleanup 
} from '@/lib/utils/dataCleanup';

export default function DataCleanupPanel() {
  const [storageStats, setStorageStats] = useState<any>(null);
  const [cleanupResults, setCleanupResults] = useState<CleanupResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCleanup, setLastCleanup] = useState<Date | null>(null);

  const { performCleanup, getStorageStats, emergencyCleanup } = useDataCleanup();

  useEffect(() => {
    refreshStorageStats();
    
    // Load last cleanup time from localStorage
    const lastCleanupTime = localStorage.getItem('subcheck_last_cleanup');
    if (lastCleanupTime) {
      setLastCleanup(new Date(lastCleanupTime));
    }
  }, []);

  const refreshStorageStats = () => {
    setStorageStats(getStorageStats());
  };

  const handleCleanup = async (preset: 'conservative' | 'aggressive' | 'development') => {
    setIsLoading(true);
    try {
      const config = CleanupPresets[preset];
      const results = await performCleanup(config);
      setCleanupResults(results);
      
      // Update last cleanup time
      const now = new Date();
      setLastCleanup(now);
      localStorage.setItem('subcheck_last_cleanup', now.toISOString());
      
      // Refresh storage stats
      refreshStorageStats();
    } catch (error) {
      console.error('Cleanup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyCleanup = () => {
    if (confirm('これにより全てのSubCheckデータが削除されます。続行しますか？')) {
      const result = emergencyCleanup();
      setCleanupResults([result]);
      refreshStorageStats();
      setLastCleanup(new Date());
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStorageColor = (percentage: number): string => {
    if (percentage > 80) return 'text-red-600';
    if (percentage > 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (!storageStats) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" text="ストレージ情報を読み込み中..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Storage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 ストレージ使用状況
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getStorageColor(storageStats.percentage)}`}>
                {storageStats.percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">使用率</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatBytes(storageStats.used)}
              </div>
              <div className="text-sm text-gray-600">使用容量</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {storageStats.subcheckItemCount}
              </div>
              <div className="text-sm text-gray-600">SubCheckアイテム数</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  storageStats.percentage > 80 ? 'bg-red-500' :
                  storageStats.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, storageStats.percentage)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cleanup Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧹 データクリーンアップ
          </CardTitle>
          {lastCleanup && (
            <p className="text-sm text-gray-600">
              最終クリーンアップ: {lastCleanup.toLocaleString('ja-JP')}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Conservative Cleanup */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-green-700 mb-2">保守的クリーンアップ</h3>
              <p className="text-sm text-gray-600 mb-4">
                7日以上古いデータのみ削除
              </p>
              <Button 
                onClick={() => handleCleanup('conservative')}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : '実行'}
              </Button>
            </div>

            {/* Aggressive Cleanup */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-yellow-700 mb-2">積極的クリーンアップ</h3>
              <p className="text-sm text-gray-600 mb-4">
                1日以上古いデータを削除
              </p>
              <Button 
                onClick={() => handleCleanup('aggressive')}
                disabled={isLoading}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : '実行'}
              </Button>
            </div>

            {/* Emergency Cleanup */}
            <div className="p-4 border rounded-lg border-red-200">
              <h3 className="font-semibold text-red-700 mb-2">緊急クリーンアップ</h3>
              <p className="text-sm text-gray-600 mb-4">
                全てのSubCheckデータを削除
              </p>
              <Button 
                onClick={handleEmergencyCleanup}
                disabled={isLoading}
                variant="outline"
                className="w-full border-red-300 text-red-700 hover:bg-red-50"
              >
                全削除
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cleanup Results */}
      {cleanupResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 クリーンアップ結果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cleanupResults.map((result, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">操作 {index + 1}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.errors.length > 0 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {result.errors.length > 0 ? 'エラーあり' : '成功'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">{result.summary}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">削除アイテム数: </span>
                      <span className="text-blue-600">{result.itemsRemoved}</span>
                    </div>
                    <div>
                      <span className="font-medium">解放容量: </span>
                      <span className="text-green-600">{formatBytes(result.storageFreed)}</span>
                    </div>
                  </div>

                  {result.errors.length > 0 && (
                    <div className="mt-3 p-2 bg-red-50 rounded">
                      <h5 className="font-medium text-red-800 mb-1">エラー:</h5>
                      <ul className="text-xs text-red-700 list-disc list-inside">
                        {result.errors.map((error, errorIndex) => (
                          <li key={errorIndex}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Refresh */}
      <div className="flex justify-center">
        <Button 
          onClick={refreshStorageStats}
          variant="outline"
          className="flex items-center gap-2"
        >
          🔄 ストレージ情報を更新
        </Button>
      </div>
    </div>
  );
}