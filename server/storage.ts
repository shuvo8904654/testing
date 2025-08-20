import { connectToMongoDB } from './mongodb';
import { GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';
import {
  User, Member, Project, NewsArticle, GalleryImage, ContactMessage, Registration, Event,
  IUser, IMember, IProject, INewsArticle, IGalleryImage, IContactMessage, IRegistration, IEvent,
  UserRole, ContentStatus, ApplicationStatus
} from '@shared/models';
import type {
  InsertUser, InsertMember, InsertProject, InsertNewsArticle, 
  InsertGalleryImage, InsertContactMessage, InsertRegistration, InsertEvent
} from '@shared/validation';

// Connect to MongoDB when storage is imported - with fallback
let mongoConnected = false;
connectToMongoDB()
  .then(() => {
    mongoConnected = true;
    console.log('✅ MongoDB Atlas connected successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed, using memory storage as fallback');
    mongoConnected = false;
  });

export interface IStorage {
  // User operations
  getUser(id: string): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
  createUser(userData: InsertUser): Promise<IUser>;
  updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null>;
  getAllUsers(): Promise<IUser[]>;
  getUsersByRole(role: string): Promise<IUser[]>;
  updateUserRole(id: string, role: string, permissions: string[]): Promise<IUser | null>;
  updateUserStatus(id: string, isActive: boolean): Promise<IUser | null>;
  updateUserApplicationStatus(id: string, updateData: any): Promise<IUser | null>;
  
  // Member operations
  getMembers(): Promise<IMember[]>;
  getMember(id: string): Promise<IMember | null>;
  createMember(memberData: InsertMember): Promise<IMember>;
  updateMember(id: string, memberData: Partial<InsertMember>): Promise<IMember | null>;
  deleteMember(id: string): Promise<void>;
  
  // Project operations
  getProjects(): Promise<IProject[]>;
  getProject(id: string): Promise<IProject | null>;
  createProject(projectData: InsertProject, createdBy?: string): Promise<IProject>;
  updateProject(id: string, projectData: Partial<InsertProject>): Promise<IProject | null>;
  deleteProject(id: string): Promise<void>;
  
  // News operations
  getNewsArticles(): Promise<INewsArticle[]>;
  getNewsArticle(id: string): Promise<INewsArticle | null>;
  createNewsArticle(articleData: InsertNewsArticle): Promise<INewsArticle>;
  updateNewsArticle(id: string, articleData: Partial<InsertNewsArticle>): Promise<INewsArticle | null>;
  deleteNewsArticle(id: string): Promise<void>;
  incrementReadCount(id: string): Promise<void>;
  
  // Gallery operations
  getGalleryImages(): Promise<IGalleryImage[]>;
  createGalleryImage(imageData: InsertGalleryImage): Promise<IGalleryImage>;
  deleteGalleryImage(id: string): Promise<void>;
  
  // Contact operations
  createContactMessage(messageData: InsertContactMessage): Promise<IContactMessage>;
  
  // Registration operations
  getRegistrations(): Promise<IRegistration[]>;
  getRegistration(id: string): Promise<IRegistration | null>;
  createRegistration(registrationData: InsertRegistration): Promise<IRegistration>;
  updateRegistrationStatus(id: string, status: ApplicationStatus, reviewedBy: string): Promise<IRegistration | null>;
  
  // Event operations
  getEvents(): Promise<IEvent[]>;
  getUpcomingEvents(): Promise<IEvent[]>;
  getEvent(id: string): Promise<IEvent | null>;
  createEvent(eventData: InsertEvent): Promise<IEvent>;
  updateEvent(id: string, eventData: Partial<InsertEvent>): Promise<IEvent | null>;
  deleteEvent(id: string): Promise<void>;
  
  // Content approval operations
  getPendingContent(): Promise<{
    projects: IProject[];
    news: INewsArticle[];
    members: IMember[];
    gallery: IGalleryImage[];
  }>;
  approveContent(type: string, id: string, approvedBy: string): Promise<void>;
  rejectContent(type: string, id: string, approvedBy: string): Promise<void>;
  
  // Image storage operations
  uploadImage(buffer: Buffer, filename: string, contentType: string): Promise<string>;
  getImage(filename: string): Promise<{ stream: any; contentType: string } | null>;
  deleteImage(filename: string): Promise<void>;
  
  // Approval history
  createApprovalHistory(historyData: any): Promise<any>;
  getApprovalHistory(): Promise<any[]>;
}

export class MongoStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async createUser(userData: InsertUser): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, userData, { new: true });
  }

  async getAllUsers(): Promise<IUser[]> {
    return await User.find().select('-password').sort({ createdAt: -1 });
  }

  async updateUserRole(id: string, role: string, permissions: string[]): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id, 
      { role: role as UserRole, permissions, updatedAt: new Date() }, 
      { new: true }
    );
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id, 
      { isActive, updatedAt: new Date() }, 
      { new: true }
    );
  }

  async getUsersByRole(role: string): Promise<IUser[]> {
    return await User.find({ role }).select('-password').sort({ createdAt: -1 });
  }

  async updateUserApplicationStatus(id: string, updateData: any): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id, 
      { ...updateData, updatedAt: new Date() }, 
      { new: true }
    ).select('-password');
  }

  async createApprovalHistory(historyData: any): Promise<any> {
    // Store in a simple approval history collection
    const approvalHistory = mongoose.model('ApprovalHistory', new mongoose.Schema({
      userId: String,
      reviewedBy: String,
      status: String,
      reviewedAt: Date,
      userEmail: String,
      userFirstName: String,
      userLastName: String
    }, { timestamps: true }));
    
    return await approvalHistory.create(historyData);
  }

  async getApprovalHistory(): Promise<any[]> {
    const approvalHistory = mongoose.model('ApprovalHistory');
    return await approvalHistory.find().sort({ reviewedAt: -1 }).limit(100);
  }

  // Image storage operations using MongoDB GridFS
  async uploadImage(buffer: Buffer, filename: string, contentType: string): Promise<string> {
    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'images' });
    const uploadStream = bucket.openUploadStream(filename, { contentType });
    
    return new Promise((resolve, reject) => {
      uploadStream.on('error', reject);
      uploadStream.on('finish', () => {
        resolve(`/api/images/${filename}`);
      });
      uploadStream.end(buffer);
    });
  }

  async getImage(filename: string): Promise<{ stream: any; contentType: string } | null> {
    try {
      const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'images' });
      const file = await bucket.find({ filename }).toArray();
      
      if (file.length === 0) return null;
      
      const downloadStream = bucket.openDownloadStreamByName(filename);
      return {
        stream: downloadStream,
        contentType: file[0].contentType || 'application/octet-stream'
      };
    } catch (error) {
      console.error('Error retrieving image:', error);
      return null;
    }
  }

  async deleteImage(filename: string): Promise<void> {
    try {
      const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'images' });
      const files = await bucket.find({ filename }).toArray();
      
      if (files.length > 0) {
        await bucket.delete(files[0]._id);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  // Member operations
  async getMembers(): Promise<IMember[]> {
    return await Member.find({ status: 'approved' }).sort({ createdAt: -1 });
  }

  async getMember(id: string): Promise<IMember | null> {
    return await Member.findById(id);
  }

  async createMember(memberData: InsertMember): Promise<IMember> {
    const member = new Member(memberData);
    return await member.save();
  }

  async updateMember(id: string, memberData: Partial<InsertMember>): Promise<IMember | null> {
    return await Member.findByIdAndUpdate(id, memberData, { new: true });
  }

  async deleteMember(id: string): Promise<void> {
    await Member.findByIdAndDelete(id);
  }

  // Project operations
  async getProjects(): Promise<IProject[]> {
    return await Project.find({ status: 'approved' }).sort({ createdAt: -1 });
  }

  async getProject(id: string): Promise<IProject | null> {
    return await Project.findById(id);
  }

  async createProject(projectData: InsertProject, createdBy?: string): Promise<IProject> {
    const project = new Project({ ...projectData, createdBy });
    return await project.save();
  }

  async updateProject(id: string, projectData: Partial<InsertProject>): Promise<IProject | null> {
    return await Project.findByIdAndUpdate(id, projectData, { new: true });
  }

  async deleteProject(id: string): Promise<void> {
    await Project.findByIdAndDelete(id);
  }

  // News operations
  async getNewsArticles(): Promise<INewsArticle[]> {
    return await NewsArticle.find({ status: 'approved' }).sort({ createdAt: -1 });
  }

  async getNewsArticle(id: string): Promise<INewsArticle | null> {
    return await NewsArticle.findById(id);
  }

  async createNewsArticle(articleData: InsertNewsArticle): Promise<INewsArticle> {
    const article = new NewsArticle(articleData);
    return await article.save();
  }

  async updateNewsArticle(id: string, articleData: Partial<InsertNewsArticle>): Promise<INewsArticle | null> {
    return await NewsArticle.findByIdAndUpdate(id, articleData, { new: true });
  }

  async deleteNewsArticle(id: string): Promise<void> {
    await NewsArticle.findByIdAndDelete(id);
  }

  async incrementReadCount(id: string): Promise<void> {
    await NewsArticle.findByIdAndUpdate(id, { $inc: { readCount: 1 } });
  }

  // Gallery operations
  async getGalleryImages(): Promise<IGalleryImage[]> {
    return await GalleryImage.find({ status: 'approved' }).sort({ createdAt: -1 });
  }

  async createGalleryImage(imageData: InsertGalleryImage): Promise<IGalleryImage> {
    const image = new GalleryImage(imageData);
    return await image.save();
  }

  async deleteGalleryImage(id: string): Promise<void> {
    await GalleryImage.findByIdAndDelete(id);
  }

  // Contact operations
  async createContactMessage(messageData: InsertContactMessage): Promise<IContactMessage> {
    const message = new ContactMessage(messageData);
    return await message.save();
  }

  // Registration operations
  async getRegistrations(): Promise<IRegistration[]> {
    return await Registration.find().sort({ createdAt: -1 });
  }

  async getRegistration(id: string): Promise<IRegistration | null> {
    return await Registration.findById(id);
  }

  async createRegistration(registrationData: InsertRegistration): Promise<IRegistration> {
    const registration = new Registration(registrationData);
    return await registration.save();
  }

  async updateRegistrationStatus(id: string, status: ApplicationStatus, reviewedBy: string): Promise<IRegistration | null> {
    return await Registration.findByIdAndUpdate(
      id,
      { 
        status, 
        reviewedBy, 
        reviewedAt: new Date() 
      },
      { new: true }
    );
  }

  // Event operations
  async getEvents(): Promise<IEvent[]> {
    return await Event.find().sort({ date: 1 });
  }

  async getUpcomingEvents(): Promise<IEvent[]> {
    return await Event.find({ 
      status: 'upcoming',
      date: { $gte: new Date() }
    }).sort({ date: 1 }).limit(10);
  }

  async getEvent(id: string): Promise<IEvent | null> {
    return await Event.findById(id);
  }

  async createEvent(eventData: InsertEvent): Promise<IEvent> {
    const event = new Event(eventData);
    return await event.save();
  }

  async updateEvent(id: string, eventData: Partial<InsertEvent>): Promise<IEvent | null> {
    return await Event.findByIdAndUpdate(id, eventData, { new: true });
  }

  async deleteEvent(id: string): Promise<void> {
    await Event.findByIdAndDelete(id);
  }

  // Content approval operations
  async getPendingContent(): Promise<{
    projects: IProject[];
    news: INewsArticle[];
    members: IMember[];
    gallery: IGalleryImage[];
  }> {
    const [projects, news, members, gallery] = await Promise.all([
      Project.find({ status: 'pending' }).sort({ createdAt: -1 }),
      NewsArticle.find({ status: 'pending' }).sort({ createdAt: -1 }),
      Member.find({ status: 'pending' }).sort({ createdAt: -1 }),
      GalleryImage.find({ status: 'pending' }).sort({ createdAt: -1 })
    ]);

    return { projects, news, members, gallery };
  }

  async approveContent(type: string, id: string, approvedBy: string): Promise<void> {
    const updateData = { 
      status: 'approved' as ContentStatus, 
      approvedBy,
      ...(type === 'user' ? { approvedAt: new Date() } : {})
    };

    switch (type) {
      case 'project':
        await Project.findByIdAndUpdate(id, updateData);
        break;
      case 'news':
        await NewsArticle.findByIdAndUpdate(id, updateData);
        break;
      case 'member':
        await Member.findByIdAndUpdate(id, updateData);
        break;
      case 'gallery':
        await GalleryImage.findByIdAndUpdate(id, updateData);
        break;
      case 'user':
        await User.findByIdAndUpdate(id, { 
          ...updateData, 
          role: 'member' as UserRole,
          applicationStatus: 'approved' as ApplicationStatus 
        });
        break;
    }
  }

  async rejectContent(type: string, id: string, approvedBy: string): Promise<void> {
    const updateData = { 
      status: 'rejected' as ContentStatus, 
      approvedBy 
    };

    switch (type) {
      case 'project':
        await Project.findByIdAndUpdate(id, updateData);
        break;
      case 'news':
        await NewsArticle.findByIdAndUpdate(id, updateData);
        break;
      case 'member':
        await Member.findByIdAndUpdate(id, updateData);
        break;
      case 'gallery':
        await GalleryImage.findByIdAndUpdate(id, updateData);
        break;
      case 'user':
        await User.findByIdAndUpdate(id, { 
          ...updateData, 
          applicationStatus: 'rejected' as ApplicationStatus 
        });
        break;
    }
  }
}

