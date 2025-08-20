import { type User, type InsertUser, type Member, type InsertMember, type Project, type InsertProject, type NewsArticle, type InsertNewsArticle, type GalleryImage, type InsertGalleryImage, type ContactMessage, type InsertContactMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getMembers(): Promise<Member[]>;
  getMember(id: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  
  getNewsArticles(): Promise<NewsArticle[]>;
  getNewsArticle(id: string): Promise<NewsArticle | undefined>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  
  getGalleryImages(): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private members: Map<string, Member>;
  private projects: Map<string, Project>;
  private newsArticles: Map<string, NewsArticle>;
  private galleryImages: Map<string, GalleryImage>;
  private contactMessages: Map<string, ContactMessage>;

  constructor() {
    this.users = new Map();
    this.members = new Map();
    this.projects = new Map();
    this.newsArticles = new Map();
    this.galleryImages = new Map();
    this.contactMessages = new Map();
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample members
    const sampleMembers = [
      {
        id: randomUUID(),
        name: "Fatima Rahman",
        position: "Club President",
        bio: "Environmental science student passionate about sustainable development and youth empowerment.",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b647?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        social: { linkedin: "#", facebook: "#" },
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Karim Ahmed",
        position: "Vice President",
        bio: "Business student focused on social entrepreneurship and community development initiatives.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        social: { linkedin: "#", facebook: "#" },
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Nusrat Jahan",
        position: "Project Coordinator",
        bio: "Social work graduate specializing in youth programs and community engagement activities.",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        social: { linkedin: "#", facebook: "#" },
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Habib Hassan",
        position: "Communications Lead",
        bio: "Media studies graduate passionate about storytelling and digital advocacy for social causes.",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        social: { linkedin: "#", facebook: "#" },
        createdAt: new Date(),
      },
    ];
    sampleMembers.forEach(member => this.members.set(member.id, member));

    // Sample projects
    const sampleProjects = [
      {
        id: randomUUID(),
        title: "Green Kurigram Initiative",
        description: "Planted over 1,000 trees across Kurigram district, engaging local schools and communities in environmental conservation efforts.",
        status: "completed",
        category: "environment",
        completedAt: "2024",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Youth Innovation Contest",
        description: "Annual competition showcasing innovative solutions to local challenges, with 50+ participants presenting sustainable business ideas.",
        status: "ongoing",
        category: "innovation",
        completedAt: "Annual Event",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Skills Development Program",
        description: "Comprehensive training in digital literacy, entrepreneurship, and leadership for 200+ young people in rural areas.",
        status: "ongoing",
        category: "education",
        completedAt: "Ongoing",
        createdAt: new Date(),
      },
    ];
    sampleProjects.forEach(project => this.projects.set(project.id, project));

    // Sample news articles
    const sampleNews = [
      {
        id: randomUUID(),
        title: "From Idea to Impact: Rashida's Sustainable Business Journey",
        content: "How a young entrepreneur from our community turned a simple idea into a thriving eco-friendly business that's creating jobs and protecting the environment. Rashida's journey began with a small loan from our microcredit program and has grown into a success story that inspires other young people in Kurigram.",
        excerpt: "How a young entrepreneur from our community turned a simple idea into a thriving eco-friendly business that's creating jobs and protecting the environment...",
        category: "Success Story",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300",
        publishedAt: new Date("2024-12-05"),
        createdAt: new Date("2024-12-05"),
      },
      {
        id: randomUUID(),
        title: "Climate Action Week: 500 Youth Make Their Voices Heard",
        content: "Our recent climate action week brought together young people from across Kurigram to demand urgent action on environmental challenges. The week-long event included workshops, demonstrations, and policy discussions that highlighted the urgent need for sustainable development in our region.",
        excerpt: "Our recent climate action week brought together young people from across Kurigram to demand urgent action on environmental challenges...",
        category: "Update",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300",
        publishedAt: new Date("2024-11-28"),
        createdAt: new Date("2024-11-28"),
      },
      {
        id: randomUUID(),
        title: "Lessons from Dr. Yunus: Building a World Without Poverty",
        content: "Reflecting on the core principles of the 3ZERO movement and how they guide our daily work in the community. Dr. Yunus's vision of a world without poverty, unemployment, and carbon emissions continues to inspire our efforts in Kurigram.",
        excerpt: "Reflecting on the core principles of the 3ZERO movement and how they guide our daily work in the community...",
        category: "Reflection",
        image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300",
        publishedAt: new Date("2024-11-20"),
        createdAt: new Date("2024-11-20"),
      },
    ];
    sampleNews.forEach(article => this.newsArticles.set(article.id, article));

    // Sample gallery images
    const sampleGallery = [
      { id: randomUUID(), title: "Tree planting ceremony", url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300", description: "Community tree planting event", createdAt: new Date() },
      { id: randomUUID(), title: "Youth workshop", url: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300", description: "Skills development workshop", createdAt: new Date() },
      { id: randomUUID(), title: "Community celebration", url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300", description: "Annual community gathering", createdAt: new Date() },
      { id: randomUUID(), title: "Environmental cleanup", url: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300", description: "River cleanup activity", createdAt: new Date() },
      { id: randomUUID(), title: "Youth conference", url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300", description: "Leadership development conference", createdAt: new Date() },
      { id: randomUUID(), title: "Sustainable farming", url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300", description: "Organic farming project", createdAt: new Date() },
      { id: randomUUID(), title: "Innovation showcase", url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300", description: "Youth innovation competition", createdAt: new Date() },
      { id: randomUUID(), title: "Team collaboration", url: "https://images.unsplash.com/photo-1491975474562-1f4e30bc9468?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300", description: "Team building workshop", createdAt: new Date() },
    ];
    sampleGallery.forEach(image => this.galleryImages.set(image.id, image));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getMembers(): Promise<Member[]> {
    return Array.from(this.members.values()).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getMember(id: string): Promise<Member | undefined> {
    return this.members.get(id);
  }

  async createMember(member: InsertMember): Promise<Member> {
    const id = randomUUID();
    const newMember: Member = { ...member, id, createdAt: new Date() };
    this.members.set(id, newMember);
    return newMember;
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = randomUUID();
    const newProject: Project = { ...project, id, createdAt: new Date() };
    this.projects.set(id, newProject);
    return newProject;
  }

  async getNewsArticles(): Promise<NewsArticle[]> {
    return Array.from(this.newsArticles.values()).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  async getNewsArticle(id: string): Promise<NewsArticle | undefined> {
    return this.newsArticles.get(id);
  }

  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const id = randomUUID();
    const newArticle: NewsArticle = { 
      ...article, 
      id, 
      publishedAt: new Date(),
      createdAt: new Date() 
    };
    this.newsArticles.set(id, newArticle);
    return newArticle;
  }

  async getGalleryImages(): Promise<GalleryImage[]> {
    return Array.from(this.galleryImages.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const id = randomUUID();
    const newImage: GalleryImage = { ...image, id, createdAt: new Date() };
    this.galleryImages.set(id, newImage);
    return newImage;
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = randomUUID();
    const newMessage: ContactMessage = { ...message, id, createdAt: new Date() };
    this.contactMessages.set(id, newMessage);
    return newMessage;
  }
}

export const storage = new MemStorage();
