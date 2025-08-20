# 3ZERO Club Kurigram - Youth Organization Website

## Overview

This is a full-stack web application for the 3ZERO Club Kurigram (ID: 050-009-0023), a youth-led organization inspired by Dr. Muhammad Yunus's vision of zero poverty, zero unemployment, and zero net carbon emissions. The platform serves as a digital presence for the organization, featuring member profiles, project showcases, news articles, gallery images, and contact functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using functional components and hooks
- **Routing**: Wouter for client-side routing - lightweight alternative to React Router
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Radix UI primitives with shadcn/ui components for consistent, accessible design
- **Styling**: Tailwind CSS with custom CSS variables for theming, including eco-green and youth-blue brand colors
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript for the REST API server
- **Database ORM**: Drizzle ORM for type-safe database operations with PostgreSQL
- **Development Setup**: In-memory storage implementation for development/testing with sample data
- **API Structure**: RESTful endpoints for members, projects, news articles, gallery images, and contact messages
- **Error Handling**: Centralized error handling middleware with structured JSON responses
- **Request Logging**: Custom middleware for API request/response logging

### Data Storage Solutions
- **Database**: PostgreSQL configured via Drizzle with Neon Database serverless driver
- **Schema Management**: Drizzle Kit for migrations and schema updates
- **Development Storage**: In-memory storage implementation with pre-populated sample data
- **File Storage**: Static assets served through Vite's development server

### Authentication and Authorization
- **Current State**: No authentication system implemented
- **Session Management**: Basic session middleware configured but not actively used
- **Security**: Basic CORS and request validation through Zod schemas

### API Design Patterns
- **REST Endpoints**: Standard CRUD operations following REST conventions
- **Response Format**: Consistent JSON responses with error handling
- **Validation**: Zod schemas for request/response validation
- **Type Safety**: Shared TypeScript types between frontend and backend

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting platform
- **Connection**: Configured via DATABASE_URL environment variable

### UI Component Libraries
- **Radix UI**: Comprehensive set of low-level UI primitives for accessibility
- **Shadcn/UI**: Pre-built components based on Radix UI with consistent styling
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Replit Integration**: Configured for Replit development environment with runtime error handling
- **Vite Plugins**: Development-specific plugins for enhanced debugging and error reporting

### Utility Libraries
- **Date-fns**: Date manipulation and formatting
- **Class Variance Authority**: Type-safe variant handling for component styling
- **CLSX/Tailwind Merge**: Utility for conditional CSS class composition

### Form and Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation for forms and API validation
- **Hookform Resolvers**: Integration between React Hook Form and Zod validation

The application follows a modern full-stack architecture with strong type safety throughout, using established patterns for scalability and maintainability.