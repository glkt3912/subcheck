// Legacy calculator module for backward compatibility
// Re-exports from the current CalculationService implementation

export {
  calculateDiagnosis,
  getWasteRateMessage,
  getWasteRateColors,
  calculatePotentialSavings,
  getWasteRateLevel
} from './calculations/CalculationService';