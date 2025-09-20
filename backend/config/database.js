import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Use DATABASE_URL for production (Render), individual vars for local development
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

pool.connect()
  .then(() => console.log("✅ PostgreSQL Database connected!"))
  .catch((err) => console.error("❌ PostgreSQL Connection Error:", err));

export default pool;