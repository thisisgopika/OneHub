import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';

// Organizer controllers
import {
  createEvent,
  getOrganizerEvents,
  getEventReport,
  updateEvent,
  deleteEvent,
  getEventByID,
  getAllEvents,
  toggleVolunteerCalls,
  toggleRegistrations,
} from '../controllers/eventController.js';

// Student controllers
import {
  register,
  cancel,
  getRegistrationsForUser
} from '../controllers/registrationController.js';
import {
  applyVolunteer,
  getVolunteersByUser,
  getEventVolunteers,
  acceptVolunteer,
  rejectVolunteer
} from '../controllers/volunteerController.js';
import {
  getNotificationsByUser,
  markNotificationRead
} from '../controllers/notificationController.js';

const router = express.Router();

// ==============================
// Organizer Routes
// ==============================
router.post('/', authMiddleware, createEvent);
router.get('/organizer', authMiddleware, getOrganizerEvents);
router.get('/:id/report', authMiddleware, getEventReport);
router.put('/:id', authMiddleware, updateEvent);
router.delete('/:id', authMiddleware, deleteEvent);
router.get('/:id/volunteers', authMiddleware, getEventVolunteers);
router.put('/volunteers/:id/accept', authMiddleware, acceptVolunteer);  
router.put('/volunteers/:id/reject', authMiddleware, rejectVolunteer);
router.put('/:id/volunteer-calls', authMiddleware, toggleVolunteerCalls);
router.put('/:id/registrations', authMiddleware, toggleRegistrations);

// ==============================
// Student Routes
// ==============================

// Events
router.get('/', authMiddleware, getAllEvents);
router.get('/:id', authMiddleware, getEventByID);

// Registrations
router.post('/:id/register', authMiddleware, register);
router.delete('/:id/register', authMiddleware, cancel);
router.get('/user/:userId/registrations', authMiddleware, getRegistrationsForUser);

// Volunteers
router.post('/:id/volunteer', authMiddleware, applyVolunteer);
router.get('/user/:userId/volunteers', authMiddleware, getVolunteersByUser);

// Notifications
router.get('/user/:userId/notifications', authMiddleware, getNotificationsByUser);
router.put('/notifications/:id/read', authMiddleware, markNotificationRead);

export default router;
