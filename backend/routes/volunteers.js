import { Router } from "express";
import authMiddleware from '../middleware/authMiddleware.js';  // Use consistent middleware
import { acceptVolunteer, rejectVolunteer } from "../controllers/volunteerController.js";

const router = Router();

// Add authMiddleware to protected routes
router.put('/:id/accept', authMiddleware, acceptVolunteer);
router.put('/:id/reject', authMiddleware, rejectVolunteer);

router.get("/", (req, res) => {
  res.json({ message: "Volunteers route works ✅" });
});

export default router;