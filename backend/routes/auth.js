import express from "express";
const router = express.Router();

// Example: POST /api/auth/login
router.post("/login", (req, res) => {
  res.json({ message: "Login route works ✅" });
});

export default router;
