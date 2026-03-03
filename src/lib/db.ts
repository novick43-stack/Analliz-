import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set in environment variables. Please add it to .env.local');
}

export const sql = neon(process.env.DATABASE_URL || 'postgres://user:pass@host/db');
