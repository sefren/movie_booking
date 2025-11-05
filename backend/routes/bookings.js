import express from "express";

import * as bookingController from "../controllers/bookingController.js";

const router = express.Router();

// Get occupied seats for a showtime
router.get('/occupied-seats', bookingController.getOccupiedSeats);

// Create a new booking
router.post('/', bookingController.createBooking);

// Get user bookings by email
router.get('/user', bookingController.getUserBookings);

// Get booking by ID
router.get('/:id', bookingController.getBookingById);

// Confirm booking after payment
router.post('/:id/confirm', bookingController.confirmBooking);

// Cancel booking
router.delete('/:id', bookingController.cancelBooking);

// Get all bookings (admin)
router.get('/admin/all', bookingController.getAllBookings);

export default router;

