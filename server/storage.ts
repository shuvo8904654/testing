import { 
  type User, 
  type UpsertUser,
  type InsertUser, 
  type Member, 
  type InsertMember, 
  type Project, 
  type InsertProject, 
  type NewsArticle, 
  type InsertNewsArticle, 
  type GalleryImage, 
  type InsertGalleryImage, 
  type ContactMessage, 
  type InsertContactMessage,
  type Registration,
  type InsertRegistration
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: InsertUser): Promise<User>;
  
  getMembers(): Promise<Member[]>;
  getMember(id: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: string, member: Partial<InsertMember>): Promise<Member>;
  deleteMember(id: string): Promise<void>;
  
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject, createdBy?: string): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  getNewsArticles(): Promise<NewsArticle[]>;
  getNewsArticle(id: string): Promise<NewsArticle | undefined>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  updateNewsArticle(id: string, article: Partial<InsertNewsArticle>): Promise<NewsArticle>;
  deleteNewsArticle(id: string): Promise<void>;
  
  getGalleryImages(): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  deleteGalleryImage(id: string): Promise<void>;
  
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  
  // Registration operations
  getRegistrations(): Promise<Registration[]>;
  getRegistration(id: string): Promise<Registration | undefined>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  updateRegistrationStatus(id: string, status: string, reviewedBy: string): Promise<Registration>;
  
  // Approval operations
  approveContent(contentType: "news" | "project" | "gallery", id: string, reviewedBy: string): Promise<void>;
  rejectContent(contentType: "news" | "project" | "gallery", id: string, reviewedBy: string): Promise<void>;
  getPendingContent(): Promise<{
    news: NewsArticle[];
    projects: Project[];
    gallery: GalleryImage[];
  }>;
  
  // Role management operations
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: string, role: string, permissions: string[]): Promise<User>;
  updateUserStatus(id: string, isActive: boolean): Promise<User>;
}



