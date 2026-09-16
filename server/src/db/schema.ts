import { pgTable, uuid, text, integer, boolean, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull(), 
  displayName: text('display_name').notNull().default('vandron'),
  profilePicture: text('profile_picture'),
  isVerified: boolean('is_verified').default(false).notNull(),
  credits: integer('credits').default(0).notNull(), 
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