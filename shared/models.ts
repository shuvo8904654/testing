import mongoose, { Schema, Document } from 'mongoose';

// User/Member types
export type UserRole = 'member' | 'admin' | 'super_admin' | 'applicant';
export type ContentStatus = 'pending' | 'approved' | 'rejected';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

// User Model
export interface IUser extends Document {
  _id: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
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

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  profileImageUrl: { type: String },
  role: { type: String, enum: ['member', 'admin', 'super_admin', 'applicant'], default: 'applicant' },
  permissions: [{ type: String }],
  isActive: { type: Boolean, default: true },
  authType: { type: String, enum: ['email', 'replit'], default: 'email' },
  applicationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
}, {
  timestamps: true,
});

export const User = mongoose.model<IUser>('User', userSchema);

// Member Model
export interface IMember extends Document {
  _id: string;
  name: string;
  email: string;
  role: string;
  bio: string;
  profileImageUrl?: string;
  status: ContentStatus;
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<IMember>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true },
  bio: { type: String, required: true },
  profileImageUrl: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdBy: { type: String, required: true },
  approvedBy: { type: String },
}, {
  timestamps: true,
});

export const Member = mongoose.model<IMember>('Member', memberSchema);

// Project Model
export interface IProject extends Document {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  status: ContentStatus;
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdBy: { type: String, required: true },
  approvedBy: { type: String },
}, {
  timestamps: true,
});

export const Project = mongoose.model<IProject>('Project', projectSchema);

// News Article Model
export interface INewsArticle extends Document {
  _id: string;
  title: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  author: string;
  status: ContentStatus;
  createdBy: string;
  approvedBy?: string;
  readCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const newsArticleSchema = new Schema<INewsArticle>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  imageUrl: { type: String },
  author: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdBy: { type: String, required: true },
  approvedBy: { type: String },
  readCount: { type: Number, default: 0 },
}, {
  timestamps: true,
});

export const NewsArticle = mongoose.model<INewsArticle>('NewsArticle', newsArticleSchema);

// Gallery Image Model
export interface IGalleryImage extends Document {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  status: ContentStatus;
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const galleryImageSchema = new Schema<IGalleryImage>({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdBy: { type: String, required: true },
  approvedBy: { type: String },
}, {
  timestamps: true,
});

export const GalleryImage = mongoose.model<IGalleryImage>('GalleryImage', galleryImageSchema);

// Contact Message Model
export interface IContactMessage extends Document {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}

const contactMessageSchema = new Schema<IContactMessage>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
}, {
  timestamps: true,
});

export const ContactMessage = mongoose.model<IContactMessage>('ContactMessage', contactMessageSchema);

// Registration/Application Model
export interface IRegistration extends Document {
  _id: string;
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

const registrationSchema = new Schema<IRegistration>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  institution: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
}, {
  timestamps: true,
});

export const Registration = mongoose.model<IRegistration>('Registration', registrationSchema);