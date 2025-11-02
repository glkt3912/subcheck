// Legacy subscriptions module for backward compatibility
// Re-exports from the current data/subscriptions implementation

export {
  MASTER_SUBSCRIPTIONS,
  getAllSubscriptions,
  getSubscriptionById,
  SUBSCRIPTION_CATEGORIES
} from './data/subscriptions';