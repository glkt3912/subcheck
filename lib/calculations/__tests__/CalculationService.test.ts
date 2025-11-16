import { describe, it, expect, vi } from "vitest";
import {
  calculateDiagnosis,
  getWasteRateLevel,
  getWasteRateMessage,
  calculatePotentialSavings,
  getWasteRateColors,
} from "../CalculationService";
import type { UserSubscription, Subscription } from "@/types";
import { UsageFrequency, SubscriptionCategory } from "@/types/subscription";

// モックサブスクリプションデータ
const mockSubscriptions: Subscription[] = [
  {
    id: "netflix",
    name: "Netflix",
    monthlyPrice: 1490,
    category: SubscriptionCategory.VIDEO,
    isPopular: true
  },
  {
    id: "spotify",
    name: "Spotify Premium",
    monthlyPrice: 980,
    category: SubscriptionCategory.MUSIC,
    isPopular: true
  },
  {
    id: "amazon-prime",
    name: "Amazon Prime",
    monthlyPrice: 500,
    category: SubscriptionCategory.OTHER,
    isPopular: false
  }
];

describe("CalculationService", () => {
  describe("calculateDiagnosis", () => {
    it("正常な使用パターンで正しく計算される", () => {
      const userSubscriptions: UserSubscription[] = [
        {
          subscriptionId: "netflix",
          usageFrequency: UsageFrequency.DAILY,
          isCustom: false,
          dateAdded: "2024-01-01",
        },
        {
          subscriptionId: "spotify",
          usageFrequency: UsageFrequency.WEEKLY,
          isCustom: false,
          dateAdded: "2024-01-01",
        }
      ];

      const result = calculateDiagnosis(userSubscriptions, mockSubscriptions);

      expect(result.totals.monthly).toBe(2470); // 1490 + 980
      expect(result.totals.yearly).toBe(29640); // 2470 * 12
      expect(result.wasteRate).toBe(6); // (980 * 0.15) / 2470 = 0.0595... ≈ 6%
      expect(result.frequencyBreakdown.daily).toBe(1490);
      expect(result.frequencyBreakdown.weekly).toBe(980);
      expect(result.comparisonItems.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBe(0); // 正常使用なので推奨なし
      expect(result.shareId).toBeTruthy();
    });

    it("高い無駄率で正しく計算される", () => {
      const userSubscriptions: UserSubscription[] = [
        {
          subscriptionId: "netflix",
          usageFrequency: UsageFrequency.UNUSED,
          isCustom: false,
          dateAdded: "2024-01-01",
        },
        {
          subscriptionId: "spotify",
          usageFrequency: UsageFrequency.MONTHLY,
          isCustom: false,
          dateAdded: "2024-01-01",
        }
      ];

      const result = calculateDiagnosis(userSubscriptions, mockSubscriptions);

      expect(result.totals.monthly).toBe(2470);
      expect(result.wasteRate).toBe(74); // (1490 * 1.0 + 980 * 0.35) / 2470 = 0.7388... ≈ 74%
      expect(result.totals.unusedYearly).toBe(21996); // (1490 * 1.0 + 980 * 0.35) * 12
      expect(result.recommendations.length).toBe(1); // Netflixの解約推奨のみ（Spotifyは980円で閾値1000円未満）
    });

    it("存在しないサブスクリプションIDを正常に処理する", () => {
      const userSubscriptions: UserSubscription[] = [
        {
          subscriptionId: "non-existent",
          usageFrequency: UsageFrequency.DAILY,
          isCustom: false,
          dateAdded: "2024-01-01",
        },
        {
          subscriptionId: "netflix",
          usageFrequency: UsageFrequency.DAILY,
          isCustom: false,
          dateAdded: "2024-01-01",
        }
      ];

      // console.warnをモック
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = calculateDiagnosis(userSubscriptions, mockSubscriptions);

      expect(consoleSpy).toHaveBeenCalledWith("❌ Subscription not found: non-existent");
      expect(result.totals.monthly).toBe(1490); // Netflixのみカウント
      expect(result.wasteRate).toBe(0); // 無駄なし
      
      consoleSpy.mockRestore();
    });

    it("空のサブスクリプションリストを正常に処理する", () => {
      const result = calculateDiagnosis([], mockSubscriptions);

      expect(result.totals.monthly).toBe(0);
      expect(result.totals.yearly).toBe(0);
      expect(result.totals.unusedYearly).toBe(0);
      expect(result.wasteRate).toBe(0);
      expect(result.comparisonItems.length).toBeGreaterThan(0); // 最も近いアイテムが選択される
      expect(result.recommendations.length).toBe(0);
    });
  });

  describe("getWasteRateLevel", () => {
    it("無駄率レベルを正しく分類する", () => {
      expect(getWasteRateLevel(10)).toBe("low");
      expect(getWasteRateLevel(19)).toBe("low");
      expect(getWasteRateLevel(20)).toBe("medium");
      expect(getWasteRateLevel(49)).toBe("medium");
      expect(getWasteRateLevel(50)).toBe("high");
      expect(getWasteRateLevel(80)).toBe("high");
    });
  });

  describe("getWasteRateMessage", () => {
    it("無駄率レベルに応じた適切なメッセージを返す", () => {
      expect(getWasteRateMessage(10)).toBe("とても効率的にサブスクを活用できています！👏");
      expect(getWasteRateMessage(30)).toBe("まずまずですが、まだ改善の余地がありそうです。📊");
      expect(getWasteRateMessage(70)).toBe("かなりの無駄が発生しています。見直しをおすすめします！⚠️");
    });
  });

  describe("calculatePotentialSavings", () => {
    it("推奨事項から年間節約額を正しく計算する", () => {
      const recommendations = [
        {
          subscriptionId: "netflix",
          action: "cancel" as const,
          reason: "未使用",
          potentialSaving: { monthly: 1490, yearly: 17880 },
          priority: "high" as const
        },
        {
          subscriptionId: "spotify",
          action: "review" as const,
          reason: "低使用",
          potentialSaving: { monthly: 343, yearly: 4116 },
          priority: "medium" as const
        }
      ];

      const totalSavings = calculatePotentialSavings(recommendations);
      expect(totalSavings).toBe(21996); // 17880 + 4116
    });

    it("空の推奨リストでゼロを返す", () => {
      expect(calculatePotentialSavings([])).toBe(0);
    });
  });

  describe("getWasteRateColors", () => {
    it("無駄率レベルに応じた適切な色を返す", () => {
      const lowColors = getWasteRateColors(10);
      expect(lowColors.primary).toBe("#10B981"); // Green
      expect(lowColors.background).toBe("#ECFDF5");

      const mediumColors = getWasteRateColors(30);
      expect(mediumColors.primary).toBe("#F59E0B"); // Yellow
      expect(mediumColors.background).toBe("#FFFBEB");

      const highColors = getWasteRateColors(70);
      expect(highColors.primary).toBe("#EF4444"); // Red
      expect(highColors.background).toBe("#FEF2F2");
    });
  });

  describe("比較アイテム生成", () => {
    it("無駄額に近い比較アイテムを生成する", () => {
      const userSubscriptions: UserSubscription[] = [
        {
          subscriptionId: "netflix",
          usageFrequency: UsageFrequency.MONTHLY,
          isCustom: false,
          dateAdded: "2024-01-01",
        }
      ];

      const result = calculateDiagnosis(userSubscriptions, mockSubscriptions);

      expect(result.comparisonItems.length).toBeGreaterThan(0);
      expect(result.comparisonItems.length).toBeLessThanOrEqual(3);

      // 生成されたアイテムが無駄額に対して適切な範囲にあることを確認
      result.comparisonItems.forEach(item => {
        expect(item.amount).toBeGreaterThan(0);
        expect(item.description).toBeTruthy();
        expect(item.icon).toBeTruthy();
        expect(item.category).toBeTruthy();
      });
    });
  });

  describe("推奨事項生成", () => {
    it("未使用サブスクリプションに解約を推奨する", () => {
      const userSubscriptions: UserSubscription[] = [
        {
          subscriptionId: "netflix",
          usageFrequency: UsageFrequency.UNUSED,
          isCustom: false,
          dateAdded: "2024-01-01",
        }
      ];

      const result = calculateDiagnosis(userSubscriptions, mockSubscriptions);
      const cancelRecommendation = result.recommendations.find(r => r.action === "cancel");

      expect(cancelRecommendation).toBeDefined();
      expect(cancelRecommendation?.priority).toBe("high");
      expect(cancelRecommendation?.potentialSaving.yearly).toBe(17880); // 1490 * 12
    });

    it("月1回使用の高額サブスクリプションに見直しを推奨する", () => {
      const userSubscriptions: UserSubscription[] = [
        {
          subscriptionId: "netflix",
          usageFrequency: UsageFrequency.MONTHLY,
          isCustom: false,
          dateAdded: "2024-01-01",
        }
      ];

      const result = calculateDiagnosis(userSubscriptions, mockSubscriptions);
      const reviewRecommendation = result.recommendations.find(r => r.action === "review");

      expect(reviewRecommendation).toBeDefined();
      expect(reviewRecommendation?.priority).toBe("medium");
      expect(reviewRecommendation?.potentialSaving.yearly).toBe(6258); // 1490 * 0.35 * 12
    });

    it("週1回使用の高額サブスクリプションにダウングレードを推奨する", () => {
      // 高額なサブスクリプションを追加
      const expensiveService: Subscription = {
        id: "premium-service",
        name: "Premium Service",
        monthlyPrice: 2000,
        category: SubscriptionCategory.UTILITY,
        isPopular: false
      };
      const expensiveSubscriptions: Subscription[] = [...mockSubscriptions, expensiveService];

      const userSubscriptions: UserSubscription[] = [
        {
          subscriptionId: "premium-service",
          usageFrequency: UsageFrequency.WEEKLY,
          isCustom: false,
          dateAdded: "2024-01-01",
        }
      ];

      const result = calculateDiagnosis(userSubscriptions, expensiveSubscriptions);
      const downgradeRecommendation = result.recommendations.find(r => r.action === "downgrade");

      expect(downgradeRecommendation).toBeDefined();
      expect(downgradeRecommendation?.priority).toBe("low");
      expect(downgradeRecommendation?.potentialSaving.yearly).toBe(3600); // 2000 * 0.15 * 12
    });

    it("推奨事項が優先度順にソートされる", () => {
      const userSubscriptions: UserSubscription[] = [
        {
          subscriptionId: "netflix",
          usageFrequency: UsageFrequency.UNUSED,
          isCustom: false,
          dateAdded: "2024-01-01",
        },
        {
          subscriptionId: "spotify",
          usageFrequency: UsageFrequency.MONTHLY,
          isCustom: false,
          dateAdded: "2024-01-01",
        }
      ];

      const result = calculateDiagnosis(userSubscriptions, mockSubscriptions);

      expect(result.recommendations.length).toBe(1); // Netflixの解約推奨のみ
      expect(result.recommendations[0].priority).toBe("high"); // 解約推奨が最初
      // Spotifyは980円なので、見直し推奨の閾値1000円を下回るため、推奨されない
    });
  });

  describe("FREQUENCY_MULTIPLIERS 検証", () => {
    it("使用頻度に応じた無駄率計算が正確である", () => {
      const testCases = [
        { frequency: UsageFrequency.DAILY, expectedWasteMultiplier: 0.0 },
        { frequency: UsageFrequency.WEEKLY, expectedWasteMultiplier: 0.15 },
        { frequency: UsageFrequency.MONTHLY, expectedWasteMultiplier: 0.35 },
        { frequency: UsageFrequency.UNUSED, expectedWasteMultiplier: 1.0 }
      ];

      testCases.forEach(({ frequency, expectedWasteMultiplier }) => {
        const userSubscriptions: UserSubscription[] = [{
          subscriptionId: "netflix",
          usageFrequency: frequency,
          isCustom: false,
          dateAdded: "2024-01-01",
        }];

        const result = calculateDiagnosis(userSubscriptions, mockSubscriptions);
        const expectedWasteRate = Math.round(expectedWasteMultiplier * 100);
        
        expect(result.wasteRate).toBe(expectedWasteRate);
      });
    });
  });
});