// This file has been deprecated - all models are now defined in shared/schema.ts using Drizzle ORM
// All types are now exported from shared/schema.ts for PostgreSQL compatibility

console.warn('⚠️  Mongoose models file is deprecated. Using Drizzle ORM schemas from shared/schema.ts');

// Re-export types from the new schema for backward compatibility
export type {
  UserRole, ContentStatus, ApplicationStatus,
  User as IUser, Member as IMember, Project as IProject, 
  NewsArticle as INewsArticle, GalleryImage as IGalleryImage,
  ContactMessage as IContactMessage, Registration as IRegistration,
  Event as IEvent
} from '@shared/schema';

export const User = {};
export const Member = {};
export const Project = {};
export const NewsArticle = {};
export const GalleryImage = {};
export const ContactMessage = {};
export const Registration = {};
export const Event = {};