import { describe, it, expect, beforeEach, vi } from "vitest";
import { AlertService } from "../AlertService";
import type { DiagnosisResult } from "@/types";
import { UsageFrequency } from "@/types/subscription";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("AlertService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe("generateAlerts", () => {
    it("should generate high waste rate alert for 70% waste rate", () => {
      const diagnosisResult: DiagnosisResult = {
        subscriptions: [
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
          },
        ],
        totals: { monthly: 3000, yearly: 36000, unusedYearly: 25000 },
        wasteRate: 70,
        frequencyBreakdown: { daily: 0, weekly: 0, monthly: 1, unused: 1 },
        comparisonItems: [],
        recommendations: [],
        createdAt: new Date(),
        shareId: "test-share-id",
      };

      const alerts = AlertService.generateAlerts(diagnosisResult);

      expect(alerts.length).toBeGreaterThan(0);

      const wasteRateAlert = alerts.find(
        (alert) => alert.type === "waste_rate"
      );
      expect(wasteRateAlert).toBeDefined();
      expect(wasteRateAlert?.severity).toBe("warning");
      expect(wasteRateAlert?.title).toContain("60%");
    });

    it("should generate unused service alert", () => {
      const diagnosisResult: DiagnosisResult = {
        subscriptions: [
          {
            subscriptionId: "netflix",
            usageFrequency: UsageFrequency.UNUSED,
            isCustom: false,
            dateAdded: "2024-01-01",
          },
          {
            subscriptionId: "spotify",
            usageFrequency: UsageFrequency.UNUSED,
            isCustom: false,
            dateAdded: "2024-01-01",
          },
        ],
        totals: { monthly: 3000, yearly: 36000, unusedYearly: 3000 },
        wasteRate: 100,
        frequencyBreakdown: { daily: 0, weekly: 0, monthly: 0, unused: 2 },
        comparisonItems: [],
        recommendations: [],
        createdAt: new Date(),
        shareId: "test-share-id",
      };

      const alerts = AlertService.generateAlerts(diagnosisResult);

      const unusedAlert = alerts.find(
        (alert) => alert.type === "unused_service"
      );
      expect(unusedAlert).toBeDefined();
      expect(unusedAlert?.severity).toBe("critical");
      expect(unusedAlert?.affectedServices).toEqual(["netflix", "spotify"]);
    });

    it("should not generate alerts for normal usage", () => {
      const diagnosisResult: DiagnosisResult = {
        subscriptions: [
          {
            subscriptionId: "netflix",
            usageFrequency: UsageFrequency.DAILY,
            isCustom: false,
            dateAdded: "2024-01-01",
          },
          {
            subscriptionId: "spotify",
            usageFrequency: UsageFrequency.DAILY,
            isCustom: false,
            dateAdded: "2024-01-01",
          },
        ],
        totals: { monthly: 3000, yearly: 36000, unusedYearly: 1000 },
        wasteRate: 5,
        frequencyBreakdown: { daily: 2, weekly: 0, monthly: 0, unused: 0 },
        comparisonItems: [],
        recommendations: [],
        createdAt: new Date(),
        shareId: "test-share-id",
      };

      const alerts = AlertService.generateAlerts(diagnosisResult);

      // Should only trigger low priority alerts if any
      const criticalAlerts = alerts.filter(
        (alert) => alert.severity === "critical"
      );
      expect(criticalAlerts.length).toBe(0);
    });

    it("should generate budget exceeded alert", () => {
      const diagnosisResult: DiagnosisResult = {
        subscriptions: [
          {
            subscriptionId: "netflix",
            usageFrequency: UsageFrequency.DAILY,
            isCustom: false,
            dateAdded: "2024-01-01",
          },
        ],
        totals: { monthly: 15000, yearly: 180000, unusedYearly: 5000 },
        wasteRate: 25,
        frequencyBreakdown: { daily: 1, weekly: 0, monthly: 0, unused: 0 },
        comparisonItems: [],
        recommendations: [],
        createdAt: new Date(),
        shareId: "test-share-id",
      };

      // Set budget condition to enabled
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          enabled: true,
          conditions: [
            {
              id: "budget-exceeded",
              type: "budget_exceeded",
              enabled: true,
              threshold: 10000,
              userConfigured: false,
            },
          ],
          notificationPreferences: {
            showInApp: true,
            showBrowser: false,
            frequency: "immediate",
          },
          lastUpdated: new Date(),
        })
      );

      const alerts = AlertService.generateAlerts(diagnosisResult);

      const budgetAlert = alerts.find(
        (alert) => alert.type === "budget_exceeded"
      );
      expect(budgetAlert).toBeDefined();
      expect(budgetAlert?.severity).toBe("warning");
    });
  });

  describe("getAlertSettings", () => {
    it("should return default settings when localStorage is empty", () => {
      const settings = AlertService.getAlertSettings();

      expect(settings.enabled).toBe(true);
      expect(settings.conditions.length).toBeGreaterThan(0);
      expect(settings.notificationPreferences.showInApp).toBe(true);
    });

    it("should merge user settings with defaults", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          enabled: false,
          conditions: [
            {
              id: "waste-rate-high",
              type: "waste_rate",
              enabled: false,
              threshold: 80,
              userConfigured: true,
            },
          ],
          notificationPreferences: {
            showInApp: false,
            showBrowser: true,
            frequency: "weekly",
          },
          lastUpdated: new Date(),
        })
      );

      const settings = AlertService.getAlertSettings();

      expect(settings.enabled).toBe(false);
      expect(settings.notificationPreferences.frequency).toBe("weekly");

      // Should still have all default conditions, merged with user settings
      expect(settings.conditions.length).toBeGreaterThan(1);

      const wasteRateCondition = settings.conditions.find(
        (c) => c.id === "waste-rate-high"
      );
      expect(wasteRateCondition?.threshold).toBe(80);
      expect(wasteRateCondition?.userConfigured).toBe(true);
    });
  });

  describe("saveAlertSettings", () => {
    it("should save settings to localStorage", () => {
      const settings = {
        enabled: true,
        conditions: [],
        notificationPreferences: {
          showInApp: true,
          showBrowser: false,
          frequency: "immediate" as const,
        },
        lastUpdated: new Date(),
      };

      AlertService.saveAlertSettings(settings);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "alertSettings",
        expect.stringContaining('"enabled":true')
      );
    });
  });
});
