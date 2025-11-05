import express from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (require authentication)
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);
router.post('/change-password', protect, authController.changePassword);

// Favorites routes
router.get('/favorites', protect, authController.getFavorites);
router.post('/favorites/:movieId', protect, authController.addFavorite);
router.delete('/favorites/:movieId', protect, authController.removeFavorite);

export default router;