// Hybrid storage - automatically switches between MongoDB and memory storage
import { memoryStorage } from './memoryStorage';

class HybridStorage implements IStorage {
  private mongoStorage = new MongoStorage();
  private memoryStorage = memoryStorage;

  private async useStorage<T>(operation: (storage: IStorage) => Promise<T>): Promise<T> {
    try {
      // Try MongoDB first if connected
      if (mongoConnected) {
        return await operation(this.mongoStorage);
      }
    } catch (error) {
      console.warn('MongoDB operation failed, falling back to memory storage:', error.message);
    }
    
    // Fallback to memory storage
    return await operation(this.memoryStorage);
  }

  // User operations
  async getUser(id: string): Promise<IUser | null> {
    return this.useStorage(storage => storage.getUser(id));
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return this.useStorage(storage => storage.getUserByEmail(email));
  }

  async createUser(userData: InsertUser): Promise<IUser> {
    return this.useStorage(storage => storage.createUser(userData));
  }

  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    return this.useStorage(storage => storage.updateUser(id, userData));
  }

  async getAllUsers(): Promise<IUser[]> {
    return this.useStorage(storage => storage.getAllUsers());
  }

  async getUsersByRole(role: string): Promise<IUser[]> {
    return this.useStorage(storage => storage.getUsersByRole(role));
  }

  async updateUserRole(id: string, role: string, permissions: string[]): Promise<IUser | null> {
    return this.useStorage(storage => storage.updateUserRole(id, role, permissions));
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<IUser | null> {
    return this.useStorage(storage => storage.updateUserStatus(id, isActive));
  }

  async updateUserApplicationStatus(id: string, updateData: any): Promise<IUser | null> {
    return this.useStorage(storage => storage.updateUserApplicationStatus(id, updateData));
  }

  // Member operations
  async getMembers(): Promise<IMember[]> {
    return this.useStorage(storage => storage.getMembers());
  }

  async getMember(id: string): Promise<IMember | null> {
    return this.useStorage(storage => storage.getMember(id));
  }

  async createMember(memberData: InsertMember): Promise<IMember> {
    return this.useStorage(storage => storage.createMember(memberData));
  }

  async updateMember(id: string, memberData: Partial<InsertMember>): Promise<IMember | null> {
    return this.useStorage(storage => storage.updateMember(id, memberData));
  }

  async deleteMember(id: string): Promise<void> {
    return this.useStorage(storage => storage.deleteMember(id));
  }

  // Project operations
  async getProjects(): Promise<IProject[]> {
    return this.useStorage(storage => storage.getProjects());
  }

  async getProject(id: string): Promise<IProject | null> {
    return this.useStorage(storage => storage.getProject(id));
  }

  async createProject(projectData: InsertProject, createdBy?: string): Promise<IProject> {
    return this.useStorage(storage => storage.createProject(projectData, createdBy));
  }

  async updateProject(id: string, projectData: Partial<InsertProject>): Promise<IProject | null> {
    return this.useStorage(storage => storage.updateProject(id, projectData));
  }

  async deleteProject(id: string): Promise<void> {
    return this.useStorage(storage => storage.deleteProject(id));
  }

  // News operations
  async getNewsArticles(): Promise<INewsArticle[]> {
    return this.useStorage(storage => storage.getNewsArticles());
  }

  async getNewsArticle(id: string): Promise<INewsArticle | null> {
    return this.useStorage(storage => storage.getNewsArticle(id));
  }

  async createNewsArticle(articleData: InsertNewsArticle): Promise<INewsArticle> {
    return this.useStorage(storage => storage.createNewsArticle(articleData));
  }

  async updateNewsArticle(id: string, articleData: Partial<InsertNewsArticle>): Promise<INewsArticle | null> {
    return this.useStorage(storage => storage.updateNewsArticle(id, articleData));
  }

  async deleteNewsArticle(id: string): Promise<void> {
    return this.useStorage(storage => storage.deleteNewsArticle(id));
  }

  async incrementReadCount(id: string): Promise<void> {
    return this.useStorage(storage => storage.incrementReadCount(id));
  }

  // Gallery operations
  async getGalleryImages(): Promise<IGalleryImage[]> {
    return this.useStorage(storage => storage.getGalleryImages());
  }

  async createGalleryImage(imageData: InsertGalleryImage): Promise<IGalleryImage> {
    return this.useStorage(storage => storage.createGalleryImage(imageData));
  }

  async deleteGalleryImage(id: string): Promise<void> {
    return this.useStorage(storage => storage.deleteGalleryImage(id));
  }

  // Contact operations
  async createContactMessage(messageData: InsertContactMessage): Promise<IContactMessage> {
    return this.useStorage(storage => storage.createContactMessage(messageData));
  }

  // Registration operations
  async getRegistrations(): Promise<IRegistration[]> {
    return this.useStorage(storage => storage.getRegistrations());
  }

  async getRegistration(id: string): Promise<IRegistration | null> {
    return this.useStorage(storage => storage.getRegistration(id));
  }

  async createRegistration(registrationData: InsertRegistration): Promise<IRegistration> {
    return this.useStorage(storage => storage.createRegistration(registrationData));
  }

  async updateRegistrationStatus(id: string, status: ApplicationStatus, reviewedBy: string): Promise<IRegistration | null> {
    return this.useStorage(storage => storage.updateRegistrationStatus(id, status, reviewedBy));
  }

  // Event operations
  async getEvents(): Promise<IEvent[]> {
    return this.useStorage(storage => storage.getEvents());
  }

  async getUpcomingEvents(): Promise<IEvent[]> {
    return this.useStorage(storage => storage.getUpcomingEvents());
  }

  async getEvent(id: string): Promise<IEvent | null> {
    return this.useStorage(storage => storage.getEvent(id));
  }

  async createEvent(eventData: InsertEvent): Promise<IEvent> {
    return this.useStorage(storage => storage.createEvent(eventData));
  }

  async updateEvent(id: string, eventData: Partial<InsertEvent>): Promise<IEvent | null> {
    return this.useStorage(storage => storage.updateEvent(id, eventData));
  }

  async deleteEvent(id: string): Promise<void> {
    return this.useStorage(storage => storage.deleteEvent(id));
  }

  // Content approval operations
  async getPendingContent(): Promise<{
    projects: IProject[];
    news: INewsArticle[];
    members: IMember[];
    gallery: IGalleryImage[];
  }> {
    return this.useStorage(storage => storage.getPendingContent());
  }

  async approveContent(type: string, id: string, approvedBy: string): Promise<void> {
    return this.useStorage(storage => storage.approveContent(type, id, approvedBy));
  }

  async rejectContent(type: string, id: string, approvedBy: string): Promise<void> {
    return this.useStorage(storage => storage.rejectContent(type, id, approvedBy));
  }

  // Image storage operations
  async uploadImage(buffer: Buffer, filename: string, contentType: string): Promise<string> {
    return this.useStorage(storage => storage.uploadImage(buffer, filename, contentType));
  }

  async getImage(filename: string): Promise<{ stream: any; contentType: string } | null> {
    return this.useStorage(storage => storage.getImage(filename));
  }

  async deleteImage(filename: string): Promise<void> {
    return this.useStorage(storage => storage.deleteImage(filename));
  }

  // Approval history
  async createApprovalHistory(historyData: any): Promise<any> {
    return this.useStorage(storage => storage.createApprovalHistory(historyData));
  }

  async getApprovalHistory(): Promise<any[]> {
    return this.useStorage(storage => storage.getApprovalHistory());
  }
}

export const storage = new HybridStorage();