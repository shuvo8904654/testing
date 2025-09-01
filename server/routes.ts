import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
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
  insertEventSchema,
  insertEventRegistrationSchema
} from "@shared/schema";
import { updateMemberSchema } from "@shared/validation";
import { z } from "zod";
import multer from "multer";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for memory storage (Cloudinary upload)
  const upload = multer({
    storage: multer.memoryStorage(),
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

  // Auth middleware
  setupAuth(app);

  // File upload endpoint using Cloudinary
  app.post("/api/upload", isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { buffer, originalname, mimetype, size } = req.file;
      
      // Generate unique filename
      const ext = originalname.split('.').pop();
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      
      const imageUrl = await storage.uploadImage(buffer, filename, mimetype);
      
      // Get image metadata after upload
      const imageData = await storage.getImage(filename);
      
      res.json({ 
        url: imageUrl,
        filename,
        originalName: originalname,
        size: size,
        mimeType: mimetype,
        metadata: imageData?.metadata || null,
        transformations: imageData?.transformations || []
      });
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
            createdBy: user.id,
            approvedBy: user.id
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
      const userId = parseInt(req.user.claims.sub);
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Members endpoints - public (only approved members)
  app.get("/api/members", async (req, res) => {
    try {
      const members = await storage.getApprovedMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  // Admin endpoint - all members with analytics
  app.get("/api/admin/members", isAdmin, async (req, res) => {
    try {
      const members = await storage.getMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.get("/api/members/:id", async (req, res) => {
    try {
      const memberId = parseInt(req.params.id);
      const member = await storage.getMember(memberId);
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch member" });
    }
  });

  // Member profile management - find by user ID instead of member ID
  app.get("/api/member-profile/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const members = await storage.getMembers();
      const member = members.find(m => m.createdBy === userId);
      if (!member) {
        return res.status(404).json({ message: "Member profile not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch member profile" });
    }
  });

  app.put("/api/member-profile/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Find member by user ID
      const members = await storage.getMembers();
      const member = members.find(m => m.createdBy === userId);
      if (!member) {
        return res.status(404).json({ message: "Member profile not found" });
      }
      
      // Validate the request body
      const validation = updateMemberSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: validation.error.errors 
        });
      }
      
      const updatedMember = await storage.updateMember(member.id, validation.data);
      if (!updatedMember) {
        return res.status(404).json({ message: "Member not found" });
      }
      res.json(updatedMember);
    } catch (error: any) {
      console.error("Error updating member profile:", error);
      res.status(500).json({ message: "Failed to update member profile" });
    }
  });

  // Keep old endpoints for backward compatibility
  app.get("/api/member-profile/:id", async (req, res) => {
    try {
      const memberId = parseInt(req.params.id);
      const member = await storage.getMember(memberId);
      if (!member) {
        return res.status(404).json({ message: "Member profile not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch member profile" });
    }
  });

  app.put("/api/member-profile/:id", async (req, res) => {
    try {
      const memberId = parseInt(req.params.id);
      
      // Validate the request body
      const validation = updateMemberSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: validation.error.errors 
        });
      }
      
      const updatedMember = await storage.updateMember(memberId, validation.data);
      if (!updatedMember) {
        return res.status(404).json({ message: "Member not found" });
      }
      res.json(updatedMember);
    } catch (error: any) {
      console.error("Error updating member profile:", error);
      res.status(500).json({ message: "Failed to update member profile" });
    }
  });

  // User analytics for member dashboard
  app.get("/api/user-analytics/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get all user-related data (including pending content for their own dashboard)
      const [userProjects, userArticles, events, userImages] = await Promise.all([
        storage.getAllProjectsByCreator(userId),
        storage.getAllNewsByCreator(userId), 
        storage.getEvents(),
        storage.getAllGalleryImagesByCreator(userId)
      ]);
      
      // Simple points calculation
      const points = (userProjects.length * 50) + (userArticles.length * 30) + (userImages.length * 20);
      
      const analytics = {
        projectsJoined: userProjects.length,
        eventsAttended: 0, // Would need event registrations to calculate
        articlesContributed: userArticles.length,
        totalPoints: points,
        imagesUploaded: userImages.length,
        joinDate: user.createdAt,
        daysActive: Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 3600 * 24)),
        streak: 1 // Would need activity tracking to calculate properly
      };

      // Generate real activities based on user content
      const activities = [
        ...userProjects.map(p => ({
          id: p.id.toString(),
          type: 'project_joined' as const,
          title: `Created project: ${p.title}`,
          description: p.description?.substring(0, 100) + '...' || '',
          date: new Date(p.createdAt),
          points: 50
        })),
        ...userArticles.map(a => ({
          id: a.id.toString(),
          type: 'content_created' as const,
          title: `Published article: ${a.title}`,
          description: a.excerpt || '',
          date: new Date(a.createdAt),
          points: 30
        })),
        ...userImages.map(i => ({
          id: i.id.toString(),
          type: 'content_created' as const,
          title: `Uploaded image: ${i.title}`,
          description: i.description || '',
          date: new Date(i.createdAt),
          points: 20
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

      // Generate achievements based on real activity
      const achievements = [];
      if (userProjects.length >= 1) {
        achievements.push({
          id: 'first-project',
          title: 'Project Pioneer',
          description: 'Created your first project',
          icon: 'target',
          category: 'contribution' as const,
          dateEarned: new Date(userProjects[0].createdAt),
          points: 50
        });
      }
      if (userArticles.length >= 1) {
        achievements.push({
          id: 'first-article',
          title: 'Content Creator',
          description: 'Published your first article',
          icon: 'book',
          category: 'contribution' as const,
          dateEarned: new Date(userArticles[0].createdAt),
          points: 30
        });
      }
      if (points >= 100) {
        achievements.push({
          id: 'hundred-points',
          title: 'Century Club',
          description: 'Earned 100 points',
          icon: 'trophy',
          category: 'participation' as const,
          dateEarned: new Date(),
          points: 0
        });
      }

      res.json({
        analytics,
        activities,
        achievements
      });
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      res.status(500).json({ message: "Failed to fetch user analytics" });
    }
  });

  // Get member profile by user ID for dashboard
  app.get("/api/member-profile/:userId", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Try to get member profile, create if doesn't exist
      let member = null;
      try {
        member = await storage.getMemberByEmail(user.email);
      } catch (error) {
        // Fallback: search through all members if method doesn't exist
        const allMembers = await storage.getMembers();
        member = allMembers.find(m => m.email === user.email) || null;
      }
      
      if (!member && user.role === 'member') {
        // Auto-create member profile for users with member role
        const memberData = {
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          email: user.email,
          role: 'member',
          bio: user.motivation || 'Active member of 3ZERO Club',
          status: 'approved' as const,
          createdBy: userId,
          profileImageUrl: user.profileImageUrl || null
        };
        member = await storage.createMember(memberData);
      }

      res.json(member);
    } catch (error) {
      console.error("Error fetching member profile:", error);
      res.status(500).json({ message: "Failed to fetch member profile" });
    }
  });

  // Get user analytics and activities for member dashboard
  app.get("/api/user-analytics/:userId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await storage.getUser(parseInt(userId));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get all user-related data
      const [projects, articles, events, galleryImages] = await Promise.all([
        storage.getProjects(),
        storage.getNewsArticles(), 
        storage.getEvents(),
        storage.getGalleryImages()
      ]);

      // Calculate user stats
      const userProjects = projects.filter(p => p.createdBy === parseInt(userId));
      const userArticles = articles.filter(a => a.createdBy === parseInt(userId));
      const userImages = galleryImages.filter(i => i.createdBy === parseInt(userId));
      
      // Simple points calculation
      const points = (userProjects.length * 50) + (userArticles.length * 30) + (userImages.length * 20);
      
      const analytics = {
        projectsJoined: userProjects.length,
        eventsAttended: 0, // Would need event registrations to calculate
        articlesContributed: userArticles.length,
        totalPoints: points,
        imagesUploaded: userImages.length,
        joinDate: user.createdAt,
        daysActive: Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 3600 * 24)),
        streak: 1 // Would need activity tracking to calculate properly
      };

      // Generate recent activities
      const activities = [
        ...userProjects.map(p => ({
          id: p.id,
          type: 'project_joined' as const,
          title: `Created project: ${p.title}`,
          description: p.description?.substring(0, 100) + '...' || '',
          date: new Date(p.createdAt),
          points: 50
        })),
        ...userArticles.map(a => ({
          id: a.id,
          type: 'content_created' as const,
          title: `Published article: ${a.title}`,
          description: a.excerpt || '',
          date: new Date(a.createdAt),
          points: 30
        })),
        ...userImages.map(i => ({
          id: i.id,
          type: 'content_created' as const,
          title: `Uploaded image: ${i.title}`,
          description: i.description || '',
          date: new Date(i.createdAt),
          points: 20
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

      // Generate achievements based on activity
      const achievements = [];
      if (userProjects.length >= 1) {
        achievements.push({
          id: 'first-project',
          title: 'Project Pioneer',
          description: 'Created your first project',
          icon: 'target',
          category: 'contribution',
          dateEarned: new Date(userProjects[0].createdAt),
          points: 50
        });
      }
      if (userArticles.length >= 1) {
        achievements.push({
          id: 'first-article',
          title: 'Content Creator',
          description: 'Published your first article',
          icon: 'book',
          category: 'contribution',
          dateEarned: new Date(userArticles[0].createdAt),
          points: 30
        });
      }
      if (points >= 100) {
        achievements.push({
          id: 'hundred-points',
          title: 'Century Club',
          description: 'Earned 100 points',
          icon: 'trophy',
          category: 'participation',
          dateEarned: new Date(),
          points: 0
        });
      }

      res.json({
        analytics,
        activities,
        achievements
      });
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      res.status(500).json({ message: "Failed to fetch user analytics" });
    }
  });

  // Image upload and management endpoints
  app.post("/api/images/upload", isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const { buffer, originalname, mimetype } = req.file;
      
      // Generate unique filename
      const ext = originalname.split('.').pop();
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      
      const imageUrl = await storage.uploadImage(buffer, filename, mimetype);
      
      res.json({ 
        message: "Image uploaded successfully",
        url: imageUrl,
        filename 
      });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Images are now served directly by Cloudinary URLs, no need for this endpoint
  // Keeping for backward compatibility - redirects to Cloudinary
  app.get("/api/images/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const imageData = await storage.getImage(filename);
      
      if (!imageData) {
        return res.status(404).json({ 
          message: "Image not found or has been deleted" 
        });
      }
      
      res.json({
        url: imageData.url,
        metadata: imageData.metadata,
        transformations: imageData.transformations,
        thumbnailUrl: imageData.transformations[0] || imageData.url,
        mediumUrl: imageData.transformations[1] || imageData.url
      });
    } catch (error) {
      console.error("Image retrieval error:", error);
      res.status(500).json({ 
        message: "Failed to retrieve image information" 
      });
    }
  });

  app.delete("/api/images/:filename", isAdmin, async (req, res) => {
    try {
      const { filename } = req.params;
      await storage.deleteImage(filename);
      res.json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error("Image deletion error:", error);
      res.status(500).json({ message: "Failed to delete image" });
    }
  });

  // Image analytics endpoint
  app.get("/api/images/analytics", isAdmin, async (req, res) => {
    try {
      const analytics = await storage.getImageAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Image analytics error:", error);
      res.status(500).json({ message: "Failed to get image analytics" });
    }
  });

  // Create project endpoint for members
  app.post("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const createdBy = parseInt((req as any).user.claims.sub);
      
      // Auto-categorize project
      const title = validatedData.title?.toLowerCase() || '';
      const description = validatedData.description?.toLowerCase() || '';
      let autoCategory = 'general';
      
      if (title.includes('environment') || description.includes('environment') || title.includes('carbon')) {
        autoCategory = 'environmental';
      } else if (title.includes('education') || description.includes('education') || title.includes('training')) {
        autoCategory = 'educational';
      } else if (title.includes('community') || description.includes('community') || title.includes('social')) {
        autoCategory = 'community';
      } else if (title.includes('technology') || description.includes('tech') || title.includes('digital')) {
        autoCategory = 'technology';
      }
      
      // Calculate initial priority score
      let priorityScore = 0;
      if (validatedData.description && validatedData.description.length > 200) priorityScore += 30;
      if (title.includes('urgent') || title.includes('critical')) priorityScore += 40;
      if (validatedData.imageUrl) priorityScore += 20;
      
      const enhancedProjectData = {
        ...validatedData,
        createdBy,
        category: autoCategory,
        priorityScore,
        status: 'pending' as const
      };
      
      const project = await storage.createProject(enhancedProjectData);
      
      console.log(`✅ Project created: "${validatedData.title}" (Category: ${autoCategory}, Priority: ${priorityScore})`);
      
      res.status(201).json({ 
        project, 
        autoCategory,
        priorityScore,
        message: "Project submitted successfully and is pending approval"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Enhanced projects endpoint with smart filtering and analytics
  app.get("/api/projects", async (req, res) => {
    try {
      const { sortBy = 'createdAt', order = 'desc', filter = 'all', category = 'all' } = req.query;
      
      let projects = await storage.getProjects();
      
      // Enhanced project analytics
      const enhancedProjects = projects.map(project => {
        let priorityScore = 0;
        let impactLevel = 'medium';
        
        // Calculate priority based on project attributes
        if (project.description && project.description.length > 200) priorityScore += 30;
        if (project.title && (project.title.includes('urgent') || project.title.includes('critical'))) priorityScore += 40;
        if (project.imageUrl) priorityScore += 20;
        
        // Determine impact level
        if (priorityScore >= 70) impactLevel = 'high';
        else if (priorityScore <= 30) impactLevel = 'low';
        
        // Auto-categorize projects
        const title = project.title?.toLowerCase() || '';
        const desc = project.description?.toLowerCase() || '';
        let autoCategory = 'general';
        
        if (title.includes('environment') || desc.includes('environment') || title.includes('carbon')) {
          autoCategory = 'environmental';
        } else if (title.includes('education') || desc.includes('education') || title.includes('training')) {
          autoCategory = 'educational';
        } else if (title.includes('community') || desc.includes('community') || title.includes('social')) {
          autoCategory = 'community';
        } else if (title.includes('technology') || desc.includes('tech') || title.includes('digital')) {
          autoCategory = 'technology';
        }
        
        return {
          ...project,
          priorityScore,
          impactLevel,
          autoCategory,
          daysActive: Math.floor((new Date().getTime() - new Date(project.createdAt).getTime()) / (1000 * 3600 * 24))
        };
      });
      
      // Apply filters
      let filteredProjects = enhancedProjects;
      if (filter === 'high-priority') {
        filteredProjects = enhancedProjects.filter(p => p.priorityScore >= 70);
      } else if (filter === 'recent') {
        filteredProjects = enhancedProjects.filter(p => p.daysActive <= 30);
      } else if (filter === 'high-impact') {
        filteredProjects = enhancedProjects.filter(p => p.impactLevel === 'high');
      }
      
      if (category !== 'all') {
        filteredProjects = filteredProjects.filter(p => p.autoCategory === category);
      }
      
      // Smart sorting
      filteredProjects.sort((a, b) => {
        if (sortBy === 'priority') {
          return order === 'desc' ? b.priorityScore - a.priorityScore : a.priorityScore - b.priorityScore;
        } else if (sortBy === 'impact') {
          const impactOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
          return order === 'desc' ? (impactOrder[b.impactLevel] || 0) - (impactOrder[a.impactLevel] || 0) : (impactOrder[a.impactLevel] || 0) - (impactOrder[b.impactLevel] || 0);
        } else if (sortBy === 'createdAt') {
          const aDate = new Date(a.createdAt).getTime();
          const bDate = new Date(b.createdAt).getTime();
          return order === 'desc' ? bDate - aDate : aDate - bDate;
        }
        return 0;
      });
      
      // Analytics
      const analytics = {
        total: enhancedProjects.length,
        highPriority: enhancedProjects.filter(p => p.priorityScore >= 70).length,
        highImpact: enhancedProjects.filter(p => p.impactLevel === 'high').length,
        categories: {
          environmental: enhancedProjects.filter(p => p.autoCategory === 'environmental').length,
          educational: enhancedProjects.filter(p => p.autoCategory === 'educational').length,
          community: enhancedProjects.filter(p => p.autoCategory === 'community').length,
          technology: enhancedProjects.filter(p => p.autoCategory === 'technology').length,
          general: enhancedProjects.filter(p => p.autoCategory === 'general').length
        },
        averagePriority: enhancedProjects.length > 0 ? Math.round(enhancedProjects.reduce((sum, p) => sum + p.priorityScore, 0) / enhancedProjects.length) : 0
      };
      
      res.json({ projects: filteredProjects, analytics });
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Enhanced news endpoint with content analysis and recommendations
  app.get("/api/news", async (req, res) => {
    try {
      const { sortBy = 'createdAt', order = 'desc', filter = 'all', limit = 50 } = req.query;
      
      let articles = await storage.getNewsArticles();
      
      // Enhanced content analysis
      const enhancedArticles = articles.map(article => {
        let contentScore = 0;
        let readabilityLevel = 'medium';
        let estimatedReadTime = 0;
        
        // Content quality scoring
        if (article.title && article.title.length >= 20 && article.title.length <= 80) contentScore += 25;
        if (article.excerpt && article.excerpt.length >= 50) contentScore += 20;
        if (article.content && article.content.length >= 300) contentScore += 25;
        if (article.imageUrl) contentScore += 15;
        if (article.content && article.content.length >= 800) contentScore += 15;
        
        // Calculate estimated read time (average 200 words per minute)
        if (article.content) {
          const wordCount = article.content.split(/\s+/).length;
          estimatedReadTime = Math.ceil(wordCount / 200);
        }
        
        // Determine readability
        if (article.content) {
          const avgSentenceLength = article.content.split('.').length;
          if (avgSentenceLength > 20) readabilityLevel = 'complex';
          else if (avgSentenceLength < 10) readabilityLevel = 'simple';
        }
        
        // Auto-categorize content
        const title = article.title?.toLowerCase() || '';
        const content = article.content?.toLowerCase() || '';
        let contentCategory = 'general';
        
        if (title.includes('environment') || content.includes('sustainability')) {
          contentCategory = 'environmental';
        } else if (title.includes('event') || content.includes('workshop')) {
          contentCategory = 'events';
        } else if (title.includes('member') || content.includes('achievement')) {
          contentCategory = 'community';
        } else if (title.includes('announcement') || content.includes('important')) {
          contentCategory = 'announcements';
        }
        
        return {
          ...article,
          contentScore,
          readabilityLevel,
          estimatedReadTime,
          contentCategory,
          engagement: article.readCount || 0,
          daysOld: Math.floor((new Date().getTime() - new Date(article.createdAt).getTime()) / (1000 * 3600 * 24))
        };
      });
      
      // Apply filters
      let filteredArticles = enhancedArticles;
      if (filter === 'popular') {
        filteredArticles = enhancedArticles.filter(a => a.engagement >= 10);
      } else if (filter === 'recent') {
        filteredArticles = enhancedArticles.filter(a => a.daysOld <= 7);
      } else if (filter === 'high-quality') {
        filteredArticles = enhancedArticles.filter(a => a.contentScore >= 80);
      }
      
      // Smart sorting
      filteredArticles.sort((a, b) => {
        if (sortBy === 'popularity') {
          return order === 'desc' ? b.engagement - a.engagement : a.engagement - b.engagement;
        } else if (sortBy === 'quality') {
          return order === 'desc' ? b.contentScore - a.contentScore : a.contentScore - b.contentScore;
        } else if (sortBy === 'createdAt') {
          const aDate = new Date(a.createdAt).getTime();
          const bDate = new Date(b.createdAt).getTime();
          return order === 'desc' ? bDate - aDate : aDate - bDate;
        }
        return 0;
      });
      
      // Limit results
      filteredArticles = filteredArticles.slice(0, parseInt(limit as string));
      
      // Analytics
      const analytics = {
        total: enhancedArticles.length,
        highQuality: enhancedArticles.filter(a => a.contentScore >= 80).length,
        popular: enhancedArticles.filter(a => a.engagement >= 10).length,
        categories: {
          environmental: enhancedArticles.filter(a => a.contentCategory === 'environmental').length,
          events: enhancedArticles.filter(a => a.contentCategory === 'events').length,
          community: enhancedArticles.filter(a => a.contentCategory === 'community').length,
          announcements: enhancedArticles.filter(a => a.contentCategory === 'announcements').length,
          general: enhancedArticles.filter(a => a.contentCategory === 'general').length
        },
        avgReadTime: enhancedArticles.length > 0 ? Math.round(enhancedArticles.reduce((sum, a) => sum + a.estimatedReadTime, 0) / enhancedArticles.length) : 0,
        totalReads: enhancedArticles.reduce((sum, a) => sum + a.engagement, 0)
      };
      
      res.json({ articles: filteredArticles, analytics });
    } catch (error: any) {
      console.error("Error fetching news articles:", error);
      res.status(500).json({ message: "Failed to fetch news articles" });
    }
  });

  app.get("/api/news/:id", async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      const article = await storage.getNewsArticle(articleId);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Enhanced news creation with content analysis and smart features
  app.post("/api/news", isAuthenticated, async (req, res) => {
    try {
      const createdBy = parseInt((req as any).user.claims.sub);
      const validatedData = insertNewsArticleSchema.parse({
        ...req.body,
        createdBy
      });
      
      // Always set status to pending for member submissions
      const articleData = {
        ...validatedData,
        createdBy,
        status: 'pending' as const,
        readCount: 0
      };
      
      // Content quality analysis
      let contentScore = 0;
      if (validatedData.title && validatedData.title.length >= 20 && validatedData.title.length <= 80) contentScore += 25;
      if (validatedData.excerpt && validatedData.excerpt.length >= 50) contentScore += 20;
      if (validatedData.content && validatedData.content.length >= 300) contentScore += 25;
      if (validatedData.imageUrl) contentScore += 15;
      if (validatedData.content && validatedData.content.length >= 800) contentScore += 15;
      
      // Auto-categorize content
      const title = validatedData.title?.toLowerCase() || '';
      const content = validatedData.content?.toLowerCase() || '';
      let contentCategory = 'general';
      
      if (title.includes('environment') || content.includes('sustainability')) {
        contentCategory = 'environmental';
      } else if (title.includes('event') || content.includes('workshop')) {
        contentCategory = 'events';
      } else if (title.includes('member') || content.includes('achievement')) {
        contentCategory = 'community';
      } else if (title.includes('announcement') || content.includes('important')) {
        contentCategory = 'announcements';
      }
      
      // Calculate estimated read time
      let estimatedReadTime = 0;
      if (validatedData.content) {
        const wordCount = validatedData.content.split(/\s+/).length;
        estimatedReadTime = Math.ceil(wordCount / 200);
      }
      
      // Auto-generate SEO-friendly excerpt if not provided
      let excerpt = validatedData.excerpt;
      if (!excerpt && validatedData.content) {
        excerpt = validatedData.content.substring(0, 150) + (validatedData.content.length > 150 ? '...' : '');
      }
      
      const enhancedArticleData = {
        ...articleData,
        excerpt,
        contentScore,
        category: contentCategory,
        estimatedReadTime
      };
      
      const article = await storage.createNewsArticle(enhancedArticleData);
      
      console.log(`✅ Article created: "${validatedData.title}" (Score: ${contentScore}, Category: ${contentCategory})`);
      
      res.status(201).json({ 
        article, 
        contentScore,
        contentCategory,
        estimatedReadTime,
        autoApproved: contentScore >= 70,
        message: "Article created with smart content analysis"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Error creating article:", error);
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  // Create gallery image endpoint
  app.post("/api/gallery", isAuthenticated, async (req, res) => {
    try {
      const createdBy = parseInt((req as any).user.claims.sub);
      const validatedData = insertGalleryImageSchema.parse({
        ...req.body,
        createdBy
      });
      
      // Always set status to pending for user submissions
      const imageData = {
        ...validatedData,
        createdBy,
        status: 'pending' as const
      };
      
      // Quality scoring based on metadata
      let qualityScore = 0;
      if (imageData.title && imageData.title.length >= 10) qualityScore += 30;
      if (imageData.description && imageData.description.length >= 20) qualityScore += 25;
      if (imageData.imageUrl) qualityScore += 25;
      
      // Auto-categorize images
      const title = imageData.title?.toLowerCase() || '';
      const desc = imageData.description?.toLowerCase() || '';
      let category = 'general';
      
      if (title.includes('event') || desc.includes('event') || title.includes('workshop')) {
        category = 'events';
      } else if (title.includes('member') || desc.includes('team') || title.includes('staff')) {
        category = 'people';
      } else if (title.includes('project') || desc.includes('project') || title.includes('activity')) {
        category = 'projects';
      } else if (title.includes('environment') || desc.includes('nature') || title.includes('green')) {
        category = 'environmental';
      }
      
      const enhancedImageData = {
        ...imageData,
        qualityScore,
        category
      };
      
      const galleryImage = await storage.createGalleryImage(enhancedImageData);
      
      console.log(`✅ Gallery image created: "${validatedData.title}" (Score: ${qualityScore}, Category: ${category})`);
      
      res.status(201).json({ 
        galleryImage, 
        qualityScore,
        category,
        message: "Image submitted successfully and is pending approval"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Error creating gallery image:", error);
      res.status(500).json({ message: "Failed to create gallery image" });
    }
  });

  // Enhanced gallery endpoint with smart organization and analytics
  app.get("/api/gallery", async (req, res) => {
    try {
      const { sortBy = 'createdAt', order = 'desc', filter = 'all', limit = 100 } = req.query;
      
      let images = await storage.getGalleryImages();
      
      // Enhanced image analysis
      const enhancedImages = images.map(image => {
        let qualityScore = 0;
        let category = 'general';
        
        // Quality scoring based on metadata
        if (image.title && image.title.length >= 10) qualityScore += 30;
        if (image.description && image.description.length >= 20) qualityScore += 25;
        if (image.alt && image.alt.length >= 10) qualityScore += 20;
        if (image.imageUrl) qualityScore += 25;
        
        // Auto-categorize images
        const title = image.title?.toLowerCase() || '';
        const desc = image.description?.toLowerCase() || '';
        
        if (title.includes('event') || desc.includes('event') || title.includes('workshop')) {
          category = 'events';
        } else if (title.includes('member') || desc.includes('team') || title.includes('staff')) {
          category = 'people';
        } else if (title.includes('project') || desc.includes('project') || title.includes('activity')) {
          category = 'projects';
        } else if (title.includes('environment') || desc.includes('nature') || title.includes('green')) {
          category = 'environmental';
        }
        
        return {
          ...image,
          qualityScore,
          category,
          daysOld: Math.floor((new Date().getTime() - new Date(image.createdAt).getTime()) / (1000 * 3600 * 24))
        };
      });
      
      // Apply filters
      let filteredImages = enhancedImages;
      if (filter === 'recent') {
        filteredImages = enhancedImages.filter(img => img.daysOld <= 30);
      } else if (filter === 'high-quality') {
        filteredImages = enhancedImages.filter(img => img.qualityScore >= 70);
      } else if (filter === 'events') {
        filteredImages = enhancedImages.filter(img => img.category === 'events');
      } else if (filter === 'people') {
        filteredImages = enhancedImages.filter(img => img.category === 'people');
      }
      
      // Smart sorting
      filteredImages.sort((a, b) => {
        if (sortBy === 'quality') {
          return order === 'desc' ? b.qualityScore - a.qualityScore : a.qualityScore - b.qualityScore;
        } else if (sortBy === 'createdAt') {
          const aDate = new Date(a.createdAt).getTime();
          const bDate = new Date(b.createdAt).getTime();
          return order === 'desc' ? bDate - aDate : aDate - bDate;
        }
        return 0;
      });
      
      // Limit results
      filteredImages = filteredImages.slice(0, parseInt(limit as string));
      
      // Analytics
      const analytics = {
        total: enhancedImages.length,
        highQuality: enhancedImages.filter(img => img.qualityScore >= 70).length,
        recent: enhancedImages.filter(img => img.daysOld <= 30).length,
        categories: {
          events: enhancedImages.filter(img => img.category === 'events').length,
          people: enhancedImages.filter(img => img.category === 'people').length,
          projects: enhancedImages.filter(img => img.category === 'projects').length,
          environmental: enhancedImages.filter(img => img.category === 'environmental').length,
          general: enhancedImages.filter(img => img.category === 'general').length
        },
        averageQuality: enhancedImages.length > 0 ? Math.round(enhancedImages.reduce((sum, img) => sum + img.qualityScore, 0) / enhancedImages.length) : 0
      };
      
      res.json({ images: filteredImages, analytics });
    } catch (error: any) {
      console.error("Error fetching gallery images:", error);
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  // Delete gallery image endpoint for admin dashboard
  app.delete("/api/gallery/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteGalleryImage(parseInt(req.params.id));
      res.json({ message: "Gallery image deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete gallery image" });
    }
  });

  // Delete news article endpoint for admin dashboard
  app.delete("/api/news/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteNewsArticle(parseInt(req.params.id));
      res.json({ message: "Article deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete article" });
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

  // Enhanced bulk content operations for admin efficiency
  app.post("/api/admin/bulk-publish", isAdmin, async (req: any, res) => {
    try {
      const { articleIds, projectIds } = req.body;
      const publishedBy = req.user.claims.sub;
      
      const results = [];
      const errors = [];
      
      // Bulk publish articles
      if (articleIds && Array.isArray(articleIds)) {
        for (const articleId of articleIds) {
          try {
            const updateData = { status: 'published' as const, publishedBy, publishedAt: new Date() };
            const article = await storage.updateNewsArticle(articleId, updateData);
            results.push({ type: 'article', id: articleId, status: 'published' });
          } catch (error) {
            errors.push({ type: 'article', id: articleId, error: error instanceof Error ? error.message : 'Unknown error' });
          }
        }
      }
      
      // Bulk activate projects
      if (projectIds && Array.isArray(projectIds)) {
        for (const projectId of projectIds) {
          try {
            const updateData = { status: 'active' as const, activatedBy: publishedBy, activatedAt: new Date() };
            const project = await storage.updateProject(projectId, updateData);
            results.push({ type: 'project', id: projectId, status: 'active' });
          } catch (error) {
            errors.push({ type: 'project', id: projectId, error: error instanceof Error ? error.message : 'Unknown error' });
          }
        }
      }
      
      res.json({ 
        message: `Bulk operation completed: ${results.length} successful, ${errors.length} failed`,
        results,
        errors 
      });
    } catch (error: any) {
      console.error("Bulk operation error:", error);
      res.status(500).json({ message: "Bulk operation failed" });
    }
  });

  app.get("/api/admin/analytics", isAdmin, async (req, res) => {
    try {
      // Comprehensive analytics across all content types
      const [users, projects, articles, events, members, gallery] = await Promise.all([
        storage.getAllUsers(),
        storage.getProjects(),
        storage.getNewsArticles(),
        storage.getEvents(),
        storage.getMembers(),
        storage.getGalleryImages()
      ]);
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const analytics = {
        overview: {
          totalUsers: users.length,
          totalProjects: projects.length,
          totalArticles: articles.length,
          totalEvents: events.length,
          totalMembers: members.length,
          totalGalleryImages: gallery.length
        },
        growth: {
          newUsersThisMonth: users.filter((u: any) => new Date(u.createdAt) >= thirtyDaysAgo).length,
          newProjectsThisMonth: projects.filter((p: any) => new Date(p.createdAt) >= thirtyDaysAgo).length,
          newArticlesThisMonth: articles.filter((a: any) => new Date(a.createdAt) >= thirtyDaysAgo).length,
          newUsersThisWeek: users.filter((u: any) => new Date(u.createdAt) >= sevenDaysAgo).length
        },
        userStats: {
          applicants: users.filter((u: any) => u.role === 'applicant').length,
          members: users.filter((u: any) => u.role === 'member').length,
          admins: users.filter((u: any) => u.role === 'admin').length,
          pending: users.filter((u: any) => u.applicationStatus === 'pending').length,
          approved: users.filter((u: any) => u.applicationStatus === 'approved').length
        },
        contentHealth: {
          pendingArticles: articles.filter((a: any) => a.status === 'pending').length,
          approvedArticles: articles.filter((a: any) => a.status === 'approved').length,
          approvedProjects: projects.filter((p: any) => p.status === 'approved').length,
          upcomingEvents: events.filter((e: any) => new Date(e.date) > now).length
        },
        engagement: {
          totalArticleReads: articles.reduce((sum: any, a: any) => sum + (a.readCount || 0), 0),
          averageArticleReads: articles.length > 0 ? Math.round(articles.reduce((sum: any, a: any) => sum + (a.readCount || 0), 0) / articles.length) : 0,
          popularArticles: articles.filter((a: any) => (a.readCount || 0) >= 10).length
        }
      };
      
      res.json(analytics);
    } catch (error: any) {
      console.error("Analytics error:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Enhanced bulk operations for admin efficiency
  app.post("/api/users/bulk-approve", isAdmin, async (req: any, res) => {
    try {
      const { userIds, role = 'member', autoCreateMember = true } = req.body;
      const reviewedBy = parseInt(req.user.claims.sub);
      
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
          errors.push({ userId, error: error instanceof Error ? error.message : 'Unknown error' });
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
      const validatedData = z.object({
        email: z.string().email(),
        password: z.string().min(8),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        age: z.string().optional(),
        address: z.string().optional(),
        motivation: z.string().optional(),
        profileImageUrl: z.string().url().optional(),
        role: z.enum(['member', 'admin', 'super_admin', 'applicant']).default('applicant'),
        permissions: z.array(z.string()).default([]),
        isActive: z.boolean().default(true),
        authType: z.enum(['email', 'replit']).default('email'),
        applicationStatus: z.enum(['pending', 'approved', 'rejected']).default('pending'),
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

  // Get all users for admin management
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.delete("/api/users/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteUser(parseInt(req.params.id));
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
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
          ...user,
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

  // Get pending content for admin review
  app.get("/api/pending-content", isAdmin, async (req, res) => {
    try {
      // Use the storage layer's getPendingContent method which fetches content with 'pending' status
      const pendingContent = await storage.getPendingContent();
      res.json(pendingContent);
    } catch (error) {
      console.error("Error fetching pending content:", error);
      res.status(500).json({ message: "Failed to fetch pending content" });
    }
  });

  // Approval history endpoint
  app.get("/api/admin/approval-history", isAdmin, async (req, res) => {
    try {
      const history = await storage.getApprovalHistory();
      res.json(history);
    } catch (error) {
      console.error("Error fetching approval history:", error);
      res.status(500).json({ message: "Failed to fetch approval history" });
    }
  });

  // Enhanced application status update with smart automation
  app.patch("/api/users/:id/application-status", isAdmin, async (req: any, res) => {
    try {
      const { applicationStatus, role, approvedAt, autoCreateMember = true } = req.body;
      const userId = parseInt(req.params.id);
      const reviewedBy = parseInt(req.user.claims.sub);
      
      // Validate that userId is a valid number
      if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({ message: "Invalid user ID provided" });
      }
      
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
            createdBy: userId,
            approvedBy: reviewedBy
          };
          
          await storage.createMember(memberData);
          console.log(`✅ Auto-created member profile for ${user.email}`);
        } catch (memberError) {
          console.warn(`Failed to auto-create member for ${user?.email}:`, memberError);
        }
      }
      
      // Create approval history record
      if (applicationStatus === 'approved' || applicationStatus === 'rejected') {
        try {
          const historyData = {
            userId,
            reviewedBy,
            status: applicationStatus,
            reviewedAt: new Date(),
            userEmail: user?.email,
            userFirstName: user?.firstName,
            userLastName: user?.lastName
          };
          
          await storage.createApprovalHistory(historyData);
        } catch (historyError) {
          console.warn(`Failed to create approval history for ${user?.email}:`, historyError);
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
      const reviewedBy = parseInt((req as any).user.claims.sub);
      const registration = await storage.updateRegistrationStatus(parseInt(req.params.id), status, reviewedBy);
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
      const member = await storage.updateMember(parseInt(req.params.id), validatedData);
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
      await storage.deleteMember(parseInt(req.params.id));
      res.json({ message: "Member deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete member" });
    }
  });

  // Projects management (Members can create, Admins can modify all)
  // Enhanced project creation with smart validation and auto-categorization
  app.post("/api/dashboard/projects", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const createdBy = parseInt((req as any).user.claims.sub);
      
      // Auto-categorize project
      const title = validatedData.title?.toLowerCase() || '';
      const description = validatedData.description?.toLowerCase() || '';
      let autoCategory = 'general';
      
      if (title.includes('environment') || description.includes('environment') || title.includes('carbon')) {
        autoCategory = 'environmental';
      } else if (title.includes('education') || description.includes('education') || title.includes('training')) {
        autoCategory = 'educational';
      } else if (title.includes('community') || description.includes('community') || title.includes('social')) {
        autoCategory = 'community';
      } else if (title.includes('technology') || description.includes('tech') || title.includes('digital')) {
        autoCategory = 'technology';
      }
      
      // Calculate initial priority score
      let priorityScore = 0;
      if (validatedData.description && validatedData.description.length > 200) priorityScore += 30;
      if (title.includes('urgent') || title.includes('critical')) priorityScore += 40;
      if (validatedData.imageUrl) priorityScore += 20;
      
      const enhancedProjectData = {
        ...validatedData,
        createdBy,
        category: autoCategory,
        priorityScore,
        status: 'pending' as const
      };
      
      const project = await storage.createProject(enhancedProjectData);
      
      console.log(`✅ Project created: "${validatedData.title}" (Category: ${autoCategory}, Priority: ${priorityScore})`);
      
      res.status(201).json({ 
        project, 
        autoCategory,
        priorityScore,
        message: "Project created successfully with smart categorization"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/dashboard/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.updateProject(parseInt(req.params.id), validatedData);
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/dashboard/projects/:id", async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Check if user is admin or project creator
      const isProjectCreator = project.createdBy === req.user?.id;
      const isAdminUser = req.user?.role === 'admin' || req.user?.role === 'superadmin';
      
      if (!isProjectCreator && !isAdminUser) {
        return res.status(403).json({ error: "Not authorized to delete this project" });
      }

      await storage.deleteProject(projectId);
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // News/Stories management (Members can create, Admins can modify all)
  app.put("/api/dashboard/news/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertNewsArticleSchema.parse(req.body);
      const article = await storage.updateNewsArticle(parseInt(req.params.id), validatedData);
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
      await storage.deleteNewsArticle(parseInt(req.params.id));
      res.json({ message: "Article deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // Gallery management (Members can create, Admins can delete)
  app.post("/api/dashboard/gallery", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertGalleryImageSchema.parse(req.body);
      const createdBy = parseInt((req as any).user.claims.sub);
      
      const imageData = {
        ...validatedData,
        createdBy,
        status: 'pending' as const
      };
      
      const image = await storage.createGalleryImage(imageData);
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
      await storage.deleteGalleryImage(parseInt(req.params.id));
      res.json({ message: "Gallery image deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete gallery image" });
    }
  });

  // Enhanced events endpoint with smart scheduling and management
  app.get("/api/events", async (req, res) => {
    try {
      const { filter = 'all', sortBy = 'date', order = 'asc', upcoming = false } = req.query;
      
      let events = await storage.getEvents();
      
      // Enhanced event analysis
      const enhancedEvents = events.map(event => {
        const eventDate = new Date(event.date);
        const now = new Date();
        const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        
        let urgency = 'normal';
        let capacity = 'available';
        let popularity = 0;
        
        // Determine urgency
        if (daysUntilEvent <= 3 && daysUntilEvent > 0) urgency = 'urgent';
        else if (daysUntilEvent <= 7 && daysUntilEvent > 3) urgency = 'soon';
        else if (daysUntilEvent < 0) urgency = 'past';
        
        // Estimate popularity based on description and category
        if (event.description && event.description.length > 100) popularity += 20;
        if (event.category === 'workshop' || event.category === 'training') popularity += 30;
        if (event.registrationRequired) popularity += 25;
        if (event.maxParticipants && event.maxParticipants <= 20) popularity += 25;
        
        // Determine capacity status
        if (event.maxParticipants) {
          if (event.maxParticipants <= 10) capacity = 'limited';
          else if (event.maxParticipants <= 30) capacity = 'moderate';
          else capacity = 'large';
        }
        
        // Smart status updates based on date
        let smartStatus = event.status;
        if (daysUntilEvent < 0 && event.status === 'upcoming') {
          smartStatus = 'completed';
        } else if (daysUntilEvent === 0 && event.status === 'upcoming') {
          smartStatus = 'ongoing';
        }
        
        return {
          ...event,
          daysUntilEvent,
          urgency,
          capacity,
          popularity,
          smartStatus,
          isUpcoming: daysUntilEvent > 0,
          isPast: daysUntilEvent < 0,
          isToday: daysUntilEvent === 0
        };
      });
      
      // Apply filters
      let filteredEvents = enhancedEvents;
      if (upcoming === 'true') {
        filteredEvents = enhancedEvents.filter(e => e.isUpcoming);
      } else if (filter === 'urgent') {
        filteredEvents = enhancedEvents.filter(e => e.urgency === 'urgent');
      } else if (filter === 'popular') {
        filteredEvents = enhancedEvents.filter(e => e.popularity >= 70);
      } else if (filter === 'this-week') {
        filteredEvents = enhancedEvents.filter(e => e.daysUntilEvent >= 0 && e.daysUntilEvent <= 7);
      }
      
      // Smart sorting
      filteredEvents.sort((a, b) => {
        if (sortBy === 'urgency') {
          const urgencyOrder: Record<string, number> = { urgent: 3, soon: 2, normal: 1, past: 0 };
          return order === 'desc' ? (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0) : (urgencyOrder[a.urgency] || 0) - (urgencyOrder[b.urgency] || 0);
        } else if (sortBy === 'popularity') {
          return order === 'desc' ? b.popularity - a.popularity : a.popularity - b.popularity;
        } else if (sortBy === 'date') {
          const aDate = new Date(a.date).getTime();
          const bDate = new Date(b.date).getTime();
          return order === 'desc' ? bDate - aDate : aDate - bDate;
        }
        return 0;
      });
      
      // Analytics
      const analytics = {
        total: enhancedEvents.length,
        upcoming: enhancedEvents.filter(e => e.isUpcoming).length,
        thisWeek: enhancedEvents.filter(e => e.daysUntilEvent >= 0 && e.daysUntilEvent <= 7).length,
        urgent: enhancedEvents.filter(e => e.urgency === 'urgent').length,
        popular: enhancedEvents.filter(e => e.popularity >= 70).length,
        categories: {
          workshop: enhancedEvents.filter(e => e.category === 'workshop').length,
          meeting: enhancedEvents.filter(e => e.category === 'meeting').length,
          training: enhancedEvents.filter(e => e.category === 'training').length,
          volunteer: enhancedEvents.filter(e => e.category === 'volunteer').length,
          other: enhancedEvents.filter(e => e.category === 'other').length
        },
        capacity: {
          limited: enhancedEvents.filter(e => e.capacity === 'limited').length,
          moderate: enhancedEvents.filter(e => e.capacity === 'moderate').length,
          large: enhancedEvents.filter(e => e.capacity === 'large').length
        }
      };
      
      res.json({ events: filteredEvents, analytics });
    } catch (error: any) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Enhanced event creation with smart scheduling and validation
  app.post("/api/events", isAdmin, async (req, res) => {
    try {
      const validatedData = z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        date: z.string().transform((str) => new Date(str)),
        time: z.string().min(1),
        location: z.string().min(1),
        category: z.enum(['workshop', 'meeting', 'training', 'volunteer', 'other']),
        maxParticipants: z.number().optional(),
        registrationRequired: z.boolean().default(false),
        contactInfo: z.string().optional(),
        status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).default('upcoming'),
      }).parse(req.body);
      const createdBy = parseInt((req as any).user.claims.sub);
      
      const eventDate = new Date(validatedData.date);
      const now = new Date();
      const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
      
      // Smart event validation
      let urgency = 'normal';
      let capacity = 'available';
      let popularity = 0;
      
      if (daysUntilEvent <= 3 && daysUntilEvent > 0) urgency = 'urgent';
      else if (daysUntilEvent <= 7 && daysUntilEvent > 3) urgency = 'soon';
      
      // Estimate popularity
      if (validatedData.description && validatedData.description.length > 100) popularity += 20;
      if (validatedData.category === 'workshop' || validatedData.category === 'training') popularity += 30;
      if (validatedData.registrationRequired) popularity += 25;
      if (validatedData.maxParticipants && validatedData.maxParticipants <= 20) popularity += 25;
      
      // Determine capacity
      if (validatedData.maxParticipants) {
        if (validatedData.maxParticipants <= 10) capacity = 'limited';
        else if (validatedData.maxParticipants <= 30) capacity = 'moderate';
        else capacity = 'large';
      }
      
      // Auto-set status based on date
      let status = 'upcoming';
      if (daysUntilEvent <= 0) status = 'completed';
      
      const enhancedEventData = {
        ...validatedData,
        createdBy,
        status,
        urgency,
        popularity,
        capacity
      };
      
      const event = await storage.createEvent(enhancedEventData);
      
      console.log(`✅ Event created: "${validatedData.title}" (${urgency}, ${capacity} capacity, ${popularity} popularity score)`);
      
      res.status(201).json({ 
        event,
        urgency,
        capacity,
        popularity,
        daysUntilEvent,
        message: "Event created with smart scheduling analysis"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.put("/api/events/:id", isAdmin, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const updateData = req.body;
      
      // Convert date string to Date object if provided
      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }

      const updatedEvent = await storage.updateEvent(eventId, updateData);
      
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      console.log(`✅ Event updated: "${updatedEvent.title}"`);
      res.json(updatedEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteEvent(parseInt(req.params.id));
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Event Registration routes
  app.get("/api/event-registrations", isAdmin, async (req, res) => {
    try {
      const { eventId } = req.query;
      const eventIdNum = eventId ? parseInt(eventId as string) : undefined;
      const registrations = await storage.getEventRegistrations(eventIdNum);
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching event registrations:", error);
      res.status(500).json({ error: "Failed to fetch event registrations" });
    }
  });

  app.post("/api/event-registrations", isAuthenticated, async (req: any, res) => {
    try {
      const registrationData = req.body;
      const userId = req.user?.claims?.sub || req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Validate the registration data
      const validatedData = insertEventRegistrationSchema.parse({
        eventId: registrationData.eventId,
        userId: parseInt(userId),
        name: registrationData.name,
        email: registrationData.email,
        phone: registrationData.phone || null,
        institution: registrationData.institution || null,
        reason: registrationData.reason || null,
        teamName: registrationData.teamName || null,
        teamMembers: registrationData.teamMembers || null,
        status: 'confirmed'
      });

      // Check if user is already registered for this event
      const existingRegistrations = await storage.getEventRegistrations(validatedData.eventId);
      const alreadyRegistered = existingRegistrations.some(reg => reg.userId === validatedData.userId);
      
      if (alreadyRegistered) {
        return res.status(409).json({ error: "User is already registered for this event" });
      }

      // Create the registration
      const registration = await storage.createEventRegistration(validatedData);
      
      console.log(`✅ Event registration created: ${registration.name} for event ${registration.eventId}`);
      
      res.status(201).json(registration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid registration data", details: error.errors });
      }
      console.error("Error creating event registration:", error);
      res.status(500).json({ error: "Failed to create event registration" });
    }
  });

  app.patch("/api/event-registrations/:id", isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const registrationId = parseInt(req.params.id);
      const registration = await storage.updateEventRegistrationStatus(registrationId, status);
      res.json(registration);
    } catch (error) {
      console.error("Error updating event registration:", error);
      res.status(500).json({ error: "Failed to update event registration" });
    }
  });

  // Anonymous event registration - creates user account automatically
  app.post("/api/event-registrations/anonymous", async (req: any, res) => {
    try {
      const registrationData = req.body;
      
      // Check if a user with this email already exists
      let user = await storage.getUserByEmail(registrationData.email);
      
      if (!user) {
        // Create a new user account automatically
        const userData = {
          email: registrationData.email,
          firstName: registrationData.name.split(' ')[0] || registrationData.name,
          lastName: registrationData.name.split(' ').slice(1).join(' ') || '',
          phone: registrationData.phone || null,
          role: 'participant' as const,
          authType: 'event_registration' as const,
          applicationStatus: 'approved' as const,
          isActive: true,
          permissions: [],
          password: null // No password for auto-created accounts
        };
        
        user = await storage.createUser(userData);
        console.log(`✅ Auto-created user account: ${user.email} (ID: ${user.id})`);
      }

      // Validate the registration data
      const validatedData = insertEventRegistrationSchema.parse({
        eventId: registrationData.eventId,
        userId: user.id,
        name: registrationData.name,
        email: registrationData.email,
        phone: registrationData.phone || null,
        institution: registrationData.institution || null,
        reason: registrationData.reason || null,
        teamName: registrationData.teamName || null,
        teamMembers: registrationData.teamMembers || null,
        status: 'confirmed'
      });

      // Check if user is already registered for this event
      const existingRegistrations = await storage.getEventRegistrations(validatedData.eventId);
      const alreadyRegistered = existingRegistrations.some(reg => reg.userId === validatedData.userId);
      
      if (alreadyRegistered) {
        return res.status(409).json({ error: "This email is already registered for this event" });
      }

      // Create the registration
      const registration = await storage.createEventRegistration(validatedData);
      
      console.log(`✅ Anonymous event registration created: ${registration.name} for event ${registration.eventId}`);
      
      res.status(201).json({
        registration,
        userCreated: !user.password, // Indicates if a new account was created
        message: !user.password ? 
          "Registration successful! An account has been created for you." : 
          "Registration successful!"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid registration data", details: error.errors });
      }
      console.error("Error creating anonymous event registration:", error);
      res.status(500).json({ error: "Failed to create event registration" });
    }
  });

  // Update event registration status
  app.patch("/api/event-registrations/:id", isAdmin, async (req, res) => {
    try {
      const registrationId = parseInt(req.params.id);
      const { status } = req.body;
      
      const updatedRegistration = await storage.updateEventRegistrationStatus(registrationId, status);
      
      if (!updatedRegistration) {
        return res.status(404).json({ error: "Registration not found" });
      }
      
      console.log(`✅ Registration status updated: ${updatedRegistration.name} - ${status}`);
      res.json(updatedRegistration);
    } catch (error) {
      console.error("Error updating registration status:", error);
      res.status(500).json({ error: "Failed to update registration status" });
    }
  });

  // Notice routes
  app.get("/api/notices", async (req, res) => {
    try {
      const { active, targetAudience } = req.query;
      
      let notices;
      if (active === 'true') {
        notices = await storage.getActiveNotices(targetAudience as string);
      } else {
        notices = await storage.getNotices();
      }
      
      res.json(notices);
    } catch (error) {
      console.error("Error fetching notices:", error);
      res.status(500).json({ error: "Failed to fetch notices" });
    }
  });

  app.post("/api/notices", isAdmin, async (req: any, res) => {
    try {
      const noticeData = {
        title: req.body.title,
        message: req.body.message,
        type: req.body.type,
        priority: req.body.priority,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        targetAudience: req.body.targetAudience || 'all',
        dismissible: req.body.dismissible !== false,
        link: req.body.link || null,
        linkText: req.body.linkText || null,
        createdBy: req.user?.claims?.sub || req.user?.id
      };
      
      const notice = await storage.createNotice(noticeData);
      res.json(notice);
    } catch (error) {
      console.error("Error creating notice:", error);
      res.status(500).json({ error: "Failed to create notice", details: (error as Error).message });
    }
  });

  app.put("/api/notices/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const notice = await storage.updateNotice(id, req.body);
      
      if (!notice) {
        return res.status(404).json({ error: "Notice not found" });
      }
      
      res.json(notice);
    } catch (error) {
      console.error("Error updating notice:", error);
      res.status(500).json({ error: "Failed to update notice" });
    }
  });

  app.delete("/api/notices/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNotice(id);
      res.json({ message: "Notice deleted successfully" });
    } catch (error) {
      console.error("Error deleting notice:", error);
      res.status(500).json({ error: "Failed to delete notice" });
    }
  });

  // Content approval endpoints
  app.post("/api/approve-content/:type/:id", isAdmin, async (req: any, res) => {
    try {
      const { type, id } = req.params;
      const approvedBy = parseInt(req.user.claims.sub);
      await storage.approveContent(type, parseInt(id), approvedBy);
      
      // Broadcast real-time notification
      if ((global as any).broadcastNotification) {
        (global as any).broadcastNotification({
          type: 'approval',
          title: 'Content Approved',
          message: `${type.charAt(0).toUpperCase() + type.slice(1)} has been approved`,
          data: { contentType: type, contentId: id, approvedBy }
        });
      }
      
      res.json({ message: `${type} approved successfully` });
    } catch (error) {
      console.error(`Error approving ${req.params.type}:`, error);
      res.status(500).json({ message: `Failed to approve ${req.params.type}` });
    }
  });

  app.post("/api/reject-content/:type/:id", isAdmin, async (req: any, res) => {
    try {
      const { type, id } = req.params;
      const approvedBy = parseInt(req.user.claims.sub);
      await storage.rejectContent(type, parseInt(id), approvedBy);
      res.json({ message: `${type} rejected successfully` });
    } catch (error) {
      console.error(`Error rejecting ${req.params.type}:`, error);
      res.status(500).json({ message: `Failed to reject ${req.params.type}` });
    }
  });

  // User role management endpoint
  app.put("/api/users/:id", isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // If updating role, use the specific role update method
      if (updateData.role !== undefined) {
        const updatedUser = await storage.updateUserRole(
          parseInt(id), 
          updateData.role, 
          updateData.permissions || []
        );
        res.json(updatedUser);
      } else {
        // For other updates, use general update method
        const updatedUser = await storage.updateUser(parseInt(id), updateData);
        res.json(updatedUser);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Create and return HTTP server instance
  const server = createServer(app);
  
  // Setup WebSocket server for real-time notifications
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  // Store connected clients
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    clients.add(ws);
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      clients.delete(ws);
    });
    
    // Send initial connection message
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to real-time notifications'
    }));
  });
  
  // Function to broadcast notifications to all connected clients
  (global as any).broadcastNotification = (notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
  }) => {
    const notificationData = JSON.stringify(notification);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(notificationData);
      }
    });
  };
  
  return server;
}

export default registerRoutes;
