import { Router } from "express";
import authMiddleware from '../middleware/authMiddleware.js'; // Use consistent middleware
import {createEvent, getEventReport, getOrganizerEvents, getEventByID,updateEvent,deleteEvent} from '../controllers/eventController.js';
import { getEventVolunteers } from "../controllers/volunteerController.js";

const router = Router();

// Add authMiddleware to protected routes
router.post('/', authMiddleware, createEvent);                    // Fixed
router.get('/', authMiddleware, getOrganizerEvents);             // Fixed  
router.get('/:id/volunteers', authMiddleware, getEventVolunteers); // Fixed
router.get('/:id/report', authMiddleware, getEventReport);       // Fixed
router.get('/:id', getEventByID);                           // This can stay public
router.put('/:id',authMiddleware,updateEvent);
router.delete('/:id',authMiddleware,deleteEvent);                             

// Remove this duplicate GET route - it conflicts with getOrganizerEvents
// router.get("/", (req, res) => {
//   res.json({ message: "Events route works ✅" });
// });

export default router;