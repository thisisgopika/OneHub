import { Router } from "express";
import { acceptVolunteer,rejectVolunteer} from "../controllers/volunteerController.js";
const router = Router();

// Example: GET /api/volunteers
router.put('/:id/accept', acceptVolunteer);
router.put('/:id/reject', rejectVolunteer);
router.get("/", (req, res) => {
  res.json({ message: "Volunteers route works ✅" });
});

export default router;