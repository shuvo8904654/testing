// This file has been deprecated - all data is now handled by PostgreSQL
// See server/db.ts for the current database connection

console.warn('⚠️  MongoDB connection file is deprecated. Using PostgreSQL with Drizzle ORM.');

// Export empty functions for backward compatibility
export async function connectToMongoDB() {
  // No-op: PostgreSQL connection is handled in server/db.ts
}

export default {};