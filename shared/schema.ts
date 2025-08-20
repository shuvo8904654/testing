// Frontend types based on MongoDB models
// These types are used by React components

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
  role: 'member' | 'admin' | 'super_admin' | 'applicant';
  permissions: string[];
  isActive: boolean;
  authType: 'email' | 'replit';
  applicationStatus?: 'pending' | 'approved' | 'rejected';
  appliedAt?: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Member {
  id: string;
  _id?: string;
  name: string;
  email: string;
  position: string; // Maps to 'role' in MongoDB
  bio: string;
  image: string; // Maps to 'profileImageUrl' in MongoDB
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  _id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  completedAt?: string; // For display purposes
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsArticle {
  id: string;
  _id?: string;
  title: string;
  content: string;
  excerpt?: string;
  image: string; // Maps to 'imageUrl' in MongoDB
  category: string; // Add category field
  author: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  approvedBy?: string;
  readCount: number;
  publishedAt: Date; // Maps to 'createdAt'
  createdAt: Date;
  updatedAt: Date;
}

export interface GalleryImage {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactMessage {
  id: string;
  _id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}

export interface Registration {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  _id?: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  category: 'workshop' | 'meeting' | 'training' | 'volunteer' | 'other';
  maxParticipants?: number;
  registrationRequired: boolean;
  contactInfo?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}