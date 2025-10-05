import { Router } from 'express';
import {
  getClassList,
  getClassDashboard,
  getClassReport,
  exportClassReport,
  getSystemStats,
  promoteClass,
  getAdminDashboard,
  getClassPerformance
} from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.get('/classes', authMiddleware, getClassList);
router.get('/classes/:class_name/dashboard', authMiddleware, getClassDashboard);
router.get('/classes/:class_name/report', authMiddleware, getClassReport);
router.post('/classes/:class_name/promote', authMiddleware, promoteClass);
router.get('/export/:class_name', authMiddleware, exportClassReport);
router.get('/system-stats', authMiddleware, getSystemStats);

// NEW ROUTES for class/semester performance dashboard
router.get('/dashboard', authMiddleware, getAdminDashboard);              // ← ADD THIS
router.get('/class-performance', authMiddleware, getClassPerformance);    // ← ADD THIS

export default router;