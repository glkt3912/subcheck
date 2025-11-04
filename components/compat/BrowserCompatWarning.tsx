'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGracefulDegradation } from '@/lib/hooks/useBrowserCompat';

interface BrowserCompatWarningProps {
  onDismiss?: () => void;
  showRecommendations?: boolean;
}

export default function BrowserCompatWarning({ 
  onDismiss, 
  showRecommendations = true 
}: BrowserCompatWarningProps) {
  const { 
    isCompatible, 
    browserInfo, 
    warnings, 
    getFallbackContent, 
    getRecommendedBrowsers 
  } = useGracefulDegradation();

  // Track manual dismissal separately from computed visibility
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return localStorage.getItem('subcheck_compat_warning_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  // Compute visibility as derived state
  const shouldShowBasedOnCompat = !isCompatible || warnings.length > 0;
  const isVisible = shouldShowBasedOnCompat && !isDismissed;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
    // Remember user dismissed the warning
    try {
      localStorage.setItem('subcheck_compat_warning_dismissed', 'true');
    } catch {
      // If localStorage is not available, dismissal will only last for current session
    }
  };

  const handleDownloadBrowser = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isVisible) {
    return null;
  }

  const fallbackContent = getFallbackContent('general');
  const recommendedBrowsers = getRecommendedBrowsers();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-red-50 border-b border-red-200">
      <Card className="max-w-4xl mx-auto border-red-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Warning Icon */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-lg">⚠️</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                ブラウザ互換性について
              </h3>
              
              <div className="space-y-3">
                {/* Browser Info */}
                <div className="text-sm text-red-700">
                  <strong>検出されたブラウザ:</strong> {browserInfo.name} {browserInfo.version}
                  {!browserInfo.isSupported && (
                    <span className="ml-2 px-2 py-1 bg-red-200 rounded text-xs">
                      サポート対象外
                    </span>
                  )}
                </div>

                {/* Warnings */}
                {warnings.length > 0 && (
                  <div className="text-sm text-red-700">
                    <strong>注意事項:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* General Message */}
                <p className="text-sm text-red-700">
                  {fallbackContent.message}
                </p>

                {/* Recommended Browsers */}
                {showRecommendations && !isCompatible && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                      推奨ブラウザ:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {recommendedBrowsers.map((browser) => (
                        <Button
                          key={browser.name}
                          onClick={() => handleDownloadBrowser(browser.url)}
                          variant="outline"
                          size="sm"
                          className="text-xs border-red-300 text-red-700 hover:bg-red-50"
                        >
                          {browser.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-red-600 hover:text-red-800 text-xl font-bold w-6 h-6 flex items-center justify-center"
              aria-label="警告を閉じる"
            >
              ×
            </button>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              理解しました
            </Button>
            {!isCompatible && (
              <Button
                onClick={() => window.location.reload()}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                ページを再読み込み
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Compact version for minimal space
 */
export function CompactBrowserWarning() {
  const { isCompatible, warnings } = useGracefulDegradation();
  
  // Track manual dismissal
  const [isDismissed, setIsDismissed] = useState(false);
  
  // Compute visibility as derived state
  const shouldShowBasedOnCompat = !isCompatible || warnings.length > 0;
  const isVisible = shouldShowBasedOnCompat && !isDismissed;

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-yellow-600 mr-2">⚠️</span>
          <p className="text-sm text-yellow-700">
            ブラウザの互換性に問題があります。一部機能が制限される可能性があります。
          </p>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-yellow-600 hover:text-yellow-800 font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
}

/**
 * Feature-specific warning component
 */
interface FeatureWarningProps {
  feature: 'localStorage' | 'webWorkers' | 'modernJS';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureWarning({ feature, children, fallback }: FeatureWarningProps) {
  const { shouldDisableFeature, getFallbackContent } = useGracefulDegradation();
  
  const isDisabled = shouldDisableFeature([feature]);
  
  if (isDisabled) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    const content = getFallbackContent(
      feature === 'localStorage' ? 'storage' : 
      feature === 'webWorkers' ? 'worker' : 'general'
    );
    
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
        <div className="flex items-center gap-2 text-yellow-800">
          <span>⚠️</span>
          <p className="text-sm">{content.message}</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}