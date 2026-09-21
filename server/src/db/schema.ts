import { pgTable, uuid, text, integer, boolean, timestamp, uniqueIndex, index, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull(), 
  displayName: text('display_name').notNull().default('vandron'),
  profilePicture: text('profile_picture'),
  isVerified: boolean('is_verified').default(false).notNull(),
  credits: integer('credits').default(0).notNull(), 
  dailyCredits: integer('daily_credits').default(50).notNull(),
  dailyCreditsExpiresAt: timestamp('daily_credits_expires_at'),
  purchasedCredits: integer('purchased_credits').default(0).notNull(),
  purchasedCreditsExpiresAt: timestamp('purchased_credits_expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  provider: text('provider').notNull(), // 'credentials', 'google', 'github', etc.
  providerAccountId: text('provider_account_id').notNull(), // email for password, sub id for google
  passwordHash: text('password_hash'), // Only filled if provider is 'credentials'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('provider_account_idx').on(table.provider, table.providerAccountId)
]);

export const images = pgTable('images', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  prompt: text('prompt').notNull(),
  negativePrompt: text('negative_prompt'),
  style: text('style'),
  aspectRatio: text('aspect_ratio').default('16:9'),
  model: text('model'),
  r2Url: text('r2_url').notNull(),
  r2Key: text('r2_key').notNull(),
  watermarkedR2Url: text('watermarked_r2_url'),
  watermarkedR2Key: text('watermarked_r2_key'),
  isPublic: boolean('is_public').default(true).notNull(),
  likesCount: integer('likes_count').default(0).notNull(),
  status: text('status').default('completed').notNull(), // pending, completed, failed
  generationType: text('generation_type').default('generate').notNull(), // generate, upscale, remove-bg
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const collections = pgTable('collections', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  imageId: uuid('image_id').references(() => images.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('user_image_collection_idx').on(table.userId, table.imageId)
]);

export const imageLikes = pgTable('image_likes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  imageId: uuid('image_id').references(() => images.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('user_image_like_idx').on(table.userId, table.imageId)
]);

export const socialAccounts = pgTable('social_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  platform: text('platform').notNull(), // instagram, linkedin, x, youtube, tiktok, pinterest, facebook, discord
  platformAccountId: text('platform_account_id').notNull(),
  accountUsername: text('account_username').notNull(),
  accountName: text('account_name').notNull(),
  avatarUrl: text('avatar_url'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  tokenExpiresAt: timestamp('token_expires_at'),
  metadata: jsonb('metadata'), // e.g. { defaultHashtags: string[], aiDisclaimer: boolean }
  status: text('status').default('active').notNull(), // active, expired, revoked
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('user_platform_account_idx').on(table.userId, table.platform, table.platformAccountId),
  index('social_accounts_user_idx').on(table.userId)
]);

export const socialPosts = pgTable('social_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  imageId: uuid('image_id').references(() => images.id, { onDelete: 'set null' }),
  mediaUrl: text('media_url').notNull(),
  mediaType: text('media_type').default('image').notNull(), // image, video, audio
  caption: text('caption').notNull(),
  targetPlatforms: jsonb('target_platforms').notNull(), // e.g. ['instagram', 'x']
  status: text('status').default('draft').notNull(), // draft, scheduled, publishing, published, failed
  scheduledFor: timestamp('scheduled_for'),
  publishedAt: timestamp('published_at'),
  platformPostIds: jsonb('platform_post_ids'), // e.g. { instagram: "post_123", x: "tweet_456" }
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('social_posts_user_status_idx').on(table.userId, table.status),
  index('social_posts_scheduled_for_idx').on(table.scheduledFor)
]);

export const socialWebhooks = pgTable('social_webhooks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  webhookUrl: text('webhook_url').notNull(),
  secret: text('secret').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  events: jsonb('events').notNull(), // ['image.generated', 'video.generated', 'post.scheduled', 'post.published']
  lastTriggeredAt: timestamp('last_triggered_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});