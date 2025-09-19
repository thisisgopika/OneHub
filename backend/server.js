import adminRoutes from './routes/admin.js';
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

// ✅ All imports at the top
import eventRoutes from "./routes/eventRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// ✅ Allow frontend (Vite on 5173) to call backend (5000)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://onehub-campus-bm7pwh5d5-thisisgopikas-projects.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Parse JSON
app.use(express.json());

// ✅ Routes
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes); // Your new route here!

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});