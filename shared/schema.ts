import { pgTable, varchar, text, boolean, timestamp, integer, json, serial, unique } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  age: varchar('age', { length: 10 }),
  address: text('address'),
  motivation: text('motivation'),
  profileImageUrl: text('profile_image_url'),
  role: varchar('role', { length: 20 }).notNull().default('applicant'),
  permissions: json('permissions').$type<string[]>().notNull().default([]),
  isActive: boolean('is_active').notNull().default(true),
  authType: varchar('auth_type', { length: 20 }).notNull().default('email'),
  applicationStatus: varchar('application_status', { length: 20 }).default('pending'),
  appliedAt: timestamp('applied_at').defaultNow(),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Members table
export const members = pgTable('members', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  username: varchar('username', { length: 100 }).unique(),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 100 }).notNull(),
  bio: text('bio').notNull(),
  website: varchar('website', { length: 255 }),
  profileImageUrl: text('profile_image_url'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  social: json('social').$type<{ linkedin?: string; facebook?: string }>(),
  createdBy: integer('created_by').notNull(),
  approvedBy: integer('approved_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Projects table
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url'),
  completedAt: varchar('completed_at', { length: 100 }),
  category: varchar('category', { length: 100 }),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  priorityScore: integer('priority_score'),
  impactLevel: varchar('impact_level', { length: 20 }),
  autoCategory: varchar('auto_category', { length: 100 }),
  daysActive: integer('days_active'),
  createdBy: integer('created_by').notNull(),
  approvedBy: integer('approved_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// News articles table
export const newsArticles = pgTable('news_articles', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  imageUrl: text('image_url'), // Legacy field - keeping for backward compatibility
  coverImageUrl: text('cover_image_url'), // New cover image field
  images: text('images').array(), // Array of image URLs for multiple images
  category: varchar('category', { length: 100 }),
  contentCategory: varchar('content_category', { length: 100 }),
  author: varchar('author', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  contentScore: integer('content_score'),
  readabilityLevel: varchar('readability_level', { length: 20 }),
  estimatedReadTime: integer('estimated_read_time'),
  engagement: integer('engagement'),
  daysOld: integer('days_old'),
  readCount: integer('read_count').notNull().default(0),
  publishedAt: timestamp('published_at'),
  createdBy: integer('created_by').notNull(),
  approvedBy: integer('approved_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Gallery images table
export const galleryImages = pgTable('gallery_images', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  alt: varchar('alt', { length: 255 }),
  imageUrl: text('image_url').notNull(),
  category: varchar('category', { length: 100 }),
  qualityScore: integer('quality_score'),
  daysOld: integer('days_old'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdBy: integer('created_by').notNull(),
  approvedBy: integer('approved_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Contact messages table
export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Registrations table
export const registrations = pgTable('registrations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  institution: varchar('institution', { length: 255 }).notNull(),
  reason: text('reason').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  reviewedBy: integer('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Events table
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  date: timestamp('date').notNull(),
  time: varchar('time', { length: 50 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  maxParticipants: integer('max_participants'),
  registrationRequired: boolean('registration_required').notNull().default(false),
  registrationDeadline: timestamp('registration_deadline'),
  eligibility: text('eligibility'),
  prizes: text('prizes'),
  teamEvent: boolean('team_event').default(false),
  minTeamSize: integer('min_team_size'),
  maxTeamSize: integer('max_team_size'),
  contactInfo: text('contact_info'),
  customQuestions: json('custom_questions').$type<Array<{
    id: string;
    question: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio';
    required: boolean;
    options?: string[];
  }>>().default([]),
  status: varchar('status', { length: 20 }).notNull().default('upcoming'),
  urgency: varchar('urgency', { length: 20 }),
  capacity: varchar('capacity', { length: 20 }),
  popularity: integer('popularity'),
  smartStatus: varchar('smart_status', { length: 100 }),
  daysUntilEvent: integer('days_until_event'),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Event registrations table
export const eventRegistrations = pgTable('event_registrations', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  institution: varchar('institution', { length: 255 }),
  reason: text('reason'),
  teamName: varchar('team_name', { length: 255 }),
  teamMembers: text('team_members'),
  customAnswers: json('custom_answers').$type<Record<string, string | string[]>>().default({}),
  status: varchar('status', { length: 20 }).notNull().default('confirmed'),
  registeredAt: timestamp('registered_at').defaultNow().notNull(),
}, (table) => ({
  uniqueUserEvent: unique().on(table.eventId, table.userId),
}));

// Notices table
export const notices = pgTable('notices', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  priority: varchar('priority', { length: 20 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  link: text('link'),
  linkText: varchar('link_text', { length: 255 }),
  dismissible: boolean('dismissible').notNull().default(true),
  targetAudience: varchar('target_audience', { length: 20 }).notNull().default('all'),
  createdBy: integer('created_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Create insert schemas using drizzle-zod
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGalleryImageSchema = createInsertSchema(galleryImages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({
  id: true,
  registeredAt: true,
});

export const insertNoticeSchema = createInsertSchema(notices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports for the frontend
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Member = typeof members.$inferSelect;
export type InsertMember = typeof members.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = typeof newsArticles.$inferInsert;

export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = typeof galleryImages.$inferInsert;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = typeof registrations.$inferInsert;

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = typeof eventRegistrations.$inferInsert;

export type Notice = typeof notices.$inferSelect;
export type InsertNotice = typeof notices.$inferInsert;

// Export common types
export type UserRole = 'member' | 'admin' | 'super_admin' | 'applicant' | 'participant';
export type ContentStatus = 'pending' | 'approved' | 'rejected';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';