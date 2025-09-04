import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";
import pool from "./config/database.js"; // ✅ DB connection

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ✅ Health check route
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      frontend: true,   // if frontend gets this response, it means frontend is running
      backend: true,    // backend is up
      database: true,   // database query worked
      db_time: result.rows[0].now,
    });
  } catch (err) {
    res.status(500).json({
      frontend: true,
      backend: true,
      database: false,  // database failed
      error: err.message,
    });
  }
});

// Routes
app.use("/api", routes);

// Error handling
app.use(errorHandler);

export default app;
