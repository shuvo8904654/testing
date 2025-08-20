import {
  IUser, IMember, IProject, INewsArticle, IGalleryImage, IContactMessage, IRegistration, IEvent,
  UserRole, ContentStatus, ApplicationStatus
} from '@shared/models';
import type {
  InsertUser, InsertMember, InsertProject, InsertNewsArticle, 
  InsertGalleryImage, InsertContactMessage, InsertRegistration, InsertEvent
} from '@shared/validation';
import { IStorage } from './storage';
import bcrypt from 'bcrypt';

// In-memory data stores
const users = new Map<string, IUser>();
const members = new Map<string, IMember>();
const projects = new Map<string, IProject>();
const newsArticles = new Map<string, INewsArticle>();
const galleryImages = new Map<string, IGalleryImage>();
const contactMessages = new Map<string, IContactMessage>();
const registrations = new Map<string, IRegistration>();
const events = new Map<string, IEvent>();

// Helper function to generate ID
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Initialize with some sample data
async function initializeSampleData() {
  // Create super admin user
  const adminId = generateId();
  const adminUser: IUser = {
    _id: adminId,
    email: 'admin@3zero.club',
    password: await bcrypt.hash('admin123', 10),
    firstName: 'Super',
    lastName: 'Admin',
    role: 'super_admin',
    permissions: [],
    isActive: true,
    authType: 'email',
    applicationStatus: 'approved',
    appliedAt: new Date(),
    approvedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as IUser;
  users.set(adminId, adminUser);

  // Create sample member
  const memberId = generateId();
  const memberUser: IUser = {
    _id: memberId,
    email: 'member@3zero.club',
    password: await bcrypt.hash('member123', 10),
    firstName: 'John',
    lastName: 'Doe',
    role: 'member',
    permissions: [],
    isActive: true,
    authType: 'email',
    applicationStatus: 'approved',
    appliedAt: new Date(),
    approvedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as IUser;
  users.set(memberId, memberUser);

  // Create sample news article
  const newsId = generateId();
  const sampleNews: INewsArticle = {
    _id: newsId,
    title: 'Welcome to 3ZERO Club Kurigram',
    content: 'We are excited to launch our youth organization focused on zero poverty, zero unemployment, and zero net carbon emissions.',
    excerpt: 'Welcome to our youth organization',
    author: 'Admin Team',
    status: 'approved',
    createdBy: adminId,
    approvedBy: adminId,
    readCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as INewsArticle;
  newsArticles.set(newsId, sampleNews);

  console.log('Sample data initialized with admin user: admin@3zero.club / admin123');
}

// Initialize sample data
initializeSampleData().catch(console.error);

export class MemoryStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<IUser | null> {
    return users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    for (const user of users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async createUser(userData: InsertUser): Promise<IUser> {
    const id = generateId();
    const user: IUser = {
      _id: id,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as IUser;
    users.set(id, user);
    return user;
  }

  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    const user = users.get(id);
    if (!user) return null;
    
    const updatedUser = { ...user, ...userData, updatedAt: new Date() };
    users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<IUser[]> {
    return Array.from(users.values()).map(user => ({ ...user, password: undefined } as IUser));
  }

  async updateUserRole(id: string, role: string, permissions: string[]): Promise<IUser | null> {
    const user = users.get(id);
    if (!user) return null;
    
    const updatedUser = { 
      ...user, 
      role: role as UserRole, 
      permissions, 
      updatedAt: new Date() 
    };
    users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<IUser | null> {
    const user = users.get(id);
    if (!user) return null;
    
    const updatedUser = { ...user, isActive, updatedAt: new Date() };
    users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsersByRole(role: string): Promise<IUser[]> {
    return Array.from(users.values())
      .filter(user => user.role === role)
      .map(user => ({ ...user, password: undefined } as IUser));
  }

  async updateUserApplicationStatus(id: string, updateData: any): Promise<IUser | null> {
    const user = users.get(id);
    if (!user) return null;
    
    const updatedUser = { ...user, ...updateData, updatedAt: new Date() };
    users.set(id, updatedUser);
    return updatedUser;
  }

  // Member operations
  async getMembers(): Promise<IMember[]> {
    return Array.from(members.values()).filter(member => member.status === 'approved');
  }

  async getMember(id: string): Promise<IMember | null> {
    return members.get(id) || null;
  }

  async createMember(memberData: InsertMember): Promise<IMember> {
    const id = generateId();
    const member: IMember = {
      _id: id,
      ...memberData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as IMember;
    members.set(id, member);
    return member;
  }

  async updateMember(id: string, memberData: Partial<InsertMember>): Promise<IMember | null> {
    const member = members.get(id);
    if (!member) return null;
    
    const updatedMember = { ...member, ...memberData, updatedAt: new Date() };
    members.set(id, updatedMember);
    return updatedMember;
  }

  async deleteMember(id: string): Promise<void> {
    members.delete(id);
  }

  // Project operations
  async getProjects(): Promise<IProject[]> {
    return Array.from(projects.values()).filter(project => project.status === 'approved');
  }

  async getProject(id: string): Promise<IProject | null> {
    return projects.get(id) || null;
  }

  async createProject(projectData: InsertProject, createdBy?: string): Promise<IProject> {
    const id = generateId();
    const project: IProject = {
      _id: id,
      ...projectData,
      createdBy: createdBy || projectData.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as IProject;
    projects.set(id, project);
    return project;
  }

  async updateProject(id: string, projectData: Partial<InsertProject>): Promise<IProject | null> {
    const project = projects.get(id);
    if (!project) return null;
    
    const updatedProject = { ...project, ...projectData, updatedAt: new Date() };
    projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<void> {
    projects.delete(id);
  }

  // News operations
  async getNewsArticles(): Promise<INewsArticle[]> {
    return Array.from(newsArticles.values())
      .filter(article => article.status === 'approved')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getNewsArticle(id: string): Promise<INewsArticle | null> {
    return newsArticles.get(id) || null;
  }

  async createNewsArticle(articleData: InsertNewsArticle): Promise<INewsArticle> {
    const id = generateId();
    const article: INewsArticle = {
      _id: id,
      ...articleData,
      readCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as INewsArticle;
    newsArticles.set(id, article);
    return article;
  }

  async updateNewsArticle(id: string, articleData: Partial<InsertNewsArticle>): Promise<INewsArticle | null> {
    const article = newsArticles.get(id);
    if (!article) return null;
    
    const updatedArticle = { ...article, ...articleData, updatedAt: new Date() };
    newsArticles.set(id, updatedArticle);
    return updatedArticle;
  }

  async deleteNewsArticle(id: string): Promise<void> {
    newsArticles.delete(id);
  }

  async incrementReadCount(id: string): Promise<void> {
    const article = newsArticles.get(id);
    if (article) {
      article.readCount = (article.readCount || 0) + 1;
      newsArticles.set(id, article);
    }
  }

  // Gallery operations
  async getGalleryImages(): Promise<IGalleryImage[]> {
    return Array.from(galleryImages.values()).filter(image => image.status === 'approved');
  }

  async createGalleryImage(imageData: InsertGalleryImage): Promise<IGalleryImage> {
    const id = generateId();
    const image: IGalleryImage = {
      _id: id,
      ...imageData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as IGalleryImage;
    galleryImages.set(id, image);
    return image;
  }

  async deleteGalleryImage(id: string): Promise<void> {
    galleryImages.delete(id);
  }

  // Contact operations
  async createContactMessage(messageData: InsertContactMessage): Promise<IContactMessage> {
    const id = generateId();
    const message: IContactMessage = {
      _id: id,
      ...messageData,
      createdAt: new Date(),
    } as IContactMessage;
    contactMessages.set(id, message);
    return message;
  }

  // Registration operations
  async getRegistrations(): Promise<IRegistration[]> {
    return Array.from(registrations.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRegistration(id: string): Promise<IRegistration | null> {
    return registrations.get(id) || null;
  }

  async createRegistration(registrationData: InsertRegistration): Promise<IRegistration> {
    const id = generateId();
    const registration: IRegistration = {
      _id: id,
      ...registrationData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as IRegistration;
    registrations.set(id, registration);
    return registration;
  }

  async updateRegistrationStatus(id: string, status: ApplicationStatus, reviewedBy: string): Promise<IRegistration | null> {
    const registration = registrations.get(id);
    if (!registration) return null;
    
    const updatedRegistration = { 
      ...registration, 
      status, 
      reviewedBy, 
      reviewedAt: new Date(),
      updatedAt: new Date()
    };
    registrations.set(id, updatedRegistration);
    return updatedRegistration;
  }

  // Event operations
  async getEvents(): Promise<IEvent[]> {
    return Array.from(events.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async getUpcomingEvents(): Promise<IEvent[]> {
    const now = new Date();
    return Array.from(events.values())
      .filter(event => event.status === 'upcoming' && event.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 10);
  }

  async getEvent(id: string): Promise<IEvent | null> {
    return events.get(id) || null;
  }

  async createEvent(eventData: InsertEvent): Promise<IEvent> {
    const id = generateId();
    const event: IEvent = {
      _id: id,
      ...eventData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as IEvent;
    events.set(id, event);
    return event;
  }

  async updateEvent(id: string, eventData: Partial<InsertEvent>): Promise<IEvent | null> {
    const event = events.get(id);
    if (!event) return null;
    
    const updatedEvent = { 
      ...event, 
      ...eventData, 
      updatedAt: new Date()
    };
    events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    events.delete(id);
  }

  // Content approval operations
  async getPendingContent(): Promise<{
    projects: IProject[];
    news: INewsArticle[];
    members: IMember[];
    gallery: IGalleryImage[];
  }> {
    return {
      projects: Array.from(projects.values()).filter(p => p.status === 'pending'),
      news: Array.from(newsArticles.values()).filter(n => n.status === 'pending'),
      members: Array.from(members.values()).filter(m => m.status === 'pending'),
      gallery: Array.from(galleryImages.values()).filter(g => g.status === 'pending'),
    };
  }

  async approveContent(type: string, id: string, approvedBy: string): Promise<void> {
    const updateData = { 
      status: 'approved' as ContentStatus, 
      approvedBy,
      updatedAt: new Date(),
    };

    switch (type) {
      case 'project':
        const project = projects.get(id);
        if (project) {
          projects.set(id, { ...project, ...updateData });
        }
        break;
      case 'news':
        const article = newsArticles.get(id);
        if (article) {
          newsArticles.set(id, { ...article, ...updateData });
        }
        break;
      case 'member':
        const member = members.get(id);
        if (member) {
          members.set(id, { ...member, ...updateData });
        }
        break;
      case 'gallery':
        const image = galleryImages.get(id);
        if (image) {
          galleryImages.set(id, { ...image, ...updateData });
        }
        break;
      case 'user':
        const user = users.get(id);
        if (user) {
          users.set(id, { 
            ...user, 
            role: 'member' as UserRole,
            applicationStatus: 'approved' as ApplicationStatus,
            approvedAt: new Date(),
            updatedAt: new Date()
          });
        }
        break;
    }
  }

  async rejectContent(type: string, id: string, approvedBy: string): Promise<void> {
    const updateData = { 
      status: 'rejected' as ContentStatus, 
      approvedBy,
      updatedAt: new Date(),
    };

    switch (type) {
      case 'project':
        const project = projects.get(id);
        if (project) {
          projects.set(id, { ...project, ...updateData });
        }
        break;
      case 'news':
        const article = newsArticles.get(id);
        if (article) {
          newsArticles.set(id, { ...article, ...updateData });
        }
        break;
      case 'member':
        const member = members.get(id);
        if (member) {
          members.set(id, { ...member, ...updateData });
        }
        break;
      case 'gallery':
        const image = galleryImages.get(id);
        if (image) {
          galleryImages.set(id, { ...image, ...updateData });
        }
        break;
      case 'user':
        const user = users.get(id);
        if (user) {
          users.set(id, { 
            ...user, 
            applicationStatus: 'rejected' as ApplicationStatus,
            updatedAt: new Date()
          });
        }
        break;
    }
  }
}

export const memoryStorage = new MemoryStorage();