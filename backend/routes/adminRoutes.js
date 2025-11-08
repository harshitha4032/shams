import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { 
  createRoom, 
  listRooms, 
  updateRoom, 
  deleteRoom, 
  createNotice, 
  dashboardStats,
  assignWarden,
  listWardens,
  getWardenLeaves,
  approveWardenLeave,
  getMaintenanceReports,
  createHostel,
  listHostels,
  updateHostel,
  deleteHostel,
  createMessMenu,
  getMessMenus,
  updateMessMenu,
  deleteMessMenu,
  markWardenAttendance,
  getWardenAttendance,
  updateStudentHostel
} from '../controllers/adminController.js';

const router = Router();
router.use(protect, authorize('admin'));

router.post('/rooms', createRoom);
router.get('/rooms', listRooms);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);
router.post('/notices', createNotice);
router.get('/stats', dashboardStats);
router.post('/assign-warden', assignWarden);
router.get('/wardens', listWardens);
router.get('/warden-leaves', getWardenLeaves);
router.patch('/warden-leaves/:id', approveWardenLeave);
router.get('/maintenance', getMaintenanceReports);

// Hostel routes
router.post('/hostels', createHostel);
router.get('/hostels', listHostels);
router.put('/hostels/:id', updateHostel);
router.delete('/hostels/:id', deleteHostel);

// Mess Menu routes
router.post('/mess-menus', createMessMenu);
router.get('/mess-menus', getMessMenus);
router.put('/mess-menus/:id', updateMessMenu);
router.delete('/mess-menus/:id', deleteMessMenu);

// Warden Attendance routes
router.post('/warden-attendance', markWardenAttendance);
router.get('/warden-attendance', getWardenAttendance);

// Student hostel assignment routes
router.put('/students/:studentId/hostel', updateStudentHostel);

export default router;