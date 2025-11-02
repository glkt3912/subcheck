// Browser compatibility reporting utilities

import { BrowserFeatureDetector } from './browserCompat';

interface CompatibilityReport {
  timestamp: string;
  browserInfo: {
    name: string;
    version: string;
    userAgent: string;
    isSupported: boolean;
  };
  features: {
    [key: string]: {
      supported: boolean;
      fallbackAvailable: boolean;
      impactLevel: 'low' | 'medium' | 'high';
    };
  };
  recommendations: string[];
  overallScore: number; // 0-100
}

export class CompatibilityReporter {
  
  /**
   * Generate comprehensive compatibility report
   */
  static generateReport(): CompatibilityReport {
    const browserInfo = BrowserFeatureDetector.getBrowserInfo();
    const userAgent = typeof window !== 'undefined' ? navigator.userAgent : 'Unknown';
    
    const features = {
      localStorage: {
        supported: BrowserFeatureDetector.isLocalStorageAvailable(),
        fallbackAvailable: true, // Memory storage available
        impactLevel: 'high' as const
      },
      sessionStorage: {
        supported: BrowserFeatureDetector.isSessionStorageAvailable(),
        fallbackAvailable: true, // Memory storage available
        impactLevel: 'medium' as const
      },
      indexedDB: {
        supported: BrowserFeatureDetector.isIndexedDBAvailable(),
        fallbackAvailable: false,
        impactLevel: 'low' as const
      },
      cssGrid: {
        supported: BrowserFeatureDetector.isCSSGridSupported(),
        fallbackAvailable: true, // Flexbox fallback
        impactLevel: 'medium' as const
      },
      flexbox: {
        supported: BrowserFeatureDetector.isFlexboxSupported(),
        fallbackAvailable: false,
        impactLevel: 'high' as const
      },
      intersectionObserver: {
        supported: BrowserFeatureDetector.isIntersectionObserverSupported(),
        fallbackAvailable: true, // Scroll event fallback
        impactLevel: 'low' as const
      },
      resizeObserver: {
        supported: BrowserFeatureDetector.isResizeObserverSupported(),
        fallbackAvailable: true, // Resize event fallback
        impactLevel: 'low' as const
      },
      webWorkers: {
        supported: BrowserFeatureDetector.isWebWorkerSupported(),
        fallbackAvailable: false,
        impactLevel: 'low' as const
      },
      modernJS: {
        supported: BrowserFeatureDetector.isModernBrowserSupported(),
        fallbackAvailable: true, // Polyfills available
        impactLevel: 'high' as const
      }
    };

    const recommendations = this.generateRecommendations(browserInfo, features);
    const overallScore = this.calculateOverallScore(features);

    return {
      timestamp: new Date().toISOString(),
      browserInfo: {
        ...browserInfo,
        userAgent
      },
      features,
      recommendations,
      overallScore
    };
  }

  /**
   * Generate personalized recommendations
   */
  private static generateRecommendations(
    browserInfo: any, 
    features: any
  ): string[] {
    const recommendations: string[] = [];

    // Browser-specific recommendations
    if (!browserInfo.isSupported) {
      if (browserInfo.name === 'Internet Explorer') {
        recommendations.push('Internet Explorerはサポートされていません。Microsoft Edge、Chrome、Firefox、またはSafariをご利用ください。');
      } else {
        recommendations.push(`${browserInfo.name}を最新バージョンに更新することをお勧めします。`);
      }
    }

    // Storage recommendations
    if (!features.localStorage.supported && !features.sessionStorage.supported) {
      recommendations.push('データの永続化ができません。ブラウザの設定でCookieを有効にするか、シークレットモードを無効にしてください。');
    } else if (!features.localStorage.supported) {
      recommendations.push('LocalStorageが利用できません。データはセッション中のみ保存されます。');
    }

    // Layout recommendations
    if (!features.cssGrid.supported && !features.flexbox.supported) {
      recommendations.push('最新のレイアウト機能が利用できません。表示が崩れる可能性があります。');
    }

    // JavaScript recommendations
    if (!features.modernJS.supported) {
      recommendations.push('一部のJavaScript機能が制限されます。ブラウザの更新をお勧めします。');
    }

    // Performance recommendations
    if (!features.webWorkers.supported) {
      recommendations.push('バックグラウンド処理が利用できません。大量データの処理時に画面が一時的に応答しなくなる可能性があります。');
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('お使いのブラウザは全ての機能に対応しています。');
    }

    return recommendations;
  }

