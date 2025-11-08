import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  reportReturn,
  getMyReturnReports,
  getAllReturnReports,
  grantHostelAccess
} from '../controllers/studentReturnController.js';

const router = Router();

// Student routes
router.use('/student', protect, authorize('student'));
router.post('/student/report-return', reportReturn);
router.get('/student/my-reports', getMyReturnReports);

// Warden routes (removed report return functionality)
router.use('/warden', protect, authorize('warden'));
router.get('/warden/all-reports', getAllReturnReports);
router.patch('/warden/grant-access/:id', grantHostelAccess);

export default router;
