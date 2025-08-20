import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { 
  insertContactMessageSchema, 
  insertNewsArticleSchema, 
  insertMemberSchema,
  insertProjectSchema,
  insertGalleryImageSchema,
  insertRegistrationSchema,
  insertUserSchema,
  insertEventSchema
} from "@shared/validation";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure multer for file uploads
  const storage_multer = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });

  const upload = multer({
    storage: storage_multer,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    },
  });

  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadsDir));

  // Auth middleware
  setupAuth(app);

  // File upload endpoint
  app.post("/api/upload", isAuthenticated, upload.single('file'), (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed" });
    }
  });

  // Enhanced registration with intelligent validation and auto-approval
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone, age, address, motivation } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Enhanced validation
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Calculate application quality for smart processing
      let qualityScore = 0;
      if (firstName && lastName) qualityScore += 20;
      if (phone) qualityScore += 15;
      if (address) qualityScore += 10;
      if (motivation && motivation.length > 50) qualityScore += 25;
      if (motivation && motivation.length > 150) qualityScore += 20;
      if (age) qualityScore += 10;

      // Determine initial status based on quality
      let initialStatus: 'pending' | 'approved' | 'rejected' = "pending";
      let initialRole: 'applicant' | 'member' | 'admin' | 'super_admin' = "applicant";
      
      // Auto-approve high-quality applications (score >= 80)
      if (qualityScore >= 80) {
        initialStatus = "approved";
        initialRole = "member";
      }

      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        age: age || null,
        address: address || null,
        motivation: motivation || null,
        authType: "email",
        role: initialRole,
        permissions: [],
        isActive: true,
        applicationStatus: initialStatus,
        appliedAt: new Date(),
        ...(initialStatus === "approved" && { approvedAt: new Date() })
      });

      // Auto-create member profile for auto-approved users
      if (initialStatus === "approved") {
        try {
          const memberData = {
            name: `${firstName || ''} ${lastName || ''}`.trim() || email,
            email: email,
            role: 'member',
            bio: motivation || 'New member of 3ZERO Club',
            status: 'approved' as const,
            createdBy: user._id,
            approvedBy: user._id
          };
          
          await storage.createMember(memberData);
          console.log(`✅ Auto-approved and created member: ${email} (Quality Score: ${qualityScore})`);
        } catch (memberError) {
          console.warn(`Auto-member creation failed for ${email}:`, memberError);
        }
      }

      // Set up session
      (req.session as any).user = { 
        claims: { sub: user.id, email: user.email },
        authType: "email"
      };
      (req as any).user = (req.session as any).user;

      res.status(201).json({ 
        user: { ...user, password: undefined },
        qualityScore,
        autoApproved: initialStatus === "approved",
        message: initialStatus === "approved" 
          ? "Registration successful! You have been automatically approved as a member."
          : "Registration successful! Your application is under review."
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user || user.authType !== "email") {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password || "");
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set up session
      (req.session as any).user = { 
        claims: { sub: user.id, email: user.email },
        authType: "email"
      };
      (req as any).user = (req.session as any).user;

      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Members endpoints
  app.get("/api/members", async (req, res) => {
    try {
      const members = await storage.getMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.get("/api/members/:id", async (req, res) => {
    try {
      const member = await storage.getMember(req.params.id);
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch member" });
    }
  });

  // Projects endpoints
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // News endpoints
  app.get("/api/news", async (req, res) => {
    try {
      const articles = await storage.getNewsArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news articles" });
    }
  });

  app.get("/api/news/:id", async (req, res) => {
    try {
      const article = await storage.getNewsArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.post("/api/news", async (req, res) => {
    try {
      const validatedData = insertNewsArticleSchema.parse(req.body);
      const article = await storage.createNewsArticle(validatedData);
      res.status(201).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  // Gallery endpoints
  app.get("/api/gallery", async (req, res) => {
    try {
      const images = await storage.getGalleryImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  // Contact endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.status(201).json({ message: "Message sent successfully", id: message.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Registration endpoints
  app.get("/api/registrations", isAdmin, async (req, res) => {
    try {
      const registrations = await storage.getRegistrations();
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  app.post("/api/registrations", async (req, res) => {
    try {
      const validatedData = insertRegistrationSchema.parse(req.body);
      const registration = await storage.createRegistration(validatedData);
      res.status(201).json(registration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create registration" });
    }
  });

  // Enhanced bulk operations for admin efficiency
  app.post("/api/users/bulk-approve", isAdmin, async (req: any, res) => {
    try {
      const { userIds, role = 'member', autoCreateMember = true } = req.body;
      const reviewedBy = req.user.claims.sub;
      
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "User IDs array is required" });
      }
      
      const results = [];
      const errors = [];
      
      for (const userId of userIds) {
        try {
          const updateData = {
            applicationStatus: 'approved' as const,
            role,
            approvedAt: new Date(),
            reviewedBy,
            reviewedAt: new Date()
          };
          
          const user = await storage.updateUserApplicationStatus(userId, updateData);
          
          // Auto-create member profile
          if (autoCreateMember && user) {
            try {
              const memberData = {
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
                email: user.email,
                role: role,
                bio: user.motivation || 'New member of 3ZERO Club',
                profileImageUrl: user.profileImageUrl,
                status: 'approved' as const,
                createdBy: reviewedBy,
                approvedBy: reviewedBy
              };
              
              await storage.createMember(memberData);
            } catch (memberError) {
              console.warn(`Failed to create member for ${user.email}:`, memberError);
            }
          }
          
          results.push({ userId, status: 'success', user });
        } catch (error) {
          errors.push({ userId, error: error.message });
        }
      }
      
      res.json({ 
        message: `Bulk approval completed: ${results.length} successful, ${errors.length} failed`,
        results,
        errors 
      });
    } catch (error) {
      console.error("Bulk approval error:", error);
      res.status(500).json({ message: "Bulk approval failed" });
    }
  });

  // Admin-only endpoint to create new users
  app.post("/api/users", isAdmin, async (req: any, res) => {
    try {
      const validatedData = insertUserSchema.extend({
        password: z.string().min(8),
      }).parse(req.body);
      
      // Hash password if provided
      if (validatedData.password) {
        validatedData.password = await bcrypt.hash(validatedData.password, 10);
      }
      
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Enhanced applicants endpoint with analytics and smart sorting
  app.get("/api/users/applicants", isAdmin, async (req, res) => {
    try {
      const { sortBy = 'appliedAt', order = 'desc', filter = 'all' } = req.query;
      
      let applicants = await storage.getUsersByRole("applicant");
      
      // Add application quality scoring
      const enhancedApplicants = applicants.map(user => {
        let qualityScore = 0;
        
        // Score based on profile completeness
        if (user.firstName && user.lastName) qualityScore += 20;
        if (user.phone) qualityScore += 15;
        if (user.address) qualityScore += 10;
        if (user.motivation && user.motivation.length > 50) qualityScore += 25;
        if (user.motivation && user.motivation.length > 150) qualityScore += 20;
        if (user.age) qualityScore += 10;
        
        return {
          ...user.toObject ? user.toObject() : user,
          qualityScore,
          daysSinceApplication: Math.floor((new Date().getTime() - new Date(user.appliedAt || user.createdAt).getTime()) / (1000 * 3600 * 24))
        };
      });
      
      // Filter applications
      let filteredApplicants = enhancedApplicants;
      if (filter === 'high-quality') {
        filteredApplicants = enhancedApplicants.filter(user => user.qualityScore >= 70);
      } else if (filter === 'urgent') {
        filteredApplicants = enhancedApplicants.filter(user => user.daysSinceApplication >= 7);
      } else if (filter === 'incomplete') {
        filteredApplicants = enhancedApplicants.filter(user => user.qualityScore < 50);
      }
      
      // Smart sorting
      filteredApplicants.sort((a, b) => {
        if (sortBy === 'quality') {
          return order === 'desc' ? b.qualityScore - a.qualityScore : a.qualityScore - b.qualityScore;
        } else if (sortBy === 'appliedAt') {
          const aDate = new Date(a.appliedAt || a.createdAt).getTime();
          const bDate = new Date(b.appliedAt || b.createdAt).getTime();
          return order === 'desc' ? bDate - aDate : aDate - bDate;
        }
        return 0;
      });
      
      // Analytics
      const analytics = {
        total: enhancedApplicants.length,
        highQuality: enhancedApplicants.filter(u => u.qualityScore >= 70).length,
        urgent: enhancedApplicants.filter(u => u.daysSinceApplication >= 7).length,
        averageQualityScore: enhancedApplicants.length > 0 ? Math.round(enhancedApplicants.reduce((sum, u) => sum + u.qualityScore, 0) / enhancedApplicants.length) : 0,
        averageDaysWaiting: enhancedApplicants.length > 0 ? Math.round(enhancedApplicants.reduce((sum, u) => sum + u.daysSinceApplication, 0) / enhancedApplicants.length) : 0
      };
      
      res.json({ applicants: filteredApplicants, analytics });
    } catch (error: any) {
      console.error("Error fetching applicants:", error);
      res.status(500).json({ message: "Failed to fetch applicants" });
    }
  });

  // Enhanced application status update with smart automation
  app.patch("/api/users/:id/application-status", isAdmin, async (req: any, res) => {
    try {
      const { applicationStatus, role, approvedAt, autoCreateMember = true } = req.body;
      const userId = req.params.id;
      const reviewedBy = req.user.claims.sub;
      
      const updateData: any = { 
        applicationStatus,
        approvedAt: applicationStatus === 'approved' ? new Date(approvedAt || new Date()) : undefined,
        reviewedBy,
        reviewedAt: new Date()
      };
      
      // Smart role assignment based on application data
      if (role) {
        updateData.role = role;
      } else if (applicationStatus === 'approved') {
        // Auto-assign role based on user profile
        const user = await storage.getUser(userId);
        if (user?.motivation && user.motivation.length > 100) {
          updateData.role = 'member'; // Detailed motivation gets member role
        } else {
          updateData.role = 'member'; // Default to member for approved users
        }
      }

      const user = await storage.updateUserApplicationStatus(userId, updateData);
      
      // Auto-create member profile when approved
      if (applicationStatus === 'approved' && autoCreateMember && user) {
        try {
          const memberData = {
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
            email: user.email,
            role: updateData.role || 'member',
            bio: user.motivation || 'New member of 3ZERO Club',
            profileImageUrl: user.profileImageUrl,
            status: 'approved' as const,
            createdBy: reviewedBy,
            approvedBy: reviewedBy
          };
          
          await storage.createMember(memberData);
          console.log(`✅ Auto-created member profile for ${user.email}`);
        } catch (memberError) {
          console.warn(`Failed to auto-create member for ${user?.email}:`, memberError);
        }
      }
      
      res.json({ 
        user, 
        message: `Application ${applicationStatus} successfully`,
        autoMemberCreated: applicationStatus === 'approved' && autoCreateMember
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  app.patch("/api/registrations/:id/status", isAdmin, async (req: any, res) => {
    try {
      const { status } = req.body;
      const reviewedBy = req.user.claims.sub;
      const registration = await storage.updateRegistrationStatus(req.params.id, status, reviewedBy);
      res.json(registration);
    } catch (error) {
      res.status(500).json({ message: "Failed to update registration status" });
    }
  });

  // Dashboard API endpoints (Admin and Member access)
  
  // Members management (Admin only)
  app.post("/api/admin/members", isAdmin, async (req, res) => {
    try {
      const validatedData = insertMemberSchema.parse(req.body);
      const member = await storage.createMember(validatedData);
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create member" });
    }
  });

  app.put("/api/admin/members/:id", isAdmin, async (req, res) => {
    try {
      const validatedData = insertMemberSchema.parse(req.body);
      const member = await storage.updateMember(req.params.id, validatedData);
      res.json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update member" });
    }
  });

  app.delete("/api/admin/members/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteMember(req.params.id);
      res.json({ message: "Member deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete member" });
    }
  });

  // Projects management (Members can create, Admins can modify all)
  app.post("/api/dashboard/projects", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/dashboard/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.updateProject(req.params.id, validatedData);
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/dashboard/projects/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // News/Stories management (Members can create, Admins can modify all)
  app.put("/api/dashboard/news/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertNewsArticleSchema.parse(req.body);
      const article = await storage.updateNewsArticle(req.params.id, validatedData);
      res.json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update article" });
    }
  });

  app.delete("/api/dashboard/news/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteNewsArticle(req.params.id);
      res.json({ message: "Article deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // Gallery management (Members can create, Admins can delete)
  app.post("/api/dashboard/gallery", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertGalleryImageSchema.parse(req.body);
      const image = await storage.createGalleryImage(validatedData);
      res.status(201).json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create gallery image" });
    }
  });

  app.delete("/api/dashboard/gallery/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteGalleryImage(req.params.id);
      res.json({ message: "Gallery image deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete gallery image" });
    }
  });

  // Events management routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events", isAdmin, async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.delete("/api/events/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteEvent(req.params.id);
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
