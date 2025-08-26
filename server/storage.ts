import { db } from './db';
import { eq, and, desc, sql } from 'drizzle-orm';
import cloudinary from './cloudinary';
import bcrypt from 'bcrypt';
import {
  users, members, projects, newsArticles, galleryImages, 
  contactMessages, registrations, events, eventRegistrations, notices,
  type User, type Member, type Project, type NewsArticle, 
  type GalleryImage, type ContactMessage, type Registration, 
  type Event, type EventRegistration, type Notice,
  type InsertUser, type InsertMember, type InsertProject, 
  type InsertNewsArticle, type InsertGalleryImage, type InsertContactMessage, 
  type InsertRegistration, type InsertEvent, type InsertEventRegistration, 
  type InsertNotice, type UserRole, type ContentStatus, type ApplicationStatus
} from '@shared/schema';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(userData: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUserRole(id: number, role: string, permissions: string[]): Promise<User | null>;
  updateUserStatus(id: number, isActive: boolean): Promise<User | null>;
  updateUserApplicationStatus(id: number, updateData: any): Promise<User | null>;
  
  // Member operations
  getMembers(): Promise<Member[]>;
  getMember(id: number): Promise<Member | null>;
  getMemberByEmail(email: string): Promise<Member | null>;
  createMember(memberData: InsertMember): Promise<Member>;
  updateMember(id: number, memberData: Partial<InsertMember>): Promise<Member | null>;
  deleteMember(id: number): Promise<void>;
  
  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | null>;
  createProject(projectData: InsertProject, createdBy?: number): Promise<Project>;
  updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | null>;
  deleteProject(id: number): Promise<void>;
  
  // News operations
  getNewsArticles(): Promise<NewsArticle[]>;
  getNewsArticle(id: number): Promise<NewsArticle | null>;
  createNewsArticle(articleData: InsertNewsArticle): Promise<NewsArticle>;
  updateNewsArticle(id: number, articleData: Partial<InsertNewsArticle>): Promise<NewsArticle | null>;
  deleteNewsArticle(id: number): Promise<void>;
  incrementReadCount(id: number): Promise<void>;
  
  // Gallery operations
  getGalleryImages(): Promise<GalleryImage[]>;
  createGalleryImage(imageData: InsertGalleryImage): Promise<GalleryImage>;
  deleteGalleryImage(id: number): Promise<void>;
  
  // Contact operations
  createContactMessage(messageData: InsertContactMessage): Promise<ContactMessage>;
  
  // Registration operations
  getRegistrations(): Promise<Registration[]>;
  getRegistration(id: number): Promise<Registration | null>;
  createRegistration(registrationData: InsertRegistration): Promise<Registration>;
  updateRegistrationStatus(id: number, status: ApplicationStatus, reviewedBy: number): Promise<Registration | null>;
  
  // Event operations
  getEvents(): Promise<Event[]>;
  getUpcomingEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | null>;
  createEvent(eventData: InsertEvent): Promise<Event>;
  updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | null>;
  deleteEvent(id: number): Promise<void>;
  
  // Event registration operations
  getEventRegistrations(eventId?: number): Promise<EventRegistration[]>;
  getEventRegistration(id: number): Promise<EventRegistration | null>;
  createEventRegistration(registrationData: InsertEventRegistration): Promise<EventRegistration>;
  updateEventRegistrationStatus(id: number, status: string): Promise<EventRegistration | null>;
  deleteEventRegistration(id: number): Promise<void>;
  
  // Content approval operations
  getPendingContent(): Promise<{
    projects: Project[];
    news: NewsArticle[];
    members: Member[];
    gallery: GalleryImage[];
  }>;
  approveContent(type: string, id: number, approvedBy: number): Promise<void>;
  rejectContent(type: string, id: number, approvedBy: number): Promise<void>;
  
  // Image storage operations
  uploadImage(buffer: Buffer, filename: string, contentType: string): Promise<string>;
  getImage(filename: string): Promise<{ stream: any; contentType: string } | null>;
  deleteImage(filename: string): Promise<void>;
  
  // Notice operations
  getNotices(): Promise<Notice[]>;
  getActiveNotices(targetAudience?: string): Promise<Notice[]>;
  getNotice(id: number): Promise<Notice | null>;
  createNotice(noticeData: InsertNotice): Promise<Notice>;
  updateNotice(id: number, noticeData: Partial<InsertNotice>): Promise<Notice | null>;
  deleteNotice(id: number): Promise<void>;
  
  // Approval history
  createApprovalHistory(historyData: any): Promise<any>;
  getApprovalHistory(): Promise<any[]>;
}

