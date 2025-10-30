export interface ShareData {
  title: string;
  text: string;
  url?: string;
  hashtags?: string[];
}

export interface ShareResult {
  success: boolean;
  platform?: 'twitter' | 'line' | 'native';
  error?: string;
}

interface ShareDataInput {
  title?: string;
  text?: string;
  url?: string;
}

export class SharingService {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  }

  /**
   * Generate Twitter share URL
   */
  generateTwitterShareUrl(data: ShareData): string {
    const params = new URLSearchParams();
    
    // Twitter text format: title + text
    const tweetText = data.title ? `${data.title}\n\n${data.text}` : data.text;
    params.append('text', tweetText);
    
    if (data.url) {
      params.append('url', data.url);
    }
    
    if (data.hashtags && data.hashtags.length > 0) {
      params.append('hashtags', data.hashtags.join(','));
    }

    return `https://twitter.com/intent/tweet?${params.toString()}`;
  }

  /**
   * Generate LINE share URL
   */
  generateLineShareUrl(data: ShareData): string {
    const params = new URLSearchParams();
    
    // LINE message format: title + text + url
    let message = data.title ? `${data.title}\n\n${data.text}` : data.text;
    if (data.url) {
      message += `\n\n${data.url}`;
    }
    
    params.append('text', message);

    return `https://social-plugins.line.me/lineit/share?${params.toString()}`;
  }

  /**
   * Share via Twitter
   */
  async shareToTwitter(data: ShareData): Promise<ShareResult> {
    try {
      const shareUrl = this.generateTwitterShareUrl({
        ...data,
        url: data.url || this.baseUrl
      });
      
      if (typeof window !== 'undefined') {
        window.open(shareUrl, '_blank', 'width=550,height=420,scrollbars=yes,resizable=yes');
      }
      
      return {
        success: true,
        platform: 'twitter'
      };
    } catch (error) {
      return {
        success: false,
        platform: 'twitter',
        error: error instanceof Error ? error.message : 'Twitter共有に失敗しました'
      };
    }
  }

  /**
   * Share via LINE
   */
  async shareToLine(data: ShareData): Promise<ShareResult> {
    try {
      const shareUrl = this.generateLineShareUrl({
        ...data,
        url: data.url || this.baseUrl
      });
      
      if (typeof window !== 'undefined') {
        window.open(shareUrl, '_blank', 'width=550,height=420,scrollbars=yes,resizable=yes');
      }
      
      return {
        success: true,
        platform: 'line'
      };
    } catch (error) {
      return {
        success: false,
        platform: 'line',
        error: error instanceof Error ? error.message : 'LINE共有に失敗しました'
      };
    }
  }

  /**
   * Share via native Web Share API (fallback for mobile devices)
   */
  async shareNative(data: ShareData): Promise<ShareResult> {
    try {
      if (typeof navigator === 'undefined' || !navigator.share) {
        throw new Error('Native sharing not supported');
      }

      const shareData: ShareDataInput = {
        title: data.title,
        text: data.text
      };

      if (data.url) {
        shareData.url = data.url;
      }

      await navigator.share(shareData);
      
      return {
        success: true,
        platform: 'native'
      };
    } catch (error) {
      return {
        success: false,
        platform: 'native',
        error: error instanceof Error ? error.message : 'ネイティブ共有に失敗しました'
      };
    }
  }

  /**
   * Check if native sharing is available
   */
  isNativeSharingAvailable(): boolean {
    return typeof navigator !== 'undefined' && 
           typeof navigator.share === 'function';
  }

  /**
   * Auto-select best sharing method for device
   */
  async share(data: ShareData, preferredPlatform?: 'twitter' | 'line' | 'native'): Promise<ShareResult> {
    if (preferredPlatform) {
      switch (preferredPlatform) {
        case 'twitter':
          return this.shareToTwitter(data);
        case 'line':
          return this.shareToLine(data);
        case 'native':
          return this.shareNative(data);
      }
    }

    // Auto-select based on device capabilities
    if (this.isNativeSharingAvailable()) {
      return this.shareNative(data);
    }

    // Default to Twitter on desktop
    return this.shareToTwitter(data);
  }

  /**
   * Copy text to clipboard as fallback
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      // Fallback for older browsers
      if (typeof document !== 'undefined') {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
}