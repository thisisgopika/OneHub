import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./config/supabaseClient.js";

// ✅ Import routes
import eventRoutes from "./routes/eventRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/admin.js";
import volunteerRoutes from "./routes/volunteers.js";

dotenv.config();

const app = express();

// ✅ CORS config (update origin as needed)
app.use(
  cors({
    origin: ["http://localhost:5173", "https://onehub-0l0j.onrender.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Parse JSON
app.use(express.json());

// ✅ Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    // Simple test: fetch 1 row from events table
    const { data, error } = await supabase.from("events").select("event_id").limit(1);

    if (error) throw error;

    res.json({
      message: "Supabase connected successfully!",
      sample: data,
      server_time: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ message: "Supabase connection failed", error: err.message });
  }
});

// ✅ API routes
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/admin", adminRoutes);

export default app;
