'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserSubscription, DiagnosisResult, UsageFrequency } from '@/types';
import { calculateDiagnosis } from '@/lib/calculations/CalculationService';
import { StorageService } from '@/lib/storage/StorageService';

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
  currentStep: 'select' | 'usage' | 'results';
}

const STORAGE_KEYS = {
  selectedServices: 'subcheck_selected_services',
  userSubscriptions: 'subcheck_user_subscriptions',
  diagnosisResult: 'subcheck_diagnosis_result'
} as const;

export function useDiagnosisSession(): UseDiagnosisSessionReturn {
  const [selectedServices, setSelectedServicesState] = useState<string[]>([]);
  const [usageFrequencies, setUsageFrequenciesState] = useState<Record<string, UsageFrequency>>({});
  const [userSubscriptions, setUserSubscriptionsState] = useState<UserSubscription[]>([]);
  const [diagnosisResult, setDiagnosisResultState] = useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const storageService = useMemo(() => new StorageService(), []);

  // Load saved data on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        setIsLoading(true);
        
        // Load selected services
        const savedServices = await storageService.getItem<string[]>(STORAGE_KEYS.selectedServices);
        if (savedServices) {
          setSelectedServicesState(savedServices);
        }
        
        // Load user subscriptions and extract usage frequencies
        const savedUserSubs = await storageService.getItem<UserSubscription[]>(STORAGE_KEYS.userSubscriptions);
        if (savedUserSubs) {
          setUserSubscriptionsState(savedUserSubs);
          
          // Extract usage frequencies from user subscriptions
          const frequencies: Record<string, UsageFrequency> = {};
          savedUserSubs.forEach(sub => {
            frequencies[sub.subscriptionId] = sub.usageFrequency;
          });
          setUsageFrequenciesState(frequencies);
        }
        
        // Load diagnosis result
        const savedResult = await storageService.getItem<DiagnosisResult>(STORAGE_KEYS.diagnosisResult);
        if (savedResult) {
          setDiagnosisResultState(savedResult);
        }
      } catch (error) {
        console.error('Failed to load diagnosis session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedData();
  }, [storageService]);

  // Save selected services to storage
  const setSelectedServices = useCallback(async (services: string[]) => {
    setSelectedServicesState(services);
    
    try {
      await storageService.setItem(STORAGE_KEYS.selectedServices, services);
      
      // Clear downstream data when selection changes
      if (services.length === 0) {
        setUsageFrequenciesState({});
        setUserSubscriptionsState([]);
        setDiagnosisResultState(null);
        await storageService.removeItem(STORAGE_KEYS.userSubscriptions);
        await storageService.removeItem(STORAGE_KEYS.diagnosisResult);
      } else {
        // Filter usage frequencies to only include selected services
        setUsageFrequenciesState(prev => {
          const filtered: Record<string, UsageFrequency> = {};
          services.forEach(serviceId => {
            if (prev[serviceId]) {
              filtered[serviceId] = prev[serviceId];
            }
          });
          return filtered;
        });
      }
    } catch (error) {
      console.error('Failed to save selected services:', error);
    }
  }, [storageService]);

  // Set usage frequency for a service
  const setUsageFrequency = useCallback((serviceId: string, frequency: UsageFrequency) => {
    setUsageFrequenciesState(prev => ({
      ...prev,
      [serviceId]: frequency
    }));
  }, []);

  // Create user subscriptions from selected services and frequencies
  const createUserSubscriptions = useCallback(async () => {
    const userSubs: UserSubscription[] = selectedServices.map(serviceId => ({
      subscriptionId: serviceId,
      usageFrequency: usageFrequencies[serviceId],
      isCustom: false,
      dateAdded: new Date().toISOString()
    }));

    setUserSubscriptionsState(userSubs);
    
    try {
      await storageService.setItem(STORAGE_KEYS.userSubscriptions, userSubs);
    } catch (error) {
      console.error('Failed to save user subscriptions:', error);
    }
  }, [selectedServices, usageFrequencies, storageService]);

  // Calculate diagnosis results
  const calculateResults = useCallback(async () => {
    if (userSubscriptions.length === 0) {
      console.warn('No user subscriptions to calculate');
      return;
    }

    try {
      const result = calculateDiagnosis(userSubscriptions);
      setDiagnosisResultState(result);
      
      await storageService.setItem(STORAGE_KEYS.diagnosisResult, result);
    } catch (error) {
      console.error('Failed to calculate diagnosis:', error);
    }
  }, [userSubscriptions, storageService]);

  // Clear entire session
  const clearSession = useCallback(async () => {
    setSelectedServicesState([]);
    setUsageFrequenciesState({});
    setUserSubscriptionsState([]);
    setDiagnosisResultState(null);
    
    try {
      await Promise.all([
        storageService.removeItem(STORAGE_KEYS.selectedServices),
        storageService.removeItem(STORAGE_KEYS.userSubscriptions),
        storageService.removeItem(STORAGE_KEYS.diagnosisResult)
      ]);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }, [storageService]);

  // Computed state
  const hasSelectedServices = selectedServices.length > 0;
  const hasAllFrequencies = selectedServices.every(serviceId => usageFrequencies[serviceId]);
  const hasResults = diagnosisResult !== null;

  // Determine current step
  let currentStep: 'select' | 'usage' | 'results' = 'select';
  if (hasResults) {
    currentStep = 'results';
  } else if (hasSelectedServices) {
    currentStep = 'usage';
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
    currentStep
  };
}