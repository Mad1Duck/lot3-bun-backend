import { pgEnum } from "drizzle-orm/pg-core";

// Enum untuk subscription status
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'canceled',
  'expired',
  'paused',
]);

// Enum untuk billing cycle
export const billingCycleEnum = pgEnum('billing_cycle', [
  'monthly',
  'yearly',
]);

// Enum untuk invoice status
export const invoiceStatusEnum = pgEnum('invoice_status', [
  'unpaid',
  'paid',
  'overdue',
  'canceled',
]);

// Enum untuk payment status
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'succeeded',
  'failed',
]);

// Enum untuk user token types
export const userTokenTypeEnum = pgEnum('user_token_type', [
  'reset_password',
  'verify_email',
  'refresh_token'
]);