import { Router } from 'express';
import {
  getClassList,
  getClassDashboard,
  getClassReport,
  exportClassReport,
  getSystemStats
} from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.get('/classes', authMiddleware, getClassList);
router.get('/classes/:class_name/dashboard', authMiddleware, getClassDashboard);
router.get('/classes/:class_name/report', authMiddleware, getClassReport);
router.get('/export/:class_name', authMiddleware, exportClassReport);
router.get('/system-stats', authMiddleware, getSystemStats);

export default router;