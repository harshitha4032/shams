import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import multer from 'multer';

import { applyHostel, createComplaint, myComplaints, requestLeave, myLeaves, getNotices, reportHealthIssue, myHealthIssues, uploadFaceData, markOwnAttendance, getMyAttendance, getMyFaceData, getMyHostelRequests, getAvailableRooms, getHostelDetails, getWardenDetails } from '../controllers/studentController.js';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.use(protect, authorize('student'));
router.post('/apply-hostel', applyHostel);
router.get('/hostel-requests', getMyHostelRequests);
router.get('/available-rooms', getAvailableRooms);
router.get('/hostels/:id/details', getHostelDetails);
router.post('/complaints', upload.single('image'), createComplaint);
router.get('/complaints', myComplaints);
router.post('/leaves', requestLeave);
router.get('/leaves', myLeaves);
router.get('/notices', getNotices);

// Health issues
router.post('/health-issues', reportHealthIssue);
router.get('/health-issues', myHealthIssues);

// Face recognition and profile photo
router.post('/upload-face-data', uploadFaceData);
router.get('/my-face-data', getMyFaceData);

// Self attendance via face recognition
router.post('/mark-attendance', markOwnAttendance);
router.get('/my-attendance', getMyAttendance);

// Warden details
router.get('/warden-details', getWardenDetails);

export default router;