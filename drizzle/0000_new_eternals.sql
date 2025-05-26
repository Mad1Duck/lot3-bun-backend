CREATE TYPE "public"."billing_cycle" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('unpaid', 'paid', 'overdue', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'succeeded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'canceled', 'expired', 'paused');--> statement-breakpoint
CREATE TYPE "public"."user_token_type" AS ENUM('reset_password', 'verify_email', 'refresh_token');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"organization_id" uuid,
	"action" varchar(100) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_role_changes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"changed_by_user_id" uuid NOT NULL,
	"target_user_id" uuid NOT NULL,
	"old_role_id" integer,
	"new_role_id" integer,
	"old_permissions" jsonb,
	"new_permissions" jsonb,
	"reason" text,
	"changed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"user_id" uuid,
	"feature_code" varchar(100) NOT NULL,
	"is_enabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feature_usages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"feature_id" uuid NOT NULL,
	"usage_amount" integer NOT NULL,
	"usage_date" timestamp DEFAULT now(),
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "features_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"organization_id" uuid NOT NULL,
	"subscription_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'IDR',
	"tax_amount" integer DEFAULT 0,
	"invoice_status" "invoice_status" DEFAULT 'unpaid',
	"issued_at" timestamp DEFAULT now(),
	"due_at" timestamp NOT NULL,
	"paid_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "organization_metadata" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organization_users" (
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"role_id" integer NOT NULL,
	"is_owner" boolean DEFAULT false,
	"joined_at" timestamp DEFAULT now(),
	CONSTRAINT "organization_users_user_id_organization_id_pk" PRIMARY KEY("user_id","organization_id")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "package_features" (
	"package_id" uuid NOT NULL,
	"feature_id" uuid NOT NULL,
	CONSTRAINT "package_features_package_id_feature_id_pk" PRIMARY KEY("package_id","feature_id")
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"payment_method" varchar(100) NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending',
	"paid_at" timestamp,
	"amount" integer NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(100) NOT NULL,
	"description" text,
	CONSTRAINT "permissions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" integer NOT NULL,
	"permission_id" uuid NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"application_id" uuid NOT NULL,
	"package_id" uuid NOT NULL,
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp,
	"status" "subscription_status" DEFAULT 'active',
	"billing_cycle" "billing_cycle" DEFAULT 'monthly',
	"created_at" timestamp DEFAULT now(),
	"canceled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_metadata" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token_hash" text NOT NULL,
	"device_info" varchar(255),
	"ip_address" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"type" "user_token_type" NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"phone" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"is_platform_owner" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"sent_at" timestamp,
	"retry_count" integer DEFAULT 0,
	"last_retry_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_role_changes" ADD CONSTRAINT "audit_role_changes_changed_by_user_id_users_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_role_changes" ADD CONSTRAINT "audit_role_changes_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_role_changes" ADD CONSTRAINT "audit_role_changes_old_role_id_user_roles_id_fk" FOREIGN KEY ("old_role_id") REFERENCES "public"."user_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_role_changes" ADD CONSTRAINT "audit_role_changes_new_role_id_user_roles_id_fk" FOREIGN KEY ("new_role_id") REFERENCES "public"."user_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_usages" ADD CONSTRAINT "feature_usages_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_usages" ADD CONSTRAINT "feature_usages_feature_id_features_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."features"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "features" ADD CONSTRAINT "features_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_metadata" ADD CONSTRAINT "organization_metadata_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_users" ADD CONSTRAINT "organization_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_users" ADD CONSTRAINT "organization_users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_users" ADD CONSTRAINT "organization_users_role_id_user_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."user_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_features" ADD CONSTRAINT "package_features_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_features" ADD CONSTRAINT "package_features_feature_id_features_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."features"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_user_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."user_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_metadata" ADD CONSTRAINT "user_metadata_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tokens" ADD CONSTRAINT "user_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;