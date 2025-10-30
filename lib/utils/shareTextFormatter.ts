import { DiagnosisResult } from '@/types';

export interface ShareTextData {
  wasteRate: number;
  yearlyWaste: number;
  monthlyTotal: number;
  serviceCount: number;
}

export class ShareTextFormatter {
  /**
   * Format diagnosis result for sharing
   */
  static formatDiagnosisResult(diagnosisResult: DiagnosisResult): ShareTextData {
    return {
      wasteRate: diagnosisResult.wasteRate,
      yearlyWaste: diagnosisResult.totals.unusedYearly,
      monthlyTotal: diagnosisResult.totals.monthly,
      serviceCount: diagnosisResult.subscriptions.length
    };
  }

  /**
   * Generate share text for Twitter
   */
  static generateTwitterText(data: ShareTextData): string {
    const wasteRateEmoji = this.getWasteRateEmoji(data.wasteRate);
    const message = this.getWasteRateMessage(data.wasteRate);
    
    return `${wasteRateEmoji} サブスク診断結果 ${wasteRateEmoji}

🔍 ${data.serviceCount}個のサービスを診断
📊 無駄率: ${data.wasteRate}%
💰 年間浪費額: ¥${data.yearlyWaste.toLocaleString()}
💳 月額合計: ¥${data.monthlyTotal.toLocaleString()}

${message}

#サブスク診断 #節約 #SubCheck`;
  }

  /**
   * Generate share text for LINE
   */
  static generateLineText(data: ShareTextData): string {
    const wasteRateEmoji = this.getWasteRateEmoji(data.wasteRate);
    
    return `${wasteRateEmoji} サブスク診断してみた！

${data.serviceCount}個のサービスで
無駄率 ${data.wasteRate}%
年間 ¥${data.yearlyWaste.toLocaleString()} も無駄遣いしてた😱

月額合計: ¥${data.monthlyTotal.toLocaleString()}

みんなも診断してみて！`;
  }

  /**
   * Generate simple share text for native sharing or clipboard
   */
  static generateSimpleText(data: ShareTextData): string {
    return `サブスク診断結果

${data.serviceCount}個のサービス
無駄率: ${data.wasteRate}%
年間浪費額: ¥${data.yearlyWaste.toLocaleString()}
月額合計: ¥${data.monthlyTotal.toLocaleString()}

SubCheckで診断`;
  }

  /**
   * Get emoji based on waste rate
   */
  private static getWasteRateEmoji(wasteRate: number): string {
    if (wasteRate < 20) return '🎉';
    if (wasteRate < 50) return '😐';
    return '😱';
  }

  /**
   * Get message based on waste rate
   */
  private static getWasteRateMessage(wasteRate: number): string {
    if (wasteRate < 20) return 'とても効率的！👏';
    if (wasteRate < 50) return 'まずまずだけど改善の余地あり📊';
    return '見直しが必要かも⚠️';
  }

  /**
   * Generate title for sharing
   */
  static generateShareTitle(data: ShareTextData): string {
    return `サブスク診断結果: 無駄率${data.wasteRate}%`;
  }

  /**
   * Generate hashtags for Twitter
   */
  static generateHashtags(data: ShareTextData): string[] {
    const hashtags = ['サブスク診断', 'SubCheck'];
    
    if (data.wasteRate < 20) {
      hashtags.push('効率的', '節約上手');
    } else if (data.wasteRate < 50) {
      hashtags.push('節約');
    } else {
      hashtags.push('無駄遣い', '見直し必要');
    }
    
    return hashtags;
  }

  /**
   * Generate URL with diagnosis parameters (for future result sharing)
   */
  static generateResultUrl(diagnosisResult: DiagnosisResult, baseUrl?: string): string {
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    
    // For now, just return the base URL
    // In the future, could encode result data in URL parameters
    return `${base}`;
  }

  /**
   * Format number for Japanese locale
   */
  static formatJapaneseNumber(amount: number): string {
    return amount.toLocaleString('ja-JP');
  }

  /**
   * Generate comparison text (what the waste amount could buy)
   */
  static generateComparisonText(yearlyWaste: number): string {
    if (yearlyWaste >= 100000) {
      return 'ヨーロッパ旅行ができちゃう金額';
    } else if (yearlyWaste >= 50000) {
      return '新しいスマホが買える金額';
    } else if (yearlyWaste >= 30000) {
      return '温泉旅行ができる金額';
    } else if (yearlyWaste >= 10000) {
      return 'コンビニ弁当20回分';
    } else {
      return 'ちょっとした節約で改善可能';
    }
  }

  /**
   * Generate complete share package for different platforms
   */
  static generateSharePackage(diagnosisResult: DiagnosisResult, platform: 'twitter' | 'line' | 'simple' = 'simple') {
    const data = this.formatDiagnosisResult(diagnosisResult);
    const title = this.generateShareTitle(data);
    const url = this.generateResultUrl(diagnosisResult);
    
    switch (platform) {
      case 'twitter':
        return {
          title,
          text: this.generateTwitterText(data),
          url,
          hashtags: this.generateHashtags(data)
        };
        
      case 'line':
        return {
          title,
          text: this.generateLineText(data),
          url
        };
        
      default:
        return {
          title,
          text: this.generateSimpleText(data),
          url
        };
    }
  }
}