import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Use individual connection parameters for both production and development
const pool = new Pool({
  host: process.env.NODE_ENV === 'production' 
    ? 'db.jlnsedtqkhyhmascvvca.supabase.co' 
    : (process.env.DB_HOST || "localhost"),
  user: process.env.NODE_ENV === 'production' 
    ? 'postgres' 
    : (process.env.DB_USER || "postgres"),
  password: process.env.NODE_ENV === 'production' 
    ? 'teamonehub@123' 
    : (process.env.DB_PASS || "password"),
  database: process.env.NODE_ENV === 'production' 
    ? 'postgres' 
    : (process.env.DB_NAME || "campus_events"),
  port: 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL Database connected!"))
  .catch((err) => console.error("❌ PostgreSQL Connection Error:", err));

export default pool;