import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Use DATABASE_URL for production, individual vars for local development
const pool = process.env.DATABASE_URL 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      // Force IPv4 and add connection settings
      host: 'db.jlnsedtqkhyhmascvvca.supabase.co',
      port: 5432,
      user: 'postgres',
      password: 'teamonehub@123',
      database: 'postgres'
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASS || "password",
      database: process.env.DB_NAME || "campus_events",
      port: process.env.DB_PORT || 5432,
    });

pool.connect()
  .then(() => console.log("✅ PostgreSQL Database connected!"))
  .catch((err) => console.error("❌ PostgreSQL Connection Error:", err));

export default pool;