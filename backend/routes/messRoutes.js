import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { addFeedback, analytics } from '../controllers/messController.js';
import { 
  applyForMess, 
  getStudentMessApplications, 
  getWardenMessApplications, 
  updateMessApplication 
} from '../controllers/messApplicationController.js';

const router = Router();

// Mess feedback - accessible to both students and wardens
router.post('/feedback', protect, (req, res, next) => {
  console.log('Mess feedback route - User role:', req.user?.role);
  if (req.user.role !== 'student' && req.user.role !== 'warden') {
    return res.status(403).json({ message: 'Forbidden - Only students and wardens can submit feedback' });
  }
  next();
}, addFeedback);

// Mess applications
router.post('/apply', protect, authorize('student'), applyForMess);
router.get('/applications', protect, authorize('student'), getStudentMessApplications);
router.get('/applications/warden', protect, authorize('warden'), getWardenMessApplications);
router.put('/applications/:id', protect, authorize('warden'), updateMessApplication);

// Analytics - accessible to admins and wardens
router.get('/analytics', protect, authorize('admin', 'warden'), analytics);

export default router;
