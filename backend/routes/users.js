import express from "express";
const router = express.Router();

// Example: GET /api/users
router.get("/", (req, res) => {
  res.json({ message: "Users route works ✅" });
});

export default router;
