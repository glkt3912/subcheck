import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveSelectedSubscriptions,
  getSelectedSubscriptions,
  saveUserSubscriptions,
  getUserSubscriptions,
  saveDiagnosisResult,
  getDiagnosisResult,
  clearAllData,
  hasExistingData
} from "../StorageService";
import type { UserSubscription, DiagnosisResult } from "@/types";
import { UsageFrequency } from "@/types/subscription";

// モックストレージ
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
};

// enhancedStorage のモック
vi.mock("../StorageWithFallback", () => ({
  enhancedStorage: {
    saveSelectedSubscriptions: vi.fn(),
    getSelectedSubscriptions: vi.fn(),
    saveUserSubscriptions: vi.fn(),
    getUserSubscriptions: vi.fn(),
    saveDiagnosisResult: vi.fn(),
    getDiagnosisResult: vi.fn(),
    getStorageStatus: vi.fn(() => ({
      available: { localStorage: true, sessionStorage: true, memory: true },
      current: "localStorage"
    }))
  }
}));

// enhancedStorage インスタンスを取得
const { enhancedStorage } = await import("../StorageWithFallback");

// グローバルlocalStorageをモック
Object.defineProperty(global, "localStorage", {
  value: mockLocalStorage,
  writable: true
});

describe("StorageService", () => {
  // テスト用データ
  const testSubscriptionIds = ["netflix", "spotify", "amazon-prime"];
  
  const testUserSubscriptions: UserSubscription[] = [
    {
      subscriptionId: "netflix",
      usageFrequency: UsageFrequency.DAILY,
      isCustom: false,
      dateAdded: "2024-01-01"
    }
  ];

  const testDiagnosisResult: DiagnosisResult = {
    subscriptions: testUserSubscriptions,
    totals: {
      monthly: 1490,
      yearly: 17880,
      unusedYearly: 0
    },
    wasteRate: 0,
    frequencyBreakdown: {
      daily: 1490,
      weekly: 0,
      monthly: 0,
      unused: 0
    },
    comparisonItems: [],
    recommendations: [],
    createdAt: new Date("2024-01-15T10:00:00Z"),
    shareId: "abc123"
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // デフォルトの戻り値を設定
    vi.mocked(enhancedStorage.getSelectedSubscriptions).mockReturnValue([]);
    vi.mocked(enhancedStorage.getUserSubscriptions).mockReturnValue([]);
    vi.mocked(enhancedStorage.getDiagnosisResult).mockReturnValue(null);
    vi.mocked(enhancedStorage.saveSelectedSubscriptions).mockReturnValue(true);
    vi.mocked(enhancedStorage.saveUserSubscriptions).mockReturnValue(true);
    vi.mocked(enhancedStorage.saveDiagnosisResult).mockReturnValue(true);
    
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe("Selected Subscriptions Management", () => {
    it("選択されたサブスクリプションを正常に保存する", () => {
      saveSelectedSubscriptions(testSubscriptionIds);

      expect(enhancedStorage.saveSelectedSubscriptions).toHaveBeenCalledWith(testSubscriptionIds);
    });

    it("選択されたサブスクリプションを正常に取得する", () => {
      vi.mocked(enhancedStorage.getSelectedSubscriptions).mockReturnValue(testSubscriptionIds);

      const result = getSelectedSubscriptions();

      expect(result).toEqual(testSubscriptionIds);
    });
  });

  describe("User Subscriptions Management", () => {
    it("ユーザーサブスクリプションを正常に保存する", () => {
      saveUserSubscriptions(testUserSubscriptions);

      expect(enhancedStorage.saveUserSubscriptions).toHaveBeenCalledWith(testUserSubscriptions);
    });

    it("ユーザーサブスクリプションを正常に取得する", () => {
      vi.mocked(enhancedStorage.getUserSubscriptions).mockReturnValue(testUserSubscriptions);

      const result = getUserSubscriptions();

      expect(result).toEqual(testUserSubscriptions);
    });
  });

  describe("Diagnosis Result Management", () => {
    it("診断結果を正常に保存する", () => {
      saveDiagnosisResult(testDiagnosisResult);

      expect(enhancedStorage.saveDiagnosisResult).toHaveBeenCalledWith(testDiagnosisResult);
    });

    it("診断結果を正常に取得する", () => {
      vi.mocked(enhancedStorage.getDiagnosisResult).mockReturnValue(testDiagnosisResult);

      const result = getDiagnosisResult();

      expect(result).toEqual(testDiagnosisResult);
    });
  });

  describe("Data Management", () => {
    it("すべてのデータを正常にクリアする", () => {
      clearAllData();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("selectedSubscriptions");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("userSubscriptions");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("diagnosisResult");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("diagnosisHistory");
    });
  });

  describe("Utility Functions", () => {
    it("既存データの有無を正しく判定する", () => {
      // データがない場合
      expect(hasExistingData()).toBe(false);

      // データがある場合
      vi.mocked(enhancedStorage.getSelectedSubscriptions).mockReturnValue(testSubscriptionIds);
      expect(hasExistingData()).toBe(true);
    });
  });
});