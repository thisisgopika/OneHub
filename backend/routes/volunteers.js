import { Router } from "express";
import { verifyToken } from '../middleware/auth.js';  // Add this import
import { acceptVolunteer, rejectVolunteer } from "../controllers/volunteerController.js";

const router = Router();

// Add verifyToken middleware to protected routes
router.put('/:id/accept', verifyToken, acceptVolunteer);
router.put('/:id/reject', verifyToken, rejectVolunteer);

router.get("/", (req, res) => {
  res.json({ message: "Volunteers route works ✅" });
});

export default router;