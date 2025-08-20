import { connectToMongoDB } from './mongodb';
import {
  User, Member, Project, NewsArticle, GalleryImage, ContactMessage, Registration, Event,
  IUser, IMember, IProject, INewsArticle, IGalleryImage, IContactMessage, IRegistration, IEvent,
  UserRole, ContentStatus, ApplicationStatus
} from '@shared/models';
import type {
  InsertUser, InsertMember, InsertProject, InsertNewsArticle, 
  InsertGalleryImage, InsertContactMessage, InsertRegistration, InsertEvent
} from '@shared/validation';

// Connect to MongoDB when storage is imported
connectToMongoDB().catch(console.error);

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

// Use MongoDB storage
export const storage = new MongoStorage();