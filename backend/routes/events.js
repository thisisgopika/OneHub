import { Router } from "express";
import { verifyToken } from '../middleware/auth.js'; // Add this import
import {createEvent, getEventReport, getOrganizerEvents, getEventByID,updateEvent,deleteEvent} from '../controllers/eventController.js';
import { getEventVolunteers } from "../controllers/volunteerController.js";

const router = Router();

// Add verifyToken to protected routes
router.post('/', verifyToken, createEvent);                    // Fixed
router.get('/', verifyToken, getOrganizerEvents);             // Fixed  
router.get('/:id/volunteers', verifyToken, getEventVolunteers); // Fixed
router.get('/:id/report', verifyToken, getEventReport);       // Fixed
router.get('/:id', getEventByID);                           // This can stay public
router.put('/:id',verifyToken,updateEvent);
router.delete('/:id',verifyToken,deleteEvent);                             

// Remove this duplicate GET route - it conflicts with getOrganizerEvents
// router.get("/", (req, res) => {
//   res.json({ message: "Events route works ✅" });
// });

export default router;