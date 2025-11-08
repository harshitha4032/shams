import { Router } from 'express';
import { login, register, uploadProfilePhoto } from '../controllers/authController.js';
const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/upload-profile-photo', uploadProfilePhoto);
export default router;
