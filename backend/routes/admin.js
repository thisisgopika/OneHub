import { Router } from 'express';
import {
  getClassList,
  getClassDashboard,
  getClassReport,
  exportClassReport,
  getSystemStats
} from '../controllers/adminController.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = Router();

router.get('/classes', verifyToken, getClassList);
router.get('/classes/:class_name/dashboard', verifyToken, getClassDashboard);
router.get('/classes/:class_name/report', verifyToken, getClassReport);
router.get('/export/:class_name', verifyToken, exportClassReport);
router.get('/system-stats', verifyToken, getSystemStats);

export default router;