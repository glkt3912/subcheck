'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SharingService, ShareResult } from '@/lib/services/SharingService';
import { ShareTextFormatter } from '@/lib/utils/shareTextFormatter';
import { DiagnosisResult } from '@/types';

interface SocialShareButtonsProps {
  diagnosisResult: DiagnosisResult;
  className?: string;
}

export default function SocialShareButtons({ diagnosisResult, className = '' }: SocialShareButtonsProps) {
  const [sharing, setSharing] = useState<string | null>(null);
  const [shareResult, setShareResult] = useState<ShareResult | null>(null);
  const sharingService = new SharingService();

  const handleTwitterShare = async () => {
    setSharing('twitter');
    setShareResult(null);
    
    try {
      const shareData = ShareTextFormatter.generateSharePackage(diagnosisResult, 'twitter');
      const result = await sharingService.shareToTwitter(shareData);
      setShareResult(result);
      
      if (result.success) {
        // Track successful share (could add analytics here)
        console.log('Twitter share successful');
      }
    } catch {
      setShareResult({
        success: false,
        platform: 'twitter',
        error: 'Twitter共有に失敗しました'
      });
    } finally {
      setSharing(null);
    }
  };

  const handleLineShare = async () => {
    setSharing('line');
    setShareResult(null);
    
    try {
      const shareData = ShareTextFormatter.generateSharePackage(diagnosisResult, 'line');
      const result = await sharingService.shareToLine(shareData);
      setShareResult(result);
      
      if (result.success) {
        // Track successful share (could add analytics here)
        console.log('LINE share successful');
      }
    } catch {
      setShareResult({
        success: false,
        platform: 'line',
        error: 'LINE共有に失敗しました'
      });
    } finally {
      setSharing(null);
    }
  };

  const handleNativeShare = async () => {
    setSharing('native');
    setShareResult(null);
    
    try {
      const shareData = ShareTextFormatter.generateSharePackage(diagnosisResult, 'simple');
      const result = await sharingService.shareNative(shareData);
      setShareResult(result);
      
      if (result.success) {
        console.log('Native share successful');
      }
    } catch {
      setShareResult({
        success: false,
        platform: 'native',
        error: 'シェアに失敗しました'
      });
    } finally {
      setSharing(null);
    }
  };

  const handleCopyLink = async () => {
    const shareData = ShareTextFormatter.generateSharePackage(diagnosisResult, 'simple');
    const fullText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
    
    const success = await sharingService.copyToClipboard(fullText);
    
    setShareResult({
      success,
      platform: 'native',
      error: success ? undefined : 'クリップボードへのコピーに失敗しました'
    });
    
    // Clear result after 3 seconds
    setTimeout(() => setShareResult(null), 3000);
  };

  const isNativeAvailable = sharingService.isNativeSharingAvailable();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Share Title */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          診断結果をシェア
        </h3>
        <p className="text-sm text-gray-600">
          友達にも診断をおすすめしよう！
        </p>
      </div>

      {/* Share Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Twitter Share */}
        <Button
          onClick={handleTwitterShare}
          disabled={sharing === 'twitter'}
          className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span>
            {sharing === 'twitter' ? 'シェア中...' : 'X (Twitter)'}
          </span>
        </Button>

        {/* LINE Share */}
        <Button
          onClick={handleLineShare}
          disabled={sharing === 'line'}
          className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.630.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
          <span>
            {sharing === 'line' ? 'シェア中...' : 'LINE'}
          </span>
        </Button>

        {/* Native Share (Mobile) */}
        {isNativeAvailable && (
          <Button
            onClick={handleNativeShare}
            disabled={sharing === 'native'}
            variant="outline"
            className="flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span>
              {sharing === 'native' ? 'シェア中...' : 'その他'}
            </span>
          </Button>
        )}

        {/* Copy Link */}
        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          <span>コピー</span>
        </Button>
      </div>

      {/* Share Result Feedback */}
      {shareResult && (
        <Card className={`${shareResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {shareResult.success ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className={`text-sm ${shareResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {shareResult.success ? (
                  shareResult.platform === 'native' && !shareResult.error ? 
                    'テキストをコピーしました！' : 
                    'シェアしました！'
                ) : (
                  shareResult.error || 'シェアに失敗しました'
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Share Preview */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">プレビュー</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-medium">
              {ShareTextFormatter.generateShareTitle(
                ShareTextFormatter.formatDiagnosisResult(diagnosisResult)
              )}
            </p>
            <p className="text-xs">
              {diagnosisResult.subscriptions.length}個のサービス • 
              年間¥{diagnosisResult.totals.unusedYearly.toLocaleString()}の無駄
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}