  /**
   * Calculate overall compatibility score
   */
  private static calculateOverallScore(features: any): number {
    const weights = {
      high: 3,
      medium: 2,
      low: 1
    };

    let totalWeight = 0;
    let achievedWeight = 0;

    Object.values(features).forEach((feature: any) => {
      const weight = weights[feature.impactLevel as keyof typeof weights];
      totalWeight += weight;
      
      if (feature.supported) {
        achievedWeight += weight;
      } else if (feature.fallbackAvailable) {
        achievedWeight += weight * 0.7; // 70% score for fallback
      }
    });

    return totalWeight > 0 ? Math.round((achievedWeight / totalWeight) * 100) : 0;
  }

  /**
   * Format report for display
   */
  static formatReport(report: CompatibilityReport): string {
    const lines: string[] = [];
    
    lines.push('=== SubCheck ブラウザ互換性レポート ===');
    lines.push(`生成日時: ${new Date(report.timestamp).toLocaleString('ja-JP')}`);
    lines.push('');
    
    lines.push('【ブラウザ情報】');
    lines.push(`  ブラウザ: ${report.browserInfo.name} ${report.browserInfo.version}`);
    lines.push(`  サポート状況: ${report.browserInfo.isSupported ? '✅ サポート対象' : '❌ サポート対象外'}`);
    lines.push('');
    
    lines.push('【機能対応状況】');
    Object.entries(report.features).forEach(([featureName, feature]) => {
      const status = feature.supported ? '✅' : feature.fallbackAvailable ? '⚠️' : '❌';
      const impact = feature.impactLevel === 'high' ? '高' : 
                    feature.impactLevel === 'medium' ? '中' : '低';
      lines.push(`  ${featureName}: ${status} (影響度: ${impact})`);
    });
    lines.push('');
    
    lines.push(`【総合スコア】: ${report.overallScore}/100`);
    lines.push('');
    
    lines.push('【推奨事項】');
    report.recommendations.forEach((rec, index) => {
      lines.push(`  ${index + 1}. ${rec}`);
    });

    return lines.join('\n');
  }

  /**
   * Export report as downloadable file
   */
  static exportReport(report: CompatibilityReport, format: 'txt' | 'json' = 'txt'): void {
    if (typeof window === 'undefined') return;

    let content: string;
    let mimeType: string;
    let filename: string;

    if (format === 'json') {
      content = JSON.stringify(report, null, 2);
      mimeType = 'application/json';
      filename = `subcheck-compatibility-${Date.now()}.json`;
    } else {
      content = this.formatReport(report);
      mimeType = 'text/plain';
      filename = `subcheck-compatibility-${Date.now()}.txt`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /**
   * Send report to analytics (placeholder)
   */
  static sendAnalytics(report: CompatibilityReport): void {
    // In a real application, you would send this to your analytics service
    console.log('Compatibility report for analytics:', {
      browser: `${report.browserInfo.name} ${report.browserInfo.version}`,
      score: report.overallScore,
      unsupportedFeatures: Object.entries(report.features)
        .filter(([, feature]) => !feature.supported)
        .map(([name]) => name)
    });
  }

  /**
   * Get compatibility status for a specific feature
   */
  static getFeatureStatus(featureName: string): {
    supported: boolean;
    message: string;
    severity: 'info' | 'warning' | 'error';
  } {
    const report = this.generateReport();
    const feature = report.features[featureName];

    if (!feature) {
      return {
        supported: false,
        message: '不明な機能です',
        severity: 'error'
      };
    }

    if (feature.supported) {
      return {
        supported: true,
        message: '対応済み',
        severity: 'info'
      };
    } else if (feature.fallbackAvailable) {
      return {
        supported: false,
        message: '代替機能で対応',
        severity: 'warning'
      };
    } else {
      return {
        supported: false,
        message: '未対応',
        severity: 'error'
      };
    }
  }
}