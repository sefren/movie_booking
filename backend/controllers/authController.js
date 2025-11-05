import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '7d',
    });
};

// Register new user
export const register = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered',
            });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            phone,
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: user.toPublicJSON(),
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Login user
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }

        // Find user with password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is inactive. Please contact support.',
            });
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toPublicJSON(),
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get current user profile
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate('favorites', 'title posterUrl rating');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.json({
            success: true,
            data: user.toPublicJSON(),
        });
    } catch (error) {
        next(error);
    }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
    try {
        const { name, phone } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user.toPublicJSON(),
        });
    } catch (error) {
        next(error);
    }
};

// Add movie to favorites
export const addFavorite = async (req, res, next) => {
    try {
        const { movieId } = req.params;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Check if already in favorites
        if (user.favorites.includes(movieId)) {
            return res.status(400).json({
                success: false,
                message: 'Movie already in favorites',
            });
        }

        user.favorites.push(movieId);
        await user.save();

        res.json({
            success: true,
            message: 'Movie added to favorites',
            data: {
                favorites: user.favorites,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Remove movie from favorites
export const removeFavorite = async (req, res, next) => {
    try {
        const { movieId } = req.params;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        user.favorites = user.favorites.filter(
            (fav) => fav.toString() !== movieId
        );

        await user.save();

        res.json({
            success: true,
            message: 'Movie removed from favorites',
            data: {
                favorites: user.favorites,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get user favorites with full movie details
export const getFavorites = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate('favorites');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.json({
            success: true,
            data: user.favorites,
        });
    } catch (error) {
        next(error);
    }
};

// Change password
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required',
            });
        }

        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        next(error);
    }
};

