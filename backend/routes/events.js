import express from "express";
const router = express.Router();

// Example: GET /api/events
router.get("/", (req, res) => {
  res.json({ message: "Events route works ✅" });
});

export default router;
