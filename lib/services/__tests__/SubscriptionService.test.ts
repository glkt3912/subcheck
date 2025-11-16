import { describe, it, expect, beforeEach, vi } from "vitest";
import { SubscriptionService } from "../SubscriptionService";
import type { Subscription } from "@/types";
import { SubscriptionCategory } from "@/types/subscription";

// モックストレージ
const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
};

// モック設定
vi.mock("@/lib/data/subscriptions", () => ({
  SUBSCRIPTION_DATA: [
    {
      id: "netflix",
      name: "Netflix",
      monthlyPrice: 1490,
      category: "streaming",
      isPopular: true
    },
    {
      id: "spotify",
      name: "Spotify Premium",
      monthlyPrice: 980,
      category: "music",
      isPopular: true
    }
  ]
}));

vi.mock("@/lib/utils/validation", () => ({
  ValidationUtils: {
    validateCustomSubscription: vi.fn(() => ({ isValid: true })),
    checkDuplicateName: vi.fn(() => ({ isValid: true })),
    sanitizeServiceName: vi.fn((name: string) => name.trim()),
    formatPrice: vi.fn((price: number) => Math.round(price))
  }
}));

describe("SubscriptionService", () => {
  let subscriptionService: SubscriptionService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage.getItem.mockReturnValue(null);
    subscriptionService = new SubscriptionService(mockStorage as Storage);
  });

  describe("constructor", () => {
    it("カスタムストレージでインスタンス化できる", () => {
      const service = new SubscriptionService(mockStorage as Storage);
      expect(service).toBeInstanceOf(SubscriptionService);
    });

    it("ストレージなしでもインスタンス化できる", () => {
      const service = new SubscriptionService();
      expect(service).toBeInstanceOf(SubscriptionService);
    });
  });

  describe("getAllSubscriptions", () => {
    it("事前定義サブスクリプションを取得する", async () => {
      const result = await subscriptionService.getAllSubscriptions();

      expect(result).toHaveLength(2);
      expect(result.find(sub => sub.id === "netflix")).toBeTruthy();
      expect(result.find(sub => sub.id === "spotify")).toBeTruthy();
    });
  });

  describe("getPopularSubscriptions", () => {
    it("人気のあるサブスクリプションのみを返す", async () => {
      const result = await subscriptionService.getPopularSubscriptions();

      expect(result).toHaveLength(2);
      expect(result.every(sub => sub.isPopular)).toBe(true);
    });
  });

  describe("getSubscriptionById", () => {
    it("事前定義サブスクリプションをIDで取得する", async () => {
      const result = await subscriptionService.getSubscriptionById("netflix");

      expect(result?.id).toBe("netflix");
      expect(result?.name).toBe("Netflix");
    });

    it("存在しないIDの場合はundefinedを返す", async () => {
      const result = await subscriptionService.getSubscriptionById("non-existent");

      expect(result).toBeUndefined();
    });
  });

  describe("isCustomSubscription", () => {
    it("カスタムサブスクリプションIDを正しく判定する", () => {
      expect(subscriptionService.isCustomSubscription("custom_test_123")).toBe(true);
      expect(subscriptionService.isCustomSubscription("custom-test-123")).toBe(false); // ハイフンは'_'ではないため
      expect(subscriptionService.isCustomSubscription("netflix")).toBe(false);
    });
  });

  describe("validateSubscription", () => {
    it("有効なサブスクリプションデータを正しく検証する", () => {
      const validSub: Partial<Subscription> = {
        name: "テストサービス",
        monthlyPrice: 1500,
        category: SubscriptionCategory.VIDEO
      };

      const result = subscriptionService.validateSubscription(validSub);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("無効なデータに対してエラーを返す", () => {
      const invalidSub: Partial<Subscription> = {
        name: "",
        monthlyPrice: -100,
        category: undefined
      };

      const result = subscriptionService.validateSubscription(invalidSub);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("サービス名は必須です");
      expect(result.errors).toContain("月額料金は0円より大きい値を入力してください");
      expect(result.errors).toContain("カテゴリは必須です");
    });
  });

  describe("searchSubscriptions", () => {
    it("名前で部分一致検索ができる", async () => {
      const result = await subscriptionService.searchSubscriptions("netflix");

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Netflix");
    });

    it("該当なしの場合は空配列を返す", async () => {
      const result = await subscriptionService.searchSubscriptions("存在しないサービス");

      expect(result).toHaveLength(0);
    });
  });
});