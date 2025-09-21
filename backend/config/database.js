import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Debug logging
console.log('=== DATABASE DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL value:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

const pool = process.env.DATABASE_URL 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASS || "password",
      database: process.env.DB_NAME || "campus_events",
      port: process.env.DB_PORT || 5432,
    });

console.log('Using database connection:', process.env.DATABASE_URL ? 'SUPABASE' : 'LOCAL');
console.log('======================');

pool.connect()
  .then(() => console.log("✅ PostgreSQL Database connected!"))
  .catch((err) => console.error("❌ PostgreSQL Connection Error:", err));

export default pool;