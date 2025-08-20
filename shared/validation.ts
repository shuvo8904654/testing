import { z } from 'zod';

// User validation schemas
export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  age: z.string().optional(),
  address: z.string().optional(),
  motivation: z.string().optional(),
  profileImageUrl: z.string().url().optional(),
  role: z.enum(['member', 'admin', 'super_admin', 'applicant']).default('applicant'),
  permissions: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  authType: z.enum(['email', 'replit']).default('email'),
  applicationStatus: z.enum(['pending', 'approved', 'rejected']).default('pending'),
});

export const updateUserSchema = insertUserSchema.partial();

// Member validation schemas
export const insertMemberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string().min(1),
  bio: z.string().min(1),
  profileImageUrl: z.string().url().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  createdBy: z.string(),
  approvedBy: z.string().optional(),
});

// Project validation schemas
export const insertProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().url().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  createdBy: z.string(),
  approvedBy: z.string().optional(),
});

// News Article validation schemas
export const insertNewsArticleSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  imageUrl: z.string().url().optional(),
  author: z.string().min(1),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  createdBy: z.string(),
  approvedBy: z.string().optional(),
  readCount: z.number().default(0),
});

// Gallery Image validation schemas
export const insertGalleryImageSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  createdBy: z.string(),
  approvedBy: z.string().optional(),
});

// Contact Message validation schemas
export const insertContactMessageSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

// Registration validation schemas
export const insertRegistrationSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  institution: z.string().min(1),
  reason: z.string().min(1),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  reviewedBy: z.string().optional(),
});

// Event validation schemas
export const insertEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.string().transform((str) => new Date(str)),
  time: z.string().min(1),
  location: z.string().min(1),
  category: z.enum(['workshop', 'meeting', 'training', 'volunteer', 'other']),
  maxParticipants: z.number().optional(),
  registrationRequired: z.boolean().default(false),
  contactInfo: z.string().optional(),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).default('upcoming'),
  createdBy: z.string(),
});

// Types derived from schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;