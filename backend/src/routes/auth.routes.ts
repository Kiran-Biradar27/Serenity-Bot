import express from 'express';
import { register, login, getUserProfile } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// Route for user registration
router.post('/register', register);

// Route for user login
router.post('/login', login);

// Route for getting user profile (protected)
router.get('/profile', protect, getUserProfile);

export default router; 