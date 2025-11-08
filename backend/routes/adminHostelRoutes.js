import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { 
  createHostel, 
  getHostels, 
  getHostelById, 
  updateHostel, 
  deleteHostel,
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getHostelDetails,
  createMess,
  getMesses,
  getMessById,
  updateMess,
  deleteMess
} from '../controllers/adminHostelController.js';

const router = Router();

// Apply protection and authorization middleware
router.use(protect, authorize('admin'));

// Hostel routes
router.route('/hostels')
  .post(createHostel)
  .get(getHostels);

router.route('/hostels/:id')
  .get(getHostelById)
  .put(updateHostel)
  .delete(deleteHostel);

// Get detailed hostel information including rooms and mess
router.get('/hostels/:id/details', getHostelDetails);

// Room routes
router.route('/rooms')
  .post(createRoom)
  .get(getRooms);

router.route('/rooms/:id')
  .get(getRoomById)
  .put(updateRoom)
  .delete(deleteRoom);

// Mess routes
router.route('/messes')
  .post(createMess)
  .get(getMesses);

router.route('/messes/:id')
  .get(getMessById)
  .put(updateMess)
  .delete(deleteMess);

export default router;