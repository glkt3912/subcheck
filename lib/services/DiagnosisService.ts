import { UserSubscription, DiagnosisResult } from '@/types';
import { calculateDiagnosis } from '@/lib/calculations/CalculationService';
import { StorageService } from '@/lib/storage/StorageService';

export type DiagnosisStep = 'select' | 'usage' | 'results';

export interface DiagnosisSessionData {
  selectedServices: string[];
  userSubscriptions: UserSubscription[];
  diagnosisResult: DiagnosisResult | null;
  currentStep: DiagnosisStep;
  lastUpdated: string;
}

export class DiagnosisService {
  private storage: StorageService;
  private static readonly STORAGE_KEY = 'subcheck_diagnosis_session';

  constructor(storage?: StorageService) {
    this.storage = storage || new StorageService();
  }

  /**
   * Start a new diagnosis session
   */
  async startNewSession(): Promise<void> {
    const sessionData: DiagnosisSessionData = {
      selectedServices: [],
      userSubscriptions: [],
      diagnosisResult: null,
      currentStep: 'select',
      lastUpdated: new Date().toISOString()
    };

    await this.storage.setItem(DiagnosisService.STORAGE_KEY, sessionData);
  }

  /**
   * Get current session data
   */
  async getSession(): Promise<DiagnosisSessionData | null> {
    try {
      return await this.storage.getItem<DiagnosisSessionData>(DiagnosisService.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to get diagnosis session:', error);
      return null;
    }
  }

  /**
   * Save selected services to session
   */
  async saveSelectedServices(serviceIds: string[]): Promise<void> {
    const session = await this.getSession();
    if (!session) {
      await this.startNewSession();
    }

    const updatedSession: DiagnosisSessionData = {
      ...session,
      selectedServices: serviceIds,
      currentStep: serviceIds.length > 0 ? 'usage' : 'select',
      lastUpdated: new Date().toISOString(),
      // Clear downstream data if selection changes
      userSubscriptions: serviceIds.length === 0 ? [] : session?.userSubscriptions || [],
      diagnosisResult: serviceIds.length === 0 ? null : session?.diagnosisResult || null
    };

    await this.storage.setItem(DiagnosisService.STORAGE_KEY, updatedSession);
  }

  /**
   * Save user subscriptions with usage frequencies
   */
  async saveUserSubscriptions(userSubscriptions: UserSubscription[]): Promise<void> {
    const session = await this.getSession();
    if (!session) {
      throw new Error('No active diagnosis session');
    }

    const updatedSession: DiagnosisSessionData = {
      ...session,
      userSubscriptions,
      currentStep: 'results',
      lastUpdated: new Date().toISOString()
    };

    await this.storage.setItem(DiagnosisService.STORAGE_KEY, updatedSession);
  }

  /**
   * Calculate and save diagnosis result
   */
  async calculateDiagnosis(userSubscriptions?: UserSubscription[]): Promise<DiagnosisResult> {
    const session = await this.getSession();
    const subscriptions = userSubscriptions || session?.userSubscriptions;

    if (!subscriptions || subscriptions.length === 0) {
      throw new Error('No user subscriptions available for diagnosis');
    }

    try {
      // Calculate diagnosis using the CalculationService
      const diagnosisResult = calculateDiagnosis(subscriptions);

      // Update session with result
      if (session) {
        const updatedSession: DiagnosisSessionData = {
          ...session,
          diagnosisResult,
          currentStep: 'results',
          lastUpdated: new Date().toISOString()
        };
        await this.storage.setItem(DiagnosisService.STORAGE_KEY, updatedSession);
      }

      return diagnosisResult;
    } catch (error) {
      console.error('Failed to calculate diagnosis:', error);
      throw new Error('診断の計算に失敗しました');
    }
  }

  /**
   * Get diagnosis result from session
   */
  async getDiagnosisResult(): Promise<DiagnosisResult | null> {
    const session = await this.getSession();
    return session?.diagnosisResult || null;
  }

  /**
   * Clear the entire diagnosis session
   */
  async clearSession(): Promise<void> {
    try {
      await this.storage.removeItem(DiagnosisService.STORAGE_KEY);
      
      // Also clear legacy storage keys for backward compatibility
      await Promise.all([
        this.storage.removeItem('subcheck_selected_services'),
        this.storage.removeItem('subcheck_user_subscriptions'),
        this.storage.removeItem('subcheck_diagnosis_result')
      ]);
    } catch (error) {
      console.error('Failed to clear diagnosis session:', error);
    }
  }

  /**
   * Check if a session is valid and not expired
   */
  async isSessionValid(maxAgeHours: number = 24): Promise<boolean> {
    const session = await this.getSession();
    if (!session) return false;

    const lastUpdated = new Date(session.lastUpdated);
    const now = new Date();
    const ageHours = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

    return ageHours <= maxAgeHours;
  }

  /**
   * Get session progress percentage
   */
  async getSessionProgress(): Promise<number> {
    const session = await this.getSession();
    if (!session) return 0;

    switch (session.currentStep) {
      case 'select':
        return session.selectedServices.length > 0 ? 33 : 0;
      case 'usage':
        return 66;
      case 'results':
        return 100;
      default:
        return 0;
    }
  }

  /**
   * Validate session data integrity
   */
  async validateSession(): Promise<{ isValid: boolean; errors: string[] }> {
    const session = await this.getSession();
    const errors: string[] = [];

    if (!session) {
      return { isValid: false, errors: ['セッションが見つかりません'] };
    }

    // Check if selected services exist
    if (session.currentStep !== 'select' && session.selectedServices.length === 0) {
      errors.push('選択されたサービスがありません');
    }

    // Check if user subscriptions match selected services
    if (session.currentStep === 'results') {
      if (session.userSubscriptions.length === 0) {
        errors.push('ユーザーサブスクリプションが設定されていません');
      }

      const subscriptionServiceIds = session.userSubscriptions.map(sub => sub.subscriptionId);
      const missingServices = session.selectedServices.filter(id => !subscriptionServiceIds.includes(id));
      
      if (missingServices.length > 0) {
        errors.push(`一部のサービスの使用頻度が設定されていません: ${missingServices.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Export session data for backup or sharing
   */
  async exportSession(): Promise<string> {
    const session = await this.getSession();
    if (!session) {
      throw new Error('No active session to export');
    }

    return JSON.stringify({
      ...session,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  /**
   * Import session data from backup
   */
  async importSession(sessionData: string): Promise<void> {
    try {
      const parsedData = JSON.parse(sessionData);
      
      // Validate required fields
      if (!parsedData.selectedServices || !Array.isArray(parsedData.selectedServices)) {
        throw new Error('Invalid session data format');
      }

      const importedSession: DiagnosisSessionData = {
        selectedServices: parsedData.selectedServices,
        userSubscriptions: parsedData.userSubscriptions || [],
        diagnosisResult: parsedData.diagnosisResult || null,
        currentStep: parsedData.currentStep || 'select',
        lastUpdated: new Date().toISOString()
      };

      await this.storage.setItem(DiagnosisService.STORAGE_KEY, importedSession);
    } catch (error) {
      console.error('Failed to import session:', error);
      throw new Error('セッションデータのインポートに失敗しました');
    }
  }
}