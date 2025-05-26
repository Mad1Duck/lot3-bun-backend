import { InferInsertModel } from 'drizzle-orm';
import {
  pgTable,
  serial,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { billingCycleEnum, invoiceStatusEnum, paymentStatusEnum, subscriptionStatusEnum, userTokenTypeEnum } from './enums';

export * from "./enums";


// Users (platform-level: superadmin & owner organisasi)
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: text('password_hash').notNull(),
  isPlatformOwner: boolean('is_platform_owner').default(false), // superadmin platform
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'), // soft delete support
});

// Organizations (tenant / usaha)
export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// Applications (SaaS modules)
export const applications = pgTable('applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// Packages (per application)
export const packages = pgTable('packages', {
  id: uuid('id').defaultRandom().primaryKey(),
  applicationId: uuid('application_id').notNull().references(() => applications.id),
  name: varchar('name', { length: 255 }).notNull(),
  price: integer('price').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// Features (per application)
export const features = pgTable('features', {
  id: uuid('id').defaultRandom().primaryKey(),
  applicationId: uuid('application_id').notNull().references(() => applications.id),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// PackageFeatures (many-to-many mapping)
export const packageFeatures = pgTable('package_features', {
  packageId: uuid('package_id').notNull().references(() => packages.id),
  featureId: uuid('feature_id').notNull().references(() => features.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.packageId, t.featureId] }),
}));

// Subscriptions (org to app + package)
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  applicationId: uuid('application_id').notNull().references(() => applications.id),
  packageId: uuid('package_id').notNull().references(() => packages.id),
  startDate: timestamp('start_date').defaultNow(),
  endDate: timestamp('end_date'),
  status: subscriptionStatusEnum('status').default('active'),
  billingCycle: billingCycleEnum('billing_cycle').default('monthly'),
  createdAt: timestamp('created_at').defaultNow(),
  canceledAt: timestamp('canceled_at'),
});

// Roles (platform user roles)
export const userRoles = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
});

// OrganizationUsers (user membership dan owner flag)
export const organizationUsers = pgTable('organization_users', {
  userId: uuid('user_id').notNull().references(() => users.id),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  roleId: integer('role_id').notNull().references(() => userRoles.id),
  isOwner: boolean('is_owner').default(false), // tanda owner usaha
  joinedAt: timestamp('joined_at').defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.organizationId] }),
}));

// Permissions (granular permissions)
export const permissions = pgTable('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  description: text('description'),
});

// RolePermissions (many-to-many)
export const rolePermissions = pgTable('role_permissions', {
  roleId: integer('role_id').notNull().references(() => userRoles.id),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
}));

// AuditLogs (tracking perubahan dan aktivitas)
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  organizationId: uuid('organization_id').references(() => organizations.id),
  action: varchar('action', { length: 100 }).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Invoices: tagihan per organisasi per subscription (paket + aplikasi)
export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  subscriptionId: uuid('subscription_id').notNull().references(() => subscriptions.id),
  amount: integer('amount').notNull(),
  currency: varchar('currency', { length: 10 }).default('IDR'),
  taxAmount: integer('tax_amount').default(0),
  status: invoiceStatusEnum('invoice_status').default('unpaid'),
  issuedAt: timestamp('issued_at').defaultNow(),
  dueAt: timestamp('due_at').notNull(),
  paidAt: timestamp('paid_at'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Payments: catatan pembayaran untuk invoice tertentu
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
  paymentMethod: varchar('payment_method', { length: 100 }).notNull(),
  paymentStatus: paymentStatusEnum('payment_status').default('pending'),
  paidAt: timestamp('paid_at'),
  amount: integer('amount').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Optional: Usage tracking (kalau ada fitur usage-based billing)
export const featureUsages = pgTable('feature_usages', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  featureId: uuid('feature_id').notNull().references(() => features.id),
  usageAmount: integer('usage_amount').notNull(), // misal kuota, hit API, menit
  usageDate: timestamp('usage_date').defaultNow(),
  metadata: jsonb('metadata'),
});

// Optional: Notifications (if you want user/organization notifications)
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  organizationId: uuid('organization_id').references(() => organizations.id),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  readAt: timestamp('read_at'),
});

// User Sessions (refresh tokens & session management)
export const userSessions = pgTable('user_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  refreshTokenHash: text('refresh_token_hash').notNull(),
  deviceInfo: varchar('device_info', { length: 255 }),
  ipAddress: varchar('ip_address', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at'),
});

// User Tokens (password reset, email verification)
export const userTokens = pgTable('user_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  token: varchar('token', { length: 255 }).notNull().unique(),
  type: userTokenTypeEnum('type').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Webhook Events (event logs for webhook delivery)
export const webhookEvents = pgTable('webhook_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  payload: jsonb('payload').notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  sentAt: timestamp('sent_at'),
  retryCount: integer('retry_count').default(0),
  lastRetryAt: timestamp('last_retry_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Feature Flags (feature toggle per org/user)
export const featureFlags = pgTable('feature_flags', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  userId: uuid('user_id').references(() => users.id),
  featureCode: varchar('feature_code', { length: 100 }).notNull(),
  isEnabled: boolean('is_enabled').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Custom Metadata for Organizations (flexible JSON)
export const organizationMetadata = pgTable('organization_metadata', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  key: varchar('key', { length: 100 }).notNull(),
  value: jsonb('value').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Custom Metadata for Users
export const userMetadata = pgTable('user_metadata', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  key: varchar('key', { length: 100 }).notNull(),
  value: jsonb('value').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Audit Role Changes (tracking role and permission updates)
export const auditRoleChanges = pgTable('audit_role_changes', {
  id: uuid('id').defaultRandom().primaryKey(),
  changedByUserId: uuid('changed_by_user_id').notNull().references(() => users.id),
  targetUserId: uuid('target_user_id').notNull().references(() => users.id),
  oldRoleId: integer('old_role_id').references(() => userRoles.id),
  newRoleId: integer('new_role_id').references(() => userRoles.id),
  oldPermissions: jsonb('old_permissions'),
  newPermissions: jsonb('new_permissions'),
  reason: text('reason'),
  changedAt: timestamp('changed_at').defaultNow(),
});

export type CreateUserInput = InferInsertModel<typeof users>;
