import { Router } from "express";
import {createEvent, getEventReport, getOrganizerEvents, getEventByID} from '../controllers/eventController.js';
import { getEventVolunteers } from "../controllers/volunteerController.js";
const router = Router();

// Example: GET /api/events
router.post('/', createEvent);
router.get('/',getOrganizerEvents);
router.get('/:id/volunteers',getEventVolunteers);
router.get('/:id/report',getEventReport);
router.get('/:id',getEventByID);

router.get("/", (req, res) => {
  res.json({ message: "Events route works ✅" });
});

export default router;
