import type { RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage";

// Simple session middleware for standard deployment
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use memory store for development, should be replaced with Redis/database in production
  return session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

// Authentication middleware
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = (req as any).user;
  
  if (!user || !user.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Verify user still exists and is active
  try {
    const userId = parseInt(user.claims.sub);
    const dbUser = await storage.getUser(userId);
    if (!dbUser || !dbUser.isActive) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Admin authorization middleware
export const isAdmin: RequestHandler = async (req, res, next) => {
  const user = (req as any).user;
  
  if (!user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const userId = parseInt(user.claims.sub);
    const dbUser = await storage.getUser(userId);
    if (!dbUser || (dbUser.role !== "admin" && dbUser.role !== "super_admin")) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Middleware to populate user from session
export const populateUser: RequestHandler = (req, res, next) => {
  (req as any).user = (req.session as any)?.user || null;
  next();
};

// Setup auth function to replace setupAuth
export function setupAuth(app: any) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(populateUser);
  
  // Logout endpoint
  app.get("/api/logout", (req: any, res: any) => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
}