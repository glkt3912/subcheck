"use client";

import { useState, useEffect, useCallback } from "react";
import { UserSubscription, DiagnosisResult, UsageFrequency } from "@/types";
import { calculateDiagnosis } from "@/lib/calculations/CalculationService";
import {
  getSelectedSubscriptions,
  saveSelectedSubscriptions,
  getUserSubscriptions,
  saveUserSubscriptions,
  getDiagnosisResult,
  saveDiagnosisResult
} from "@/lib/storage/StorageService";

// Helper functions to clear individual items
function clearDiagnosisResult(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem('diagnosisResult');
    } catch (error) {
      console.warn('Failed to clear diagnosis result:', error);
    }
  }
}

function clearUserSubscriptions(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem('userSubscriptions');
    } catch (error) {
      console.warn('Failed to clear user subscriptions:', error);
    }
  }
}

function clearSelectedSubscriptions(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem('selectedSubscriptions');
    } catch (error) {
      console.warn('Failed to clear selected subscriptions:', error);
    }
  }
}

interface UseDiagnosisSessionReturn {
  // State
  selectedServices: string[];
  usageFrequencies: Record<string, UsageFrequency>;
  userSubscriptions: UserSubscription[];
  diagnosisResult: DiagnosisResult | null;
  isLoading: boolean;

  // Actions
  setSelectedServices: (services: string[]) => void;
  setUsageFrequency: (serviceId: string, frequency: UsageFrequency) => void;
  createUserSubscriptions: () => void;
  calculateResults: () => void;
  clearSession: () => void;

  // Computed state
  hasSelectedServices: boolean;
  hasAllFrequencies: boolean;
  hasResults: boolean;
  currentStep: "select" | "usage" | "results";
}

// Storage keys are now handled internally by StorageService functions

export function useDiagnosisSession(): UseDiagnosisSessionReturn {
  const [selectedServices, setSelectedServicesState] = useState<string[]>([]);
  const [usageFrequencies, setUsageFrequenciesState] = useState<
    Record<string, UsageFrequency>
  >({});
  const [userSubscriptions, setUserSubscriptionsState] = useState<
    UserSubscription[]
  >([]);
  const [diagnosisResult, setDiagnosisResultState] =
    useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // StorageService is now function-based, no need for instance

  // Load saved data on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        setIsLoading(true);

        // Load selected services
        const savedServices = getSelectedSubscriptions();
        if (savedServices.length > 0) {
          setSelectedServicesState(savedServices);
        }

        // Load user subscriptions and extract usage frequencies
        const savedUserSubs = getUserSubscriptions();
        if (savedUserSubs.length > 0) {
          setUserSubscriptionsState(savedUserSubs);

          // Extract usage frequencies from user subscriptions
          const frequencies: Record<string, UsageFrequency> = {};
          savedUserSubs.forEach((sub: UserSubscription) => {
            frequencies[sub.subscriptionId] = sub.usageFrequency;
          });
          setUsageFrequenciesState(frequencies);
        }

        // Load diagnosis result
        const savedResult = getDiagnosisResult();
        if (savedResult) {
          setDiagnosisResultState(savedResult);
        }
      } catch (error) {
        console.error("Failed to load diagnosis session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedData();
  }, []);

  // Save selected services to storage
  const setSelectedServices = useCallback(
    async (services: string[]) => {
      setSelectedServicesState(services);

      try {
        saveSelectedSubscriptions(services);

        // Clear downstream data when selection changes
        if (services.length === 0) {
          setUsageFrequenciesState({});
          setUserSubscriptionsState([]);
          setDiagnosisResultState(null);
          // Clear user subscriptions and diagnosis result from storage
          clearUserSubscriptions();
          clearDiagnosisResult();
        } else {
          // Filter usage frequencies to only include selected services
          setUsageFrequenciesState((prev) => {
            const filtered: Record<string, UsageFrequency> = {};
            services.forEach((serviceId) => {
              if (prev[serviceId]) {
                filtered[serviceId] = prev[serviceId];
              }
            });
            return filtered;
          });
        }
      } catch (error) {
        console.error("Failed to save selected services:", error);
      }
    },
    []
  );

  // Set usage frequency for a service
  const setUsageFrequency = useCallback(
    (serviceId: string, frequency: UsageFrequency) => {
      setUsageFrequenciesState((prev) => ({
        ...prev,
        [serviceId]: frequency,
      }));
    },
    []
  );

  // Create user subscriptions from selected services and frequencies
  const createUserSubscriptions = useCallback(async () => {
    const userSubs: UserSubscription[] = selectedServices.map((serviceId) => ({
      subscriptionId: serviceId,
      usageFrequency: usageFrequencies[serviceId],
      isCustom: false,
      dateAdded: new Date().toISOString(),
    }));

    setUserSubscriptionsState(userSubs);

    try {
      saveUserSubscriptions(userSubs);
    } catch (error) {
      console.error("Failed to save user subscriptions:", error);
    }
  }, [selectedServices, usageFrequencies]);

  // Calculate diagnosis results
  const calculateResults = useCallback(async () => {
    if (userSubscriptions.length === 0) {
      console.warn("No user subscriptions to calculate");
      return;
    }

    try {
      const result = calculateDiagnosis(userSubscriptions);
      setDiagnosisResultState(result);

      saveDiagnosisResult(result);
    } catch (error) {
      console.error("Failed to calculate diagnosis:", error);
    }
  }, [userSubscriptions]);

  // Clear entire session
  const clearSession = useCallback(async () => {
    setSelectedServicesState([]);
    setUsageFrequenciesState({});
    setUserSubscriptionsState([]);
    setDiagnosisResultState(null);

    try {
      // Clear all data using the new API
      clearSelectedSubscriptions();
      clearUserSubscriptions();
      clearDiagnosisResult();
    } catch (error) {
      console.error("Failed to clear session:", error);
    }
  }, []);

  // Computed state
  const hasSelectedServices = selectedServices.length > 0;
  const hasAllFrequencies = selectedServices.every(
    (serviceId) => usageFrequencies[serviceId]
  );
  const hasResults = diagnosisResult !== null;

  // Determine current step
  let currentStep: "select" | "usage" | "results" = "select";
  if (hasResults) {
    currentStep = "results";
  } else if (hasSelectedServices) {
    currentStep = "usage";
  }

  return {
    // State
    selectedServices,
    usageFrequencies,
    userSubscriptions,
    diagnosisResult,
    isLoading,

    // Actions
    setSelectedServices,
    setUsageFrequency,
    createUserSubscriptions,
    calculateResults,
    clearSession,

    // Computed state
    hasSelectedServices,
    hasAllFrequencies,
    hasResults,
    currentStep,
  };
}