export class PostgreSQLStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
    const result = await db.update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users)
      .where(eq(users.role, role as UserRole))
      .orderBy(desc(users.createdAt));
  }

  async updateUserRole(id: number, role: string, permissions: string[]): Promise<User | null> {
    const result = await db.update(users)
      .set({ 
        role: role as UserRole, 
        permissions, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  }

  async updateUserStatus(id: number, isActive: boolean): Promise<User | null> {
    const result = await db.update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  }

  async updateUserApplicationStatus(id: number, updateData: any): Promise<User | null> {
    const result = await db.update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  }

  // Member operations
  async getMembers(): Promise<Member[]> {
    return await db.select().from(members)
      .orderBy(desc(members.createdAt));
  }

  async getApprovedMembers(): Promise<Member[]> {
    return await db.select().from(members)
      .where(eq(members.status, 'approved'))
      .orderBy(desc(members.createdAt));
  }

  async getMember(id: number): Promise<Member | null> {
    const result = await db.select().from(members).where(eq(members.id, id)).limit(1);
    return result[0] || null;
  }

  async getMemberByEmail(email: string): Promise<Member | null> {
    const result = await db.select().from(members).where(eq(members.email, email)).limit(1);
    return result[0] || null;
  }

  async createMember(memberData: InsertMember): Promise<Member> {
    const result = await db.insert(members).values(memberData).returning();
    return result[0];
  }

  async updateMember(id: number, memberData: Partial<InsertMember>): Promise<Member | null> {
    const result = await db.update(members)
      .set({ ...memberData, updatedAt: new Date() })
      .where(eq(members.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteMember(id: number): Promise<void> {
    await db.delete(members).where(eq(members.id, id));
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects)
      .where(eq(projects.status, 'approved'))
      .orderBy(desc(projects.createdAt));
  }

  async getProject(id: number): Promise<Project | null> {
    const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return result[0] || null;
  }

  async createProject(projectData: InsertProject, createdBy?: number): Promise<Project> {
    const data = createdBy ? { ...projectData, createdBy } : projectData;
    const result = await db.insert(projects).values(data).returning();
    return result[0];
  }

  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | null> {
    const result = await db.update(projects)
      .set({ ...projectData, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getProjectsByCreator(createdBy: number): Promise<Project[]> {
    return await db.select().from(projects)
      .where(eq(projects.createdBy, createdBy))
      .orderBy(desc(projects.createdAt));
  }

  async getAllProjectsByCreator(createdBy: number): Promise<Project[]> {
    return await db.select().from(projects)
      .where(eq(projects.createdBy, createdBy))
      .orderBy(desc(projects.createdAt));
  }

  // News operations
  async getNewsArticles(): Promise<NewsArticle[]> {
    return await db.select().from(newsArticles)
      .where(eq(newsArticles.status, 'approved'))
      .orderBy(desc(newsArticles.createdAt));
  }

  async getNewsArticle(id: number): Promise<NewsArticle | null> {
    const result = await db.select().from(newsArticles).where(eq(newsArticles.id, id)).limit(1);
    return result[0] || null;
  }

  async createNewsArticle(articleData: InsertNewsArticle): Promise<NewsArticle> {
    const result = await db.insert(newsArticles).values(articleData).returning();
    return result[0];
  }

  async updateNewsArticle(id: number, articleData: Partial<InsertNewsArticle>): Promise<NewsArticle | null> {
    const result = await db.update(newsArticles)
      .set({ ...articleData, updatedAt: new Date() })
      .where(eq(newsArticles.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteNewsArticle(id: number): Promise<void> {
    await db.delete(newsArticles).where(eq(newsArticles.id, id));
  }

  async getNewsByCreator(createdBy: number): Promise<NewsArticle[]> {
    return await db.select().from(newsArticles)
      .where(eq(newsArticles.createdBy, createdBy))
      .orderBy(desc(newsArticles.createdAt));
  }

  async getAllNewsByCreator(createdBy: number): Promise<NewsArticle[]> {
    return await db.select().from(newsArticles)
      .where(eq(newsArticles.createdBy, createdBy))
      .orderBy(desc(newsArticles.createdAt));
  }

  async incrementReadCount(id: number): Promise<void> {
    await db.update(newsArticles)
      .set({ readCount: sql`${newsArticles.readCount} + 1` })
      .where(eq(newsArticles.id, id));
  }

  // Gallery operations
  async getGalleryImages(): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages)
      .where(eq(galleryImages.status, 'approved'))
      .orderBy(desc(galleryImages.createdAt));
  }

  async createGalleryImage(imageData: InsertGalleryImage): Promise<GalleryImage> {
    const result = await db.insert(galleryImages).values(imageData).returning();
    return result[0];
  }

  async deleteGalleryImage(id: number): Promise<void> {
    await db.delete(galleryImages).where(eq(galleryImages.id, id));
  }

  async getAllGalleryImagesByCreator(createdBy: number): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages)
      .where(eq(galleryImages.createdBy, createdBy))
      .orderBy(desc(galleryImages.createdAt));
  }

  // Contact operations
  async createContactMessage(messageData: InsertContactMessage): Promise<ContactMessage> {
    const result = await db.insert(contactMessages).values(messageData).returning();
    return result[0];
  }

  // Registration operations
  async getRegistrations(): Promise<Registration[]> {
    return await db.select().from(registrations).orderBy(desc(registrations.createdAt));
  }

  async getRegistration(id: number): Promise<Registration | null> {
    const result = await db.select().from(registrations).where(eq(registrations.id, id)).limit(1);
    return result[0] || null;
  }

  async createRegistration(registrationData: InsertRegistration): Promise<Registration> {
    const result = await db.insert(registrations).values(registrationData).returning();
    return result[0];
  }

  async updateRegistrationStatus(id: number, status: ApplicationStatus, reviewedBy: number): Promise<Registration | null> {
    const result = await db.update(registrations)
      .set({ 
        status, 
        reviewedBy, 
        reviewedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(registrations.id, id))
      .returning();
    return result[0] || null;
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.createdAt));
  }

  async getUpcomingEvents(): Promise<Event[]> {
    return await db.select().from(events)
      .where(eq(events.status, 'upcoming'))
      .orderBy(events.date);
  }

  async getEvent(id: number): Promise<Event | null> {
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0] || null;
  }

  async createEvent(eventData: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values(eventData).returning();
    return result[0];
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | null> {
    const result = await db.update(events)
      .set({ ...eventData, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Event registration operations
  async getEventRegistrations(eventId?: number): Promise<EventRegistration[]> {
    if (eventId) {
      return await db.select().from(eventRegistrations)
        .where(eq(eventRegistrations.eventId, eventId))
        .orderBy(desc(eventRegistrations.registeredAt));
    }
    return await db.select().from(eventRegistrations).orderBy(desc(eventRegistrations.registeredAt));
  }

  async getEventRegistration(id: number): Promise<EventRegistration | null> {
    const result = await db.select().from(eventRegistrations).where(eq(eventRegistrations.id, id)).limit(1);
    return result[0] || null;
  }

  async createEventRegistration(registrationData: InsertEventRegistration): Promise<EventRegistration> {
    const result = await db.insert(eventRegistrations).values(registrationData).returning();
    return result[0];
  }

  async updateEventRegistrationStatus(id: number, status: string): Promise<EventRegistration | null> {
    const result = await db.update(eventRegistrations)
      .set({ status })
      .where(eq(eventRegistrations.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteEventRegistration(id: number): Promise<void> {
    await db.delete(eventRegistrations).where(eq(eventRegistrations.id, id));
  }

  // Content approval operations
  async getPendingContent(): Promise<{
    projects: Project[];
    news: NewsArticle[];
    members: Member[];
    gallery: GalleryImage[];
  }> {
    const [pendingProjects, pendingNews, pendingMembers, pendingGallery] = await Promise.all([
      db.select().from(projects).where(eq(projects.status, 'pending')).orderBy(desc(projects.createdAt)),
      db.select().from(newsArticles).where(eq(newsArticles.status, 'pending')).orderBy(desc(newsArticles.createdAt)),
      db.select().from(members).where(eq(members.status, 'pending')).orderBy(desc(members.createdAt)),
      db.select().from(galleryImages).where(eq(galleryImages.status, 'pending')).orderBy(desc(galleryImages.createdAt))
    ]);

    return {
      projects: pendingProjects,
      news: pendingNews,
      members: pendingMembers,
      gallery: pendingGallery
    };
  }

  async approveContent(type: string, id: number, approvedBy: number): Promise<void> {
    const updateData = { 
      status: 'approved' as ContentStatus, 
      approvedBy,
      updatedAt: new Date()
    };

    switch (type) {
      case 'project':
        await db.update(projects).set(updateData).where(eq(projects.id, id));
        break;
      case 'news':
        await db.update(newsArticles).set(updateData).where(eq(newsArticles.id, id));
        break;
      case 'member':
        await db.update(members).set(updateData).where(eq(members.id, id));
        break;
      case 'gallery':
        await db.update(galleryImages).set(updateData).where(eq(galleryImages.id, id));
        break;
    }
  }

  async rejectContent(type: string, id: number, approvedBy: number): Promise<void> {
    const updateData = { 
      status: 'rejected' as ContentStatus, 
      approvedBy,
      updatedAt: new Date()
    };

    switch (type) {
      case 'project':
        await db.update(projects).set(updateData).where(eq(projects.id, id));
        break;
      case 'news':
        await db.update(newsArticles).set(updateData).where(eq(newsArticles.id, id));
        break;
      case 'member':
        await db.update(members).set(updateData).where(eq(members.id, id));
        break;
      case 'gallery':
        await db.update(galleryImages).set(updateData).where(eq(galleryImages.id, id));
        break;
    }
  }

  // Image storage operations using Cloudinary
  async uploadImage(buffer: Buffer, filename: string, contentType: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          public_id: filename.split('.')[0],
          format: filename.split('.').pop(),
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result!.secure_url);
          }
        }
      ).end(buffer);
    });
  }

  async getImage(filename: string): Promise<{ stream: any; contentType: string } | null> {
    return null; // Images served directly via Cloudinary URLs
  }

  async deleteImage(filename: string): Promise<void> {
    try {
      const publicId = filename.split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      throw error;
    }
  }

  // Approval history (simplified implementation)
  // Notice operations
  async getNotices(): Promise<Notice[]> {
    return await db.select().from(notices).orderBy(desc(notices.createdAt));
  }

  async getActiveNotices(targetAudience?: string): Promise<Notice[]> {
    const now = new Date();
    const conditions = [
      sql`${notices.startDate} <= ${now}`,
      sql`${notices.endDate} >= ${now}`
    ];
    
    if (targetAudience) {
      conditions.push(eq(notices.targetAudience, targetAudience));
    }
    
    return await db.select().from(notices)
      .where(and(...conditions))
      .orderBy(desc(notices.priority), desc(notices.createdAt));
  }

  async getNotice(id: number): Promise<Notice | null> {
    const result = await db.select().from(notices).where(eq(notices.id, id)).limit(1);
    return result[0] || null;
  }

  async createNotice(noticeData: InsertNotice): Promise<Notice> {
    const result = await db.insert(notices).values(noticeData).returning();
    return result[0];
  }

  async updateNotice(id: number, noticeData: Partial<InsertNotice>): Promise<Notice | null> {
    const result = await db.update(notices)
      .set({ ...noticeData, updatedAt: new Date() })
      .where(eq(notices.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteNotice(id: number): Promise<void> {
    await db.delete(notices).where(eq(notices.id, id));
  }

  async createApprovalHistory(historyData: any): Promise<any> {
    // Could implement with a separate approval_history table if needed
    return { id: Date.now(), ...historyData };
  }

  async getApprovalHistory(): Promise<any[]> {
    // Could implement with a separate approval_history table if needed
    return [];
  }
}

// Create a superadmin user if none exists
async function createSuperAdmin() {
  try {
    const existingAdmin = await db.select().from(users)
      .where(eq(users.role, 'super_admin'))
      .limit(1);
    
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.insert(users).values({
        email: 'admin@3zeroclub.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        permissions: ['all'],
        isActive: true,
        authType: 'email',
        applicationStatus: 'approved',
        approvedAt: new Date()
      });
      console.log('✅ Superadmin created successfully');
    } else {
      console.log('ℹ️ Superadmin already exists');
    }
  } catch (error) {
    console.error('Error creating superadmin:', error);
  }
}

// Create sample projects if none exist
async function createSampleProjects() {
  try {
    const existingProjects = await db.select().from(projects).limit(1);
    
    if (existingProjects.length === 0) {
      const adminUser = await db.select().from(users)
        .where(eq(users.role, 'super_admin'))
        .limit(1);
      
      if (adminUser.length > 0) {
        const sampleProjects = [
          {
            title: "Zero Poverty Initiative",
            description: "Community-driven microfinance program providing small loans to local entrepreneurs, helping 150+ families start sustainable businesses and break the cycle of poverty.",
            imageUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
            completedAt: "Completed December 2024",
            category: "Economic Development",
            status: "approved",
            priorityScore: 95,
            impactLevel: "high",
            autoCategory: "Social Impact",
            daysActive: 180,
            createdBy: adminUser[0].id,
            approvedBy: adminUser[0].id
          },
          {
            title: "Green Youth Training Program",
            description: "Environmental awareness and skill development program training 200+ young people in sustainable agriculture, renewable energy, and eco-friendly business practices.",
            imageUrl: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
            completedAt: "Ongoing since March 2024",
            category: "Environmental",
            status: "approved",
            priorityScore: 88,
            impactLevel: "high",
            autoCategory: "Education",
            daysActive: 120,
            createdBy: adminUser[0].id,
            approvedBy: adminUser[0].id
          },
          {
            title: "Digital Literacy Campaign",
            description: "Technology education initiative providing computer and internet skills training to rural communities, bridging the digital divide and creating new employment opportunities.",
            imageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
            completedAt: "Completed October 2024",
            category: "Education",
            status: "approved",
            priorityScore: 82,
            impactLevel: "medium",
            autoCategory: "Technology",
            daysActive: 90,
            createdBy: adminUser[0].id,
            approvedBy: adminUser[0].id
          }
        ];

        await db.insert(projects).values(sampleProjects);
        console.log('✅ Sample projects created successfully');
      }
    } else {
      console.log('ℹ️ Projects already exist');
    }
  } catch (error) {
    console.error('Error creating sample projects:', error);
  }
}

// Initialize data
createSuperAdmin();
createSampleProjects();

export const storage = new PostgreSQLStorage();