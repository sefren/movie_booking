import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      const error = new Error('Not authorized to access this route');
      error.statusCode = 401;
      return next(error);
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      );

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        const error = new Error('User not found');
        error.statusCode = 401;
        return next(error);
      }

      if (!req.user.isActive) {
        const error = new Error('User account is deactivated');
        error.statusCode = 403;
        return next(error);
      }

      next();
    } catch (err) {
      const error = new Error('Not authorized, token failed');
      error.statusCode = 401;
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};

// Optional auth - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'your-secret-key'
        );
        req.user = await User.findById(decoded.id).select('-password');
      } catch (err) {
        // Token invalid but continue anyway
        req.user = null;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Admin only middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    const error = new Error('Not authorized as admin');
    error.statusCode = 403;
    next(error);
  }
};
