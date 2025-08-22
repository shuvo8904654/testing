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
  social?: {
    linkedin?: string;
    facebook?: string;
  };
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
  category?: string; // Auto-categorized: environmental, educational, community, technology, general
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

export interface NewsArticle {
  id: string;
  _id?: string;
  title: string;
  content: string;
  excerpt?: string;
  image: string; // Maps to 'imageUrl' in MongoDB
  imageUrl?: string; // Alternative field name
  category?: string; // Auto-categorized: environmental, events, community, announcements, general
  contentCategory?: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  contentScore?: number;
  readabilityLevel?: 'simple' | 'medium' | 'complex';
  estimatedReadTime?: number;
  engagement?: number;
  daysOld?: number;
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
  alt?: string;
  url?: string; // Alternative field name
  imageUrl: string;
  category?: string; // Auto-categorized: events, people, projects, environmental, general
  qualityScore?: number;
  daysOld?: number;
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
  category: 'workshop' | 'meeting' | 'training' | 'volunteer' | 'olympiad' | 'competition' | 'hackathon' | 'other';
  maxParticipants?: number;
  registrationRequired: boolean;
  requiresRegistration?: boolean; // Alternative property name for compatibility
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