// Simplified schema file for MongoDB compatibility
// TODO: Complete PostgreSQL migration when DATABASE_URL is available

// Export types compatible with MongoDB models
export type UserRole = 'member' | 'admin' | 'super_admin' | 'applicant';
export type ContentStatus = 'pending' | 'approved' | 'rejected';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

// User type for frontend (compatible with MongoDB)
export interface User {
  id: string;
  _id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  age?: string;
  address?: string;
  motivation?: string;
  profileImageUrl?: string;
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  authType: 'email' | 'replit';
  applicationStatus?: ApplicationStatus;
  appliedAt?: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Member type for frontend (compatible with MongoDB)
export interface Member {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  bio: string;
  profileImageUrl?: string;
  status: ContentStatus;
  social?: {
    linkedin?: string;
    facebook?: string;
  };
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Project type for frontend (compatible with MongoDB)
export interface Project {
  id: string;
  _id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  completedAt?: string;
  category?: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  priorityScore?: number;
  impactLevel?: 'low' | 'medium' | 'high';
  autoCategory?: string;
  daysActive?: number;
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// News Article type for frontend (compatible with MongoDB)
export interface NewsArticle {
  id: string;
  _id?: string;
  title: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  category?: string;
  contentCategory?: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  contentScore?: number;
  readabilityLevel?: 'simple' | 'medium' | 'complex';
  estimatedReadTime?: number;
  engagement?: number;
  daysOld?: number;
  readCount: number;
  publishedAt: Date;
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Gallery Image type for frontend (compatible with MongoDB)
export interface GalleryImage {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  alt?: string;
  imageUrl: string;
  category?: string;
  qualityScore?: number;
  daysOld?: number;
  status: ContentStatus;
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Contact Message type for frontend (compatible with MongoDB)
export interface ContactMessage {
  id: string;
  _id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}

// Registration type for frontend (compatible with MongoDB)
export interface Registration {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  reason: string;
  status: ApplicationStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Event type for frontend (compatible with MongoDB)
export interface Event {
  id: string;
  _id?: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  category: 'workshop' | 'meeting' | 'training' | 'volunteer' | 'olympiad' | 'competition' | 'hackathon' | 'other';
  maxParticipants?: number;
  registrationRequired: boolean;
  registrationDeadline?: Date;
  eligibility?: string;
  prizes?: string;
  teamEvent?: boolean;
  minTeamSize?: number;
  maxTeamSize?: number;
  contactInfo?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  urgency?: 'urgent' | 'soon' | 'normal' | 'past';
  capacity?: 'limited' | 'moderate' | 'large' | 'available';
  popularity?: number;
  smartStatus?: string;
  daysUntilEvent?: number;
  isUpcoming?: boolean;
  isPast?: boolean;
  isToday?: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Event Registration type for frontend (compatible with MongoDB)
export interface EventRegistration {
  id: string;
  _id?: string;
  eventId: string;
  participantId?: string;
  participantName: string;
  email: string;
  phone: string;
  institution?: string;
  grade?: string;
  experience?: string;
  motivation?: string;
  teamName?: string;
  teamMembers?: Array<{ name: string; email: string; phone: string; }>;
  additionalInfo?: string;
  status: 'registered' | 'confirmed' | 'waitlist' | 'cancelled';
  registeredAt: Date;
  checkInTime?: Date;
}

// Notice type for frontend (compatible with MongoDB)
export interface Notice {
  id: string;
  _id?: string;
  title: string;
  message: string;
  type: 'announcement' | 'event' | 'urgent' | 'info';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: Date;
  endDate: Date;
  link?: string;
  linkText?: string;
  dismissible: boolean;
  targetAudience: 'all' | 'members' | 'admins';
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Simple insert types for MongoDB compatibility (no Zod validation for now)
export type InsertUser = Omit<User, 'id' | '_id' | 'createdAt' | 'updatedAt'>;
export type InsertMember = Omit<Member, 'id' | '_id' | 'createdAt' | 'updatedAt'>;
export type InsertProject = Omit<Project, 'id' | '_id' | 'createdAt' | 'updatedAt'>;
export type InsertNewsArticle = Omit<NewsArticle, 'id' | '_id' | 'createdAt' | 'updatedAt'>;
export type InsertGalleryImage = Omit<GalleryImage, 'id' | '_id' | 'createdAt' | 'updatedAt'>;
export type InsertContactMessage = Omit<ContactMessage, 'id' | '_id' | 'createdAt'>;
export type InsertRegistration = Omit<Registration, 'id' | '_id' | 'createdAt' | 'updatedAt'>;
export type InsertEvent = Omit<Event, 'id' | '_id' | 'createdAt' | 'updatedAt'>;
export type InsertEventRegistration = Omit<EventRegistration, 'id' | '_id' | 'registeredAt'>;
export type InsertNotice = Omit<Notice, 'id' | '_id' | 'createdAt' | 'updatedAt'>;