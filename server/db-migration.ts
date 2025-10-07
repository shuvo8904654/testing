import { execSync } from 'child_process';

/**
 * Automatically push database schema changes using drizzle-kit
 * This runs whenever the server starts to ensure the database schema is up-to-date
 */
export async function pushDatabaseSchema(): Promise<boolean> {
  try {
    console.log('🔄 Checking database schema...');
    
    // Run drizzle-kit push to sync schema
    execSync('npm run db:push', {
      stdio: 'inherit',
      encoding: 'utf-8'
    });
    
    console.log('✅ Database schema is up-to-date');
    return true;
  } catch (error) {
    console.error('❌ Failed to push database schema:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Check if database tables exist
 * Returns true if tables exist, false otherwise
 */
export async function checkDatabaseExists(): Promise<boolean> {
  try {
    const { db } = await import('./db');
    const { sql } = await import('drizzle-orm');
    
    // Try to query the users table to check if it exists
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as table_exists
    `);
    
    return result.rows[0]?.table_exists === true;
  } catch (error) {
    // If query fails, assume tables don't exist
    return false;
  }
}