import { 
  users,
  members,
  projects,
  newsArticles,
  galleryImages,
  contactMessages,
  registrations
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const insertData = {
      ...userData,
      permissions: userData.permissions || [],
    };
    const [user] = await db
      .insert(users)
      .values(insertData as any)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          role: userData.role,
          permissions: (userData.permissions || []) as string[],
          isActive: userData.isActive,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const insertData = {
      ...userData,
      permissions: userData.permissions || [],
    };
    const [user] = await db
      .insert(users)
      .values(insertData as any)
      .returning();
    return user;
  }

  async getMembers(): Promise<Member[]> {
    return await db.select().from(members).orderBy(members.createdAt);
  }

  async getMember(id: string): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    return member;
  }

  async createMember(memberData: InsertMember): Promise<Member> {
    const insertData = {
      ...memberData,
      social: memberData.social || {},
    };
    const [member] = await db
      .insert(members)
      .values(insertData as any)
      .returning();
    return member;
  }

  async updateMember(id: string, memberData: Partial<InsertMember>): Promise<Member> {
    const updateData: any = { ...memberData };
    if (updateData.social) {
      updateData.social = updateData.social;
    }
    const [member] = await db
      .update(members)
      .set(updateData)
      .where(eq(members.id, id))
      .returning();
    return member;
  }

  async deleteMember(id: string): Promise<void> {
    await db.delete(members).where(eq(members.id, id));
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(projects.createdAt);
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(projectData: InsertProject, createdBy?: string): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values({ ...projectData, createdBy })
      .returning();
    return project;
  }

  async updateProject(id: string, projectData: Partial<InsertProject>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set(projectData)
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getNewsArticles(): Promise<NewsArticle[]> {
    return await db.select().from(newsArticles).orderBy(newsArticles.publishedAt);
  }

  async getNewsArticle(id: string): Promise<NewsArticle | undefined> {
    const [article] = await db.select().from(newsArticles).where(eq(newsArticles.id, id));
    return article;
  }

  async createNewsArticle(articleData: InsertNewsArticle): Promise<NewsArticle> {
    const [article] = await db
      .insert(newsArticles)
      .values({
        ...articleData,
        publishedAt: new Date(),
      })
      .returning();
    return article;
  }

  async updateNewsArticle(id: string, articleData: Partial<InsertNewsArticle>): Promise<NewsArticle> {
    const [article] = await db
      .update(newsArticles)
      .set(articleData)
      .where(eq(newsArticles.id, id))
      .returning();
    return article;
  }

  async deleteNewsArticle(id: string): Promise<void> {
    await db.delete(newsArticles).where(eq(newsArticles.id, id));
  }

  async getGalleryImages(): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages).orderBy(galleryImages.createdAt);
  }

  async createGalleryImage(imageData: InsertGalleryImage): Promise<GalleryImage> {
    const [image] = await db
      .insert(galleryImages)
      .values(imageData)
      .returning();
    return image;
  }

  async deleteGalleryImage(id: string): Promise<void> {
    await db.delete(galleryImages).where(eq(galleryImages.id, id));
  }

  async createContactMessage(messageData: InsertContactMessage): Promise<ContactMessage> {
    const [message] = await db
      .insert(contactMessages)
      .values(messageData)
      .returning();
    return message;
  }

  async getRegistrations(): Promise<Registration[]> {
    return await db.select().from(registrations).orderBy(registrations.createdAt);
  }

  async getRegistration(id: string): Promise<Registration | undefined> {
    const [registration] = await db.select().from(registrations).where(eq(registrations.id, id));
    return registration;
  }

  async createRegistration(registrationData: InsertRegistration): Promise<Registration> {
    const [registration] = await db
      .insert(registrations)
      .values(registrationData)
      .returning();
    return registration;
  }

  async updateRegistrationStatus(id: string, status: string, reviewedBy: string): Promise<Registration> {
    const [registration] = await db
      .update(registrations)
      .set({
        status,
        reviewedBy,
        reviewedAt: new Date(),
      })
      .where(eq(registrations.id, id))
      .returning();
    return registration;
  }

  // Approval operations
  async approveContent(contentType: "news" | "project" | "gallery", id: string, reviewedBy: string): Promise<void> {
    const reviewData = {
      approvalStatus: "approved",
      reviewedBy,
      reviewedAt: new Date(),
    };

    switch (contentType) {
      case "news":
        await db.update(newsArticles).set(reviewData).where(eq(newsArticles.id, id));
        break;
      case "project":
        await db.update(projects).set(reviewData).where(eq(projects.id, id));
        break;
      case "gallery":
        await db.update(galleryImages).set(reviewData).where(eq(galleryImages.id, id));
        break;
    }
  }

  async rejectContent(contentType: "news" | "project" | "gallery", id: string, reviewedBy: string): Promise<void> {
    const reviewData = {
      approvalStatus: "rejected",
      reviewedBy,
      reviewedAt: new Date(),
    };

    switch (contentType) {
      case "news":
        await db.update(newsArticles).set(reviewData).where(eq(newsArticles.id, id));
        break;
      case "project":
        await db.update(projects).set(reviewData).where(eq(projects.id, id));
        break;
      case "gallery":
        await db.update(galleryImages).set(reviewData).where(eq(galleryImages.id, id));
        break;
    }
  }

  async getPendingContent(): Promise<{
    news: NewsArticle[];
    projects: Project[];
    gallery: GalleryImage[];
  }> {
    const [pendingNews, pendingProjects, pendingGallery] = await Promise.all([
      db.select().from(newsArticles).where(eq(newsArticles.approvalStatus, "pending")),
      db.select().from(projects).where(eq(projects.approvalStatus, "pending")),
      db.select().from(galleryImages).where(eq(galleryImages.approvalStatus, "pending")),
    ]);

    return {
      news: pendingNews,
      projects: pendingProjects,
      gallery: pendingGallery,
    };
  }

  // Role management operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async updateUserRole(id: string, role: string, permissions: string[]): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        role: role as "super_admin" | "admin" | "member",
        permissions,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
