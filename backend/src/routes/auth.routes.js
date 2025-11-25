import express from 'express';
import { registerPasien, login, getProfile, logout } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerPasien);
router.post('/login', login);
router.get('/me', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout);

export default router;